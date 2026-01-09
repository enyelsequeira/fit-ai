import { createFileRoute, redirect } from "@tanstack/react-router";

import { LandingPageA } from "@/landing-page/version-a/Page";
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
  return <LandingPageA />;
}
