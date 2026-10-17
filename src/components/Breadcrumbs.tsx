import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/structured-data";

/** Where the page sits in the site (the matching BreadcrumbList is in each page's structured data). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-primary/80">
                  {crumb.name}
                </span>
              ) : (
                <>
                  <a href={crumb.path} className="transition-colors hover:text-primary">
                    {crumb.name}
                  </a>
                  <ChevronRight aria-hidden className="size-3" strokeWidth={1.5} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
