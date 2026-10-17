"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { categories, categoryOrder, servicePath, type CategoryId } from "@/lib/taxonomy";
import { useReveal } from "@/lib/useReveal";
import { MetaballText } from "./ui/MetaballText";
import { Pill } from "./ui/Pill";
import { ServiceArt } from "./ServiceArt";

const pad = (n: number) => String(n).padStart(2, "0");

/** What each card shows. Passed in by the page, so the service pages' full copy stays out of the browser bundle. */
export type ServiceCard = { text: string; points: string[]; art: string };

/**
 * The five disciplines as an accordion of separate cards. Opening a card
 * grows it smoothly: an animated illustration of the discipline wipes in,
 * the bullet points stagger in, the description rises under the title and
 * the + turns into a ×.
 * Cards open independently; the first starts open. Styles: `.svc-*` in globals.css.
 */
export default function Services({ cards }: { cards: Record<CategoryId, ServiceCard> }) {
  const root = useRef<HTMLElement>(null);
  const baseId = useId();
  const [open, setOpen] = useState(() => categoryOrder.map((_, i) => i === 0));
  useReveal(root);

  const toggle = (index: number) => setOpen((prev) => prev.map((v, i) => (i === index ? !v : v)));

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative overflow-x-clip bg-canvas py-28 md:py-40">
      <div className="shell">
        <MetaballText
          id="services-title"
          text="Five disciplines. One studio."
          hoverColor="var(--cat-web)"
          className="max-w-[16ch] font-display text-section font-medium uppercase"
        />

        <div className="relative mt-14 md:mt-20">
          {/* Soft white light behind the glass cards, so the frosting has something to blur. */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-[8%] -inset-y-[10%]">
            <span className="glow-orb glow-orb-a" />
            <span className="glow-orb glow-orb-b" />
            <span className="glow-orb glow-orb-c" />
          </div>
          <ul className="relative flex flex-col gap-4 md:gap-6">
            {categoryOrder.map((id, i) => {
              const { name, short, color } = categories[id];
              const { text, points, art } = cards[id];
              const isOpen = open[i];
              const buttonId = `${baseId}-${id}-title`;
              const panelId = `${baseId}-${id}-panel`;

              return (
                <li
                  key={id}
                  data-fade
                  data-open={isOpen || undefined}
                  className="svc-card glass"
                  style={{ "--svc-color": color } as CSSProperties}
                >
                  <span aria-hidden className="svc-num">
                    {pad(i + 1)}.
                  </span>
                  <h3 className="svc-title">
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className="svc-toggle"
                    >
                      {name}
                    </button>
                  </h3>
                  <span aria-hidden className="svc-icon">
                    <Plus className="size-5 md:size-6" strokeWidth={2} />
                  </span>

                  {/* Details: laid out across the card's grid, hidden from AT while closed. */}
                  <div id={panelId} inert={!isOpen} className="contents">
                    <div className="svc-desc">
                      <div className="min-h-0 overflow-hidden">
                        {/* Above the card-wide toggle, but only the link catches clicks. */}
                        <div className="svc-desc-text pointer-events-none relative z-[2]">
                          <p>{text}</p>
                          <a
                            href={servicePath(id)}
                            className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            More on {short}
                            <ArrowRight aria-hidden className="size-3.5" strokeWidth={1.5} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="svc-media">
                      <div className="svc-frame">
                        <div className="svc-photo">
                          <ServiceArt id={id} label={art} active={isOpen} />
                        </div>
                      </div>
                    </div>
                    <ul className="svc-points">
                      {points.map((point, p) => (
                        <li key={point} style={{ "--i": p } as CSSProperties}>
                          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--svc-color)" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div data-fade className="mt-12 md:mt-16">
          <Pill href="/services">All services</Pill>
        </div>
      </div>
    </section>
  );
}
