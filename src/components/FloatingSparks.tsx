"use client";

import { useEffect, useRef } from "react";
import { SparkGlyph } from "./ui/SparkLogo";

const COUNT = 10;
const TAU = Math.PI * 2;
// How far past the screen edges a spark travels before wrapping around.
const MARGIN = 40;

/** Small seeded random generator (mulberry32), so server and client agree on the layout. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(11);
const SPARKS = Array.from({ length: COUNT }, () => ({
  x: random(), // start position, as a fraction of the viewport
  y: random(),
  size: 7 + random() * 11, // px
  alpha: 0.3 + random() * 0.45,
  rise: 5 + random() * 12, // px per second, drifting upward
  depth: 0.08 + random() * 0.3, // how much page scrolling moves it
  sway: 12 + random() * 28, // px of side-to-side wander
  f1: 0.05 + random() * 0.08, // wander frequencies (Hz)
  f2: 0.03 + random() * 0.06,
  phase: random() * TAU,
  spin: (random() - 0.5) * 24, // degrees per second
  twinkle: 0.5 + random() * 1.1,
}));

/**
 * Ten white sparks (the logo's four-point star) floating over the whole site:
 * each drifts slowly upward on its own wandering path, turning and gently
 * twinkling, and moves with the page at its own depth when scrolling.
 * Purely decorative: no pointer events, under the navbar and popups.
 * Reduced motion leaves them still.
 */
export default function FloatingSparks() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-spark]") ?? []);
    if (!els.length) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };

    const place = (t: number) => {
      const scroll = window.scrollY;
      const span = height + MARGIN * 2;
      SPARKS.forEach((s, i) => {
        // Rise and scroll parallax, wrapping off the top back in at the bottom.
        let y = s.y * height - t * s.rise - scroll * s.depth;
        y = (((y % span) + span) % span) - MARGIN;
        const x =
          s.x * width +
          Math.sin(t * s.f1 * TAU + s.phase) * s.sway +
          Math.sin(t * s.f2 * TAU + s.phase * 1.7) * s.sway * 0.5;
        const glow = 0.5 + 0.5 * Math.sin(t * s.twinkle + s.phase);
        const el = els[i];
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(t * s.spin).toFixed(1)}deg) scale(${(0.75 + 0.35 * glow).toFixed(3)})`;
        el.style.opacity = (s.alpha * (0.55 + 0.45 * glow)).toFixed(3);
      });
    };

    window.addEventListener("resize", onResize);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(0);
      const onScroll = () => place(0);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
      };
    }

    let raf = 0;
    const frame = (now: number) => {
      place(now / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[35] overflow-hidden">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          data-spark
          className="absolute left-0 top-0 text-white opacity-0 will-change-transform"
          style={{ width: s.size, height: s.size }}
        >
          <SparkGlyph className="size-full drop-shadow-[0_0_6px_rgb(255_255_255/0.55)]" />
        </span>
      ))}
    </div>
  );
}
