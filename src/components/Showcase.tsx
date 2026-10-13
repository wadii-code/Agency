"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { PROJECTS } from "@/lib/projects";
import { cn } from "@/lib/cn";
import { MetaballText } from "./ui/MetaballText";
import { CategoryLabel } from "./ui/CategoryLabel";
import ProjectViewer from "./ProjectViewer";

function StatusPill({ children, live }: { children: string; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-canvas/75 px-3 py-1 text-[12px] backdrop-blur-md">
      {live ? (
        <span className="relative size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-infra/70" />
          <span className="absolute inset-0 rounded-full bg-infra" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

export default function Showcase() {
  const root = useRef<HTMLElement>(null);
  const [viewer, setViewer] = useState<{ index: number; origin: DOMRect | null } | null>(null);
  useReveal(root);

  const closeViewer = useCallback(() => setViewer(null), []);
  const changeProject = useCallback((index: number) => setViewer({ index, origin: null }), []);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
        gsap.set(cards, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(gsap.utils.toArray("[data-zoom]", root.current), { scale: 1.18 });

        // Each card wipes up from its bottom edge while the screenshot settles in.
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            // Cleared afterwards: a clip-path would stop the glass from blurring what sits behind it.
            gsap.to(batch, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "expo.inOut",
              stagger: 0.1,
              clearProps: "clipPath",
            });
            gsap.to(
              batch.map((card) => card.querySelector("[data-zoom]")),
              { scale: 1, duration: 1.6, ease: "expo.out", stagger: 0.1, delay: 0.15 },
            );
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative overflow-x-clip bg-canvas py-28 md:py-40">
      <div className="shell">
        <div className="flex flex-col gap-8 pb-14 md:pb-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <MetaballText
              id="work-title"
              text="Selected work, shipped & live."
              hoverColor="var(--cat-commerce)"
              className="mt-6 max-w-[16ch] font-display text-section font-medium uppercase"
            />
          </div>
        </div>

        <div className="relative">
          {/* Soft white light behind the glass cards, so the frosting has something to blur. */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-[10%] -inset-y-[6%]">
            <span className="glow-orb glow-orb-a" />
            <span className="glow-orb glow-orb-b" />
            <span className="glow-orb glow-orb-c" />
          </div>
          <ul className="relative grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {PROJECTS.map((project, i) => {
              const featured = project.layout === "featured";
              const wide = project.layout === "wide";
              return (
                <li
                  key={project.slug}
                  data-card
                  className={cn(featured && "sm:col-span-2 lg:row-span-2", wide && "sm:col-span-2")}
                >
                  <button
                    type="button"
                    data-project={project.slug}
                    data-cursor="link"
                    data-cursor-size={featured ? 160 : 120}
                    aria-haspopup="dialog"
                    aria-label={`${project.title}, ${project.type}. Open full preview`}
                    onClick={(e) => setViewer({ index: i, origin: e.currentTarget.getBoundingClientRect() })}
                    className="glass glass-tile group flex h-full w-full flex-col p-2.5 text-left outline-offset-4 transition-[scale] duration-500 ease-expo hover:scale-[1.015]"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-[0.8rem] bg-canvas",
                        featured && "aspect-[16/10] lg:aspect-auto lg:min-h-[440px] lg:flex-1",
                        wide && "aspect-[16/8] lg:aspect-auto lg:flex-1",
                        !featured && !wide && "aspect-[16/10]",
                      )}
                    >
                      <div data-zoom className="absolute inset-0">
                        <div className="absolute inset-0 transition-[scale] duration-700 ease-expo group-hover:scale-[1.04]">
                          <Image
                            src={project.cover}
                            alt={`Homepage of ${project.title}`}
                            fill
                            sizes={
                              featured || wide
                                ? "(min-width: 1024px) 66vw, 100vw"
                                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            }
                            className="object-cover object-left-top"
                          />
                        </div>
                      </div>
                      {/* Soft fade so the hover pills stay legible on bright screenshots. */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-canvas/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2 transition-[opacity,translate] duration-300 ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:hover)]:-translate-y-2 [@media(hover:hover)]:opacity-0">
                        <StatusPill live>Live Site</StatusPill>
                        <StatusPill>{project.tag}</StatusPill>
                      </div>
                    </div>

                    <div className={cn("flex items-start justify-between gap-4 px-2 pb-2", featured ? "pt-6" : "pt-5")}>
                      <div className="min-w-0">
                        {featured ? (
                          <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-muted">Featured project</p>
                        ) : null}
                        <h3
                          className={cn(
                            "font-display font-medium uppercase leading-tight",
                            featured ? "text-[clamp(24px,2.4vw,34px)]" : "text-[20px]",
                          )}
                        >
                          {project.title}
                        </h3>
                        <p className="mt-1.5 text-[14px] text-muted">{project.type}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <CategoryLabel id={project.category} className="text-[12px]" />
                        <span className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors duration-300 group-hover:text-primary">
                          View project
                          <Maximize2
                            aria-hidden
                            className="size-3.5 transition-transform duration-300 ease-expo group-hover:scale-110"
                            strokeWidth={1.5}
                          />
                        </span>
                      </div>
                    </div>
                    {featured && project.summary ? (
                      <p className="max-w-[56ch] px-2 pb-2 pt-1 text-[16px] leading-[1.6] text-primary/75">
                        {project.summary}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {viewer ? (
        <ProjectViewer
          projects={PROJECTS}
          index={viewer.index}
          origin={viewer.origin}
          onIndexChange={changeProject}
          onClose={closeViewer}
        />
      ) : null}
    </section>
  );
}
