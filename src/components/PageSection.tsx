import type { ReactNode } from "react";
import { MetaballText } from "./ui/MetaballText";

const TITLE = "font-display text-[clamp(28px,3.4vw,44px)] font-medium uppercase";

/**
 * A section of an inner page, animated like the home page's: the hairline
 * draws in, the metaball title blurs up (and swells under the cursor in
 * `color`), and the content's `data-fade` / `data-wipe` items follow.
 * `split` puts the title in a left column beside the content.
 */
export function PageSection({
  id,
  titleId,
  title,
  color,
  action,
  split = false,
  children,
}: {
  id?: string;
  titleId: string;
  title: string;
  color?: string;
  action?: ReactNode;
  split?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={titleId} className="shell">
      <div data-divider className="h-px bg-hairline" />
      <div className="py-20 md:py-28">
        {split ? (
          <div className="grid gap-10 lg:grid-cols-12">
            <MetaballText id={titleId} text={title} hoverColor={color} className={`${TITLE} lg:col-span-5`} />
            <div className="lg:col-span-7">{children}</div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <MetaballText id={titleId} text={title} hoverColor={color} className={TITLE} />
              {action ? <div data-fade>{action}</div> : null}
            </div>
            <div className="mt-10 md:mt-14">{children}</div>
          </>
        )}
      </div>
    </section>
  );
}
