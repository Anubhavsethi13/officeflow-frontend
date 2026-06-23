import { createFileRoute } from "@tanstack/react-router";
import { TaskLayout } from "@/components/task/TaskLayout";
import { useAuth, canViewAllDepartments } from "@/lib/auth";
import { useTasks } from "@/lib/tasks-store";
import { DEPARTMENTS, type DeptKey } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { Lightbulb, TrendingUp, Users, ShieldAlert, Cpu, Wallet, Package, HeadphonesIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - officeflow" }] }),
  component: Dashboard,
});

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#10b981"
};

const STATUS_COLORS = {
  completed: "#10b981",
  pending: "#3b82f6",
  overdue: "#ef4444"
};

function getRecommendations(isAdmin: boolean, departments: DeptKey[]) {
  const recs = [];

  if (isAdmin) {
    recs.push({
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      title: "Team Management & Leadership",
      desc: "Cross-departmental collaboration is currently stable. To improve overall velocity, consider running weekly syncs between Software and Support teams to reduce ticket resolution times. Keep team morale high by recognizing top performers publicly this Friday."
    });
  }

  if (departments.includes("software") || isAdmin) {
    recs.push({
      icon: Cpu,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      title: "Software & Tech Integration",
      desc: "Consider evaluating new AI-assisted coding tools for the development team. Implementing stricter CI/CD pipelines could reduce the testing backlog by 15%."
    });
  }

  if (departments.includes("accounts") || isAdmin) {
    recs.push({
      icon: Wallet,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      title: "Cost Management",
      desc: "Review recurring SaaS subscriptions this quarter. Consolidating vendor contracts might yield a 5-8% reduction in monthly overhead."
    });
  }

  if (departments.includes("consumables") || isAdmin) {
    recs.push({
      icon: Package,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      title: "Sales & Inventory Strategy",
      desc: "Slow-moving inventory detected in basic rolls. Consider bundling these items with high-demand printers as a promotional offer to clear warehouse space and drive overall sales."
    });
  }

  if (departments.includes("support") || isAdmin) {
    recs.push({
      icon: HeadphonesIcon,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      title: "Client Relations & Support",
      desc: "Empathy training for handling escalated tickets can significantly boost customer retention. Implement a 'positive phrasing' guideline for initial ticket responses."
    });
  }

  if (departments.includes("hardware") || isAdmin) {
    recs.push({
      icon: ShieldAlert,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      title: "Hardware Maintenance",
      desc: "Implement a preventative maintenance schedule for legacy servers. Upgrading aging networking gear at branch offices will prevent unexpected downtime."
    });
  }

  return recs;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong p-3 rounded-lg border border-black/5 dark:border-white/10 shadow-xl text-foreground">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          // If the color is very transparent (like the Pending bar), force it to a readable grey.
          const textColor = entry.color?.startsWith('var(--foreground)') ? '#94a3b8' : entry.color;
          return (
            <p key={index} className="text-xs" style={{ color: textColor }}>
              {entry.name}: <span className="font-bold text-foreground">{entry.value}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}

function Dashboard() {
  const { user } = useAuth();
  const tasks = useTasks();
  if (!user) return null;

  const isAdmin = canViewAllDepartments(user.role);
  const userDepts = user.departments || [];

  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const visibleTasks = useMemo(() => {
    let list = isAdmin ? tasks : tasks.filter(t => userDepts.includes(t.department));
    
    if (fromDate) {
      const start = new Date(fromDate);
      list = list.filter(t => {
        const d = new Date(t.createdAt);
        return isNaN(d.getTime()) || d >= start;
      });
    }
    
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(t => {
        const d = new Date(t.createdAt);
        return isNaN(d.getTime()) || d <= end;
      });
    }
    
    return list;
  }, [tasks, isAdmin, userDepts, fromDate, toDate]);

  const criticalIssues = useMemo(() => {
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);

    return visibleTasks.filter(t => {
      if (/completed|done|closed|resolved|payment done/i.test(t.status)) return false;
      const due = new Date(t.dueDate);
      return t.priority === "Critical" || due <= twoDaysFromNow;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [visibleTasks]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(criticalIssues.length / ITEMS_PER_PAGE);
  const paginatedIssues = criticalIssues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Data Calculations ---
  
  // 1. Department Performance (Admin)
  const deptPerformanceData = useMemo(() => {
    return DEPARTMENTS.map(d => {
      const deptTasks = tasks.filter(t => t.department === d.key);
      const completed = deptTasks.filter(t => /completed|done|closed|resolved/i.test(t.status)).length;
      return {
        name: d.name,
        Completed: completed,
        Pending: deptTasks.length - completed,
      };
    });
  }, [tasks]);

  // 2. Priority Distribution (Global/Local)
  const priorityData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    visibleTasks.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [visibleTasks]);

  // 3. Status Breakdown (Local)
  const statusData = useMemo(() => {
    const completed = visibleTasks.filter(t => /completed|done|closed|resolved/i.test(t.status)).length;
    const overdue = visibleTasks.filter(t => new Date(t.dueDate) < new Date() && !/completed|done|closed|resolved/i.test(t.status)).length;
    const pending = visibleTasks.length - completed - overdue;
    return [
      { name: "Completed", value: completed, fill: STATUS_COLORS.completed },
      { name: "Pending", value: pending, fill: STATUS_COLORS.pending },
      { name: "Overdue", value: overdue, fill: STATUS_COLORS.overdue },
    ];
  }, [visibleTasks]);

  // 4. Trend Line (Mocked based on due dates over the last 7 days)
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      const dayTasks = visibleTasks.filter(t => t.dueDate.startsWith(dateStr) || t.createdAt.startsWith(dateStr));
      const completed = dayTasks.filter(t => /completed|done/i.test(t.status)).length;
      
      data.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Total: dayTasks.length,
        Completed: completed
      });
    }
    return data;
  }, [visibleTasks]);

  const recommendations = getRecommendations(isAdmin, userDepts);

  return (
    <TaskLayout title="Analytics Dashboard">
      <div className="space-y-6">
        
        {/* Header Hero */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[color:var(--primary)]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-2">
              Performance Insights, <span className="gradient-text">{user.name.split(" ")[0]}</span>
            </h2>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Here is the overarching performance of all departments. Identify bottlenecks and read our latest leadership recommendations." 
                : "Welcome to your department's graphical overview. Review your team's workload and tailored strategies below."}
            </p>
          </div>
          <div className="relative z-10 glass rounded-2xl p-4 flex flex-col sm:flex-row gap-6 border-black/5 dark:border-white/10 items-center">
            <div className="flex gap-6 items-center">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Tasks</div>
                <div className="text-3xl font-display font-bold text-foreground">{visibleTasks.length}</div>
              </div>
              <div className="w-px h-12 bg-black/10 dark:bg-white/10" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Completion</div>
                <div className="text-3xl font-display font-bold text-[color:var(--success)]">
                  {Math.round((statusData[0]?.value / (visibleTasks.length || 1)) * 100)}%
                </div>
              </div>
            </div>
            <div className="w-full sm:w-px sm:h-12 bg-black/10 dark:bg-white/10" />
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">From</span>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent border border-black/10 dark:border-white/10 h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">To</span>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent border border-black/10 dark:border-white/10 h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
              {(fromDate || toDate) && (
                <button 
                  onClick={() => { setFromDate(""); setToDate(""); }}
                  className="text-xs text-[color:var(--destructive)] hover:underline font-medium ml-1"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Main Chart depending on role */}
          <div className="glass rounded-3xl p-6 flex flex-col">
            <h3 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="size-5 text-[color:var(--primary)]" />
              {isAdmin ? "Department Task Volume" : "7-Day Workload Trend"}
            </h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {isAdmin ? (
                  <BarChart data={deptPerformanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground)" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="name" stroke="var(--foreground)" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--foreground)" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--foreground)', opacity: 0.05 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="Completed" stackId="a" fill="url(#colorCompleted)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Pending" stackId="a" fill="var(--foreground)" fillOpacity={0.1} radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                ) : (
                  <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground)" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="date" stroke="var(--foreground)" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--foreground)" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Total" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                    <Line type="monotone" dataKey="Completed" stroke="var(--success)" strokeWidth={3} dot={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center relative">
              <h3 className="font-display font-semibold text-sm mb-2 absolute top-6 left-6 text-muted-foreground uppercase tracking-wider">Priority Spread</h3>
              <div className="w-full h-[200px] mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {priorityData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div className="size-2 rounded-full" style={{ background: PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center relative">
              <h3 className="font-display font-semibold text-sm mb-2 absolute top-6 left-6 text-muted-foreground uppercase tracking-wider">Task Status</h3>
              <div className="w-full h-[200px] mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div className="size-2 rounded-full" style={{ background: entry.fill }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI/Strategic Recommendations */}
        <div>
          <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-400" />
            Strategic Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${rec.bg} ${rec.color}`}>
                    <rec.icon className="size-5" />
                  </div>
                  <h4 className="font-semibold text-sm leading-tight">{rec.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Issues Tracker */}
        <div>
          <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
            <ShieldAlert className="size-5 text-[color:var(--destructive)]" />
            Recent Critical Issues & Deadlines
          </h3>
          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                    <th className="px-6 py-4 font-medium">Task ID</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Created Date</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {paginatedIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No critical issues or approaching deadlines. Great job!
                      </td>
                    </tr>
                  ) : (
                    paginatedIssues.map((t) => (
                      <tr key={t.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-[color:var(--secondary)]">{t.id}</td>
                        <td className="px-6 py-4 font-medium">{t.title}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            t.priority === 'Critical' ? 'bg-red-500/15 text-red-500' : 'bg-orange-500/15 text-orange-500'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{t.createdAt.slice(0, 10)}</td>
                        <td className="px-6 py-4 font-bold text-[color:var(--destructive)]">{t.dueDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="p-4 border-t border-black/5 dark:border-white/5">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm text-muted-foreground px-4">Page {currentPage} of {totalPages}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </TaskLayout>
  );
}
