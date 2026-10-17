"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

/** The home page's scroll reveals (`useReveal`) for server-rendered pages: wrap the content that carries the data attributes. */
export function Reveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return <div ref={root}>{children}</div>;
}
