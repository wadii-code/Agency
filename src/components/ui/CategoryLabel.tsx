import { categories, type CategoryId } from "@/lib/taxonomy";
import { cn } from "@/lib/cn";
import { SparkGlyph } from "./SparkLogo";

export function CategoryLabel({
  id,
  full = false,
  className,
}: {
  id: CategoryId;
  full?: boolean;
  className?: string;
}) {
  const category = categories[id];
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em]", className)}
      style={{ color: category.color }}
    >
      <SparkGlyph className="size-2.5 shrink-0" />
      {full ? category.name : category.short}
    </span>
  );
}
