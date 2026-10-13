import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type PillStyle = {
  variant?: "ghost" | "gradient";
  size?: "sm" | "md";
  icon?: ReactNode;
};

const pillClass = ({ variant = "ghost", size = "md" }: PillStyle, className?: string) =>
  cn("pill", variant === "gradient" && "pill-gradient", size === "sm" && "pill-sm", className);

/* The arrow rests at the right edge and swaps to the left on hover. */
function PillContent({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  const arrow = icon ?? <ArrowRight className="size-4" strokeWidth={1.5} />;
  return (
    <>
      <span aria-hidden className="pill-icon pill-icon-in">
        {arrow}
      </span>
      <span className="pill-label">{children}</span>
      <span aria-hidden className="pill-fill" />
      <span aria-hidden className="pill-icon pill-icon-out">
        {arrow}
      </span>
    </>
  );
}

/**
 * Pill CTA after the "Flow Button": an outlined pill that, on hover or focus,
 * fills from the centre, squares its corners and swaps its arrow from the
 * right edge to the left. `gradient` keeps the violet → cyan ring at rest and
 * fills with the same gradient. Styles live in globals.css (`.pill`).
 */
export function Pill({
  href,
  variant,
  size,
  icon,
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & PillStyle & { href: string }) {
  return (
    <a href={href} className={pillClass({ variant, size }, className)} {...rest}>
      <PillContent icon={icon}>{children}</PillContent>
    </a>
  );
}

/** The same pill as a `<button>`. */
export function PillButton({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & PillStyle) {
  return (
    <button type={type} className={pillClass({ variant, size }, className)} {...rest}>
      <PillContent icon={icon}>{children}</PillContent>
    </button>
  );
}
