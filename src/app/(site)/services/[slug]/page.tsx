import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Annotation } from "@/components/ui/Annotation";
import { MetaballText } from "@/components/ui/MetaballText";
import { Pill } from "@/components/ui/Pill";
import { SparkGlyph } from "@/components/ui/SparkLogo";
import { PageHeader } from "@/components/PageHeader";
import { PageSection } from "@/components/PageSection";
import { ProjectCard } from "@/components/ProjectCard";
import { Faq } from "@/components/Faq";
import { CtaBand, GlowOrbs } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { ServiceArt } from "@/components/ServiceArt";
import { categories, categoryOrder } from "@/lib/taxonomy";
import { SERVICE_DETAILS, serviceBySlug, servicePath } from "@/lib/services";
import { PROJECTS } from "@/lib/projects";
import { PROCESS_STEPS } from "@/lib/process";
import { pageMetadata } from "@/lib/metadata";
import { rise } from "@/lib/rise";
import {
  ORGANIZATION_ID,
  absoluteUrl,
  breadcrumbList,
  graph,
  serviceId,
  thing,
  webPage,
  type Crumb,
} from "@/lib/structured-data";

// Fully static: an unknown slug waits for the render instead of streaming a shell, so it gets a real 404.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return categoryOrder.map((id) => ({ slug: categories[id].slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  const service = serviceBySlug((await params).slug);
  if (!service) return {};
  return pageMetadata({ title: service.title, description: service.description, path: servicePath(service.id) });
}

const pad = (n: number) => String(n).padStart(2, "0");

const sideLink = "inline-flex items-center gap-1.5 text-[15px] text-primary/70 transition-colors hover:text-primary";

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = serviceBySlug((await params).slug);
  if (!service) notFound();

  const { id, title, kicker, description, text, approach, points, faqs, about, art } = service;
  const { name, color } = categories[id];
  const path = servicePath(id);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name, path },
  ];
  // Work filed under this discipline, or else a few recent projects.
  const ownWork = PROJECTS.filter((project) => project.category === id);
  const work = (ownWork.length ? ownWork : PROJECTS).slice(0, 3);
  const others = categoryOrder.filter((other) => other !== id);

  const jsonLd = graph(
    {
      "@type": "Service",
      "@id": serviceId(path),
      name: title,
      alternateName: name,
      serviceType: name,
      description: `${text} ${approach.join(" ")}`,
      url: absoluteUrl(path),
      provider: { "@id": ORGANIZATION_ID },
      areaServed: "Worldwide",
      about: about.map(thing),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${name}: what's included`,
        itemListElement: points.map((point) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: point.name, description: point.text },
        })),
      },
      ...(ownWork.length
        ? { subjectOf: ownWork.map((project) => ({ "@id": `${absoluteUrl(`/work/${project.slug}`)}#work` })) }
        : {}),
    },
    webPage(path, { name: title, description, about: { "@id": serviceId(path) }, breadcrumb: true }),
    breadcrumbList(path, crumbs),
    {
      "@type": "FAQPage",
      "@id": `${absoluteUrl(path)}#faq`,
      isPartOf: { "@id": `${absoluteUrl(path)}#webpage` },
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  );

  return (
    <Reveal>
      <article>
        <JsonLd data={jsonLd} />
        <PageHeader
          crumbs={crumbs}
          aside={
            <div className="glass relative mx-auto aspect-[224/272] w-full max-w-[340px] overflow-hidden rounded-[1.25rem] lg:ml-auto lg:mr-0">
              <ServiceArt id={id} label={art} active />
            </div>
          }
        >
          <Annotation className="mt-10" {...rise(0.1)}>
            {kicker}
          </Annotation>
          <MetaballText
            as="h1"
            reveal="intro"
            text={title}
            hoverColor={color}
            className="mt-5 max-w-[18ch] font-display text-section font-bold uppercase"
          />
          <p className="mt-4 flex items-center gap-2 text-[14px] font-medium uppercase tracking-[0.08em]" {...rise(0.4, { color })}>
            <SparkGlyph className="size-2.5" />
            {name}
          </p>
          <p className="mt-6 max-w-[56ch] text-[18px] leading-relaxed text-primary/75" {...rise(0.5)}>
            {text}
          </p>
          <div className="mt-10 flex flex-wrap gap-3" {...rise(0.6)}>
            <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog">
              Start a Project
            </Pill>
            <Pill href="#included">What’s included</Pill>
          </div>
        </PageHeader>

        <PageSection id="included" titleId="included-title" title="What’s included" color={color}>
          <div className="relative">
            <GlowOrbs />
            <ul className="relative grid gap-4 sm:grid-cols-2 md:gap-6">
              {points.map((point) => (
                <li key={point.name} data-fade className="glass rounded-[1.25rem] p-6 md:p-8">
                  <SparkGlyph className="size-4" style={{ color }} />
                  <h3 className="mt-5 font-display text-[20px] font-medium uppercase leading-tight md:text-[22px]">{point.name}</h3>
                  <p className="mt-3 text-[16px] leading-[1.6] text-primary/70">{point.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </PageSection>

        <PageSection titleId="approach-title" title="How we approach it" color={color} split>
          <div className="space-y-6 text-[18px] leading-[1.7] text-primary/75">
            {approach.map((paragraph) => (
              <p key={paragraph} data-fade>
                {paragraph}
              </p>
            ))}
          </div>
        </PageSection>

        <PageSection
          titleId="process-title"
          title="How a project runs"
          color={color}
          action={
            <a href="/#process" className={sideLink}>
              Our process
              <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
            </a>
          }
        >
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} data-fade className="border-t border-white/20 pt-6">
                <span className="text-outline font-display text-[44px] font-bold leading-none">{pad(i + 1)}</span>
                <h3 className="mt-5 font-display text-[18px] font-medium uppercase">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-primary/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </PageSection>

        <PageSection
          titleId="work-title"
          title={ownWork.length ? `${name} case studies` : "Selected work"}
          color={color}
          action={
            <a href="/work" className={sideLink}>
              All case studies
              <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
            </a>
          }
        >
          <div className="relative">
            <GlowOrbs />
            <ul className="relative grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {work.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        </PageSection>

        <PageSection titleId="faq-title" title={`Questions about ${name}`} color={color} split>
          <Faq items={faqs} />
        </PageSection>

        <PageSection titleId="related-title" title="Other disciplines" color={color}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => (
              <li key={other} data-fade>
                <a
                  href={servicePath(other)}
                  data-cursor="link"
                  data-cursor-size={110}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[1.25rem] border border-hairline p-6 transition-[border-color,translate] duration-500 ease-expo hover:-translate-y-1 hover:border-white/40"
                >
                  <span>
                    <span
                      className="flex items-center gap-2 text-[13px] uppercase tracking-[0.08em]"
                      style={{ color: categories[other].color }}
                    >
                      <SparkGlyph className="size-2.5" />
                      {categories[other].short}
                    </span>
                    <span className="mt-4 block font-display text-[19px] font-medium uppercase leading-tight">
                      {SERVICE_DETAILS[other].title}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-muted transition-[translate,color] duration-500 ease-expo group-hover:translate-x-1 group-hover:text-primary"
                    strokeWidth={1.5}
                  />
                </a>
              </li>
            ))}
          </ul>
        </PageSection>

        <CtaBand
          title="Have a project in mind?"
          text={`Tell us what you're building and when you need it. We'll come back with how we'd approach the ${categories[id].short} side, and everything around it.`}
        />
      </article>
    </Reveal>
  );
}
