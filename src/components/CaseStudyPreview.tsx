"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Maximize2 } from "lucide-react";
import { projectBySlug } from "@/lib/projects";
import { PillButton } from "./ui/Pill";

const loadViewer = () => import("./ProjectViewer");
const ProjectViewer = dynamic(loadViewer, { ssr: false });

/** "Open full preview" on a case study: the showcase's browser-style viewer, for this one project. */
export function CaseStudyPreview({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState<DOMRect | null | undefined>(undefined);
  const project = projectBySlug(slug);
  if (!project) return null;

  return (
    <>
      <PillButton
        aria-haspopup="dialog"
        icon={<Maximize2 className="size-4" strokeWidth={1.5} />}
        onPointerEnter={loadViewer}
        onFocus={loadViewer}
        onClick={(e) => setOrigin(document.querySelector(`[data-project="${slug}"]`)?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect())}
      >
        Open full preview
      </PillButton>
      {origin !== undefined ? (
        <ProjectViewer
          projects={[project]}
          index={0}
          origin={origin}
          onIndexChange={() => {}}
          onClose={() => setOrigin(undefined)}
        />
      ) : null}
    </>
  );
}
