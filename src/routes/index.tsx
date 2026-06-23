import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: user ? "/welcome" : "/login" });
  }, [user, navigate]);
  return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
}
