import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Briefcase, Users, Trello, FileText, BookOpen, ClipboardList,
  MessagesSquare, FileSignature, UserPlus, GraduationCap, BarChart3, Settings,
  LogOut, Bell, Search, Menu, Sparkles, Home,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { canAccessPath } from "@/lib/access-control";

const NAV = [
  { to: "/hiring/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hiring/jobs", label: "Jobs", icon: Briefcase },
  { to: "/hiring/candidates", label: "Candidates", icon: Users },
  { to: "/hiring/pipeline", label: "Pipeline", icon: Trello },
  { to: "/hiring/exam-center", label: "Exam Center", icon: FileText },
  { to: "/hiring/question-bank", label: "Question Bank", icon: BookOpen },
  { to: "/hiring/answer-sheets", label: "Answer Sheets", icon: ClipboardList },
  { to: "/hiring/interviews", label: "Interviews", icon: MessagesSquare },
  { to: "/hiring/offers", label: "Offers", icon: FileSignature },
  { to: "/hiring/joining", label: "Joining", icon: UserPlus },
  { to: "/hiring/onboarding", label: "Onboarding", icon: GraduationCap },
  { to: "/hiring/reports", label: "Reports", icon: BarChart3 },
  { to: "/hiring/settings", label: "Settings", icon: Settings },
];

export function HiringLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!canAccessPath(user, pathname)) navigate({ to: "/welcome" });
  }, [hydrated, user, pathname, navigate]);

  const display = user ?? { name: "Guest", role: "—", avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Guest" };

  return (
    <div className="min-h-screen flex w-full">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-strong transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/5 shrink-0">
          <div className="size-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 grid place-items-center shadow-lg">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold leading-tight">officeflow HRMS</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hiring</div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {NAV.filter(n => user ? canAccessPath(user, n.to) : true).map(n => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1 shrink-0">
          <Link to="/welcome" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
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

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-white/5 h-16 flex items-center gap-3 px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold truncate">{title}</h1>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 h-9 w-72">
              <Search className="size-4 text-muted-foreground" />
              <Input className="border-0 bg-transparent shadow-none h-7 p-0 focus-visible:ring-0" placeholder="Search candidates, jobs, tests…" />
            </div>
            <ThemeToggle className="size-9 rounded-xl" />
            <button className="relative size-9 grid place-items-center rounded-xl hover:bg-white/5">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--accent)]" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img src={display.avatar} alt={display.name} className="size-8 rounded-full" />
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium leading-tight">{display.name}</div>
                <div className="text-[10px] text-muted-foreground">{display.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
