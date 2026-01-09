import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/components/signup/signup-view.tsx";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});
