import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Showcase from "@/components/Showcase";
import Footer from "@/components/Footer";
import LensCursor from "@/components/LensCursor";
import PageScroll from "@/components/PageScroll";
import ContactModal from "@/components/ContactModal";
import FloatingSparks from "@/components/FloatingSparks";

export default function Home() {
  return (
    <>
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
      <ContactModal />
    </>
  );
}
