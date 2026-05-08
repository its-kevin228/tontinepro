import { Header } from "./Header";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Security } from "./Security";
import { Solutions } from "./Solutions";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffffe] font-sans text-[#272343] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Security />
        <Solutions />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};
