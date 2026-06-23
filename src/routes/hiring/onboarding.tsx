import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { GraduationCap, CheckCircle2, Circle, Clock } from "lucide-react";
import { useHrStore } from "@/lib/hr-store";

export const Route = createFileRoute("/hiring/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Hiring" }] }),
  component: OnboardingPage,
});

const TASKS = [
  "Create employee login",
  "Assign reporting manager",
  "Collect documents",
  "Issue ID card",
  "Assign laptop / system",
  "Assign software access",
  "Share HR policies",
  "Add to attendance system",
  "Add to payroll",
  "Team introduction",
  "Training schedule",
  "First 7 days task plan",
];

// Dynamic from hr-store

function OnboardingPage() {
  const { state } = useHrStore();
  const recentEmployees = state.employees.slice(0, 6).map((e, i) => ({
    id: e.employeeCode,
    name: e.name,
    role: e.designation,
    done: Math.min(TASKS.length, i === 0 ? TASKS.length : Math.max(0, TASKS.length - i * 3)),
    status: i === 0 ? "Completed" : i > 3 ? "Not Started" : "In Progress"
  }));

  return (
    <HiringLayout title="Onboarding" subtitle="First-week checklist for new joiners">
      <div className="grid lg:grid-cols-2 gap-4">
        {recentEmployees.map(e => (
          <div key={e.id} className="glass-strong rounded-2xl border border-white/10 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 grid place-items-center shadow">
                  <GraduationCap className="size-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.role} · <span className="font-mono">{e.id}</span></div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${
                e.status === "Completed" ? "bg-emerald-500/15 text-emerald-300" :
                e.status === "In Progress" ? "bg-blue-500/15 text-blue-300" :
                "bg-zinc-500/15 text-zinc-300"
              }`}>{e.status}</span>
            </div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{e.done}/{TASKS.length}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${(e.done/TASKS.length)*100}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TASKS.map((t, i) => (
                <div key={t} className="flex items-center gap-1.5 text-xs">
                  {i < e.done ? <CheckCircle2 className="size-3.5 text-emerald-400" /> :
                   i === e.done && e.status === "In Progress" ? <Clock className="size-3.5 text-blue-400" /> :
                   <Circle className="size-3.5 text-muted-foreground" />}
                  <span className={i < e.done ? "" : "text-muted-foreground"}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </HiringLayout>
  );
}
