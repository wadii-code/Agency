import { Plus } from "lucide-react";

/** Questions and answers as native disclosure widgets: readable without JavaScript, and by crawlers. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-hairline">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-b border-hairline">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[18px] font-medium leading-snug transition-colors hover:text-primary md:text-[20px] [&::-webkit-details-marker]:hidden">
            <h3>{q}</h3>
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 transition-[rotate,background-color] duration-500 ease-expo group-open:rotate-45 group-open:bg-white/10"
            >
              <Plus className="size-4" strokeWidth={1.5} />
            </span>
          </summary>
          <p className="max-w-[64ch] pb-7 pr-14 text-[16px] leading-[1.7] text-primary/70">{a}</p>
        </details>
      ))}
    </div>
  );
}
