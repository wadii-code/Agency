"use client";

import { useId, useRef, type CSSProperties, type HTMLAttributes } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type MetaballTextProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** Colour the swollen letters take on, e.g. `var(--cat-web)`. */
  hoverColor?: string;
  /** How much the letters under the pointer grow. */
  hoverScale?: number;
  /**
   * `scroll`: words blur up into place when scrolled into view.
   * `intro`: words blur up from the first paint, in CSS (page titles at the top, see globals.css).
   * `none`: the parent animates `[data-mb-word]`.
   */
  reveal?: "scroll" | "intro" | "none";
};

/*
 * Metaball display type, after the Framer "METABALLTEXT" component.
 * Letters near the pointer swell and recolour; an SVG goo filter (blur +
 * alpha threshold) makes neighbouring swollen letters melt into each other.
 * Touch screens get a one-off wave when the title scrolls into view, and
 * reduced motion keeps the title static. Mice also get the ring cursor
 * (`data-cursor`, see LensCursor).
 */
export function MetaballText({
  text,
  as: Tag = "h2",
  hoverColor = "var(--cat-motion)",
  hoverScale = 1.3,
  reveal = "scroll",
  className,
  style,
  ...rest
}: MetaballTextProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const filterId = `mb-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = root.current;
      const visual = el?.querySelector<HTMLElement>("[data-mb-visual]");
      const glow = el?.querySelector<HTMLElement>("[data-mb-glow]");
      const blur = el?.querySelector("feGaussianBlur");
      if (!el || !visual || !glow || !blur) return;

      const chars = gsap.utils.toArray<HTMLElement>("[data-mb-char]", el);
      const goo = `url(#${filterId})`;
      const fitBlur = () => {
        const fontSize = parseFloat(getComputedStyle(el).fontSize);
        // Scale the goo with the type: enough to bridge swollen neighbours, not melt resting letters.
        blur.setAttribute("stdDeviation", String(Math.min(9, Math.max(2, fontSize * 0.05))));
        return fontSize;
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (reveal !== "scroll") return;
        gsap.from(gsap.utils.toArray("[data-mb-word]", el), {
          yPercent: 45,
          opacity: 0,
          filter: "blur(10px)",
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.05,
          clearProps: "filter,transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // Pointer devices: letters swell around the cursor.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const scales = chars.map(() => 1);
        let centers: { x: number; y: number }[] = [];
        let pointer: { x: number; y: number } | null = null;
        let radius = 100;
        let raf = 0;
        const extra = hoverScale - 1;

        const measure = () => {
          radius = fitBlur() * 1.4;
          // Measure each letter at rest, relative to the heading (transforms cleared for the read).
          const current = chars.map((c) => c.style.transform);
          chars.forEach((c) => (c.style.transform = ""));
          const box = el.getBoundingClientRect();
          centers = chars.map((c) => {
            const r = c.getBoundingClientRect();
            return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
          });
          chars.forEach((c, i) => (c.style.transform = current[i]));
        };

        const tick = () => {
          let moving = false;
          for (let i = 0; i < chars.length; i++) {
            let target = 1;
            if (pointer && centers[i]) {
              // Spread along the line more than across lines.
              const d = Math.hypot(pointer.x - centers[i].x, (pointer.y - centers[i].y) * 1.6);
              if (d < radius) {
                const t = 1 - d / radius;
                target = 1 + extra * t * t * (3 - 2 * t); // smoothstep falloff
              }
            }
            let s = scales[i] + (target - scales[i]) * 0.12;
            if (target === 1 && Math.abs(s - 1) < 0.001) s = 1;
            if (Math.abs(s - target) > 0.001) moving = true;
            scales[i] = s;
            chars[i].style.transform = s === 1 ? "" : `scale(${s.toFixed(4)})`;
            chars[i].style.color = s > 1.005 ? hoverColor : "";
          }
          if (moving || pointer) {
            raf = requestAnimationFrame(tick);
          } else {
            raf = 0;
            visual.style.filter = "";
          }
        };
        const run = () => {
          if (!raf) raf = requestAnimationFrame(tick);
        };
        const locate = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
          glow.style.transform = `translate(${pointer.x}px, ${pointer.y}px) translate(-50%, -50%)`;
        };
        const onEnter = (e: PointerEvent) => {
          measure();
          locate(e);
          visual.style.filter = goo;
          glow.style.opacity = "0.35";
          run();
        };
        const onMove = (e: PointerEvent) => {
          locate(e);
          run();
        };
        const onLeave = () => {
          pointer = null;
          glow.style.opacity = "0";
          run();
        };

        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          cancelAnimationFrame(raf);
          chars.forEach((c) => {
            c.style.transform = "";
            c.style.color = "";
          });
          visual.style.filter = "";
          glow.style.opacity = "0";
        };
      });

      // Touch screens: a single gooey wave runs through the title once it is in view.
      mm.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          once: true,
          onEnter: () => {
            fitBlur();
            visual.style.filter = goo;
            gsap.to(chars, {
              scale: hoverScale,
              color: hoverColor,
              duration: 0.32,
              ease: "power2.out",
              // Wait for the words to settle first.
              delay: reveal === "scroll" ? 0.6 : reveal === "intro" ? 1.3 : 0,
              stagger: { each: 0.035, repeat: 1, yoyo: true },
              onComplete: () => {
                visual.style.filter = "";
                gsap.set(chars, { clearProps: "transform,color" });
              },
            });
          },
        });
      });
    },
    { scope: root, dependencies: [text, hoverColor, hoverScale, reveal] },
  );

  return (
    <Tag
      ref={root}
      data-cursor="lens"
      data-mb-intro={reveal === "intro" || undefined}
      className={cn("relative isolate", className)}
      style={style}
      {...rest}
    >
      <span className="sr-only">{text}</span>
      <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -17" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span
        data-mb-glow
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-[2.4em] w-[4em] rounded-full opacity-0 transition-opacity duration-500"
        style={
          {
            background: `radial-gradient(closest-side, color-mix(in oklab, ${hoverColor} 45%, transparent), transparent)`,
          } as CSSProperties
        }
      />
      <span data-mb-visual aria-hidden className="block">
        {words.map((word, w) => (
          <span key={w}>
            <span data-mb-word className="inline-block whitespace-nowrap" style={{ "--word": w } as CSSProperties}>
              {Array.from(word).map((char, c) => (
                <span key={c} data-mb-char className="inline-block origin-bottom transition-colors duration-200">
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
