"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX } from "@/components/three/noise";

/**
 * A slowly morphing "liquid metal" sphere. Dark chrome body with an
 * electric-blue floor bounce and a cyan rim and strip light.
 * It leans toward the cursor, ripples harder when the cursor is near, and
 * turns as the page scrolls.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAgitate;
varying vec3 vNormal;
varying vec3 vView;

${SIMPLEX}

float field(vec3 p) {
  float t = uTime;
  // Only broad, slow swells so the surface stays molten-smooth. The cursor
  // just makes the second swell a little stronger, never finer.
  float n = snoise(p * 0.7 + vec3(0.0, t * 0.15, t * 0.05)) * 0.25;
  n += snoise(p * 1.35 - vec3(t * 0.15)) * (0.06 + 0.06 * uAgitate);
  return n;
}

vec3 displace(vec3 p) {
  return p + normalize(p) * field(p);
}

void main() {
  vec3 p = position;
  vec3 n = normalize(p);
  vec3 t = normalize(cross(n, abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
  vec3 b = cross(n, t);
  // A wide sample step: tiny steps amplify float error into speckled
  // normals on lower-precision GPUs.
  float e = 0.04;
  vec3 P = displace(p);
  // Normal of the displaced surface from two nearby displaced points.
  vec3 dn = normalize(cross(displace(p + t * e) - P, displace(p + b * e) - P));

  vec4 mv = modelViewMatrix * vec4(P, 1.0);
  vNormal = normalize(normalMatrix * dn);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uGlow;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 R = reflect(-V, N);

  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);

  // Fake studio for the chrome: a softbox overhead, a cyan strip light on
  // the left and a blue floor bounce. Edges are crisp enough to read as
  // polished metal, soft enough to stay liquid.
  float softbox = smoothstep(0.3, 0.72, R.y) * smoothstep(1.05, 0.5, abs(R.x));
  float strip = smoothstep(-0.45, -0.85, R.x) * smoothstep(0.75, 0.05, abs(R.y));
  float floorBounce = smoothstep(-0.05, -0.9, R.y);

  vec3 base = vec3(0.035, 0.035, 0.045);
  vec3 col = base;
  col += vec3(0.95) * softbox;
  col += uGlow * strip * 1.1;
  col += uAccent * floorBounce * 0.75;
  col = mix(col, mix(uAccent, uGlow, fres) * 1.2, fres * 0.75);

  // Key light specular.
  vec3 L = normalize(vec3(-0.4, 0.85, 0.55));
  col += vec3(1.0) * pow(max(dot(R, L), 0.0), 48.0) * 1.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

// Fixed "tech blue" palette for the blob, independent of the site accent.
// The raw shader output skips three's colour management, so pass the sRGB
// values as-is rather than the linearised ones Color stores by default.
const srgb = (hex: string) => new THREE.Color(hex).convertLinearToSRGB();
const BLUE = "#0a7cff";
const CYAN = "#22d3ee";

function Blob({
  pointer,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number; near: number }>;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAgitate: { value: 0 },
      uAccent: { value: srgb(BLUE) },
      uGlow: { value: srgb(CYAN) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    const u = material.current?.uniforms;
    if (!m || !u) return;
    u.uTime.value += delta;
    const { x, y, near } = pointer.current;
    u.uAgitate.value = THREE.MathUtils.damp(u.uAgitate.value, near, 3, delta);
    // Scroll turns it and shrinks it away as the hero leaves.
    const sp = Math.min(window.scrollY / window.innerHeight, 1.2);
    const targetY = x * 0.6 + sp * 2.2;
    const targetX = -y * 0.4 + sp * 0.6;
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, targetY, 4, delta);
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, targetX, 4, delta);
    m.position.x = THREE.MathUtils.damp(m.position.x, x * 0.15, 3, delta);
    m.position.y = THREE.MathUtils.damp(m.position.y, y * 0.12, 3, delta);
    const s = 1 - sp * 0.35;
    m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, s, 4, delta));
  });

  return (
    // Starts tiny; the damped scale in the frame loop grows it in.
    <mesh ref={mesh} scale={0.001}>
      <icosahedronGeometry args={[1.05, 64]} />
      <shaderMaterial
        ref={material}
        // Force full precision; mediump noise is what speckles the surface.
        precision="highp"
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function LiquidBlob({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, near: 0 });
  const [visible, setVisible] = useState(true);

  // Track the pointer page-wide, relative to the blob's own box.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const d = Math.hypot(nx, ny);
      pointer.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
        near: Math.max(0, 1 - d / 1.4),
      };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Stop rendering once it's scrolled out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        // Measure layout size (ignores CSS transforms on ancestors) and skip
        // re-measuring on scroll, so an animating parent can't make the
        // canvas jump in size later.
        resize={{ scroll: false, offsetSize: true }}
        dpr={[1, 1.75]}
        // Camera sits far enough back that the blob fills ~70% of the canvas:
        // ripples and pointer drift never reach the edge and get clipped.
        camera={{ position: [0, 0, 5.2], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Blob pointer={pointer} />
      </Canvas>
    </div>
  );
}
