import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  type LucideIcon,
  ArrowUpRight,
  Sparkles,
  LogOut,
  KanbanSquare,
  Users2,
  Warehouse,
  UserPlus,
} from "lucide-react";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { canAccessModule, type ModuleKey } from "@/lib/access-control";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome - officeflow" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const workspaces: Array<{
    title: string;
    description: string;
    to: "/task-management" | "/employees" | "/wms" | "/hiring/dashboard";
    module: ModuleKey;
    icon: LucideIcon;
    accent: string;
    glow: string;
    label: string;
  }> = [
    {
      title: "Task Management",
      description: "Kanban boards, priorities, deadlines, and progress in one place.",
      to: "/task-management",
      module: "tasks",
      icon: KanbanSquare,
      accent: "from-violet-400 via-fuchsia-400 to-rose-400",
      glow: "group-hover:shadow-violet-950/40",
      label: "Boards",
    },
    {
      title: "Employee Management",
      description: "People records, roles, reporting lines, and company structure.",
      to: "/employees",
      module: "employees",
      icon: Users2,
      accent: "from-sky-400 via-cyan-400 to-teal-300",
      glow: "group-hover:shadow-cyan-950/40",
      label: "People",
    },
    {
      title: "Warehouse Management",
      description: "Products, stock movement, storage locations, and inventory reports.",
      to: "/wms",
      module: "warehouse",
      icon: Warehouse,
      accent: "from-emerald-400 via-teal-300 to-lime-300",
      glow: "group-hover:shadow-emerald-950/40",
      label: "Inventory",
    },
    {
      title: "Hiring Management",
      description: "Candidates, exams, interviews, offers, joining, and onboarding.",
      to: "/hiring/dashboard",
      module: "hiring",
      icon: UserPlus,
      accent: "from-amber-300 via-orange-400 to-pink-400",
      glow: "group-hover:shadow-orange-950/40",
      label: "Talent",
    },
  ];

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const visibleWorkspaces = workspaces.filter((workspace) => canAccessModule(user, workspace.module));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 workspace-bg" />
      <div className="absolute inset-0 workspace-grid" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-300 shadow-lg shadow-violet-950/35">
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">officeflow</div>
              <div className="text-xs text-muted-foreground">Workspace System</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.3fr] lg:py-14">
          <section className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground">
              <Sparkles className="size-4 text-[color:var(--info)]" />
              Workspace hub
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Jump into the area you need and keep today&apos;s operations moving
              with a cleaner, faster workspace.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="text-2xl font-bold text-foreground">{visibleWorkspaces.length}</div>
                <div className="mt-1 text-muted-foreground">Allowed Modules</div>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="text-2xl font-bold text-foreground">{user.role}</div>
                <div className="mt-1 text-muted-foreground">Access Role</div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {visibleWorkspaces.map((workspace) => {
              const Icon = workspace.icon;
              return (
                <button
                  key={workspace.to}
                  onClick={() => navigate({ to: workspace.to })}
                  className={`workspace-card group relative min-h-[178px] overflow-hidden rounded-lg border p-5 text-left shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${workspace.glow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${workspace.accent}`}
                  />
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`grid size-12 place-items-center rounded-lg bg-gradient-to-br ${workspace.accent} shadow-lg`}
                      >
                        <Icon className="size-6 text-white" />
                      </div>
                      <div className="grid size-10 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors group-hover:bg-card group-hover:text-foreground">
                        <ArrowUpRight className="size-5" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        {workspace.label}
                      </div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {workspace.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {workspace.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {visibleWorkspaces.length === 0 && (
              <div className="workspace-card rounded-lg border p-6 text-sm text-muted-foreground">
                No modules are assigned to this employee yet. Ask an administrator to update access control.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
