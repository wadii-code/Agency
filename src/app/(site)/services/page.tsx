import { ArrowRight } from "lucide-react";
import { Annotation } from "@/components/ui/Annotation";
import { MetaballText } from "@/components/ui/MetaballText";
import { SparkGlyph } from "@/components/ui/SparkLogo";
import { PageHeader } from "@/components/PageHeader";
import { CtaBand, GlowOrbs } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { categories, categoryOrder } from "@/lib/taxonomy";
import { SERVICE_DETAILS, servicePath } from "@/lib/services";
import { pageMetadata } from "@/lib/metadata";
import { rise } from "@/lib/rise";
import { absoluteUrl, breadcrumbList, graph, serviceId, webPage, type Crumb } from "@/lib/structured-data";

const PATH = "/services";
const TITLE = "Digital Agency Services";
const DESCRIPTION =
  "Websites and web apps, UI/UX design, e-commerce, motion design and digital infrastructure: the five disciplines of SPARK, a digital studio in Casablanca.";
const CRUMBS: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Services", path: PATH },
];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const pad = (n: number) => String(n).padStart(2, "0");

export default function ServicesPage() {
  const jsonLd = graph(
    webPage(PATH, { type: "CollectionPage", name: TITLE, description: DESCRIPTION, breadcrumb: true }),
    breadcrumbList(PATH, CRUMBS),
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl(PATH)}#list`,
      name: "SPARK services",
      itemListElement: categoryOrder.map((id, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@id": serviceId(servicePath(id)), "@type": "Service", name: SERVICE_DETAILS[id].title, url: absoluteUrl(servicePath(id)) },
      })),
    },
  );

  return (
    <Reveal>
      <JsonLd data={jsonLd} />
      <PageHeader crumbs={CRUMBS}>
        <Annotation className="mt-10" {...rise(0.1)}>
          Five disciplines. One studio.
        </Annotation>
        <MetaballText
          as="h1"
          reveal="intro"
          text="Services"
          hoverColor="var(--cat-web)"
          className="mt-5 max-w-[16ch] font-display text-section font-bold uppercase"
        />
        <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-primary/75" {...rise(0.45)}>
          SPARK covers the whole life of a digital product, from research and interface design to engineering, launch and
          hosting. One team in Casablanca, working with clients worldwide, so nothing gets lost between agencies.
        </p>
      </PageHeader>

      <section aria-label="All services" className="shell relative pb-8">
        <GlowOrbs />
        <ol className="relative flex flex-col gap-4 md:gap-6">
          {categoryOrder.map((id, i) => {
            const { name, color } = categories[id];
            const { title, text, points } = SERVICE_DETAILS[id];
            return (
              // The first card is on screen at load: it rises in with the header; the rest fade in on scroll.
              <li key={id} data-fade {...(i === 0 ? rise(0.6) : {})}>
                <a
                  href={servicePath(id)}
                  data-cursor="link"
                  data-cursor-size={140}
                  className="glass glass-tile group grid gap-6 p-6 transition-[scale] duration-500 ease-expo hover:scale-[1.008] md:grid-cols-12 md:gap-10 md:p-10"
                >
                  <span className="font-display text-[22px] font-bold md:col-span-1 md:text-[28px]">{pad(i + 1)}.</span>
                  <div className="md:col-span-6">
                    <h2 className="font-display text-[24px] font-bold uppercase leading-tight md:text-[32px]">{name}</h2>
                    <p className="mt-2 text-[14px] uppercase tracking-[0.08em]" style={{ color }}>
                      {title}
                    </p>
                    <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.65] text-primary/70">{text}</p>
                  </div>
                  <div className="flex flex-col justify-between gap-6 md:col-span-5">
                    <ul className="flex flex-wrap gap-2">
                      {points.map((point) => (
                        <li
                          key={point.name}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[13px]"
                        >
                          <SparkGlyph className="size-2" style={{ color }} />
                          {point.name}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
                      Explore {categories[id].short}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-500 ease-expo group-hover:translate-x-1"
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <CtaBand
        title="Not sure where to start?"
        text="Tell us what you're building. We'll suggest the right mix of design, engineering and infrastructure for it."
      />
    </Reveal>
  );
}
