"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scroll } from "@/lib/scroll";

/**
 * Gradient (Perlin-style) 3D noise plus fbm.
 *
 * Shared verbatim by the vertex and fragment stages: the silhouette wobble and
 * the colour flow have to be sampled from the *same* field or the highlights
 * slide off the bumps they are supposed to be lighting.
 */
const noiseChunk = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
            dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
        mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
            dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(
        mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
            dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
        mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
            dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z);
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
`;

const orbVertex = /* glsl */ `
  uniform float uTime;
  uniform float uWobble;
  uniform float uEnergy;

  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vBump;

  ${noiseChunk}

  void main() {
    // Two noise fields drifting at different rates keep the blob from ever
    // settling into a repeating shape.
    // Low frequencies on purpose: high-frequency displacement just roughens
    // the surface, while a few big lobes actually change the silhouette, which
    // is the part the eye reads as "liquid".
    float slow = fbm3(normal * 0.72 + vec3(0.0, uTime * 0.1, 0.0));
    float fast = fbm3(normal * 1.7 - vec3(uTime * 0.15, 0.0, uTime * 0.08));

    float bump = slow * 0.82 + fast * 0.18;
    vBump = bump;

    // Displace along the normal — the silhouette itself breathes, which is the
    // whole character of the thing. Colour flow alone reads as a painted ball.
    vec3 displaced = position + normal * bump * uWobble * (1.0 + uEnergy * 0.6);

    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

    vLocal = displaced;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);

    gl_Position = projectionMatrix * mv;
  }
`;

const orbFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  uniform float uEnergy;

  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vBump;

  ${noiseChunk}

  void main() {
    // Domain warping: feed noise back into its own lookup. This is what turns
    // soft blobs into the liquid, marbled banding Siri has.
    vec3 p = vLocal * 0.82;
    float w1 = fbm3(p + vec3(0.0, uTime * 0.12, uTime * 0.06));
    vec3 q = p + w1 * 1.15;
    float w2 = fbm3(q - vec3(uTime * 0.08, 0.0, 0.0));
    vec3 r = p + w2 * 1.5;
    float w3 = fbm3(r + vec3(uTime * 0.14));

    // Tight smoothstep windows on separate fields. Wide windows average the
    // hues into mud; narrow ones keep them as distinct bands that slide over
    // each other, which is what reads as iridescent rather than tie-dyed.
    float m1 = smoothstep(-0.16, 0.16, w1);
    float m2 = smoothstep(-0.14, 0.20, w2);

    // A, B and C are the cool family and cover the entire surface. D is the
    // loud accent, gated behind a high threshold so it surfaces as thin wisps
    // on the noise peaks instead of washing over everything — an accent mixed
    // at the same weight as the base always wins, because it is the most
    // saturated colour and additive blending amplifies it further.
    vec3 color = mix(uColorA, uColorB, m1);
    color = mix(color, uColorC, m2 * 0.6);

    // Gate off the *normalised* field, not the raw fbm. This noise sums
    // un-normalised gradients, so its actual spread is only about ±0.16 —
    // thresholding on raw values near 0.3 silently erases the accent.
    // Normalise with the same window as m1/m2, then cube it so only the top
    // of the range reaches full strength.
    float m3 = smoothstep(-0.14, 0.18, w3);
    color = mix(color, uColorD, pow(m3, 3.0) * 0.7);

    // Specular-ish hot spots where the flow peaks.
    color += vec3(1.0) * pow(max(w3, 0.0), 2.6) * 0.55;

    float facing = abs(dot(vNormal, vView));

    // Rim: bright, saturated edge like the glass shell around the Siri blob.
    float rim = pow(1.0 - facing, 2.2);
    // Rim stays in the cool family — tinting it with the accent puts the
    // loudest colour on the brightest, largest part of the silhouette.
    color += mix(uColorA, uColorC, m1) * rim * 1.15;

    // Fade the silhouette off rather than ending on a hard sphere edge, so it
    // reads as luminous volume instead of a lit ball.
    float body = pow(smoothstep(-0.02, 0.78, facing), 1.5);
    float density = 0.5 + 0.5 * smoothstep(-0.5, 0.55, vBump);

    float alpha = body * density * (0.78 + uEnergy * 0.22);

    gl_FragColor = vec4(color, alpha);
  }
`;

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uEnergy;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    // Wide, very soft falloff — the ambient bloom the orb casts around itself.
    float glow = pow(max(0.0, 1.0 - d), 2.6);
    gl_FragColor = vec4(uColor, glow * (0.7 + uEnergy * 0.35));
  }
`;

type Props = {
  /** Four widely-separated hues; see the orb palette in ThemeProvider. */
  colors: readonly [string, string, string, string];
  pointer: RefObject<{ x: number; y: number }>;
  still: boolean;
};

/**
 * A Siri-style orb: a soft luminous blob whose surface flows and whose
 * silhouette breathes. Scroll speed feeds its "energy", so it swells and
 * brightens while the visitor moves and settles when they stop to read.
 */
export default function SiriOrb({ colors, pointer, still }: Props) {
  const group = useRef<THREE.Group>(null);
  const orb = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const energy = useRef(0);

  const orbMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: orbVertex,
        fragmentShader: orbFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWobble: { value: 0.46 },
          uEnergy: { value: 0 },
          uColorA: { value: new THREE.Color(colors[0]) },
          uColorB: { value: new THREE.Color(colors[1]) },
          uColorC: { value: new THREE.Color(colors[2]) },
          uColorD: { value: new THREE.Color(colors[3]) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(colors[2]) },
          uEnergy: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    const o = orb.current;
    const h = halo.current;
    if (!g || !o || !h) return;

    const om = o.material as THREE.ShaderMaterial;
    const hm = h.material as THREE.ShaderMaterial;

    om.uniforms.uColorA.value.set(colors[0]);
    om.uniforms.uColorB.value.set(colors[1]);
    om.uniforms.uColorC.value.set(colors[2]);
    om.uniforms.uColorD.value.set(colors[3]);
    hm.uniforms.uColor.value.set(colors[2]);

    const step = Math.min(delta, 0.05);

    // The orb is wide and soft, so on a narrow viewport it needs to sit
    // further back and higher or it washes out the copy underneath.
    const portrait = state.viewport.aspect < 0.9;
    const startX = portrait ? 3.4 : 3.4;
    const startY = portrait ? 5.6 : -0.3;
    const startZ = portrait ? -15 : -6.5;

    const exit = THREE.MathUtils.clamp(scroll.progress / 0.22, 0, 1);
    const ease = exit * exit * (3 - 2 * exit);

    const p = pointer.current ?? { x: 0, y: 0 };
    g.position.x +=
      (THREE.MathUtils.lerp(startX, 12, ease) + p.x * 0.45 - g.position.x) * 0.06;
    g.position.y +=
      (THREE.MathUtils.lerp(startY, 24, ease) - p.y * 0.4 - g.position.y) * 0.06;
    g.position.z += (THREE.MathUtils.lerp(startZ, -28, ease) - g.position.z) * 0.06;

    if (still) return;

    // Energy ramps with scroll speed and decays when the page is still.
    const target = THREE.MathUtils.clamp(Math.abs(scroll.velocity) / 45, 0, 1);
    energy.current += (target - energy.current) * 0.06;

    om.uniforms.uEnergy.value = energy.current;
    hm.uniforms.uEnergy.value = energy.current;
    om.uniforms.uTime.value = state.clock.elapsedTime;

    // Breathing, plus a swell while scrolling.
    const t = state.clock.elapsedTime;
    const breathe = 1 + Math.sin(t * 0.9) * 0.035 + energy.current * 0.1;
    o.scale.setScalar(breathe);
    h.scale.setScalar(breathe);

    // Slow tumble so the flow never presents the same face twice.
    o.rotation.y += step * 0.13;
    o.rotation.x += (-p.y * 0.25 - o.rotation.x) * 0.03;
    o.rotation.z += step * 0.05;

    // Halo always faces the camera so the bloom stays a clean circle.
    h.quaternion.copy(state.camera.quaternion);
  });

  return (
    <group ref={group} position={[3.4, -0.3, -6.5]}>
      <mesh ref={halo} material={haloMaterial} renderOrder={0}>
        <planeGeometry args={[11.5, 11.5]} />
      </mesh>

      <mesh ref={orb} material={orbMaterial} renderOrder={1}>
        {/* Icosahedron, not a UV sphere: displacement on a UV sphere pinches
            hard at the poles. Detail 20 is ~8.8k triangles — enough that the
            wobbling silhouette stays smooth. */}
        <icosahedronGeometry args={[1.55, 20]} />
      </mesh>
    </group>
  );
}
