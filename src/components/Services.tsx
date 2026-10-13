"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import { categories, categoryOrder, type CategoryId } from "@/lib/taxonomy";
import { useReveal } from "@/lib/useReveal";
import { MetaballText } from "./ui/MetaballText";
import { ServiceArt } from "./ServiceArt";

type Detail = { text: string; points: string[]; art: string };

const DETAILS: Record<CategoryId, Detail> = {
  web: {
    text: "Marketing sites and product-grade web apps engineered on Next.js. Fast by default, accessible by design and easy for your team to edit.",
    points: ["Next.js & React", "Headless CMS", "Web apps", "Core Web Vitals"],
    art: "Animation: a web page assembling inside a browser window",
  },
  uiux: {
    text: "Research-led UX, crisp interface design and token-driven design systems that keep every screen consistent as your product grows.",
    points: ["UX research", "Wireframes", "Design tokens", "Component libraries"],
    art: "Animation: a selected interface component with a toggle, colour swatches and a slider",
  },
  commerce: {
    text: "Storefronts, checkouts and secure customer portals that turn traffic into revenue and keep operations running smoothly.",
    points: ["Shopify & headless", "Checkout flows", "B2B portals", "Payments"],
    art: "Animation: a product added to the cart, which counts up",
  },
  motion: {
    text: "Scroll-driven storytelling, micro-interactions and kinetic typography. Motion that guides attention and never fights it.",
    points: ["Scroll storytelling", "Micro-interactions", "Kinetic type", "SVG & Lottie"],
    art: "Animation: kinetic letters, a bouncing ball and a timeline playhead",
  },
  infra: {
    text: "Cloud hosting, CI/CD, databases and monitoring: the invisible foundations that keep your platform secure, fast and always on.",
    points: ["Vercel & AWS", "CI/CD pipelines", "Postgres & Supabase", "Monitoring"],
    art: "Animation: data flowing through a network into blinking servers",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The five disciplines as an accordion of separate cards. Opening a card
 * grows it smoothly: an animated illustration of the discipline wipes in,
 * the bullet points stagger in, the description rises under the title and
 * the + turns into a ×.
 * Cards open independently; the first starts open. Styles: `.svc-*` in globals.css.
 */
export default function Services() {
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
              const { name, color } = categories[id];
              const { text, points, art } = DETAILS[id];
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
                        <p className="svc-desc-text">{text}</p>
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
      </div>
    </section>
  );
}
