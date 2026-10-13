import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/** Concave 4-pointed spark centred on (cx, cy). */
function sparkPath(cx: number, cy: number, r: number) {
  const c = r * 0.2;
  return (
    `M${cx} ${cy - r}` +
    `Q${cx + c} ${cy - c} ${cx + r} ${cy}` +
    `Q${cx + c} ${cy + c} ${cx} ${cy + r}` +
    `Q${cx - c} ${cy + c} ${cx - r} ${cy}` +
    `Q${cx - c} ${cy - c} ${cx} ${cy - r}Z`
  );
}

/**
 * The SPARK "S": one solid shape whose two slots end in 4-pointed sparks.
 * Traced from the official logo artwork (1 unit = 10px of the 2000px source).
 */
export const SPARK_MARK_VIEWBOX = "0 0 133.2 102.1";
export const SPARK_MARK_PATH =
  "M1.8 4.8l-1.1 1.9l-.7 2.4l0 49.7l.3 1.5l.9 1.7l1.5 1.6l1.1 .8l1.7 .7l1.1 .1l.1 .1l.6 0l.1-.1l19.9 0l.1 .1l11.9 0l.1 .1l14.9 0l.1 .1l21.4 .1l.1-.1l6.1 0l.1-.1l5.8 0l.1-.1l6.7-.1l1.1-.3l1.5-.9l.6-.6l1-1.4l.6-1.4l.5-1.7l1-5.8l.3-.5l.3 0l.3 .5l.5 3.8l.7 3l.8 1.9l1.4 2.1l1.7 1.5l1.5 .8l2 .7l2.5 .5l.6 .2l.4 .3l0 .2l-.4 .4l-.6 .2l-2.5 .3l-2.1 .6l-1.5 .7l-1 .9l-.7 1l-1.3 3l-.7 2.4l-.2 1.3l-.2 .4l-.1 .9l-.3 1l0 .5l-.3 .5l-.5-.1l-.3-.3l-.2-1.4l-.8-2.6l-1.1-2.4l-1-1.5l-1.2-1.2l-.9-.6l-.7-.3l-1.4-.3l-8.4 0l-.1 .1l-3 0l-.1 .1l-16.1 0l-.1-.1l-16.1 0l-.1-.1l-36.5 0l-.1 .1l-6.5 0l-.1 .1l-1.2 0l-.1 .1l-.7 0l-.9 .2l-1.3 .6l-1.4 1.3l-.6 1.1l-.6 2.2l0 21.6l.6 1.5l.5 .7l.7 .6l1.2 .4l123 0l.1-.1l.5 0l1.3-.5l1.2-.8l1.4-1.5l.8-1.6l.6-2.2l.1-1.6l.1-.1l0-1.8l.1-.1l0-4.6l.1-.1l0-2.3l.1-.1l.1-7.1l.1-.1l0-2.4l.1-.1l0-6.7l.1-.1l0-4.8l.1-.1l-.1-15.3l-.1-.1l0-2.3l-.1-.1l-.1-1.8l-.8-3.2l-.8-1.7l-1.3-1.6l-.7-.5l-1.2-.6l-1-.3l-2.6-.1l-.1-.1l-5.9 0l-.1 .1l-1.1 0l-.1-.1l-1 0l-.1 .1l-3.1 0l-.1-.1l-.2 .1l-5.9 0l-.1-.1l-.3 .1l-7 0l-.1-.1l-.9 0l-.1 .1l-.7 0l-.1-.1l-.7 0l-.1 .1l-.8 0l-.1-.1l-2.8 .1l-.1-.1l-.5 0l-.1 .1l-27.3 0l-.1 .1l-24.1 .1l-1 .2l-.7 .4l-1.2 1.1l-.5 .7l-.8 1.6l-.5 1.5l-1.1 4.5l-.5 .6l-.2 0l-.5-.6l-.5-2.9l-.9-3l-.6-1.3l-1.1-1.6l-1.3-1.2l-1.7-1l-2.5-.9l-2.1-.5l-1-.5l-.3-.3l0-.7l.7-.4l4.7-1.3l1.4-.7l.9-.7l1.2-1.2l1.1-1.6l1.1-2.7l.6-2.9l.3-3l.3-.8l.3-.2l.3 .2l.2 .4l.5 3.5l.2 .5l0 .5l.6 2.6l1.1 2.5l.8 1.1l.9 .8l1.1 .6l1.4 .4l.9 0l.1 .1l.9 0l.1 .1l1.5 0l.1 .1l1.6 0l.1 .1l1.8 0l.1 .1l2.6 0l.1 .1l24.5 0l.1-.1l6.7 0l.1-.1l2.3 0l.1-.1l5.9 0l.1-.1l10.7-.1l.1-.1l5.1 0l.1-.1l12.9 0l.1-.1l2.6-.1l2.3-.5l2.8-1.2l1.3-.9l1.1-1.1l1.1-1.6l.7-1.9l.6-2.8l0-.6l.1-.1l.1-1.5l.1-.1l0-1.1l.1-.1l.2-3l.1-.1l.1-8.3l-.5-2l-.6-1.1l-.6-.6l-1.2-.5l-.8 0l-.1-.1l-119.4 0l-.1 .1l-.8 0l-.9 .2l-2.1 .8l-2.3 1.6l-1.2 1.2Z";

type MarkProps = SVGProps<SVGSVGElement> & { title?: string };

export function SparkMark({ title, className, ...rest }: MarkProps) {
  return (
    <svg
      viewBox={SPARK_MARK_VIEWBOX}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={SPARK_MARK_PATH} />
    </svg>
  );
}

/** Standalone spark used for bullets and accents. */
export function SparkGlyph({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...rest}>
      <path d={sparkPath(12, 12, 12)} />
    </svg>
  );
}

export function SparkLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SparkMark className="h-6 w-auto" />
      <span className="font-display text-[19px] font-bold uppercase leading-none tracking-[0.06em]">
        Spark
      </span>
    </span>
  );
}
