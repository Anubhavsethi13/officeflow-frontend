import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hiring/")({
  beforeLoad: () => { throw redirect({ to: "/hiring/dashboard" }); },
});
