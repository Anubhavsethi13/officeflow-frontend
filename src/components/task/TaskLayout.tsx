import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, KanbanSquare, BarChart3, Settings, LogOut,
  Bell, Search, Menu, Sparkles, Home, UserCheck
} from "lucide-react";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { canAccessPath } from "@/lib/access-control";
import { useTasks } from "@/lib/tasks-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { canViewAllDepartments } from "@/lib/auth";
import { AlertTriangle, Clock } from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/task-management", label: "Task Board", icon: KanbanSquare },
  { to: "/employee-report", label: "Employee Month Report", icon: UserCheck },
];

export function TaskLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
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

  // --- Deadline Reminder Logic ---
  const tasks = useTasks();
  const isAdmin = user ? canViewAllDepartments(user.role) : false;
  
  const urgentTasks = useMemo(() => {
    if (!user) return [];
    // Admins see all urgent tasks, others see their own assigned urgent tasks
    const relevantTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo === user.id);
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);

    return relevantTasks.filter(t => {
      if (/completed|done|closed|resolved|payment done/i.test(t.status)) return false;
      const due = new Date(t.dueDate);
      return due <= twoDaysFromNow;
    });
  }, [tasks, user, isAdmin]);

  const [showUrgentPopup, setShowUrgentPopup] = useState(false);

  useEffect(() => {
    // Show pop-up once per session if there are urgent tasks
    if (hydrated && urgentTasks.length > 0 && !sessionStorage.getItem("officeflow.deadlineAlertShown")) {
      const timer = setTimeout(() => setShowUrgentPopup(true), 1500); // slight delay so it doesn't jar on load
      sessionStorage.setItem("officeflow.deadlineAlertShown", "true");
      return () => clearTimeout(timer);
    }
  }, [hydrated, urgentTasks.length]);

  return (
    <div className="min-h-screen flex w-full">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-strong transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/5 shrink-0">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold leading-tight">officeflow</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Workspace System</div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {NAV.filter(n => user ? canAccessPath(user, n.to) : true).map(n => {
            const active = n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/");
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
              <Input className="border-0 bg-transparent shadow-none h-7 p-0 focus-visible:ring-0" placeholder="Search tasks, people…" />
            </div>
            <ThemeToggle className="size-9 rounded-xl" />
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative size-9 grid place-items-center rounded-xl hover:bg-white/5 transition-colors">
                  <Bell className="size-4" />
                  {urgentTasks.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--destructive)] animate-pulse" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 glass-strong border-white/10 shadow-2xl">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <span className="text-xs bg-[color:var(--destructive)]/20 text-[color:var(--destructive)] px-2 py-0.5 rounded-full font-medium">
                    {urgentTasks.length} Urgent
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {urgentTasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No pending deadlines!</div>
                  ) : (
                    urgentTasks.map(t => (
                      <Link key={t.id} to="/task-management" className="block p-3 hover:bg-white/5 rounded-xl transition-colors mb-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm leading-tight text-foreground">{t.title}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{t.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[color:var(--destructive)]">
                          <Clock className="size-3" /> Due: {t.dueDate}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
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

      {/* Global Deadline Alert Popup */}
      <Dialog open={showUrgentPopup} onOpenChange={setShowUrgentPopup}>
        <DialogContent className="sm:max-w-md glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="size-10 rounded-full bg-[color:var(--destructive)]/20 flex items-center justify-center">
                <AlertTriangle className="size-5 text-[color:var(--destructive)]" />
              </div>
              Approaching Deadlines
            </DialogTitle>
            <DialogDescription className="pt-4 text-base leading-relaxed">
              You have <strong className="text-foreground">{urgentTasks.length} task(s)</strong> that are overdue or due within the next 48 hours. 
              <br/><br/>
              Please take immediate action. Failure to resolve these may result in issuing credit notes or losing the deal entirely.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowUrgentPopup(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
              Dismiss
            </button>
            <Link 
              to="/task-management" 
              onClick={() => setShowUrgentPopup(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[color:var(--destructive)] text-white hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
            >
              View Tasks Now
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
