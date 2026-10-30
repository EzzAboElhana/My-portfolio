"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 4200;

/** Evenly spread points on a sphere (Fibonacci spiral). */
function sphere(n: number, r = 1.7) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out[i * 3] = Math.cos(theta) * radius * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = Math.sin(theta) * radius * r;
  }
  return out;
}

/** Points along a (2,3) torus knot tube. */
function torusKnot(n: number, R = 1.15, r = 0.42) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const p = 2;
    const q = 3;
    const cu = Math.cos(q * t);
    const base = R * (2 + cu) * 0.5;
    // Spread points around the tube so it reads as a solid, not a wire.
    const a = (i % 37) / 37 * Math.PI * 2;
    const off = r * 0.5;
    out[i * 3] = base * Math.cos(p * t) + Math.cos(a) * off;
    out[i * 3 + 1] = base * Math.sin(p * t) + Math.sin(a) * off;
    out[i * 3 + 2] = R * Math.sin(q * t) * 0.9 + Math.cos(a) * off;
  }
  return out;
}

/** Points filling a phone-shaped slab. */
function slab(n: number, w = 1.25, h = 2.6, d = 0.16) {
  const out = new Float32Array(n * 3);
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    // Most points on the face, a few wrapping the edges.
    const onEdge = rand() < 0.18;
    const x = (rand() - 0.5) * w;
    const y = (rand() - 0.5) * h;
    out[i * 3] = onEdge ? (rand() < 0.5 ? -w / 2 : w / 2) : x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = (rand() - 0.5) * d;
  }
  return out;
}

type Props = {
  pointer: React.RefObject<{ x: number; y: number }>;
};

/**
 * Variant 1 — particle cloud that dissolves and re-forms into a new shape.
 * Shapes cycle on a timer here; in the real hero this would follow scroll.
 */
export default function ParticleMorph({ pointer }: Props) {
  const points = useRef<THREE.Points>(null);

  const targets = useMemo(
    () => [sphere(COUNT), torusKnot(COUNT), slab(COUNT)],
    [],
  );

  // Seed buffer only — from here on the geometry's own array is the state,
  // so there is no second copy to keep in sync.
  const initial = useMemo(() => Float32Array.from(targets[0]), [targets]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    const p = pointer.current ?? { x: 0, y: 0 };

    // 3.2s per shape: 2s settled, 1.2s of travel.
    const cycle = 3.2;
    const idx = Math.floor(t / cycle) % targets.length;
    const next = targets[idx];
    const local = (t % cycle) / cycle;
    const ease = Math.min(1, Math.max(0, (local - 0.35) / 0.4));
    const pull = ease * ease * (3 - 2 * ease);

    const attr = points.current.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    const k = Math.min(1, delta * (2 + pull * 8));
    for (let i = 0; i < arr.length; i++) {
      // Chase the target, with drift folded into the target so it can never
      // accumulate — the buffer stays the single source of truth.
      const target = next[i] + Math.sin(t * 1.4 + i * 0.37) * 0.006;
      arr[i] += (target - arr[i]) * k;
    }
    attr.needsUpdate = true;

    points.current.rotation.y = t * 0.16 + p.x * 0.4;
    points.current.rotation.x = -p.y * 0.25;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initial, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#9fd8ff"
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
