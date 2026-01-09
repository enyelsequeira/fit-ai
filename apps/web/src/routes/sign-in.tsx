import { createFileRoute } from "@tanstack/react-router";

import SignInPage from "@/components/sign-in/sign-in-view.tsx";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});
