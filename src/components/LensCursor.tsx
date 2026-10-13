"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const MIN_SIZE = 96;
const MAX_SIZE = 260;

/*
 * Ring cursor for the big things on the page: a white ring, with an ↗ arrow
 * over links, that inverts whatever it crosses (mix-blend-mode: difference).
 * Targets opt in with `data-cursor="link"` (ring + arrow) or
 * `data-cursor="lens"` (ring only). The ring follows the target's font size
 * unless `data-cursor-size` sets a diameter in px.
 * Mouse only: touch and keyboard users keep the native behaviour.
 */
export default function LensCursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const arrow = el?.querySelector<SVGSVGElement>("[data-lens-arrow]");
    if (!el || !arrow) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    const enable = () => {
      const html = document.documentElement;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ease = (seconds: number) => (still ? 0 : seconds);

      html.classList.add("has-lens-cursor");
      gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 1 });
      const xTo = gsap.quickTo(el, "x", { duration: ease(0.28), ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: ease(0.28), ease: "power3" });

      let target: Element | null = null;
      let pointer: { x: number; y: number } | null = null;
      let frame = 0;

      const show = (next: Element | null) => {
        if (next === target) return;
        target = next;
        if (!next) {
          gsap.to(el, { scale: 0, duration: ease(0.35), ease: "power3.out", overwrite: "auto" });
          return;
        }
        const fontSize = parseFloat(getComputedStyle(next).fontSize);
        const size =
          Number(next.getAttribute("data-cursor-size")) || gsap.utils.clamp(MIN_SIZE, MAX_SIZE, fontSize * 1.45);
        const link = next.getAttribute("data-cursor") === "link";
        // Strokes thicken a little with the ring, like the reference's chunky arrow.
        const stroke = gsap.utils.clamp(4, 8, size * 0.032);
        gsap.to(arrow, { autoAlpha: link ? 1 : 0, scale: link ? 1 : 0.5, duration: ease(0.35), overwrite: true });
        gsap.to(el, {
          width: size,
          height: size,
          "--lens-stroke": `${stroke}px`,
          scale: 1,
          duration: ease(0.55),
          ease: "expo.out",
          overwrite: "auto",
        });
      };

      const targetAt = (x: number, y: number) => document.elementFromPoint(x, y)?.closest("[data-cursor]") ?? null;
      // Re-check once the page has settled under a still mouse (scroll, a dialog opening…).
      const recheck = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (pointer) show(targetAt(pointer.x, pointer.y));
        });
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        // First sighting: jump into place instead of flying in from the corner.
        if (!pointer) gsap.set(el, { x: e.clientX, y: e.clientY });
        pointer = { x: e.clientX, y: e.clientY };
        xTo(e.clientX);
        yTo(e.clientY);
        show(e.target instanceof Element ? e.target.closest("[data-cursor]") : null);
      };
      const onOut = (e: PointerEvent) => {
        if (e.relatedTarget) return;
        // Left the window.
        pointer = null;
        show(null);
      };
      const onDown = () => {
        if (target) gsap.to(el, { scale: 0.86, duration: ease(0.18), ease: "power2.out", overwrite: "auto" });
      };
      const onUp = () => {
        if (target) gsap.to(el, { scale: 1, duration: ease(0.6), ease: "back.out(2.5)", overwrite: "auto" });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", recheck, { passive: true });
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("click", recheck, true);
      document.addEventListener("pointerout", onOut);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", recheck);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("click", recheck, true);
        document.removeEventListener("pointerout", onOut);
        cancelAnimationFrame(frame);
        html.classList.remove("has-lens-cursor");
        gsap.killTweensOf([el, arrow]);
        gsap.set(el, { autoAlpha: 0, scale: 0 });
      };
    };

    let disable = fine.matches ? enable() : null;
    const onChange = () => {
      disable?.();
      disable = fine.matches ? enable() : null;
    };
    fine.addEventListener("change", onChange);
    return () => {
      fine.removeEventListener("change", onChange);
      disable?.();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none invisible fixed left-0 top-0 z-[70] grid size-24 place-items-center rounded-full border-solid border-white mix-blend-difference [--lens-stroke:4px] [border-width:var(--lens-stroke)]"
    >
      {/* Lucide's arrow-up-right, drawn with a fixed screen-space stroke at any ring size. */}
      <svg
        data-lens-arrow
        viewBox="0 0 24 24"
        className="size-full"
        fill="none"
        stroke="#fff"
        strokeLinecap="square"
        style={{ strokeWidth: "calc(var(--lens-stroke) * 1.5)" }}
      >
        <path d="M7 7h10v10M7 17 17 7" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
