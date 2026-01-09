import { Hero } from "./Hero";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { Stats } from "./Stats";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import { Box } from "@mantine/core";

export function LandingPageA() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA />
      <Footer />
    </>
  );
}
