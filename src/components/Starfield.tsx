"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/*
 * 3D starfield, after the Framer "Stars" component. The original renders
 * three.js Points; this is the same scene on raw WebGL so the hero doesn't
 * ship three.js: star sprites scattered through a cube, seen by a perspective
 * camera that drifts toward the mouse while it keeps looking at the centre.
 */
export const STARFIELD = {
  background: "#251F40",
  color: "#808080",
  count: 3000,
  size: 6,
  sceneDepth: 2000,
  cameraDepth: 1000,
  speedX: 2,
  speedY: 2,
  // Lazy load: build the scene within 450vh of the viewport, free the GPU beyond 300vh.
  initDistanceVh: 450,
  destroyDistanceVh: 300,
} as const;

const FOV = 75;
const ALPHA_TEST = 0.2;
// Same five-point star path the Framer component draws into its 64px sprite.
const STAR_PATH = "M32 2 L41 22 L62 25 L47 40 L50 62 L32 52 L14 62 L17 40 L2 25 L23 22 Z";

const VERTEX = `
attribute vec3 position;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uSize;
uniform float uScale;
void main() {
  vec4 mv = uView * vec4(position, 1.0);
  gl_PointSize = uSize * (uScale / -mv.z);
  gl_Position = uProjection * mv;
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D uMap;
uniform vec3 uColor;
void main() {
  float a = texture2D(uMap, gl_PointCoord).a;
  if (a < ${ALPHA_TEST}) discard;
  gl_FragColor = vec4(uColor, a);
}`;

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function perspective(fovDeg: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

/** View matrix for a camera at `eye` looking at the origin, y up. */
function lookAtOrigin(ex: number, ey: number, ez: number) {
  let len = Math.hypot(ex, ey, ez);
  const z = [ex / len, ey / len, ez / len];
  // x = normalize(up × z)
  let x = [z[2], 0, -z[0]];
  len = Math.hypot(x[0], x[2]) || 1;
  x = [x[0] / len, 0, x[2] / len];
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  // prettier-ignore
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0] * ex + x[1] * ey + x[2] * ez),
    -(y[0] * ex + y[1] * ey + y[2] * ez),
    -(z[0] * ex + z[1] * ey + z[2] * ez),
    1,
  ]);
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

type Scene = { render: () => void; resize: () => void; destroy: () => void };

function createScene(canvas: HTMLCanvasElement, camera: { x: number; y: number }): Scene | null {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: true, powerPreference: "low-power" });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Stars: uniformly scattered through a cube of side `sceneDepth`.
  const { count, sceneDepth, cameraDepth, size } = STARFIELD;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * sceneDepth;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

  // Sprite: the star shape drawn white into a 64px canvas.
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const ctx = sprite.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(STAR_PATH));
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uView = u("uView");
  const uProjection = u("uProjection");
  const uSize = u("uSize");
  const uScale = u("uScale");
  gl.uniform1i(u("uMap"), 0);
  gl.uniform3fv(u("uColor"), hexToRgb(STARFIELD.color));

  const [r, g, b] = hexToRgb(STARFIELD.background);
  gl.clearColor(r, g, b, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(uProjection, false, perspective(FOV, width / height, 1, cameraDepth));
    // Size attenuation as in three.js: size × (half the canvas height ÷ depth).
    gl.uniform1f(uSize, size * dpr);
    gl.uniform1f(uScale, height / 2);
  };

  const render = () => {
    gl.uniformMatrix4fv(uView, false, lookAtOrigin(camera.x, camera.y, cameraDepth / 2));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  const destroy = () => {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  resize();
  return { render, resize, destroy };
}

export function Starfield({ className, style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const camera = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    let scene: Scene | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let visible = false;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = 0;
      if (!scene) return;
      // The Framer easing (speed × 0.0005 per frame at 60fps), made frame-rate independent.
      const dt = last ? Math.min((now - last) / (1000 / 60), 4) : 1;
      last = now;
      const kx = 1 - Math.pow(1 - STARFIELD.speedX * 5e-4, dt);
      const ky = 1 - Math.pow(1 - STARFIELD.speedY * 5e-4, dt);
      camera.x += (mouse.x - camera.x) * kx;
      camera.y += (-mouse.y - camera.y) * ky;
      scene.render();
      // Keep drifting until the camera has caught up with the mouse.
      if (visible && Math.abs(mouse.x - camera.x) + Math.abs(-mouse.y - camera.y) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        last = 0;
      }
    };
    const play = () => {
      if (!raf && visible && scene && !still) raf = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX - window.innerWidth / 2;
      mouse.y = e.clientY - window.innerHeight / 2;
      play();
    };

    const build = () => {
      if (scene) return;
      canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 size-full opacity-0 transition-opacity duration-[1200ms]";
      host.appendChild(canvas);
      scene = createScene(canvas, camera);
      if (!scene) {
        canvas.remove();
        canvas = null;
        return;
      }
      canvas.addEventListener("webglcontextlost", teardown);
      scene.render();
      const shown = canvas;
      requestAnimationFrame(() => shown.classList.remove("opacity-0"));
      play();
    };

    function teardown() {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      canvas?.removeEventListener("webglcontextlost", teardown);
      scene?.destroy();
      canvas?.remove();
      scene = null;
      canvas = null;
    }

    // Root-margin percentages are relative to the viewport, so 450% = 450vh.
    const margin = (vh: number) => `${vh}% 0px ${vh}% 0px`;
    const initObserver = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && build(),
      { rootMargin: margin(STARFIELD.initDistanceVh) },
    );
    // Torn down past the destroy distance, rebuilt on the way back in.
    const destroyObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? build() : teardown()),
      { rootMargin: margin(STARFIELD.destroyDistanceVh) },
    );
    // Only spend frames while the hero is actually on screen.
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    const resizeObserver = new ResizeObserver(() => {
      if (!scene) return;
      scene.resize();
      scene.render();
    });

    initObserver.observe(host);
    destroyObserver.observe(host);
    viewObserver.observe(host);
    resizeObserver.observe(host);
    if (!still) window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      initObserver.disconnect();
      destroyObserver.disconnect();
      viewObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      teardown();
    };
  }, []);

  return (
    <div
      ref={mount}
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={{ background: STARFIELD.background, ...style }}
      {...rest}
    />
  );
}
