import type { ReactNode } from "react";
import type { Crumb } from "@/lib/structured-data";
import { rise } from "@/lib/rise";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * Top of an inner page: breadcrumbs, then the page's own heading block, with
 * the footer's violet wash. Everything here rises in from the first paint
 * (pages mark their own pieces with `rise()`), like the home page's hero.
 */
export function PageHeader({ crumbs, children, aside }: { crumbs: Crumb[]; children: ReactNode; aside?: ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] -top-[40%] -z-10 h-[110%] w-[70%] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(37,31,73,0.85), transparent)" }}
      />
      <div className="shell grid items-end gap-12 pb-16 pt-[calc(var(--header-h)+48px)] md:pb-24 md:pt-[calc(var(--header-h)+80px)] lg:grid-cols-12">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
          <div {...rise(0.05)}>
            <Breadcrumbs items={crumbs} />
          </div>
          {children}
        </div>
        {aside ? (
          <div className="lg:col-span-5" {...rise(0.55)}>
            {aside}
          </div>
        ) : null}
      </div>
    </header>
  );
}
