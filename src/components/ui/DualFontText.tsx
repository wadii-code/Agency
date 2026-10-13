"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

type DualFontTextProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  /** One entry per line. Lines are fixed, so letters changing width never re-wrap the text. */
  lines: string[];
  as?: "h1" | "h2" | "p";
  /** Milliseconds between shuffles (the Framer default is 300). */
  speed?: number;
};

/*
 * Mixed-font headline, after the Framer "Dual Font Animation": on a short
 * interval every letter randomly switches between two faces, the bold display
 * sans and an italic serif (`[data-df-char][data-alt]` in globals.css).
 * Each line is exactly one line-height tall, so the swaps never move the
 * layout around it. Reduced motion keeps a single static mix, and the
 * shuffling pauses while the headline is off screen.
 */
export function DualFontText({ lines, as: Tag = "h1", speed = 300, ...rest }: DualFontTextProps) {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>("[data-df-char]"));
    const shuffle = () => chars.forEach((c) => c.toggleAttribute("data-alt", Math.random() > 0.5));
    shuffle();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let visible = true;
    const start = () => {
      if (!timer && visible && !document.hidden) timer = window.setInterval(shuffle, speed);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    const onVisibility = () => (document.hidden ? stop() : start());

    observer.observe(el);
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [speed]);

  return (
    <Tag ref={root} {...rest}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden className="block">
        {lines.map((line, l) => (
          <span key={l} className="block h-[1lh] whitespace-nowrap">
            {line.split(" ").map((word, w) => (
              <span key={w}>
                {w > 0 ? " " : null}
                <span data-df-word className="inline-block">
                  {Array.from(word).map((char, c) => (
                    <span key={c} data-df-char>
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
