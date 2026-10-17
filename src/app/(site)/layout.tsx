import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LensCursor from "@/components/LensCursor";
import PageScroll from "@/components/PageScroll";
import LazyContactModal from "@/components/LazyContactModal";
import FloatingSparks from "@/components/FloatingSparks";
import { JsonLd } from "@/components/JsonLd";
import { graph, siteGraph } from "@/lib/structured-data";

/* Shared chrome for every page of the site, plus the studio and website entities every page refers to. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <JsonLd data={graph(...siteGraph())} />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <FloatingSparks />
      <LensCursor />
      <PageScroll />
      <LazyContactModal />
    </>
  );
}
