"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scroll } from "@/lib/scroll";
import { makeRand } from "@/lib/rand";

const COUNT = 2600;
/** Depth of the slab stars live in. Wrapping across it makes the field infinite. */
const DEPTH = 70;
const FRONT = 6;
const BACK = FRONT - DEPTH;
/**
 * Below this per-frame travel the streaks stay hidden and are not rebuilt.
 * Set high on purpose: this is a portfolio people skim, and at full strength
 * the streaks white out the copy they are trying to read. It should register
 * as a flourish on a hard fling, never as an obstruction.
 */
const WARP_THRESHOLD = 0.75;

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute float aTint;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vFade;
  varying float vTint;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    float dist = -mv.z;
    // Twinkle: each star gets its own phase so the field never pulses in sync.
    float twinkle = 0.62 + 0.38 * sin(uTime * 1.7 + aSeed * 6.2831);

    gl_PointSize = aSize * uPixelRatio * twinkle * (300.0 / max(dist, 0.1));

    // Fade in from the far plane and back out as a star sweeps past the lens,
    // so nothing pops into or out of existence at the wrap boundary.
    float near = smoothstep(0.0, 9.0, dist);
    float far = 1.0 - smoothstep(${(DEPTH * 0.72).toFixed(1)}, ${DEPTH.toFixed(1)}, dist);

    vFade = twinkle * near * far;
    vTint = aTint;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vFade;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    // Soft halo with a hot core — a flat disc reads as confetti, not starlight.
    float halo = pow(1.0 - d, 2.0);
    float core = pow(1.0 - d, 9.0);
    float alpha = (halo * 0.34 + core * 0.8) * vFade;

    vec3 color = mix(uColorA, uColorB, vTint);
    gl_FragColor = vec4(color, alpha);
  }
`;

type Props = {
  colorA: string;
  colorB: string;
  still: boolean;
};

/**
 * The persistent starfield, plus the warp streaks that grow out of it.
 *
 * Stars drift toward the camera on their own and accelerate with scroll
 * velocity, so scrolling the page reads as flying forward. Positions wrap
 * through a fixed-depth slab instead of the camera moving, which keeps the
 * field endless with no coordinate drift.
 *
 * Points and streaks live in one component because the streaks are literally
 * the stars smeared along their own travel — they have to read the same
 * position buffer in the same frame, and splitting them would mean either a
 * second simulation or a cross-component mutation order to get right.
 */
export default function Starfield({ colorA, colorB, still }: Props) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const streaks = useRef<THREE.LineSegments>(null);

  const { geometry, streakGeometry } = useMemo(() => {
    const position = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const tint = new Float32Array(COUNT);

    const rand = makeRand(987654321);

    for (let i = 0; i < COUNT; i++) {
      position[i * 3] = (rand() - 0.5) * 46;
      position[i * 3 + 1] = (rand() - 0.5) * 30;
      position[i * 3 + 2] = BACK + rand() * DEPTH;

      // Mostly small stars with a few bright ones — an even spread looks fake.
      // Kept deliberately restrained: this field sits directly behind body
      // copy, and big sprites turn the page into noise.
      const r = rand();
      size[i] = r < 0.93 ? 0.55 + r * 0.75 : 1.7 + rand() * 1.5;
      seed[i] = rand();
      tint[i] = rand() < 0.72 ? rand() * 0.25 : 0.5 + rand() * 0.5;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));

    // Two vertices per star: the star itself and the tail behind it.
    const sg = new THREE.BufferGeometry();
    sg.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(COUNT * 6), 3),
    );

    return { geometry: g, streakGeometry: sg };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
        },
      }),
    // Colours are pushed as uniforms every frame; rebuilding the material on a
    // theme change would throw away the compiled program for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const streakMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    [],
  );

  useFrame((state, delta) => {
    // Everything mutated per frame is reached through the scene-object refs
    // rather than the memoised values directly: the React Compiler treats a
    // value captured by a hook as frozen, and writing to it from the frame
    // loop is a lint error.
    const stars = points.current;
    const trail = streaks.current;
    if (!stars || !trail) return;

    const starMaterial = stars.material as THREE.ShaderMaterial;
    const trailMaterial = trail.material as THREE.LineBasicMaterial;

    const u = starMaterial.uniforms;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uColorA.value.set(colorA);
    u.uColorB.value.set(colorB);
    trailMaterial.color.set(colorB);

    if (still) return;
    u.uTime.value = state.clock.elapsedTime;

    // Cap the step so a backgrounded tab doesn't teleport the field on its
    // first frame back.
    const step = Math.min(delta, 0.05);
    const drift = 1.6 * step;
    const boost = THREE.MathUtils.clamp(scroll.velocity * 0.085, -3.2, 3.2);
    const travel = drift + boost;

    const attr = stars.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 2; i < arr.length; i += 3) {
      let z = arr[i] + travel;
      if (z > FRONT) z -= DEPTH;
      else if (z < BACK) z += DEPTH;
      arr[i] = z;
    }
    attr.needsUpdate = true;

    // Warp streaks: only rebuilt while actually moving fast, so the common
    // case (reading, not scrolling) costs one comparison.
    const speed = Math.abs(travel);
    const target = THREE.MathUtils.clamp((speed - WARP_THRESHOLD) / 6, 0, 0.3);
    trailMaterial.opacity += (target - trailMaterial.opacity) * 0.22;

    const visible = trailMaterial.opacity > 0.01;
    trail.visible = visible;

    if (visible) {
      const sAttr = trail.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const sArr = sAttr.array as Float32Array;
      const tail = -travel * 1.4;

      for (let i = 0; i < COUNT; i++) {
        const x = arr[i * 3];
        const y = arr[i * 3 + 1];
        const z = arr[i * 3 + 2];
        const o = i * 6;
        sArr[o] = x;
        sArr[o + 1] = y;
        sArr[o + 2] = z;
        sArr[o + 3] = x;
        sArr[o + 4] = y;
        sArr[o + 5] = z + tail;
      }
      sAttr.needsUpdate = true;
    }

    // A whisper of roll keeps the field from reading as flat wallpaper.
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.006;
    }
  });

  return (
    <group ref={group}>
      <points
        ref={points}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
      <lineSegments
        ref={streaks}
        geometry={streakGeometry}
        material={streakMaterial}
        frustumCulled={false}
        visible={false}
      />
    </group>
  );
}
