export type CategoryId = "web" | "uiux" | "commerce" | "motion" | "infra";

export type Category = {
  name: string;
  short: string;
  /** CSS variable reference, e.g. `var(--cat-web)`. */
  color: string;
  /** URL slug of the discipline's service page. */
  slug: string;
};

export const categories: Record<CategoryId, Category> = {
  web: { name: "Websites & Web Apps", short: "Websites", color: "var(--cat-web)", slug: "web-design-development" },
  uiux: { name: "UI/UX & Systems", short: "UI/UX", color: "var(--cat-uiux)", slug: "ui-ux-design" },
  commerce: { name: "E-Commerce & Portals", short: "E-Commerce", color: "var(--cat-commerce)", slug: "ecommerce-development" },
  motion: { name: "Motion & Kinetic Type", short: "Motion", color: "var(--cat-motion)", slug: "motion-design" },
  infra: { name: "Digital Infrastructure", short: "Infrastructure", color: "var(--cat-infra)", slug: "digital-infrastructure" },
};

export const categoryOrder: CategoryId[] = ["web", "uiux", "commerce", "motion", "infra"];

/** The discipline's service page (kept here, not in services.ts, so client code never pulls in the page copy). */
export const servicePath = (id: CategoryId) => `/services/${categories[id].slug}`;
