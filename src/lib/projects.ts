import type { CategoryId } from "./taxonomy";
import previews from "@/data/work-previews.json";

export type PreviewTile = { src: string; width: number; height: number };

/** A stitched full-page capture (CSS px), sliced into tiles (image px). */
export type Preview = { width: number; height: number; tiles: PreviewTile[] };

export type Device = "desktop" | "mobile";

export type Project = {
  slug: string;
  title: string;
  type: string;
  category: CategoryId;
  summary: string;
  /** Second pill on the card's hover state. */
  tag: string;
  /** Pills shown in the preview popup. */
  highlights: string[];
  layout?: "featured" | "wide";
  cover: string;
  previews: Partial<Record<Device, Preview>>;
};

type ProjectData = Omit<Project, "cover" | "previews">;

/*
 * Showcase projects. Deliberately no URLs or domains anywhere in the site:
 * visitors explore each project through the full-page captures in
 * /public/work/<slug>/ (generated, with domains and emails blurred).
 */
const DATA: ProjectData[] = [
  {
    slug: "maison-materiau",
    title: "Maison Materiau",
    type: "Furniture & interiors e-commerce",
    category: "commerce",
    summary:
      "Online store for high-end furniture, interior decoration and building materials in Casablanca, with shopping by room, a wishlist and a full cart.",
    tag: "Shop by room",
    highlights: ["E-commerce", "Shop by room", "Wishlist & cart"],
    layout: "featured",
  },
  {
    slug: "skiro",
    title: "SKIRO",
    type: "Streetwear drop store",
    category: "commerce",
    summary:
      "Drop-based store for an underground Moroccan streetwear label, with a lookbook and a quick order form paid cash on delivery.",
    tag: "Next.js",
    highlights: ["Next.js", "Cash on delivery", "Lookbook"],
  },
  {
    slug: "mardental",
    title: "Mardental",
    type: "SaaS for dental clinics",
    category: "web",
    summary:
      "Landing page for practice-management software built for Moroccan dental clinics: appointments, patient files, payments and accounting, with a free trial.",
    tag: "Next.js",
    highlights: ["Next.js", "SaaS landing", "Free trial sign-up"],
  },
  {
    slug: "hormexpres",
    title: "Hormexpres",
    type: "Construction & civil engineering",
    category: "web",
    summary:
      "Corporate site for a Casablanca construction and civil-engineering company, presenting its services and projects with quote requests.",
    tag: "Quote requests",
    highlights: ["Corporate site", "Services & projects", "Quote requests"],
  },
  {
    slug: "nounou-express",
    title: "Nounou Express",
    type: "Domestic staffing agency",
    category: "web",
    summary:
      "Lead-generation site for a domestic staffing agency placing nannies, housekeepers, cooks, caregivers and drivers across Morocco.",
    tag: "Lead generation",
    highlights: ["Lead generation", "Request form", "Nationwide coverage"],
  },
  {
    slug: "lm7at7at",
    title: "LM7AT7AT",
    type: "Fashion e-commerce",
    category: "commerce",
    summary: "Fashion store with curated collections, a searchable catalogue, wishlist and customer accounts.",
    tag: "Catalogue & search",
    highlights: ["E-commerce", "Catalogue & search", "Customer accounts"],
  },
  {
    slug: "dyna-house",
    title: "Dyna House",
    type: "Cleaning & concierge services",
    category: "web",
    summary:
      "Website for a Casablanca cleaning and concierge company: services, before-and-after results, pricing and quote requests sent straight to WhatsApp.",
    tag: "Quotes via WhatsApp",
    highlights: ["Service showcase", "Before / after", "Quotes via WhatsApp"],
  },
  {
    slug: "aveiro-maroc",
    title: "Aveiro Maroc",
    type: "Seafood cannery & exporter",
    category: "web",
    summary:
      "Corporate export site for an Agadir seafood cannery founded in 1946, presenting its products, certifications, production and export markets.",
    tag: "Export showcase",
    highlights: ["Corporate site", "Export showcase", "Product range"],
    layout: "wide",
  },
];

const manifest = previews as Record<string, Partial<Record<Device, Preview>>>;

export const PROJECTS: Project[] = DATA.map((project) => ({
  ...project,
  cover: `/work/${project.slug}/cover.webp`,
  previews: manifest[project.slug] ?? {},
}));

/** The project's case-study page. */
export const projectPath = (slug: string) => `/work/${slug}`;

export const projectBySlug = (slug: string) => PROJECTS.find((project) => project.slug === slug) ?? null;
