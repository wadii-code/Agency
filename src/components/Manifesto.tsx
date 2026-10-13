"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { Pill } from "./ui/Pill";

const PREFIX = "We craft";
const WORDS = [
  { word: "websites", color: "var(--cat-web)" },
  { word: "interfaces", color: "var(--cat-uiux)" },
  { word: "storefronts", color: "var(--cat-commerce)" },
  { word: "motion", color: "var(--cat-motion)" },
  { word: "infrastructure", color: "var(--cat-infra)" },
  { word: "experiences", color: "var(--text-primary)" },
];

/* Framer "Scroll Synced Text" settings: fade-in mode, middle placement. */
const INACTIVE_OPACITY = 0.2;
const SCRUB = 0.7;

/**
 * Studio statement, after the Framer "Scroll Synced Text" component: the
 * prefix sticks to the middle of the screen while the list scrolls past it.
 * Each word lights up as it lines up with the prefix, and the scroll snaps
 * from word to word. Reduced motion shows every word lit.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const list = root.current?.querySelector<HTMLElement>("[data-word-list]");
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", root.current);
      if (!list || words.length < 2) return;

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const line = () => words[0].offsetHeight;
        const middle = () => window.innerHeight / 2;

        // The first word arrives lit; the others light up over the last line before the prefix.
        words.slice(1).forEach((word) => {
          gsap.fromTo(
            word,
            { opacity: INACTIVE_OPACITY },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: word,
                start: () => `center ${middle() + line()}px`,
                end: () => `center ${middle()}px`,
                scrub: SCRUB,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // Settle with a word level with the prefix.
        ScrollTrigger.create({
          trigger: list,
          start: () => `top ${middle() - line() / 2}px`,
          end: () => `bottom ${middle() + line() / 2}px`,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (words.length - 1),
            duration: { min: 0.2, max: 0.2 },
            delay: 0.02,
            ease: "power2.inOut",
            directional: false,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="studio"
      aria-labelledby="studio-title"
      className="relative overflow-x-clip bg-canvas py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-1/2 h-[80%] w-[60%] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(37,31,73,0.55), transparent)" }}
      />

      <div className="shell relative">
        <div className="flex items-start gap-[0.26em] font-sans text-[clamp(25px,7.4vw,124px)] font-extrabold leading-[1.1] tracking-[-0.045em] md:mt-28">
          <h2 id="studio-title" className="sticky top-[calc(50dvh-0.55em)] shrink-0 whitespace-nowrap">
            <span aria-hidden>{PREFIX}</span>
            <span className="sr-only">
              {PREFIX} {WORDS.slice(0, -1).map((w) => w.word).join(", ")} and {WORDS.at(-1)?.word}.
            </span>
          </h2>
          <ul data-word-list aria-hidden className="min-w-0">
            {WORDS.map(({ word, color }) => (
              <li key={word} data-word className="whitespace-nowrap" style={{ color }}>
                {word}
              </li>
            ))}
          </ul>
        </div>

        <div data-fade className="mt-20 md:mt-28">
          <Pill href="#process" icon={<ArrowDown className="size-4" strokeWidth={1.5} />}>
            How we work
          </Pill>
        </div>
      </div>
    </section>
  );
}
