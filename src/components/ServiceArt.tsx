"use client";

import { useEffect, useRef } from "react";
import type { CategoryId } from "@/lib/taxonomy";

/*
 * Black-and-white motion graphics, one per discipline, drawn on a canvas
 * every frame so the motion stays continuous and smooth. Scenes are drawn in
 * a 224 × 272 design space and scaled to cover the frame. A scene only runs
 * while its card is open and on screen, and resumes where it paused; reduced
 * motion shows a single still frame.
 */

const W = 224;
const H = 272;
const TAU = Math.PI * 2;

type Scene = (ctx: CanvasRenderingContext2D, t: number) => void;

const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);
const white = (a: number) => `rgba(255,255,255,${clamp(a).toFixed(3)})`;

/** Holds each step for `hold` seconds, then eases to the next over the rest of the period. */
function stepper(t: number, period: number, hold: number, count: number) {
  const n = Math.floor(t / period);
  const local = t - n * period;
  const k = easeInOut(clamp((local - hold) / (period - hold)));
  return { from: n % count, to: (n + 1) % count, k, n, local };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2)));
}

/* ------------------------------------------------------------------
   Websites & web apps: a page that re-flows between three layouts
   (landing, editorial, dashboard) while a cursor follows the CTA.
------------------------------------------------------------------- */

// [x, y, w, h, alpha, radius, outlined]
type Box = [number, number, number, number, number, number, 0 | 1];
const LAYOUTS: Box[][] = [
  [
    [30, 62, 96, 10, 0.92, 3, 0],
    [30, 77, 70, 10, 0.92, 3, 0],
    [30, 96, 92, 4, 0.3, 2, 0],
    [30, 105, 78, 4, 0.3, 2, 0],
    [30, 118, 42, 13, 0.95, 6.5, 0],
    [134, 62, 60, 69, 0.1, 7, 1],
    [30, 146, 50, 80, 0.05, 6, 1],
    [87, 146, 50, 80, 0.05, 6, 1],
    [144, 146, 50, 80, 0.05, 6, 1],
  ],
  [
    [30, 136, 124, 10, 0.92, 3, 0],
    [30, 151, 86, 10, 0.92, 3, 0],
    [30, 170, 164, 4, 0.3, 2, 0],
    [30, 179, 132, 4, 0.3, 2, 0],
    [30, 194, 52, 13, 0.95, 6.5, 0],
    [30, 62, 164, 62, 0.1, 8, 1],
    [112, 192, 38, 34, 0.05, 6, 1],
    [156, 192, 38, 34, 0.05, 6, 1],
    [156, 192, 38, 34, 0, 6, 1],
  ],
  [
    [80, 62, 74, 9, 0.92, 3, 0],
    [80, 76, 48, 9, 0.5, 3, 0],
    [80, 92, 114, 4, 0.3, 2, 0],
    [80, 100, 92, 4, 0.3, 2, 0],
    [158, 62, 36, 12, 0.95, 6, 0],
    [30, 62, 40, 164, 0.08, 7, 1],
    [80, 114, 114, 56, 0.05, 7, 1],
    [80, 176, 55, 50, 0.05, 6, 1],
    [139, 176, 55, 50, 0.05, 6, 1],
  ],
];

function cursorPath(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 13);
  ctx.lineTo(x + 3.6, y + 9.6);
  ctx.lineTo(x + 6.3, y + 15.4);
  ctx.lineTo(x + 8.6, y + 14.4);
  ctx.lineTo(x + 6, y + 8.6);
  ctx.lineTo(x + 10.8, y + 8.6);
  ctx.closePath();
}

const webScene: Scene = (ctx, t) => {
  const { from, to, k, local } = stepper(t, 3.6, 1.8, LAYOUTS.length);
  const lag = easeInOut(clamp((local - 2.05) / 1.55));
  const float = Math.sin(t * 0.6) * 2.5;
  ctx.translate(0, float);

  // Browser chrome
  rr(ctx, 18, 28, 188, 212, 12);
  ctx.fillStyle = white(0.03);
  ctx.fill();
  ctx.strokeStyle = white(0.14);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 48);
  ctx.lineTo(206, 48);
  ctx.stroke();
  [0.4, 0.2, 0.2].forEach((a, i) => {
    ctx.beginPath();
    ctx.arc(31 + i * 9, 38, 2.5, 0, TAU);
    ctx.fillStyle = white(a);
    ctx.fill();
  });
  rr(ctx, 64, 34, 110, 8, 4);
  ctx.fillStyle = white(0.07);
  ctx.fill();

  // Blocks re-flow between layouts
  const boxes = LAYOUTS[from].map((a, i) => {
    const b = LAYOUTS[to][i];
    return a.map((v, j) => (j === 6 ? v : lerp(v, b[j], k))) as Box;
  });
  boxes.forEach(([x, y, w, h, a, r, outlined]) => {
    rr(ctx, x, y, w, h, r);
    ctx.fillStyle = white(a);
    ctx.fill();
    if (outlined) {
      ctx.strokeStyle = white(Math.min(0.16, a * 3));
      ctx.stroke();
    }
  });

  // Dashboard details fade in with the dashboard layout
  const dash = (from === 2 ? 1 - k : 0) + (to === 2 ? k : 0);
  if (dash > 0.01) {
    const [cx, cy, cw, ch] = boxes[6];
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const px = cx + 10 + u * (cw - 20);
      const py = cy + ch * 0.62 - Math.sin(u * 5 + t * 1.4) * ch * 0.14 - u * ch * 0.18;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = white(0.75 * dash);
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.lineWidth = 1;
    const [sx, sy] = boxes[5];
    for (let i = 0; i < 5; i++) {
      rr(ctx, sx + 8, sy + 12 + i * 14, i === 1 ? 24 : 18, 4, 2);
      ctx.fillStyle = white((i === 1 ? 0.7 : 0.25) * dash);
      ctx.fill();
    }
  }

  // Cursor trails the CTA, then clicks it
  const fromBtn = LAYOUTS[from][4];
  const toBtn = LAYOUTS[to][4];
  const bx = lerp(fromBtn[0] + fromBtn[2] * 0.6, toBtn[0] + toBtn[2] * 0.6, lag);
  const by = lerp(fromBtn[1] + fromBtn[3] * 0.7, toBtn[1] + toBtn[3] * 0.7, lag);
  const click = clamp((local - 0.35) / 0.9);
  if (click > 0 && click < 1) {
    ctx.beginPath();
    ctx.arc(bx, by, 3 + click * 16, 0, TAU);
    ctx.strokeStyle = white(0.45 * (1 - click));
    ctx.stroke();
  }
  cursorPath(ctx, bx, by);
  ctx.fillStyle = white(0.95);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.stroke();
};

/* ------------------------------------------------------------------
   UI/UX & systems: a grid of tokens breathing from square to circle
   in a diagonal wave, with a selection frame gliding between them.
------------------------------------------------------------------- */

const COLS = 4;
const ROWS = 5;
const TILE = 34;
const GAP = 10;
const GX = (W - (COLS * TILE + (COLS - 1) * GAP)) / 2;
const GY = (H - (ROWS * TILE + (ROWS - 1) * GAP)) / 2;
const SELECT: [number, number][] = [
  [1, 1],
  [2, 3],
  [0, 2],
  [3, 4],
  [2, 0],
  [1, 3],
];

const uiScene: Scene = (ctx, t) => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const e = smooth(0.5 + 0.5 * Math.sin(t * 1.1 - (c + r) * 0.42));
      const size = TILE * lerp(0.6, 1, e);
      const x = GX + c * (TILE + GAP) + (TILE - size) / 2;
      const y = GY + r * (TILE + GAP) + (TILE - size) / 2;
      rr(ctx, x, y, size, size, lerp(5, size / 2, e));
      ctx.fillStyle = white(lerp(0.04, 0.88, e ** 3));
      ctx.fill();
      ctx.strokeStyle = white(lerp(0.22, 0, e));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Selection frame with handles
  const { from, to, k } = stepper(t, 2.6, 1.3, SELECT.length);
  const cx = lerp(SELECT[from][0], SELECT[to][0], k);
  const cy = lerp(SELECT[from][1], SELECT[to][1], k);
  const x = GX + cx * (TILE + GAP) - 6;
  const y = GY + cy * (TILE + GAP) - 6;
  const s = TILE + 12;
  ctx.strokeStyle = white(0.85);
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, s, s);
  ctx.fillStyle = white(1);
  [
    [x, y],
    [x + s, y],
    [x, y + s],
    [x + s, y + s],
  ].forEach(([hx, hy]) => {
    ctx.fillRect(hx - 2.5, hy - 2.5, 5, 5);
  });
  rr(ctx, x + s / 2 - 13, y + s + 6, 26, 9, 4.5);
  ctx.fillStyle = white(0.85);
  ctx.fill();
};

/* ------------------------------------------------------------------
   E-commerce & portals: a product carousel gliding card to card, the
   bag counting up as each product lands in the centre.
------------------------------------------------------------------- */

const PRODUCTS = 5;

function productShape(ctx: CanvasRenderingContext2D, kind: number, x: number, y: number) {
  ctx.beginPath();
  if (kind === 0) ctx.arc(x, y, 17, 0, TAU);
  else if (kind === 1) ctx.roundRect(x - 16, y - 16, 32, 32, 9);
  else if (kind === 2) ctx.roundRect(x - 22, y - 11, 44, 22, 11);
  else if (kind === 3) {
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + 18, y + 13);
    ctx.lineTo(x - 18, y + 13);
    ctx.closePath();
  } else ctx.ellipse(x, y, 13, 19, 0, 0, TAU);
}

const commerceScene: Scene = (ctx, t) => {
  const { n, k, local } = stepper(t, 3, 1.7, PRODUCTS);
  const p = n + k;

  const cards = Array.from({ length: PRODUCTS }, (_, j) => {
    const d = ((((j - p) % PRODUCTS) + PRODUCTS + 2.5) % PRODUCTS) - 2.5;
    return { j, d };
  }).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));

  for (const { j, d } of cards) {
    const ad = Math.abs(d);
    const alpha = clamp(1 - ad * 0.62);
    if (alpha <= 0.01) continue;
    const scale = 1 - 0.2 * Math.min(1, ad);
    const cx = W / 2 + d * 84;
    const cy = 124;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    // Card
    rr(ctx, -52, -74, 104, 148, 12);
    ctx.fillStyle = "#0d0d0f";
    ctx.fill();
    ctx.strokeStyle = white(0.16);
    ctx.stroke();
    // Product
    rr(ctx, -43, -65, 86, 80, 8);
    ctx.fillStyle = white(0.06);
    ctx.fill();
    const bob = Math.sin(t * 1.4 + j) * 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 3, 0, 0, TAU);
    ctx.fillStyle = white(0.06);
    ctx.fill();
    productShape(ctx, j, 0, -27 + bob);
    ctx.fillStyle = white(0.85);
    ctx.fill();
    // Details
    rr(ctx, -43, 25, 58, 6, 3);
    ctx.fillStyle = white(0.85);
    ctx.fill();
    rr(ctx, -43, 37, 36, 4, 2);
    ctx.fillStyle = white(0.3);
    ctx.fill();
    rr(ctx, -43, 50, 30, 12, 6);
    ctx.fillStyle = white(0.92);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(33, 56, 9, 0, TAU);
    ctx.strokeStyle = white(0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(29, 56);
    ctx.lineTo(37, 56);
    ctx.moveTo(33, 52);
    ctx.lineTo(33, 60);
    ctx.stroke();
    ctx.restore();
  }

  // Indicator
  let ix = W / 2 - 34;
  for (let j = 0; j < PRODUCTS; j++) {
    const dist = Math.abs(((((j - p) % PRODUCTS) + PRODUCTS + 2.5) % PRODUCTS) - 2.5);
    const w = 5 + 12 * Math.max(0, 1 - dist);
    rr(ctx, ix, 222, w, 5, 2.5);
    ctx.fillStyle = white(0.22 + 0.7 * Math.max(0, 1 - dist));
    ctx.fill();
    ix += w + 6;
  }

  // Bag with a count that bumps as each product settles
  const bump = n > 0 ? Math.sin(Math.PI * clamp(local / 0.5)) * 0.18 : 0;
  ctx.save();
  ctx.translate(188, 30);
  ctx.scale(1 + bump, 1 + bump);
  rr(ctx, -10, -6, 20, 18, 4);
  ctx.strokeStyle = white(0.7);
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -6, 5, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(10, -8, 6.5, 0, TAU);
  ctx.fillStyle = white(1);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "700 8px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String((n % 9) + 1), 10, -7.6);
  ctx.restore();
};

/* ------------------------------------------------------------------
   Motion & kinetic type: a field of lines flowing like silk, with a
   point gliding along the brightest one.
------------------------------------------------------------------- */

const LINES = 16;
const X0 = 14;
const X1 = 210;

function wave(x: number, k: number, t: number) {
  const u = (x - X0) / (X1 - X0);
  const env = Math.sin(Math.PI * u) ** 1.5;
  return env * (Math.sin(x * 0.032 + t * 1.2 + k * 0.32) * 7 + Math.sin(x * 0.014 - t * 0.8 + k * 0.18) * 10);
}

const motionScene: Scene = (ctx, t) => {
  const top = 50;
  const gap = 11.4;
  const hero = 8;
  for (let k = 0; k < LINES; k++) {
    const base = top + k * gap;
    ctx.beginPath();
    for (let x = X0; x <= X1; x += 3) {
      const y = base + wave(x, k, t);
      if (x === X0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const centre = 1 - Math.abs(k - (LINES - 1) / 2) / ((LINES - 1) / 2);
    ctx.strokeStyle = white(k === hero ? 0.95 : 0.1 + 0.42 * centre ** 1.5);
    ctx.lineWidth = k === hero ? 1.5 : 1;
    ctx.stroke();
  }

  // A point gliding along the bright line
  const u = (t * 0.14) % 1;
  const x = X0 + u * (X1 - X0);
  const y = top + hero * gap + wave(x, hero, t);
  const fade = Math.sin(Math.PI * u);
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 16);
  glow.addColorStop(0, white(0.35 * fade));
  glow.addColorStop(1, white(0));
  ctx.fillStyle = glow;
  ctx.fillRect(x - 16, y - 16, 32, 32);
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, TAU);
  ctx.fillStyle = white(fade);
  ctx.fill();
};

/* ------------------------------------------------------------------
   Digital infrastructure: a dotted globe turning slowly, data arcs
   pulsing between regions and a satellite on its orbit.
------------------------------------------------------------------- */

const DOTS = (() => {
  const count = 240;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(i * golden) * r, y, Math.sin(i * golden) * r] as const;
  });
})();

const toVec = (lat: number, lon: number) => {
  const a = (lat * Math.PI) / 180;
  const b = (lon * Math.PI) / 180;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)] as const;
};

const ARCS = [
  [toVec(22, -40), toVec(48, 50)],
  [toVec(-12, 95), toVec(30, 170)],
  [toVec(40, -130), toVec(-24, -55)],
] as const;

function slerp(a: readonly number[], b: readonly number[], s: number) {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const omega = Math.acos(dot);
  const so = Math.sin(omega) || 1;
  const ka = Math.sin((1 - s) * omega) / so;
  const kb = Math.sin(s * omega) / so;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

const infraScene: Scene = (ctx, t) => {
  const cx = 112;
  const cy = 126;
  const R = 74;
  const a = t * 0.32;
  const b = -0.38;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const project = (x: number, y: number, z: number, lift = 1) => {
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    const y2 = y * cb - z1 * sb;
    const z2 = y * sb + z1 * cb;
    return { px: cx + x1 * R * lift, py: cy - y2 * R * lift, depth: (z2 + 1) / 2 };
  };

  const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.5);
  halo.addColorStop(0, white(0.06));
  halo.addColorStop(1, white(0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.strokeStyle = white(0.1);
  ctx.lineWidth = 1;
  ctx.stroke();

  for (const [x, y, z] of DOTS) {
    const { px, py, depth } = project(x, y, z);
    ctx.beginPath();
    ctx.arc(px, py, 0.55 + depth, 0, TAU);
    ctx.fillStyle = white(0.05 + 0.82 * depth ** 2.2);
    ctx.fill();
  }

  // Data arcs with travelling pulses
  ARCS.forEach(([from, to], i) => {
    let prev: ReturnType<typeof project> | null = null;
    for (let s = 0; s <= 1.0001; s += 1 / 28) {
      const v = slerp(from, to, s);
      const pt = project(v[0], v[1], v[2], 1 + 0.24 * Math.sin(Math.PI * s));
      if (prev) {
        ctx.beginPath();
        ctx.moveTo(prev.px, prev.py);
        ctx.lineTo(pt.px, pt.py);
        ctx.strokeStyle = white(0.06 + 0.45 * pt.depth ** 2);
        ctx.stroke();
      }
      prev = pt;
    }
    const s = (t * 0.42 + i / ARCS.length) % 1;
    const v = slerp(from, to, s);
    const pt = project(v[0], v[1], v[2], 1 + 0.24 * Math.sin(Math.PI * s));
    ctx.beginPath();
    ctx.arc(pt.px, pt.py, 2.4, 0, TAU);
    ctx.fillStyle = white((0.25 + 0.75 * pt.depth) * Math.sin(Math.PI * s));
    ctx.fill();
  });

  // Satellite orbit
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath();
  ctx.ellipse(0, 0, 100, 24, 0, 0, TAU);
  ctx.strokeStyle = white(0.14);
  ctx.stroke();
  const th = t * 0.6;
  const sx = Math.cos(th) * 100;
  const sy = Math.sin(th) * 24;
  ctx.fillStyle = white(Math.sin(th) > 0 ? 0.95 : 0.3);
  ctx.fillRect(sx - 3, sy - 3, 6, 6);
  ctx.restore();
};

const SCENES: Record<CategoryId, Scene> = {
  web: webScene,
  uiux: uiScene,
  commerce: commerceScene,
  motion: motionScene,
  infra: infraScene,
};

export function ServiceArt({ id, label, active }: { id: CategoryId; label: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Scene time survives pauses, so a card resumes where it stopped.
  const elapsed = useRef(1.2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const scene = SCENES[id];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;
    let visible = false;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch) return;
      if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
      }
      // Cover-fit the 224 × 272 design space.
      const scale = Math.max(cw / W, ch / H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(
        dpr * scale,
        0,
        0,
        dpr * scale,
        dpr * (cw - W * scale) / 2,
        dpr * (ch - H * scale) / 2,
      );
      ctx.save();
      scene(ctx, elapsed.current);
      ctx.restore();
    };

    const frame = (now: number) => {
      if (last) elapsed.current += Math.min(now - last, 64) / 1000;
      last = now;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const run = active && visible && !still;
      if (run && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resize = new ResizeObserver(draw);
    observer.observe(canvas);
    resize.observe(canvas);
    draw();
    sync();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
    };
  }, [id, active]);

  return (
    <div className="svc-art">
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  );
}
