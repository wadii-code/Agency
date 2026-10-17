import Image from "next/image";
import { projectPath, type Project } from "@/lib/projects";
import { CategoryLabel } from "./ui/CategoryLabel";

/** A project in a grid, linking to its case study. `level` keeps the heading outline right on each page. */
export function ProjectCard({ project, level = "h3" }: { project: Project; level?: "h2" | "h3" }) {
  const Heading = level;
  return (
    <a
      href={projectPath(project.slug)}
      data-cursor="link"
      data-cursor-size={120}
      className="glass glass-tile group flex h-full flex-col p-2.5 outline-offset-4 transition-[scale] duration-500 ease-expo hover:scale-[1.015]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[0.8rem] bg-white/[0.04]">
        <Image
          src={project.cover}
          alt={`Homepage of ${project.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-left-top transition-[scale] duration-700 ease-expo group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-start justify-between gap-4 px-2 pb-2 pt-5">
        <div className="min-w-0">
          <Heading className="font-display text-[20px] font-medium uppercase leading-tight">{project.title}</Heading>
          <p className="mt-1.5 text-[14px] text-muted">{project.type}</p>
        </div>
        <CategoryLabel id={project.category} className="shrink-0 text-[12px]" />
      </div>
    </a>
  );
}
