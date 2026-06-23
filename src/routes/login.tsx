import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login - officeflow" }] }),
  component: LoginPage,
});

const DEMO_USERS = [
  { label: "Admin", email: "admin@officeflow.test", password: "Admin@123" },
  { label: "Employee", email: "employee@officeflow.test", password: "Employee@123" },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("admin@officeflow.test");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/attendance" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await loginWithCredentials(email, password);
    setSubmitting(false);
    if (ok) {
      navigate({ to: "/attendance" });
      return;
    }

    setError("Email or password is not valid.");
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 relative overflow-hidden">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[color:var(--primary)]/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 size-72 rounded-full bg-[color:var(--secondary)]/20 blur-3xl" />

      <div className="relative w-full max-w-md glass-strong rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">officeflow</div>
            <div className="text-xs text-muted-foreground">Workspace Management</div>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to access your workspace</p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                autoComplete="email"
                required
                className="pl-9 glass border-white/10 h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">Password</Label>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                className="pl-9 glass border-white/10 h-11 rounded-xl"
              />
            </div>
            {error && <p className="text-xs text-[color:var(--destructive)]">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Demo accounts</Label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.password);
                    setError("");
                  }}
                  className="text-xs px-3 py-2 rounded-lg border glass border-white/10 hover:border-white/30"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <Checkbox /> Remember me
            </label>
            <a className="text-[color:var(--secondary)] hover:underline">Forgot password?</a>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 gradient-primary border-0 text-white rounded-xl glow-primary"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
