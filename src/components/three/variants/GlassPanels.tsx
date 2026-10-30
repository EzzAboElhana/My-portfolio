"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/data/portfolio";

/** Rounded-rectangle plane — planeGeometry has no corner radius. */
function roundedPlane(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(shape, 16);
}

function Panel({
  index,
  total,
  geometry,
}: {
  index: number;
  total: number;
  geometry: THREE.BufferGeometry;
}) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Each panel bobs on its own phase so the ring never looks rigid.
    ref.current.position.y = Math.sin(t * 0.6 + index) * 0.22;
    ref.current.rotation.z = Math.sin(t * 0.4 + index * 1.3) * 0.06;
  });

  const radius = 2.15;
  return (
    <group
      ref={ref}
      position={[
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius * 0.55,
      ]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#9db6ff"
          transparent
          opacity={0.16}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bright edge so each pane reads against the dark backdrop. */}
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#8fe3ff" transparent opacity={0.65} />
      </lineSegments>
    </group>
  );
}

type Props = {
  pointer: React.RefObject<{ x: number; y: number }>;
};

/** Variant 4 — one floating glass pane per project, orbiting slowly. */
export default function GlassPanels({ pointer }: Props) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => roundedPlane(1.05, 1.7, 0.12), []);
  const total = Math.min(projects.length, 7);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const p = pointer.current ?? { x: 0, y: 0 };
    const target = t * 0.16 + p.x * 0.5;
    group.current.rotation.y +=
      (target - group.current.rotation.y) * Math.min(1, delta * 2.5);
    group.current.rotation.x = -p.y * 0.16;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={2} color="#dce8ff" />
      <pointLight position={[-4, -2, 2]} intensity={18} color="#2b5cff" />
      <group ref={group}>
        {Array.from({ length: total }, (_, i) => (
          <Panel key={i} index={i} total={total} geometry={geometry} />
        ))}
      </group>
    </>
  );
}
