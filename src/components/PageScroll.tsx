"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const storageKey = () => `spark-scroll:${window.location.pathname}`;

function readSaved() {
  try {
    const value = Number(window.sessionStorage.getItem(storageKey()));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

/**
 * Page-level scrolling:
 * - Reloading keeps the reading position. It is saved whenever the page is
 *   left and, after a reload, put back once fonts and layout have settled,
 *   unless the visitor has already started scrolling.
 * - In-page links (#work, #contact…) scroll smoothly. This is done here rather
 *   than with CSS `scroll-behavior`, which skews ScrollTrigger's measurements.
 */
export default function PageScroll() {
  /* Remember and restore the scroll position. */
  useEffect(() => {
    const save = () => {
      try {
        window.sessionStorage.setItem(storageKey(), String(Math.round(window.scrollY)));
      } catch {
        // Storage can be unavailable (private mode); the browser's own restore still applies.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibility);

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const saved = navigation?.type === "reload" ? readSaved() : null;

    let touched = false;
    const onUserScroll = () => {
      touched = true;
    };
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    let frame = 0;
    const restore = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (saved === null || touched || Math.abs(window.scrollY - saved) < 2) return;
        window.scrollTo({ top: saved, behavior: "instant" });
        ScrollTrigger.update();
      });
    };

    // Late layout changes (fonts swapping in, viewport units settling) would
    // otherwise drift the restored position, so re-apply it while the page
    // height changes during the first moments after the reload.
    const settle = new ResizeObserver(restore);
    const stopSettling = window.setTimeout(() => settle.disconnect(), 2500);

    if (saved !== null) {
      userEvents.forEach((type) => window.addEventListener(type, onUserScroll, { passive: true }));
      restore();
      settle.observe(document.body);
      document.fonts?.ready.then(restore);
      if (document.readyState === "complete") restore();
      else window.addEventListener("load", restore, { once: true });
    }

    return () => {
      settle.disconnect();
      window.clearTimeout(stopSettling);
      cancelAnimationFrame(frame);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("load", restore);
      userEvents.forEach((type) => window.removeEventListener(type, onUserScroll));
    };
  }, []);

  /* Smooth scrolling for in-page links. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      // The skip link keeps its native jump, which also moves keyboard focus.
      if (!link || link.classList.contains("skip-link")) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: still ? "instant" : "smooth", block: "start" });
      window.history.pushState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
