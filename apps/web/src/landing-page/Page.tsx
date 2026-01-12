import { Hero } from "./Hero.tsx";
import { Features } from "./Features.tsx";
import { HowItWorks } from "./HowItWorks.tsx";
import { Stats } from "./Stats.tsx";
import { CTA } from "./CTA.tsx";
import { Footer } from "./Footer.tsx";
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
