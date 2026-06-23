import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TaskLayout } from "@/components/task/TaskLayout";
import { useAuth } from "@/lib/auth";
import { useTasks } from "@/lib/tasks-store";
import { DEPARTMENTS, USERS } from "@/lib/mock-data";
import { PRODUCTS, MOVEMENTS, findCategory, fmtINR, stockStatusColor, stockStatus } from "@/lib/wms-data";
import { PackageX, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports - officeflow" }] }),
  component: Reports,
});

function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tasks = useTasks();
  if (!user) return null;

  const total = tasks.length;
  const done = tasks.filter(t => /completed|done|closed|resolved|payment done/i.test(t.status)).length;
  const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && !/completed|done|closed|resolved/i.test(t.status)).length;
  const priCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 } as Record<string, number>;
  tasks.forEach(t => { priCounts[t.priority]++; });

  const max = Math.max(...DEPARTMENTS.map(d => tasks.filter(t => t.department === d.key).length), 1);

  // --- Inventory & Sales Performance Calculations ---
  const productPerformance = PRODUCTS.map(p => {
    const totalOut = MOVEMENTS
      .filter(m => m.productId === p.id && m.type === "OUT")
      .reduce((sum, m) => sum + m.quantity, 0);
    const category = findCategory(p.subCategoryId)?.name || p.type;
    return { ...p, totalOut, categoryName: category };
  });

  // Top Sellers: High OUT movements
  const topSellers = [...productPerformance]
    .filter(p => p.totalOut > 0)
    .sort((a, b) => b.totalOut - a.totalOut)
    .slice(0, 5);

  // Slow Movers: High current stock, very low or zero OUT movements
  const slowMovers = [...productPerformance]
    .filter(p => p.currentStock > 0 && p.totalOut <= Math.max(1, p.currentStock * 0.1))
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5);

  return (
    <TaskLayout title="Reports & Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Tasks", total, "var(--primary)"],
          ["Completed", done, "var(--success)"],
          ["Overdue", overdue, "var(--destructive)"],
          ["Completion %", `${Math.round((done / total) * 100)}%`, "var(--accent)"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="font-display text-3xl font-bold mt-2" style={{ color: `var(--foreground)` }}>{v as any}</div>
            <div className="h-1 mt-3 rounded-full" style={{ background: `color-mix(in oklab, ${c} 60%, transparent)` }} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-4">Department-wise Tasks</h3>
          <div className="space-y-3">
            {DEPARTMENTS.map(d => {
              const c = tasks.filter(t => t.department === d.key).length;
              return (
                <div key={d.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">{c}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(c / max) * 100}%`, background: d.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-4">Priority Distribution</h3>
          <div className="flex items-end gap-3 h-48">
            {(["Low", "Medium", "High", "Critical"] as const).map((p, i) => {
              const colors = ["var(--success)", "var(--warning)", "#fb923c", "var(--destructive)"];
              const h = (priCounts[p] / Math.max(...Object.values(priCounts))) * 100;
              return (
                <div key={p} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold">{priCounts[p]}</div>
                  <div className="w-full rounded-t-xl transition-all" style={{ height: `${h}%`, background: colors[i], minHeight: 8 }} />
                  <div className="text-[10px] text-muted-foreground">{p}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Employee Workload</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USERS.filter(u => u.role === "Employee").map(u => {
              const c = tasks.filter(t => t.assignedTo === u.id).length;
              return (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                  <img src={u.avatar} className="size-9 rounded-full" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="h-1.5 mt-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(100, c * 25)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        {/* Top Sellers */}
        <div className="glass rounded-2xl p-6 border-t-4 border-[color:var(--success)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[color:var(--success)]/15 text-[color:var(--success)] rounded-lg">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Top Selling Items</h3>
              <p className="text-xs text-muted-foreground">Items with highest dispatch volume</p>
            </div>
          </div>
          <div className="space-y-3">
            {topSellers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/20">{p.categoryName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/20">{p.sku}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-bold text-[color:var(--success)]">{p.totalOut} {p.unit} sold</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Stock: {p.currentStock} {p.unit}</div>
                </div>
              </div>
            ))}
            {topSellers.length === 0 && (
              <div className="text-sm text-center py-4 text-muted-foreground border border-dashed border-white/10 rounded-xl">No sales recorded yet.</div>
            )}
          </div>
        </div>

        {/* Slow Movers */}
        <div className="glass rounded-2xl p-6 border-t-4 border-[color:var(--warning)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[color:var(--warning)]/15 text-[color:var(--warning)] rounded-lg">
              <PackageX className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Slow Movers / Dead Stock</h3>
              <p className="text-xs text-muted-foreground">High inventory but little to no sales. Plan offers!</p>
            </div>
          </div>
          <div className="space-y-3">
            {slowMovers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/20">{p.categoryName}</span>
                    <span className={`px-1.5 py-0.5 rounded ${stockStatusColor(stockStatus(p))}`}>
                      {stockStatus(p)}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-bold text-[color:var(--warning)]">{p.currentStock} {p.unit} in stock</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Only {p.totalOut} {p.unit} sold</div>
                </div>
              </div>
            ))}
            {slowMovers.length === 0 && (
              <div className="text-sm text-center py-4 text-muted-foreground border border-dashed border-white/10 rounded-xl">No slow movers identified. Great!</div>
            )}
          </div>
        </div>
      </div>
    </TaskLayout>
  );
}
