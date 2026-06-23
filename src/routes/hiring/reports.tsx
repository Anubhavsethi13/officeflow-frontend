import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { CANDIDATES, HIRING_DEPTS } from "@/lib/hiring-data";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";

export const Route = createFileRoute("/hiring/reports")({
  head: () => ({ meta: [{ title: "Hiring Reports - officeflow" }] }),
  component: ReportsPage,
});

const SOURCES = Array.from(new Set(CANDIDATES.map(c => c.source)));

function ReportsPage() {
  const byDept = HIRING_DEPTS.map(d => ({ name: d, count: CANDIDATES.filter(c => c.department === d).length }));
  const bySource = SOURCES.map(s => ({ name: s, count: CANDIDATES.filter(c => c.source === s).length }));
  const maxD = Math.max(...byDept.map(d => d.count), 1);
  const maxS = Math.max(...bySource.map(d => d.count), 1);

  return (
    <HiringLayout title="Hiring Reports" subtitle="Insights across jobs, candidates and rounds">
      <div className="flex justify-end gap-2 mb-4">
        <button className="inline-flex items-center gap-2 glass rounded-xl px-4 h-10 text-sm border border-white/10"><FileSpreadsheet className="size-4" /> Export Excel</button>
        <button className="inline-flex items-center gap-2 glass rounded-xl px-4 h-10 text-sm border border-white/10"><FileText className="size-4" /> Export PDF</button>
        <button className="inline-flex items-center gap-2 glass rounded-xl px-4 h-10 text-sm border border-white/10"><Printer className="size-4" /> Print</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="font-display font-semibold mb-4">Department-wise Hiring</div>
          <div className="space-y-3">
            {byDept.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1"><span>{d.name}</span><span className="tabular-nums">{d.count}</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-600" style={{ width: `${(d.count/maxD)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="font-display font-semibold mb-4">Source-wise Candidates</div>
          <div className="space-y-3">
            {bySource.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1"><span>{d.name}</span><span className="tabular-nums">{d.count}</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(d.count/maxS)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-4 gap-3">
        {[
          { label: "Avg Time-to-Hire", value: "21 days" },
          { label: "Offer Acceptance", value: "78%" },
          { label: "Test Pass Rate", value: "64%" },
          { label: "Drop-off Rate", value: "12%" },
        ].map(k => (
          <div key={k.label} className="glass-strong rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-display font-bold mt-1">{k.value}</div>
          </div>
        ))}
      </div>
    </HiringLayout>
  );
}
