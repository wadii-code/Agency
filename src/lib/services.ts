import type { CategoryId } from "./taxonomy";

/** A topic as a knowledge-graph entity (its English Wikipedia article), for structured data. */
export type Entity = { name: string; wiki: string };

export type ServiceDetail = {
  /** URL slug of the service page: /services/<slug>. */
  slug: string;
  /** What people search for; the page title. */
  title: string;
  /** Short descriptor under the service name. */
  kicker: string;
  /** Meta description (about 150 characters). */
  description: string;
  /** One-paragraph summary (home accordion, service cards). */
  text: string;
  /** The longer explanation on the service page. */
  approach: string[];
  points: { name: string; text: string }[];
  faqs: { q: string; a: string }[];
  /** Topics the service covers, linked to their Wikipedia entities. */
  about: Entity[];
  /** Label for the discipline animation (ServiceArt). */
  art: string;
};

/*
 * What each discipline covers: the home accordion, the service pages, the
 * structured data and llms.txt all read from here. Copy only states what the
 * studio does and what the site shows elsewhere (no figures, prices or quotes).
 */
export const SERVICE_DETAILS: Record<CategoryId, ServiceDetail> = {
  web: {
    slug: "web-design-development",
    title: "Website & Web App Development",
    kicker: "Web design and development",
    description:
      "Marketing websites and product-grade web apps engineered on Next.js by SPARK: fast by default, accessible by design and easy for your team to edit.",
    text: "Marketing sites and product-grade web apps engineered on Next.js. Fast by default, accessible by design and easy for your team to edit.",
    approach: [
      "Your website is often the first conversation a client has with your business. We design and engineer it to load fast, read well on every screen and be easy for search engines to understand, then hand your team an editor they can actually use.",
      "When the job goes beyond pages, such as dashboards, booking flows or logged-in areas, we build web applications on the same foundations, with the same care for speed and accessibility.",
    ],
    points: [
      { name: "Next.js & React", text: "Server-rendered pages that load fast and that search engines read easily, on a modern, well-supported stack." },
      { name: "Headless CMS", text: "Your team edits pages, posts and images in a friendly editor, without touching code." },
      { name: "Web apps", text: "Dashboards, booking flows and logged-in areas built on the same foundations as your website." },
      { name: "Core Web Vitals", text: "Loading speed, responsiveness and visual stability checked against Google's Core Web Vitals before launch." },
    ],
    faqs: [
      {
        q: "Which technology do you build websites with?",
        a: "Next.js and React, usually paired with a headless CMS so your team can edit content on its own.",
      },
      {
        q: "Can our team update the website after launch?",
        a: "Yes. Content lives in a headless CMS with an editor made for non-developers, so pages, posts and images can change without code.",
      },
      {
        q: "Will the website be fast and work on phones?",
        a: "Yes. Every page is built for phones, tablets and desktops, and performance, accessibility and SEO are checked before launch.",
      },
      {
        q: "Do you work with clients outside Morocco?",
        a: "Yes. SPARK is based in Casablanca and works with clients worldwide.",
      },
    ],
    about: [
      { name: "Web development", wiki: "Web_development" },
      { name: "Web application", wiki: "Web_application" },
      { name: "Responsive web design", wiki: "Responsive_web_design" },
      { name: "Web performance", wiki: "Web_performance" },
      { name: "Next.js", wiki: "Next.js" },
      { name: "React", wiki: "React_(software)" },
      { name: "Headless CMS", wiki: "Headless_content_management_system" },
    ],
    art: "Animation: a web page assembling inside a browser window",
  },
  uiux: {
    slug: "ui-ux-design",
    title: "UI/UX Design & Design Systems",
    kicker: "Interface design and design systems",
    description:
      "Research-led UX, interface design and token-driven design systems by SPARK, keeping every screen of your product consistent as it grows.",
    text: "Research-led UX, crisp interface design and token-driven design systems that keep every screen consistent as your product grows.",
    approach: [
      "Good interfaces start with the people who use them. We research, map the journeys that matter and test wireframes and prototypes before a single screen is polished.",
      "What you get is more than a set of mockups: a design system of tokens and components that design and code share, so new screens stay consistent as the product grows.",
    ],
    points: [
      { name: "UX research", text: "Interviews, audits and analytics to learn what users need and where they get stuck." },
      { name: "Wireframes", text: "Simple layouts to agree on structure and flows before investing in visual design." },
      { name: "Design tokens", text: "Colours, type and spacing defined once and shared by design and code." },
      { name: "Component libraries", text: "Reusable, documented components that keep every screen consistent." },
    ],
    faqs: [
      {
        q: "What is a design system?",
        a: "A shared library of design tokens (colours, type, spacing) and ready-made components. Designers and developers use the same building blocks, so every new screen matches the rest of the product.",
      },
      {
        q: "Do you test designs before development starts?",
        a: "Yes. Wireframes and prototypes are reviewed and tested before production code is written, when changes are cheapest.",
      },
      {
        q: "Do you also build what you design?",
        a: "Yes. Design and engineering happen in the same studio, so the design system becomes real components in code.",
      },
    ],
    about: [
      { name: "User experience design", wiki: "User_experience_design" },
      { name: "User interface design", wiki: "User_interface_design" },
      { name: "Design system", wiki: "Design_system" },
      { name: "Website wireframe", wiki: "Website_wireframe" },
      { name: "Usability testing", wiki: "Usability_testing" },
    ],
    art: "Animation: a selected interface component with a toggle, colour swatches and a slider",
  },
  commerce: {
    slug: "ecommerce-development",
    title: "E-Commerce Development & Customer Portals",
    kicker: "Online stores and customer portals",
    description:
      "Online stores, checkouts and secure customer portals by SPARK, on Shopify or headless stacks, built to turn traffic into revenue.",
    text: "Storefronts, checkouts and secure customer portals that turn traffic into revenue and keep operations running smoothly.",
    approach: [
      "An online store has one job: make buying easy. We design product pages, carts and checkouts that remove friction, with the payment and delivery options your customers expect, cash on delivery included.",
      "For businesses that sell to other businesses, we build secure portals where customers log in to order, track and reorder.",
    ],
    points: [
      { name: "Shopify & headless", text: "Shopify when speed to market matters, or a headless storefront when the brand needs full control." },
      { name: "Checkout flows", text: "Short, clear checkouts with the payment and delivery options your customers already use." },
      { name: "B2B portals", text: "Secure customer areas for ordering, tracking and account management." },
      { name: "Payments", text: "Online payments and cash on delivery, built into the checkout." },
    ],
    faqs: [
      {
        q: "Should we choose Shopify or a headless store?",
        a: "Shopify is the fastest way to launch and easy to run day to day. A headless storefront takes longer to build but gives complete control over design and performance. We help you choose based on your catalogue, budget and plans.",
      },
      {
        q: "Can customers pay cash on delivery?",
        a: "Yes. Stores can offer cash on delivery alongside online payment. SKIRO, one of the stores we built, takes its orders cash on delivery.",
      },
      {
        q: "Can the store have wishlists and customer accounts?",
        a: "Yes. Maison Materiau and LM7AT7AT both have wishlists, and LM7AT7AT adds customer accounts.",
      },
    ],
    about: [
      { name: "E-commerce", wiki: "E-commerce" },
      { name: "Shopify", wiki: "Shopify" },
      { name: "Payment gateway", wiki: "Payment_gateway" },
      { name: "Cash on delivery", wiki: "Cash_on_delivery" },
    ],
    art: "Animation: a product added to the cart, which counts up",
  },
  motion: {
    slug: "motion-design",
    title: "Web Animation & Motion Design",
    kicker: "Web animation and kinetic typography",
    description:
      "Scroll-driven storytelling, micro-interactions and kinetic typography by SPARK: web animation that guides attention and never fights it.",
    text: "Scroll-driven storytelling, micro-interactions and kinetic typography. Motion that guides attention and never fights it.",
    approach: [
      "Motion is how an interface explains itself: what changed, where to look next, what can be touched. We use it with intent, from scroll-driven stories that pace a narrative to micro-interactions that confirm an action.",
      "Every animation respects the reduced-motion setting, and effects are built to stay smooth, so motion adds to the experience instead of slowing it down.",
    ],
    points: [
      { name: "Scroll storytelling", text: "Sections that reveal, pin and transition as visitors scroll, pacing the story." },
      { name: "Micro-interactions", text: "Small, quick feedback on buttons, hovers and forms that makes an interface feel alive." },
      { name: "Kinetic type", text: "Animated typography for headlines and brand moments, like the mixed-font headline on our home page." },
      { name: "SVG & Lottie", text: "Lightweight vector animations that stay sharp at any size." },
    ],
    faqs: [
      {
        q: "Will animations slow my website down?",
        a: "Not when they're built well. We animate properties the browser can render cheaply and load heavier effects only when they're needed.",
      },
      {
        q: "What about visitors who prefer less motion?",
        a: "Every animation respects the reduced-motion setting on their device: those visitors get a calm, static version of the page.",
      },
    ],
    about: [
      { name: "Motion graphics", wiki: "Motion_graphics" },
      { name: "Kinetic typography", wiki: "Kinetic_typography" },
      { name: "Lottie", wiki: "Lottie_(file_format)" },
      { name: "Web accessibility", wiki: "Web_accessibility" },
    ],
    art: "Animation: kinetic letters, a bouncing ball and a timeline playhead",
  },
  infra: {
    slug: "digital-infrastructure",
    title: "Cloud Hosting, CI/CD & Web Infrastructure",
    kicker: "Hosting, deployment and monitoring",
    description:
      "Cloud hosting, CI/CD pipelines, databases and monitoring by SPARK: the invisible foundations that keep your platform secure, fast and always on.",
    text: "Cloud hosting, CI/CD, databases and monitoring: the invisible foundations that keep your platform secure, fast and always on.",
    approach: [
      "Great design falls apart on slow, fragile hosting. We set up the foundations behind your product: global hosting, automated deployments, databases and monitoring.",
      "Every change goes through a pipeline that builds, checks and deploys it, with a live staging link to review before anything reaches your visitors.",
    ],
    points: [
      { name: "Vercel & AWS", text: "Hosting on global networks that serve your pages from locations close to each visitor." },
      { name: "CI/CD pipelines", text: "Automated builds, checks and deployments on every change, with preview links for review." },
      { name: "Postgres & Supabase", text: "Reliable relational databases for your content, users and orders." },
      { name: "Monitoring", text: "Uptime, error and performance monitoring, so problems are caught early." },
    ],
    faqs: [
      {
        q: "Where will our website be hosted?",
        a: "Usually on Vercel or AWS, on global networks that serve pages from locations close to your visitors.",
      },
      {
        q: "Do you support the platform after launch?",
        a: "Yes. After launch we keep monitoring, iterating and adding features, so the product keeps improving.",
      },
    ],
    about: [
      { name: "Cloud computing", wiki: "Cloud_computing" },
      { name: "CI/CD", wiki: "CI/CD" },
      { name: "Content delivery network", wiki: "Content_delivery_network" },
      { name: "PostgreSQL", wiki: "PostgreSQL" },
      { name: "Amazon Web Services", wiki: "Amazon_Web_Services" },
      { name: "Vercel", wiki: "Vercel" },
      { name: "Website monitoring", wiki: "Website_monitoring" },
    ],
    art: "Animation: data flowing through a network into blinking servers",
  },
};

export const servicePath = (id: CategoryId) => `/services/${SERVICE_DETAILS[id].slug}`;

export function serviceBySlug(slug: string) {
  const entry = Object.entries(SERVICE_DETAILS).find(([, detail]) => detail.slug === slug);
  return entry ? { id: entry[0] as CategoryId, ...entry[1] } : null;
}
