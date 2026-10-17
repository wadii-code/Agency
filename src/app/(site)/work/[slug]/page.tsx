import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { SparkGlyph } from "@/components/ui/SparkLogo";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { CaseStudyPreview } from "@/components/CaseStudyPreview";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { categories } from "@/lib/taxonomy";
import { SERVICE_DETAILS, servicePath } from "@/lib/services";
import { PROJECTS, projectBySlug, projectPath, type PreviewTile } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";
import { ORGANIZATION_ID, absoluteUrl, breadcrumbList, graph, serviceId, webPage, type Crumb } from "@/lib/structured-data";

// Fully static: an unknown slug waits for the render instead of streaming a shell, so it gets a real 404.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title}: ${project.type}`,
    description: project.summary,
    path: projectPath(project.slug),
  });
}

/** The top of a full-page capture, framed like a screen. */
function Screen({ tile, alt, sizes, className }: { tile?: PreviewTile; alt: string; sizes: string; className: string }) {
  if (!tile) return null;
  return (
    <div className={`relative overflow-hidden bg-white/[0.04] ${className}`}>
      <Image src={tile.src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();

  const { slug, title, type, category, summary, highlights, cover, previews } = project;
  const path = projectPath(slug);
  const { name: categoryName, color } = categories[category];
  const service = SERVICE_DETAILS[category];
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: title, path },
  ];
  const index = PROJECTS.indexOf(project);
  const previous = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  // Same discipline first, then the rest.
  const more = [
    ...PROJECTS.filter((p) => p !== project && p.category === category),
    ...PROJECTS.filter((p) => p !== project && p.category !== category),
  ].slice(0, 3);

  const jsonLd = graph(
    {
      "@type": "CreativeWork",
      "@id": `${absoluteUrl(path)}#work`,
      name: title,
      headline: `${title}: ${type}`,
      description: summary,
      genre: type,
      keywords: highlights.join(", "),
      url: absoluteUrl(path),
      image: absoluteUrl(cover),
      inLanguage: "en",
      creator: { "@id": ORGANIZATION_ID },
      about: { "@id": serviceId(servicePath(category)) },
    },
    webPage(path, {
      type: "ItemPage",
      name: `${title}: ${type}`,
      description: summary,
      about: { "@id": `${absoluteUrl(path)}#work` },
      breadcrumb: true,
    }),
    breadcrumbList(path, crumbs),
  );

  return (
    <article>
      <JsonLd data={jsonLd} />
      <PageHeader crumbs={crumbs}>
        <a
          href={servicePath(category)}
          className="mt-10 inline-flex items-center gap-2 text-[14px] font-medium uppercase tracking-[0.08em] underline-offset-4 hover:underline"
          style={{ color }}
        >
          <SparkGlyph className="size-2.5" />
          {categoryName}
        </a>
        <h1 className="mt-5 font-display text-section font-bold uppercase">{title}</h1>
        <p className="mt-3 text-[18px] text-muted">{type}</p>
        <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-primary/80">{summary}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog">
            Start a similar project
          </Pill>
          <CaseStudyPreview slug={slug} />
        </div>
      </PageHeader>

      {/* The viewer grows out of (and shrinks back into) this cover. */}
      <figure data-project={slug} className="shell">
        <div className="glass rounded-[1.5rem] p-2.5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-white/[0.04]">
            <Image
              src={cover}
              alt={`Homepage of ${title}, designed and built by SPARK`}
              fill
              priority
              sizes="(min-width: 1680px) 1560px, 94vw"
              className="object-cover object-left-top"
            />
          </div>
        </div>
      </figure>

      {/* The project */}
      <section aria-labelledby="about-title" className="shell py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="about-title" className="font-display text-[clamp(28px,3.4vw,44px)] font-medium uppercase">
              About the project
            </h2>
            <p className="mt-6 text-[18px] leading-[1.7] text-primary/75">{summary}</p>
            <p className="mt-6 text-[18px] leading-[1.7] text-primary/75">
              Designed and built by SPARK, and live today. The screens below are captures of the real site, with domains
              and emails blurred.{" "}
              <a href={servicePath(category)} className="text-primary underline underline-offset-4 hover:no-underline">
                How we approach {service.title}
              </a>
              .
            </p>
          </div>
          <dl className="grid content-start gap-6 border-t border-hairline pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Sector</dt>
              <dd className="mt-2 text-[17px]">{type}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Discipline</dt>
              <dd className="mt-2 text-[17px]">
                <a href={servicePath(category)} className="underline-offset-4 hover:underline">
                  {categoryName}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Highlights</dt>
              <dd className="mt-3">
                <ul className="flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[13px]">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Status</dt>
              <dd className="mt-2 inline-flex items-center gap-2 text-[17px]">
                <span aria-hidden className="size-2 rounded-full bg-infra" />
                Live
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Screens */}
      <section aria-labelledby="screens-title" className="shell border-t border-hairline py-20 md:py-28">
        <h2 id="screens-title" className="font-display text-[clamp(28px,3.4vw,44px)] font-medium uppercase">
          On desktop and mobile
        </h2>
        <div className="mt-10 grid items-start gap-6 md:mt-14 lg:grid-cols-12">
          <div className="glass rounded-[1.25rem] p-2.5 lg:col-span-8">
            <Screen
              tile={previews.desktop?.tiles[0]}
              alt={`${title} on desktop`}
              sizes="(min-width: 1024px) 66vw, 94vw"
              className="aspect-[16/11] rounded-[0.8rem]"
            />
          </div>
          <div className="mx-auto w-full max-w-[300px] rounded-[40px] border border-white/15 bg-black p-2 lg:col-span-4">
            <Screen
              tile={previews.mobile?.tiles[0]}
              alt={`${title} on mobile`}
              sizes="300px"
              className="aspect-[9/19] rounded-[32px]"
            />
          </div>
        </div>
      </section>

      {/* Previous / next */}
      <nav aria-label="More case studies" className="shell border-t border-hairline">
        <ul className="grid sm:grid-cols-2">
          <li>
            <a href={projectPath(previous.slug)} className="group flex flex-col gap-2 py-10 transition-colors hover:text-primary sm:pr-8">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-500 ease-expo group-hover:-translate-x-1" strokeWidth={1.5} />
                Previous
              </span>
              <span className="font-display text-[22px] font-medium uppercase md:text-[28px]">{previous.title}</span>
            </a>
          </li>
          <li className="border-t border-hairline sm:border-l sm:border-t-0">
            <a href={projectPath(next.slug)} className="group flex flex-col items-end gap-2 py-10 text-right transition-colors hover:text-primary sm:pl-8">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Next
                <ArrowRight aria-hidden className="size-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-1" strokeWidth={1.5} />
              </span>
              <span className="font-display text-[22px] font-medium uppercase md:text-[28px]">{next.title}</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* More work */}
      <section aria-labelledby="more-title" className="shell border-t border-hairline py-20 md:py-28">
        <h2 id="more-title" className="font-display text-[clamp(28px,3.4vw,44px)] font-medium uppercase">
          More work
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 md:gap-6 lg:grid-cols-3">
          {more.map((other) => (
            <li key={other.slug}>
              <ProjectCard project={other} />
            </li>
          ))}
        </ul>
      </section>

      <CtaBand
        title={`Want something like ${title}?`}
        text="Tell us about your business and what you need online. We'll come back with how we'd approach it."
      />
    </article>
  );
}
