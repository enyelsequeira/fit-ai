import { createFileRoute, redirect } from "@tanstack/react-router";

import { LandingPageA } from "@/landing-page/Page.tsx";
import { getUser } from "@/lib/get-user.ts";

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
  return <LandingPageA />;
}
