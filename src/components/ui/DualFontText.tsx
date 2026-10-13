"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from "react";

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
 * sans and an italic serif (`[data-df-char]` in globals.css).
 * Each line is exactly one line-height tall, so the swaps never move the
 * layout around it. Reduced motion keeps a single static mix, and the
 * shuffling pauses while the headline is off screen.
 *
 * The two faces have different widths, so letting the text reflow on every
 * swap would be a layout shift every 300ms (bad for CLS). Instead the layout
 * always uses the display face, the serif twin is painted over it, and each
 * letter slides with a transform to where the reflow would have put it: the
 * same motion on screen, with a layout that never moves.
 */
export function DualFontText({ lines, as: Tag = "h1", speed = 300, ...rest }: DualFontTextProps) {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-df-line]")).map((line) =>
      Array.from(line.querySelectorAll<HTMLElement>("[data-df-char]")),
    );
    const chars = rows.flat();
    // How much wider (or narrower) each letter is in the serif, in em so it holds at any font size.
    let gain: number[] = [];

    const measure = () => {
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      if (!fontSize) return;
      const read = () => chars.map((c) => c.getBoundingClientRect().width / fontSize);
      const plain = read();
      // Give the serif twins their natural width for one synchronous read (never painted).
      el.setAttribute("data-df-measure", "");
      const both = read();
      el.removeAttribute("data-df-measure");
      gain = both.map((w, i) => w - 2 * plain[i]);
      place();
    };

    // Slide each letter to its reflowed position. Lines are centred, so each
    // also moves back by half of its line's change in width.
    const place = () => {
      if (!gain.length) return;
      let offset = 0;
      for (const row of rows) {
        const extra = row.map((c, k) => (c.hasAttribute("data-alt") ? gain[offset + k] : 0));
        offset += row.length;
        let x = -extra.reduce((sum, d) => sum + d, 0) / 2;
        row.forEach((c, k) => {
          c.style.transform = x ? `translateX(${x.toFixed(4)}em)` : "";
          x += extra[k];
        });
      }
    };

    const shuffle = () => {
      chars.forEach((c) => c.toggleAttribute("data-alt", Math.random() > 0.5));
      place();
    };

    measure();
    shuffle();
    // Web fonts arriving late change the widths: measure again.
    document.fonts?.addEventListener("loadingdone", measure);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => document.fonts?.removeEventListener("loadingdone", measure);
    }

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
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [speed]);

  // Running word index across lines (the hero staggers its intro by it).
  let wordIndex = 0;

  return (
    <Tag ref={root} {...rest}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden className="block">
        {lines.map((line, l) => (
          <span key={l} data-df-line className="block h-[1lh] whitespace-nowrap">
            {line.split(" ").map((word, w) => (
              <span key={w}>
                {w > 0 ? " " : null}
                <span data-df-word className="inline-block" style={{ "--word": wordIndex++ } as CSSProperties}>
                  {Array.from(word).map((char, c) => (
                    <span key={c} data-df-char data-char={char}>
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
