import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Showcase from "@/components/Showcase";
import Footer from "@/components/Footer";
import LensCursor from "@/components/LensCursor";
import PageScroll from "@/components/PageScroll";
import LazyContactModal from "@/components/LazyContactModal";
import FloatingSparks from "@/components/FloatingSparks";
import { categories, categoryOrder } from "@/lib/taxonomy";
import { SERVICE_DETAILS } from "@/lib/services";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Structured data (schema.org): the studio, its services and the website. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "SPARK Digital",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/opengraph-image`,
      email: CONTACT_EMAIL,
      sameAs: [INSTAGRAM_URL],
      address: { "@type": "PostalAddress", addressLocality: "Casablanca", addressCountry: "MA" },
      areaServed: "Worldwide",
      knowsAbout: categoryOrder.map((id) => categories[id].name),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: categoryOrder.map((id) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: categories[id].name, description: SERVICE_DETAILS[id].text },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <main id="main">
        <Hero />
        <Manifesto />
        <Services />
        <Process />
        <Showcase />
      </main>
      <Footer />
      <FloatingSparks />
      <LensCursor />
      <PageScroll />
      <LazyContactModal />
    </>
  );
}
