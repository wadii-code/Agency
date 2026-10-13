"use client";

import { useRef, useState, type ComponentType, type CSSProperties, type PointerEvent, type SVGProps } from "react";
import { CodeXml, Compass, PenTool, Rocket, TrendingUp } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { MetaballText } from "./ui/MetaballText";
import { PillButton } from "./ui/Pill";

type Step = {
  title: string;
  body: string;
  outputs: string[];
  Icon: ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;
};

const STEPS: Step[] = [
  {
    title: "Discover",
    body: "Workshops, audits and research to pin down goals, audiences and what success looks like.",
    outputs: ["Brief & goals", "Content audit", "Sitemap"],
    Icon: Compass,
  },
  {
    title: "Design",
    body: "Wireframes, interface design and a token-based system, prototyped and tested before production code.",
    outputs: ["Wireframes", "UI design", "Design tokens"],
    Icon: PenTool,
  },
  {
    title: "Build",
    body: "Engineering on Next.js and a headless CMS, reviewed together on a live staging link.",
    outputs: ["Next.js", "Headless CMS", "Staging"],
    Icon: CodeXml,
  },
  {
    title: "Launch",
    body: "Performance, accessibility and SEO checks, then a careful release with analytics in place.",
    outputs: ["QA & a11y", "SEO", "Analytics"],
    Icon: Rocket,
  },
  {
    title: "Scale",
    body: "Monitoring, iteration and new features over time, so the product keeps improving after launch.",
    outputs: ["Monitoring", "Iteration", "Support"],
    Icon: TrendingUp,
  },
];

const pad = (n: number) => String(n).padStart(2, "0");
// Elastic pull while dragging, and how far counts as a throw rather than a click.
const ELASTIC = 0.5;
const THROW = 6;

/**
 * The five steps as a stack of black-and-white frosted-glass cards, after
 * the Framer "CardStack": cards behind the front one sit higher, smaller
 * and darker, over soft drifting white light. Drag (or click) the front
 * card to send it to the back; "Next step" does the same from the keyboard.
 * Screen readers get the steps as a plain ordered list in step order.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  // order[0] is the step on top of the stack.
  const [order, setOrder] = useState(() => STEPS.map((_, i) => i));
  useReveal(root);

  const next = () => setOrder((o) => [...o.slice(1), o[0]]);

  const onPointerDown = (e: PointerEvent<HTMLLIElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLLIElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < THROW) return;
    d.moved = true;
    const card = e.currentTarget;
    card.dataset.dragging = "";
    card.style.transform = `translate(${dx * ELASTIC}px, ${dy * ELASTIC}px) scale(1.05) rotate(2deg)`;
  };
  const onPointerEnd = (e: PointerEvent<HTMLLIElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const card = e.currentTarget;
    delete card.dataset.dragging;
    card.style.transform = "";
    // A cancelled touch means the page scrolled instead.
    if (e.type !== "pointercancel") next();
  };

  return (
    <section
      ref={root}
      id="process"
      aria-labelledby="process-title"
      className="relative overflow-x-clip bg-canvas py-28 md:py-40"
    >
      <div className="shell grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <MetaballText
            id="process-title"
            text="From first call to launch, in five moves."
            className="max-w-[16ch] font-display text-section font-medium uppercase"
          />
          <div data-fade className="mt-10 hidden lg:block">
            <PillButton aria-controls="process-steps" onClick={next}>
              Next step
            </PillButton>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* Room above the stack for the cards peeking out behind the front one. */}
          <div data-fade className="relative mx-auto w-full max-w-[640px] pt-[26%] sm:pt-[14%]">
            {/* Soft white light behind the glass, so the frosting has something to blur. */}
            <div aria-hidden className="pointer-events-none absolute -inset-x-[18%] -bottom-[18%] top-0">
              <span className="glow-orb glow-orb-a" />
              <span className="glow-orb glow-orb-b" />
              <span className="glow-orb glow-orb-c" />
            </div>
            <ol id="process-steps" className="relative aspect-[4/5] select-none sm:aspect-[16/10]">
              {STEPS.map(({ title, body, outputs, Icon }, i) => {
                const place = order.indexOf(i);
                const front = place === 0;
                return (
                  <li
                    key={title}
                    data-front={front || undefined}
                    className="stack-card"
                    style={{ "--p": place } as CSSProperties}
                    onPointerDown={front ? onPointerDown : undefined}
                    onPointerMove={front ? onPointerMove : undefined}
                    onPointerUp={front ? onPointerEnd : undefined}
                    onPointerCancel={front ? onPointerEnd : undefined}
                  >
                    <article className="glass glass-card h-full">
                      <div className="glass-content flex h-full flex-col justify-between p-6 md:p-8">
                        <div className="flex items-start justify-between gap-6">
                          <span className="text-outline font-display text-[clamp(56px,6vw,96px)] font-bold leading-[0.8]">
                            {pad(i + 1)}
                          </span>
                          <span
                            className="grid size-12 shrink-0 place-items-center rounded-full border border-white/20 bg-white/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                          >
                            <Icon aria-hidden className="size-5" strokeWidth={1.5} />
                          </span>
                        </div>
                        <div>
                          <h3 className="font-display text-[clamp(26px,2.6vw,38px)] font-medium uppercase leading-none">
                            {title}
                          </h3>
                          <p className="mt-3 max-w-[42ch] text-[16px] leading-[1.55] text-primary/70">{body}</p>
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {outputs.map((output) => (
                              <li
                                key={output}
                                className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[12px] text-primary/85"
                              >
                                {output}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
          <div data-fade className="mt-10 flex justify-center lg:hidden">
            <PillButton aria-controls="process-steps" onClick={next}>
              Next step
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
