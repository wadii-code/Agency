export type CategoryId = "web" | "uiux" | "commerce" | "motion" | "infra";

export type Category = {
  name: string;
  short: string;
  /** CSS variable reference, e.g. `var(--cat-web)`. */
  color: string;
};

export const categories: Record<CategoryId, Category> = {
  web: { name: "Websites & Web Apps", short: "Websites", color: "var(--cat-web)" },
  uiux: { name: "UI/UX & Systems", short: "UI/UX", color: "var(--cat-uiux)" },
  commerce: { name: "E-Commerce & Portals", short: "E-Commerce", color: "var(--cat-commerce)" },
  motion: { name: "Motion & Kinetic Type", short: "Motion", color: "var(--cat-motion)" },
  infra: { name: "Digital Infrastructure", short: "Infrastructure", color: "var(--cat-infra)" },
};

export const categoryOrder: CategoryId[] = ["web", "uiux", "commerce", "motion", "infra"];
