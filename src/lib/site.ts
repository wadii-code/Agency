/** SPARK's public channels. */
export const CONTACT_EMAIL = "wadiibeingpro@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/hallospark/";
export const INSTAGRAM_HANDLE = "@hallospark";
/** Opens a Gmail compose window in the browser (instead of the default mail app). */
export const CONTACT_EMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent("New project")}`;

export const SITE_NAME = "SPARK";
export const SITE_TITLE = "SPARK | Websites & Digital Solutions";
export const SITE_DESCRIPTION =
  "SPARK is a Casablanca-based digital agency building high-performance websites, web apps, UI/UX systems, e-commerce and scalable digital infrastructure.";

/*
 * Public origin used by the metadata, sitemap, robots.txt and structured data
 * (server-side only). Set NEXT_PUBLIC_SITE_URL to the custom domain in
 * production; on Vercel it falls back to the project's production domain.
 */
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelDomain ? `https://${vercelDomain}` : "http://localhost:3000")
).replace(/\/+$/, "");
