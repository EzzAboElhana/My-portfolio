"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scroll } from "@/lib/scroll";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec2 vUv;

  // Value noise + fbm. Cheap enough to run fullscreen and smooth enough that
  // the clouds never show the underlying lattice.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec2(37.1, 17.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 3.0;

    // Two fbm layers pulling in different directions: the offset one warps the
    // other's lookup, which is what gives the clouds their filament shape.
    float drift = uTime * 0.012;
    float warp = fbm(p + vec2(drift, -drift * 0.6));
    float clouds = fbm(p + warp * 1.6 + vec2(-drift * 0.5, drift * 0.3));

    // Scrolling nudges the density so the backdrop is never quite the same
    // twice through the page.
    clouds = pow(clamp(clouds + uProgress * 0.08, 0.0, 1.0), 2.4);

    vec3 color = mix(uColorA, uColorB, clamp(warp * 1.2, 0.0, 1.0));

    // Fade to nothing at the edges so the plane's rectangle never shows.
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = (1.0 - smoothstep(0.55, 1.0, d.x)) * (1.0 - smoothstep(0.5, 1.0, d.y));

    gl_FragColor = vec4(color, clouds * edge * 0.42);
  }
`;

type Props = {
  colorA: string;
  colorB: string;
  still: boolean;
};

/**
 * Volumetric-looking cloud backdrop sitting far behind the stars. It is a
 * single additive plane rather than real volume — at this scale and opacity
 * the difference is invisible and the cost is one fullscreen pass.
 */
export default function Nebula({ colorA, colorB, still }: Props) {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    // Reached through the mesh ref, not the memoised material: the React
    // Compiler forbids writing to a value a hook has captured.
    if (!mesh.current) return;
    const u = (mesh.current.material as THREE.ShaderMaterial).uniforms;
    u.uColorA.value.set(colorA);
    u.uColorB.value.set(colorB);
    u.uProgress.value = scroll.progress;
    if (!still) u.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={mesh}
      position={[0, 0, -46]}
      renderOrder={-1}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[190, 120]} />
    </mesh>
  );
}
