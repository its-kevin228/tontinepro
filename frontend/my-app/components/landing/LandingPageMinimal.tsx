import { Header } from "./HeaderMinimal";
import { Hero } from "./HeroMinimal";
import { HowItWorks } from "./HowItWorksMinimal";
import { Security } from "./SecurityMinimal";
import { Solutions } from "./SolutionsMinimal";
import { CTA } from "./CTAMinimal";
import { Footer } from "./FooterMinimal";

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
