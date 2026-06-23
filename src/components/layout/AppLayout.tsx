import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth, canViewAllDepartments } from "@/lib/auth";
import {
  Users, Network, LogOut, Bell, Search, Plus, Menu, Sparkles, Home,
  CalendarDays, ClipboardCheck, IndianRupee, ShieldCheck, User
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { canAccessPath } from "@/lib/access-control";

const EMP_NAV = [
  { to: "/profile/me", label: "My Profile", icon: User },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/hierarchy", label: "Company Hierarchy", icon: Network },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/leaves", label: "Leave Management", icon: ClipboardCheck },
  { to: "/payroll", label: "Payroll", icon: IndianRupee },
  { to: "/access-control", label: "Access Control", icon: ShieldCheck },
] as const;

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!canAccessPath(user, pathname)) navigate({ to: "/welcome" });
  }, [hydrated, loading, user, pathname, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  const navItems = EMP_NAV.filter((item) => canAccessPath(user, item.to));

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-strong transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/5">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold leading-tight">officeflow</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Workspace System</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(n => {
            const active = pathname === n.to || (n.to !== "/profile/me" && pathname.startsWith(n.to));
            if (n.to === "/profile/me") {
              return (
                <button
                  key={n.to}
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/profile/$employeeId", params: { employeeId: "me" } });
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? "gradient-primary text-white shadow-lg glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </button>
              );
            }

            return (
              <Link
                key={n.to}
                to={n.to as string}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "gradient-primary text-white shadow-lg glow-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
          {navItems.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No employee pages assigned.
            </div>
          )}
        </nav>
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <Link
            to="/welcome"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Home className="size-4" /> Back to Welcome
          </Link>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-white/5 h-16 flex items-center gap-3 px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <h1 className="font-display text-lg font-semibold truncate">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 h-9 w-64">
              <Search className="size-4 text-muted-foreground" />
              <Input className="border-0 bg-transparent shadow-none h-7 p-0 focus-visible:ring-0" placeholder="Search tasks, people…" />
            </div>
            <Button size="sm" className="gradient-primary text-white border-0 rounded-xl hidden sm:flex">
              <Plus className="size-4" /> New Task
            </Button>
            <ThemeToggle className="size-9 rounded-xl" />
            <button className="relative size-9 grid place-items-center rounded-xl hover:bg-white/5">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--accent)]" />
            </button>
            <button onClick={() => navigate({ to: "/profile/$employeeId", params: { employeeId: "me" } })} className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-80 transition-opacity">
              <img src={user.avatar} alt={user.name} className="size-8 rounded-full" />
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium leading-tight">{user.name}</div>
                <div className="text-[10px] text-muted-foreground">{user.role}</div>
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { canViewAllDepartments };
