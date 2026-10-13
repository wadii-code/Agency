import type { Metadata } from "next";
import { Pill } from "@/components/ui/Pill";
import { SparkMark } from "@/components/ui/SparkLogo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-24 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(37,31,73,0.85), transparent)" }}
      />
      <SparkMark aria-hidden className="h-8 w-auto text-primary" />
      <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.18em] text-muted">Error 404</p>
      <h1 className="mt-5 font-display text-section font-bold uppercase">Page not found</h1>
      <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-muted">
        This page doesn’t exist or has moved. Everything SPARK does is on the home page.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Pill href="/" variant="gradient">
          Back to home
        </Pill>
        <Pill href="/#work">View our work</Pill>
      </div>
    </main>
  );
}
