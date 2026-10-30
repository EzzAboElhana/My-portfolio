"use client";

import { useEffect, useRef } from "react";
import useTheme from "./useTheme";

/**
 * Dark-mode backdrop: a faint blue glow that slowly drifts and folds, kept
 * deliberately quiet so it reads as atmosphere rather than decoration.
 *  - Domain-warped noise drives the flow; the cursor bends it around itself.
 *  - Scrolling nudges the flow along.
 *  - The middle of the screen stays darker so copy on top stays readable.
 * Raw WebGL with a single fullscreen triangle, rendered at reduced
 * resolution (it's soft anyway), paused when the tab is hidden.
 */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

// 2D simplex noise (Ashima).
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * snoise(p); p *= 2.02; a *= 0.5; }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.035 + uScroll * 0.15;

  // The cursor bends the flow around itself.
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  vec2 toM = p - m;
  float pull = exp(-dot(toM, toM) * 6.0);
  p += vec2(-toM.y, toM.x) * pull * 0.35;

  // Two rounds of domain warping = folding silk.
  // Low frequencies only: broad folds, not marble.
  vec2 q = vec2(fbm(p * 0.45 + vec2(0.0, t)), fbm(p * 0.45 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 0.6 + 1.6 * q + vec2(1.7, 9.2) + t * 0.6),
                fbm(p * 0.6 + 1.6 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p * 0.55 + 1.8 * r);

  // Thin bright ribbons where the field crosses certain levels.
  float ribbon = smoothstep(0.86, 1.0, 1.0 - abs(f * 2.0 - 0.2));
  float body = smoothstep(-0.1, 0.8, f);

  vec3 navy = vec3(0.012, 0.025, 0.065);
  vec3 blue = vec3(0.0, 0.43, 0.9);
  vec3 cyan = vec3(0.13, 0.83, 0.93);
  vec3 col = navy;
  // Whisper-level: a faint drifting glow, the ribbons barely there.
  col += blue * body * 0.16;
  col += cyan * ribbon * 0.06;

  // Keep the centre band (where the copy sits) calmer, and darken edges a bit.
  float centre = smoothstep(0.0, 0.55, abs(uv.x - 0.42));
  col *= mix(0.55, 1.0, centre);
  col *= 1.0 - 0.35 * length(uv - 0.5);


  gl_FragColor = vec4(col, 1.0);
}
`;

const SCALE = 0.5; // render at half resolution; the field is soft anyway

export default function FlowField() {
  const { theme } = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme !== "dark") return;
    const cv = canvas.current;
    const gl = cv?.getContext("webgl", { antialias: false, alpha: false });
    if (!cv || !gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // One triangle that covers the whole screen.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };
    let scroll = 0;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      cv.width = Math.round(window.innerWidth * SCALE);
      cv.height = Math.round(window.innerHeight * SCALE);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };

    const frame = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const target = window.scrollY / window.innerHeight;
      scroll += (target - scroll) * 0.06;
      gl.uniform1f(uTime, reduce ? 0 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (reduce) frame(performance.now());
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [theme]);

  if (theme !== "dark") return null;
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
