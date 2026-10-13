"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Shared scroll reveals, driven by data attributes inside `scope`:
 * - `[data-divider]`    hairline that draws in from the left
 * - `[data-annotation]` curly brackets closing in around the label
 * - `[data-fade]`       batched fade-up
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-divider]", root).forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-annotation]", root).forEach((el) => {
          const [open, label, close] = Array.from(el.children);
          gsap
            .timeline({
              defaults: { duration: 1, ease: "expo.out" },
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            })
            .from(label, { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, 0)
            .from(open, { x: 18, autoAlpha: 0 }, 0)
            .from(close, { x: -18, autoAlpha: 0 }, 0);
        });

        const fades = gsap.utils.toArray<HTMLElement>("[data-fade]", root);
        if (!fades.length) return;
        gsap.set(fades, { autoAlpha: 0, y: 20 });
        ScrollTrigger.batch(fades, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.07,
            }),
        });
      });
    },
    { scope },
  );
}
