"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { CONTACT_EMAIL, CONTACT_EMAIL_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { categories, categoryOrder, servicePath } from "@/lib/taxonomy";
import { SparkMark } from "./ui/SparkLogo";

const SOCIALS = [{ label: "Instagram", handle: INSTAGRAM_HANDLE, href: INSTAGRAM_URL }];

/* Studio clock: client-only so SSR and hydration never disagree. */
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Casablanca",
});
const subscribeClock = (onChange: () => void) => {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
};
function useCasablancaTime() {
  return useSyncExternalStore(
    subscribeClock,
    () => timeFormat.format(Date.now()),
    () => null,
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-fade>
      <p className="text-[13px] uppercase tracking-[0.08em] text-muted">{title}</p>
      <div className="mt-4 flex flex-col items-start gap-1 text-[16px]">{children}</div>
    </div>
  );
}

// min-h-11 keeps every footer link a comfortable 44px tap target.
const linkClass = "inline-flex min-h-11 items-center text-primary/80 transition-colors duration-300 hover:text-primary";

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const time = useCasablancaTime();
  useReveal(root);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-talk]", {
          yPercent: 105,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-talk]", start: "top 92%", once: true },
        });
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true };
        gsap.fromTo("[data-watermark]", { yPercent: 18, rotation: -8 }, { yPercent: 0, rotation: 0, ease: "none", scrollTrigger: scrub });
        gsap.from("[data-wordmark]", { yPercent: 45, ease: "none", scrollTrigger: scrub });
      });
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden border-t border-hairline bg-surface"
    >
      {/* Watermarks & ambient wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-[20%] -top-[30%] h-[90%] w-[70%] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(37,31,73,0.85), transparent)" }}
        />
        <SparkMark
          data-watermark
          className="absolute -right-[18%] top-[8%] h-[min(80vw,760px)] w-auto text-white/[0.035] md:-right-[8%]"
        />
      </div>

      <div className="shell pt-24 md:pt-36">
        {/* "Let's talk" opens the contact popup. Mice get the inverting ring cursor (LensCursor), everyone else an inline arrow. */}
        <h2 id="contact-title">
          <button
            type="button"
            data-contact
            data-cursor="link"
            aria-haspopup="dialog"
            className="inline-flex max-w-full items-center gap-[0.16em] text-left font-sans text-[clamp(56px,14vw,220px)] font-medium leading-[1.05] tracking-[-0.045em] text-primary/90 transition-colors duration-500 hover:text-primary"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-talk className="block whitespace-nowrap">
                Let’s talk
              </span>
            </span>
            <ArrowUpRight aria-hidden className="size-[0.5em] shrink-0 text-muted in-[.has-lens-cursor]:hidden" strokeWidth={1.5} />
          </button>
        </h2>
        <div data-divider className="mt-20 h-px w-full bg-hairline md:mt-28" />

        <div className="grid gap-12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Studio">
            <p className="py-2.5 text-primary/80">Casablanca, working worldwide</p>
            <p className="font-mono text-[14px] text-muted">
              Local time <span className="text-primary/80">{time ?? "--:--"}</span>
            </p>
            <a href="/work" className={`mt-2 ${linkClass}`}>
              Selected work
            </a>
          </FooterColumn>

          {/* Every service page, on every page: the site's topic map. */}
          <FooterColumn title="Services">
            <nav aria-label="Services" className="flex flex-col items-start gap-1">
              {categoryOrder.map((id) => (
                <a key={id} href={servicePath(id)} className={linkClass}>
                  {categories[id].name}
                </a>
              ))}
            </nav>
          </FooterColumn>

          <FooterColumn title="Contact">
            <a
              href={CONTACT_EMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-all ${linkClass}`}
            >
              {CONTACT_EMAIL}
              <span className="sr-only"> (opens Gmail in a new tab)</span>
            </a>
          </FooterColumn>

          <FooterColumn title="Social">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group gap-1.5 ${linkClass}`}
              >
                {s.handle}
                <span className="sr-only"> on {s.label} (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 text-muted transition-[translate,color] duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={1.5}
                />
              </a>
            ))}
          </FooterColumn>
        </div>

        {/* Copyright: the mark and studio name on the left, the legal line on the right. */}
        <div className="mt-20 md:mt-28">
          <div aria-hidden className="h-px bg-linear-to-r from-motion/0 via-motion/50 to-web/0" />
          <p className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-3">
              <SparkMark className="h-4 w-auto text-primary" />
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
                SPARK Digital
              </span>
              <span aria-hidden className="h-3.5 w-px bg-white/20" />
              <span className="font-mono text-[12px] text-muted">© 2026</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">All rights reserved</span>
          </p>
        </div>
      </div>

      {/* Oversized glass wordmark over a soft white glow. */}
      <div aria-hidden className="pointer-events-none relative select-none overflow-hidden">
        <div
          className="absolute inset-x-[8%] bottom-[-30%] top-[10%] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgb(255 255 255 / 0.09), transparent)" }}
        />
        {/* Lights the letters' outer edges, brightest along the top (used by .glass-text). */}
        <svg className="absolute size-0">
          <filter id="glass-letter" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 40 0" result="solid" />
            <feMorphology in="solid" operator="erode" radius="1" result="inner" />
            <feComposite in="solid" in2="inner" operator="out" result="rim" />
            <feOffset in="solid" dy="2.5" result="shifted" />
            <feComposite in="solid" in2="shifted" operator="out" result="top" />
            <feFlood floodColor="#fff" floodOpacity="0.24" />
            <feComposite in2="rim" operator="in" result="rimLit" />
            <feFlood floodColor="#fff" floodOpacity="0.7" />
            <feComposite in2="top" operator="in" result="topLit" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="rimLit" />
              <feMergeNode in="topLit" />
            </feMerge>
          </filter>
        </svg>
        <p
          data-wordmark
          className="glass-text -mb-[0.12em] text-center font-display text-[24vw] font-bold uppercase leading-[0.85] tracking-[-0.02em]"
        >
          Spark
        </p>
      </div>
    </footer>
  );
}
