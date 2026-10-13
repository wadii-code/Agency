import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Curly-bracket section annotation, e.g. `{ SPARK® STUDIOS }`. */
export function Annotation({ children, className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-annotation
      className={cn(
        "inline-flex items-center gap-2 font-sans text-annotation font-normal uppercase text-muted",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true">{"{"}</span>
      <span>{children}</span>
      <span aria-hidden="true">{"}"}</span>
    </p>
  );
}
