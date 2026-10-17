import { categories, categoryOrder } from "./taxonomy";
import { SERVICE_DETAILS, servicePath, type Entity } from "./services";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/*
 * schema.org building blocks. Every page describes itself as nodes of one
 * graph: the studio (an Organization), the website, each service and each
 * case study, linked by @id, with topics tied to their Wikipedia entities so
 * search engines know exactly which "React" or "Design system" is meant.
 */

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const absoluteUrl = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);
export const serviceId = (path: string) => `${absoluteUrl(path)}#service`;

export const thing = ({ name, wiki }: Entity) => ({
  "@type": "Thing",
  name,
  sameAs: `https://en.wikipedia.org/wiki/${wiki}`,
});

const CASABLANCA = {
  "@type": "City",
  name: "Casablanca",
  sameAs: "https://en.wikipedia.org/wiki/Casablanca",
  containedInPlace: { "@type": "Country", name: "Morocco", sameAs: "https://en.wikipedia.org/wiki/Morocco" },
};

/** The studio and the website: on every page, so each page can point at them by @id. */
export function siteGraph() {
  const topics = new Map<string, Entity>();
  for (const id of categoryOrder) for (const entity of SERVICE_DETAILS[id].about) topics.set(entity.wiki, entity);

  return [
    {
      "@type": "ProfessionalService",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      alternateName: "SPARK Digital",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      image: `${SITE_URL}/opengraph-image`,
      email: CONTACT_EMAIL,
      sameAs: [INSTAGRAM_URL],
      address: { "@type": "PostalAddress", addressLocality: "Casablanca", addressCountry: "MA" },
      location: CASABLANCA,
      areaServed: "Worldwide",
      knowsAbout: [...topics.values()].map(thing),
      makesOffer: categoryOrder.map((id) => ({
        "@type": "Offer",
        itemOffered: { "@id": serviceId(servicePath(id)), "@type": "Service", name: categories[id].name },
      })),
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ];
}

export type Crumb = { name: string; path: string };

export const breadcrumbList = (path: string, crumbs: Crumb[]) => ({
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl(path)}#breadcrumb`,
  itemListElement: crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/** The page itself, part of the website, about its main entity. */
export function webPage(
  path: string,
  { type = "WebPage", name, description, about, breadcrumb }: {
    type?: string;
    name: string;
    description: string;
    about?: object;
    breadcrumb?: boolean;
  },
) {
  return {
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    ...(about ? { about } : {}),
    ...(breadcrumb ? { breadcrumb: { "@id": `${absoluteUrl(path)}#breadcrumb` } } : {}),
  };
}

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
