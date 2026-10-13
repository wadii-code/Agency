"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DualFontText } from "./ui/DualFontText";
import { Pill } from "./ui/Pill";
import { STARFIELD, Starfield } from "./Starfield";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const title = el?.querySelector<HTMLElement>("[data-hero-title]");
      if (!el || !title) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Intro: the headline blurs up word by word as the stars rush in. */
        gsap.set(title, { autoAlpha: 1 });
        gsap.from(title.querySelectorAll("[data-df-word]"), {
          yPercent: 60,
          opacity: 0,
          filter: "blur(14px)",
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.07,
          delay: 0.1,
          clearProps: "filter,transform",
        });

        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from("[data-stars]", { autoAlpha: 0, scale: 1.2, duration: 2.8 }, 0)
          .fromTo(
            "[data-hero-fade]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 },
            0.45,
          );

        /* Scroll-out parallax */
        const scrub = { trigger: el, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-content]", { opacity: 0.15, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-stars-parallax]", { yPercent: 18, ease: "none", scrollTrigger: scrub });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas"
    >
      {/* Starfield backdrop (Framer "Stars" settings), fading into the page below. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: STARFIELD.background }}>
        <div data-stars-parallax className="absolute inset-0">
          <Starfield data-stars className="absolute inset-0" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-canvas" />
      </div>

      <div
        data-hero-content
        className="shell relative flex flex-1 flex-col pb-8 pt-[calc(var(--header-h)+24px)]"
      >
        {/* Centred mixed-font headline and calls to action. */}
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <DualFontText
            id="hero-title"
            data-hero-title
            data-hero-hide
            data-cursor="lens"
            lines={["We build", "websites &", "digital", "solutions"]}
            className="font-display text-hero font-bold uppercase"
          />
          <div data-hero-fade data-hero-hide className="mt-12 flex flex-wrap justify-center gap-3 md:mt-14">
            <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog">
              Start a Project
            </Pill>
            <Pill href="#work">View Showcases</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
