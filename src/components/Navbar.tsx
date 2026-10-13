"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { CONTACT_EMAIL, CONTACT_EMAIL_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { Annotation } from "./ui/Annotation";
import { Pill } from "./ui/Pill";
import { SparkMark } from "./ui/SparkLogo";

export const navLinks = [
  { href: "#studio", label: "Studio" },
  { href: "#process", label: "Process" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Dynamic-island navbar, after the Framer "Dynamic Navbar": a floating black
 * pill that lists every link at the top of the page, then collapses to just
 * the section you are reading. The pill springs between widths and the label
 * blurs up into place. Hover or keyboard focus opens the full list again.
 */
export default function Navbar() {
  const header = useRef<HTMLElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const settledWidth = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const current = navLinks.find((l) => l.href === `#${active}`) ?? null;
  const expanded = engaged || current === null;

  /* Mobile menu: page scroll lock + Escape. */
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Spring the pill between its old and new natural widths. */
  useLayoutEffect(() => {
    const el = pill.current;
    if (!el) return;
    // Mid-animation, start from where the pill visually is right now.
    const from = el.style.width ? el.getBoundingClientRect().width : settledWidth.current;
    gsap.killTweensOf(el);
    el.style.width = "";
    const to = el.getBoundingClientRect().width;
    settledWidth.current = to;
    if (from === null || Math.abs(from - to) < 1 || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { width: from },
      {
        width: to,
        duration: 0.6,
        ease: "back.out(1.25)",
        onComplete: () => {
          el.style.width = "";
        },
      },
    );
  }, [expanded, active]);

  useGSAP(() => {
    const el = header.current;
    if (!el) return;

    // Track which section is being read (refreshed after pinned sections add their spacing).
    navLinks.forEach(({ href }) => {
      const id = href.slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        refreshPriority: -1,
        onToggle: (self) => setActive((prev) => (self.isActive ? id : prev === id ? null : prev)),
      });
    });

    ScrollTrigger.create({
      start: 40,
      end: "max",
      onToggle: (self) => setScrolled(self.isActive),
    });

    // Drop in with the hero's entrance.
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(el, { yPercent: -160, duration: 1.1, ease: "expo.out", delay: 0.3 });
    });
  });

  const close = () => setOpen(false);
  const label = current?.label ?? "SPARK";

  return (
    <>
      <header ref={header} className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-4">
        <div
          ref={pill}
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          onFocus={() => setEngaged(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
          }}
          className={cn(
            "glass glass-dark glass-nav pointer-events-auto flex h-[60px] items-center justify-center overflow-hidden rounded-[32px] transition-[padding] duration-300",
            scrolled ? "px-2.5 py-2" : "p-2.5",
          )}
        >
          <nav aria-label="Primary" className="flex items-center gap-4 whitespace-nowrap pl-2.5">
            <a href="#top" aria-label="SPARK, back to top" onClick={close} className="grid shrink-0 place-items-center">
              <SparkMark className="h-[22px] w-auto" />
            </a>

            {/* Desktop: every link, or just the section being read. */}
            <ul
              key={expanded ? "all" : (active ?? "none")}
              className="hidden items-center gap-3.5 px-2 md:flex"
            >
              {(expanded ? navLinks : current ? [current] : []).map((link) => {
                const isCurrent = link.href === `#${active}`;
                return (
                  <li key={link.href} className="nav-appear">
                    <a
                      href={link.href}
                      aria-current={isCurrent ? "location" : undefined}
                      className={cn(
                        "flex items-center gap-1.5 text-[15px] leading-none transition-colors duration-300",
                        isCurrent || !expanded ? "text-primary" : "text-primary/60 hover:text-primary",
                      )}
                    >
                      {isCurrent && expanded ? (
                        <span aria-hidden className="size-1.5 rounded-full bg-linear-to-r from-motion to-web" />
                      ) : null}
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Mobile: the current section only. */}
            <span key={label} className="nav-appear px-1 text-[15px] leading-none md:hidden">
              {label}
            </span>

            <Pill
              href="#contact"
              variant="gradient"
              size="sm"
              data-contact
              aria-haspopup="dialog"
              className="hidden h-10 sm:inline-flex"
            >
              Start a Project
            </Pill>
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/40 transition-colors hover:border-primary md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" strokeWidth={1.5} /> : <Menu className="size-4" strokeWidth={1.5} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu: sibling of the header so `fixed` isn't trapped by its backdrop-filter. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-canvas/95 backdrop-blur-xl transition-[opacity,visibility] duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-between pb-10 pt-[calc(var(--header-h)+24px)]">
          <div>
            <Annotation>Menu</Annotation>
            <ul className="mt-6">
              {navLinks.map((link, i) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    className="flex items-baseline gap-4 border-b border-hairline py-5 font-display text-[36px] font-medium uppercase leading-none"
                  >
                    <span className="font-sans text-[13px] font-normal text-muted">0{i + 1}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog" onClick={close}>
              Start a Project
            </Pill>
            <p className="flex flex-col items-start gap-1 text-[14px] leading-relaxed text-muted">
              <a
                href={CONTACT_EMAIL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 transition-colors hover:text-primary"
              >
                {CONTACT_EMAIL}
                <span className="sr-only"> (opens Gmail in a new tab)</span>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 transition-colors hover:text-primary"
              >
                {INSTAGRAM_HANDLE}
                <span className="sr-only"> on Instagram (opens in a new tab)</span>
              </a>
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
