"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Shared scroll reveals, driven by data attributes inside `scope`:
 * - `[data-divider]`    hairline that draws in from the left
 * - `[data-annotation]` curly brackets closing in around the label
 * - `[data-fade]`       batched fade-up
 * - `[data-wipe]`       card that wipes up from its bottom edge while its
 *                       `[data-zoom]` image settles in (batched)
 * Anything already on screen when the page loads is left as it is: it was
 * painted (or animated in by the CSS intro) before this ran, and hiding it
 * to replay the reveal would flash.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const offscreen = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;
      const pick = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, root).filter(offscreen);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        pick("[data-divider]").forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        pick("[data-annotation]").forEach((el) => {
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

        const cards = pick("[data-wipe]");
        if (cards.length) {
          const zoomOf = (card: HTMLElement) => card.querySelector<HTMLElement>("[data-zoom]");
          gsap.set(cards, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(cards.map(zoomOf).filter(Boolean), { scale: 1.18 });
          ScrollTrigger.batch(cards, {
            start: "top 88%",
            once: true,
            onEnter: (batch) => {
              // Cleared afterwards: a clip-path would stop the glass from blurring what sits behind it.
              gsap.to(batch, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "expo.inOut",
                stagger: 0.1,
                clearProps: "clipPath",
              });
              gsap.to((batch as HTMLElement[]).map(zoomOf).filter(Boolean), {
                scale: 1,
                duration: 1.6,
                ease: "expo.out",
                stagger: 0.1,
                delay: 0.15,
              });
            },
          });
        }

        const fades = pick("[data-fade]");
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
