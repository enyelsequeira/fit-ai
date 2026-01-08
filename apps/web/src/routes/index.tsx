import { createFileRoute, redirect } from "@tanstack/react-router";

import { CTASection, Features, Footer, Hero, HowItWorks, Stats } from "@/components/landing";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async () => {
    const session = await getUser();
    if (session) {
      throw redirect({
        to: "/dashboard",
      });
    }
    return { session };
  },
});

function HomeComponent() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTASection />
      <Footer />
    </div>
  );
}
