import type { CSSProperties } from "react";

/**
 * Props for an inner page's intro: the element rises in `delay` seconds after the first paint
 * (`[data-rise]` in globals.css). Pass the element's own inline style here so it isn't overwritten.
 */
export const rise = (delay: number, style?: CSSProperties) => ({
  "data-rise": true,
  style: { ...style, "--rise": `${delay}s` } as CSSProperties,
});
