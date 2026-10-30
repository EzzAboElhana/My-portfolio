"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX } from "../noise";

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uAspect;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
varying vec2 vUv;

${SIMPLEX}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

  // Domain warp: noise offsetting the lookup of more noise = liquid flow.
  float w1 = snoise(vec3(p * 1.4, uTime * 0.10));
  float w2 = snoise(vec3(p * 1.9 + w1 * 0.6, uTime * 0.13 + 5.0));
  vec2 warped = p + vec2(w1, w2) * 0.42;

  // The cursor drags the field toward itself.
  vec2 toPointer = warped - uPointer * vec2(uAspect, 1.0) * 0.5;
  float pull = 1.0 - smoothstep(0.0, 1.1, length(toPointer));
  warped += normalize(toPointer + 1e-5) * pull * 0.28;

  float band = snoise(vec3(warped * 1.15, uTime * 0.08));

  vec3 col = mix(uA, uB, smoothstep(-0.7, 0.6, band));
  col = mix(col, uC, smoothstep(0.25, 1.0, band + pull * 0.5));

  // Sink the edges so the copy on top always has contrast.
  float vig = smoothstep(1.35, 0.25, length(p));
  col *= 0.18 + vig * 0.82;

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

type Props = {
  pointer: React.RefObject<{ x: number; y: number }>;
};

/** Variant 5 — no geometry to speak of: a full-bleed flowing gradient field. */
export default function ShaderField({ pointer }: Props) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const smooth = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uA: { value: new THREE.Color("#05061a") },
      uB: { value: new THREE.Color("#1b3fd8") },
      uC: { value: new THREE.Color("#8fe3ff") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const p = pointer.current ?? { x: 0, y: 0 };
    // Pointer y is screen-space (down positive); flip for shader space.
    smooth.current.x += (p.x - smooth.current.x) * Math.min(1, delta * 2.2);
    smooth.current.y += (-p.y - smooth.current.y) * Math.min(1, delta * 2.2);

    const u = material.current?.uniforms;
    if (u) {
      u.uTime.value = state.clock.elapsedTime;
      u.uPointer.value.copy(smooth.current);
      u.uAspect.value = viewport.width / viewport.height;
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}
