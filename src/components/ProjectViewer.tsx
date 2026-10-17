"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Lock, Monitor, Smartphone, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { projectPath, type Device, type Project } from "@/lib/projects";
import { CategoryLabel } from "./ui/CategoryLabel";

type ViewerProps = {
  projects: Project[];
  index: number;
  /** Where the clicked card sits, so the popup can grow out of it. */
  origin: DOMRect | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rect of the card for `slug`, if it is on the page. */
const cardRect = (slug: string) =>
  document.querySelector<HTMLElement>(`[data-project="${slug}"]`)?.getBoundingClientRect() ?? null;

function morphFrom(panel: HTMLElement, from: DOMRect) {
  const to = panel.getBoundingClientRect();
  return {
    x: from.left - to.left,
    y: from.top - to.top,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height,
    transformOrigin: "0 0",
  };
}

/**
 * Huge in-page preview of a project: a browser-style window that scrolls
 * through the full-page capture, with a desktop / phone toggle. No URL or
 * domain is ever shown or linked.
 */
export default function ProjectViewer({ projects, index, origin, onIndexChange, onClose }: ViewerProps) {
  const project = projects[index];
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const [device, setDevice] = useState<Device>(() => (window.innerWidth < 768 ? "mobile" : "desktop"));
  const [scrolled, setScrolled] = useState(false);
  const preview = project.previews[device] ?? project.previews.desktop;
  const titleId = `viewer-title-${project.slug}`;

  /* Open: grow out of the card. */
  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.from([backdrop.current, el], { autoAlpha: 0, duration: 0.2 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
      tl.from(backdrop.current, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0);
      if (origin) {
        tl.from(el, { ...morphFrom(el, origin), duration: 0.85 }, 0);
      } else {
        tl.from(el, { y: 40, scale: 0.97, autoAlpha: 0, duration: 0.6, ease: "expo.out" }, 0);
      }
      // Opacity only (not autoAlpha) so the close button can take focus straight away.
      tl.from("[data-viewer-content]", { opacity: 0, duration: 0.45, ease: "power2.out" }, 0.5);
    },
    { scope: panel },
  );

  /* Close: shrink back into the current project's card. */
  const requestClose = useCallback(() => {
    const el = panel.current;
    if (!el || closing.current) return;
    closing.current = true;
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    const target = cardRect(project.slug);
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(el.querySelectorAll("[data-viewer-content]"), { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0);
    if (target) {
      const to = el.getBoundingClientRect();
      tl.to(
        el,
        {
          x: target.left - to.left,
          y: target.top - to.top,
          scaleX: target.width / to.width,
          scaleY: target.height / to.height,
          transformOrigin: "0 0",
          duration: 0.6,
          ease: "expo.inOut",
        },
        0.08,
      );
    } else {
      tl.to(el, { scale: 0.96, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
    }
    tl.to(backdrop.current, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.25);
  }, [onClose, project.slug]);

  const go = useCallback(
    (step: number) => onIndexChange((index + step + projects.length) % projects.length),
    [index, onIndexChange, projects.length],
  );

  /* Page scroll lock + focus handling for the lifetime of the popup. */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = prevOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  /* New project or device: back to the top, with a short crossfade. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = 0;
    setScrolled(false);
    if (progress.current) progress.current.style.transform = "scaleX(0)";
    if (!prefersReducedMotion()) {
      gsap.fromTo(el.firstElementChild, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" });
    }
  }, [index, device]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`;
    if (!scrolled && el.scrollTop > 40) setScrolled(true);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      requestClose();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      go(e.key === "ArrowLeft" ? -1 : 1);
    } else if (e.key === "Tab" && panel.current) {
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const tiles = preview?.tiles ?? [];
  const phone = device === "mobile";

  const tileImages = (sizes: string) =>
    tiles.map((tile, i) => (
      <Image
        key={tile.src}
        src={tile.src}
        width={tile.width}
        height={tile.height}
        alt={i === 0 ? `Full-page ${device} preview of ${project.title}` : ""}
        sizes={sizes}
        loading={i < 2 ? "eager" : "lazy"}
        // The faint fill is the loading skeleton: the tile's space is reserved and tinted until it arrives.
        className={cn("block h-auto w-full select-none bg-white/[0.04]", i > 0 && "-mt-px")}
        draggable={false}
      />
    ));

  return createPortal(
    <div className="fixed inset-0 z-[90]" onKeyDown={onKeyDown}>
      <div
        ref={backdrop}
        aria-hidden
        className="absolute inset-0 bg-canvas/80 backdrop-blur-md"
        onClick={requestClose}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-0 flex flex-col overflow-hidden border-hairline bg-surface md:inset-4 md:rounded-2xl md:border lg:inset-6"
      >
        {/* Window chrome */}
        <div
          data-viewer-content
          className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-3 sm:gap-4 sm:px-5"
        >
          <div className="hidden items-center gap-1.5 md:flex" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full border border-white/15" />
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <h2 id={titleId} className="truncate font-display text-[15px] font-medium uppercase leading-none sm:text-[17px]">
              {project.title}
            </h2>
            <span className="hidden xl:inline-flex">
              <CategoryLabel id={project.category} className="text-[11px]" />
            </span>
          </div>

          {/* Address bar: intentionally shows no domain. */}
          <div className="mx-auto hidden h-9 min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-canvas/60 px-4 text-[13px] text-muted lg:flex">
            <Lock aria-hidden className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">Private preview · {project.title}</span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div role="group" aria-label="Device" className="flex rounded-full border border-hairline p-0.5">
              {(
                [
                  ["desktop", Monitor, "Desktop"],
                  ["mobile", Smartphone, "Mobile"],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={device === value}
                  onClick={() => setDevice(value)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors duration-300",
                    device === value
                      ? "border-white/70 text-primary"
                      : "border-transparent text-muted hover:text-primary",
                  )}
                >
                  <Icon aria-hidden className="size-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Browsing the showcase: link out to the case study and step between projects.
                Opened from a case study (a single project), neither applies. */}
            {projects.length > 1 ? (
              <>
                <a
                  href={projectPath(project.slug)}
                  className="hidden h-9 items-center gap-1.5 rounded-full border border-hairline px-3 text-[13px] text-muted transition-colors hover:border-white/40 hover:text-primary md:flex"
                >
                  Case study
                  <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={1.5} />
                </a>
                <div className="hidden items-center gap-1 sm:flex">
                  <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() => go(-1)}
                    className="grid size-10 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-white/40 hover:text-primary"
                  >
                    <ChevronLeft aria-hidden className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next project"
                    onClick={() => go(1)}
                    className="grid size-10 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-white/40 hover:text-primary"
                  >
                    <ChevronRight aria-hidden className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </>
            ) : null}

            <button
              type="button"
              data-autofocus
              aria-label="Close preview"
              onClick={requestClose}
              className="grid size-10 place-items-center rounded-full border border-white/40 transition-colors hover:border-primary hover:bg-white/5"
            >
              <X aria-hidden className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div data-viewer-content className="relative min-h-0 flex-1">
          <div className="absolute inset-x-0 top-0 z-10 h-px bg-hairline">
            <div
              ref={progress}
              className="h-px origin-left bg-linear-to-r from-motion to-web"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          {phone ? (
            <div className="flex h-full items-stretch justify-center gap-12 md:items-center md:px-8 md:py-6 xl:gap-20">
              <aside className="hidden w-[320px] shrink-0 lg:block">
                <CategoryLabel id={project.category} />
                <p className="mt-6 font-display text-[clamp(28px,2.6vw,40px)] font-medium uppercase leading-[1.05]">
                  {project.title}
                </p>
                <p className="mt-2 text-[15px] text-muted">{project.type}</p>
                <p className="mt-6 text-[16px] leading-[1.6] text-primary/80">{project.summary}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {project.highlights.map((h) => (
                    <li key={h} className="rounded-full border border-hairline px-3 py-1 text-[12px] text-primary/80">
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="mt-10 text-[13px] text-muted">
                  Scroll inside the phone to explore.{projects.length > 1 ? " Use ← → to switch projects." : ""}
                </p>
              </aside>

              {/* Phone frame on larger screens; edge-to-edge on an actual phone. */}
              <div className="relative h-full w-full md:aspect-[410/864] md:h-full md:max-h-[880px] md:w-auto md:rounded-[46px] md:border md:border-white/15 md:bg-black md:p-2.5">
                <div className="relative h-full overflow-hidden md:rounded-[38px]">
                  <div
                    ref={scroller}
                    data-viewer-scroll
                    tabIndex={0}
                    aria-label={`${project.title} mobile preview, scrollable`}
                    onScroll={onScroll}
                    className="viewer-scroll h-full overflow-y-auto overscroll-contain bg-canvas outline-none"
                  >
                    <div>{tileImages("(min-width: 768px) 390px, 100vw")}</div>
                  </div>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-2 hidden h-6 w-24 -translate-x-1/2 rounded-full bg-black md:block"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={scroller}
              data-viewer-scroll
              tabIndex={0}
              aria-label={`${project.title} desktop preview, scrollable`}
              onScroll={onScroll}
              className="viewer-scroll h-full overflow-y-auto overscroll-contain bg-canvas outline-none"
            >
              <div className="mx-auto w-full max-w-[1440px]">{tileImages("(min-width: 1500px) 1440px, 96vw")}</div>
            </div>
          )}

          {/* Scroll hint until the visitor starts scrolling. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-canvas/80 px-4 py-2 text-[13px] backdrop-blur-md transition-opacity duration-500",
              scrolled ? "opacity-0" : "opacity-100",
            )}
          >
            <ArrowDown className="size-3.5 animate-bounce" strokeWidth={1.5} />
            Scroll to explore the full site
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
