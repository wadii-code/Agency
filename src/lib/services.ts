import type { CategoryId } from "./taxonomy";

export type ServiceDetail = { text: string; points: string[]; art: string };

/** What each discipline covers (the Services accordion, structured data and llms.txt). */
export const SERVICE_DETAILS: Record<CategoryId, ServiceDetail> = {
  web: {
    text: "Marketing sites and product-grade web apps engineered on Next.js. Fast by default, accessible by design and easy for your team to edit.",
    points: ["Next.js & React", "Headless CMS", "Web apps", "Core Web Vitals"],
    art: "Animation: a web page assembling inside a browser window",
  },
  uiux: {
    text: "Research-led UX, crisp interface design and token-driven design systems that keep every screen consistent as your product grows.",
    points: ["UX research", "Wireframes", "Design tokens", "Component libraries"],
    art: "Animation: a selected interface component with a toggle, colour swatches and a slider",
  },
  commerce: {
    text: "Storefronts, checkouts and secure customer portals that turn traffic into revenue and keep operations running smoothly.",
    points: ["Shopify & headless", "Checkout flows", "B2B portals", "Payments"],
    art: "Animation: a product added to the cart, which counts up",
  },
  motion: {
    text: "Scroll-driven storytelling, micro-interactions and kinetic typography. Motion that guides attention and never fights it.",
    points: ["Scroll storytelling", "Micro-interactions", "Kinetic type", "SVG & Lottie"],
    art: "Animation: kinetic letters, a bouncing ball and a timeline playhead",
  },
  infra: {
    text: "Cloud hosting, CI/CD, databases and monitoring: the invisible foundations that keep your platform secure, fast and always on.",
    points: ["Vercel & AWS", "CI/CD pipelines", "Postgres & Supabase", "Monitoring"],
    art: "Animation: data flowing through a network into blinking servers",
  },
};
