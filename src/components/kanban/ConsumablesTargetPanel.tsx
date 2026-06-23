import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  currentMonthKey,
  summarizeSalesMonth,
  useSalesTargets,
} from "@/lib/consumables-targets";
import { type Task } from "@/lib/mock-data";
import { fmtINR } from "@/lib/wms-data";
import { AlertTriangle, Target } from "lucide-react";

export function ConsumablesTargetPanel({ tasks }: { tasks: Task[] }) {
  const monthKey = currentMonthKey();
  const { target, updateTarget } = useSalesTargets(monthKey);
  const summary = summarizeSalesMonth(tasks, target, monthKey);

  return (
    <section className="glass rounded-2xl p-5 mb-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Target className="size-4 text-[color:var(--secondary)]" />
            {summary.monthLabel} Sales Target
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h3 className="font-display text-4xl font-bold">{fmtINR(summary.totalAchieved)}</h3>
            <span className="pb-1 text-sm text-muted-foreground">
              of {fmtINR(summary.totalTarget)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="w-full sm:w-48 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Update Target</Label>
            <Input
              type="number"
              min={0}
              value={target}
              onChange={(event) => updateTarget(Number(event.target.value))}
              className="bg-white/5 border-white/10 text-right font-mono"
              aria-label={`Overall Sales Target`}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center w-full sm:min-w-[360px]">
            <TargetStat label="Progress" value={`${summary.overallPercent}%`} />
            <TargetStat label="Remaining" value={fmtINR(summary.remaining)} />
            <TargetStat label="WMS SKUs" value={String(summary.linkedProductCount)} />
          </div>
        </div>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--secondary)] transition-all duration-500 ease-in-out"
          style={{ width: `${summary.overallPercent}%` }}
        />
      </div>

      {summary.lowStockCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[color:var(--warning)]/15 px-3 py-2 text-xs text-[color:var(--warning)] border border-[color:var(--warning)]/20">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            <strong>{summary.lowStockCount} linked WMS SKU{summary.lowStockCount === 1 ? "" : "s"}</strong> running low on stock and may impact upcoming sales.
          </span>
        </div>
      )}
    </section>
  );
}

function TargetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 border border-white/5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
