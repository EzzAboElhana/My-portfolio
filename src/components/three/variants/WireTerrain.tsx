"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX } from "../noise";

const VERT = /* glsl */ `
uniform float uTime;
uniform float uPointer;
varying float vHeight;

${SIMPLEX}

void main() {
  vec3 pos = position;

  // Two travelling octaves: long swell plus finer chop.
  float swell = snoise(vec3(pos.x * 0.16, pos.y * 0.16 + uTime * 0.22, 0.0));
  float chop  = snoise(vec3(pos.x * 0.55, pos.y * 0.55 + uTime * 0.35, 3.0));

  float h = swell * 1.15 + chop * 0.28;
  h *= 0.85 + uPointer * 0.4;

  // Flatten toward the near edge so the grid meets the type cleanly.
  h *= smoothstep(-14.0, 4.0, pos.y);

  pos.z += h;
  vHeight = h;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform vec3 uLow;
uniform vec3 uHigh;
varying float vHeight;

void main() {
  vec3 col = mix(uLow, uHigh, smoothstep(-0.6, 1.3, vHeight));
  float alpha = mix(0.18, 0.9, smoothstep(-0.4, 1.2, vHeight));
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

type Props = {
  pointer: React.RefObject<{ x: number; y: number }>;
};

/** Variant 3 — wireframe landscape rolling toward the horizon. */
export default function WireTerrain({ pointer }: Props) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const hover = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: 0 },
      uLow: { value: new THREE.Color("#16307a") },
      uHigh: { value: new THREE.Color("#8fe3ff") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const p = pointer.current ?? { x: 0, y: 0 };
    const target = Math.min(1, Math.hypot(p.x, p.y));
    hover.current += (target - hover.current) * Math.min(1, delta * 2.5);

    const u = material.current?.uniforms;
    if (u) {
      u.uTime.value = state.clock.elapsedTime;
      u.uPointer.value = hover.current;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -1.6, -3]}>
      <planeGeometry args={[34, 26, 130, 110]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
