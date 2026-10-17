import { Pill } from "./ui/Pill";

/** Closing call to action on inner pages; opens the contact popup. */
export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section aria-labelledby="cta-title" className="shell py-24 md:py-32">
      <div className="glass relative overflow-hidden rounded-[28px] px-6 py-14 text-center md:px-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] -bottom-1/2 top-1/3 -z-10 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(157,149,255,0.25), transparent)" }}
        />
        <h2 id="cta-title" className="mx-auto max-w-[18ch] font-display text-section font-medium uppercase">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-[48ch] text-[17px] leading-relaxed text-primary/70">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog">
            Start a Project
          </Pill>
          <Pill href="/work">See our work</Pill>
        </div>
      </div>
    </section>
  );
}
