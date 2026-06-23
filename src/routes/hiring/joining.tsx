import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { candidateAvatar } from "@/lib/hiring-data";
import { UserPlus, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useHiringStore } from "@/lib/hiring-store";
import { useHrStore } from "@/lib/hr-store";

export const Route = createFileRoute("/hiring/joining")({
  head: () => ({ meta: [{ title: "Joining — Hiring" }] }),
  component: JoiningPage,
});

const CHECKLIST = ["Resume","Photo","Aadhaar","PAN","Education","Experience","Bank details","Signed offer","NDA","Policy ack."];

// Dynamic from store

function JoiningPage() {
  const { candidates, updateCandidateStage } = useHiringStore();
  const { addEmployee } = useHrStore();

  const entries = candidates
    .filter(c => ["Offer Accepted", "Joined"].includes(c.stage))
    .map(c => ({
      candidate: c,
      joiningDate: `2026-07-01`, // Mock expected date
      bgv: "Cleared",
      status: c.stage === "Joined" ? "Joined" : "Joining Pending",
      done: c.stage === "Joined" ? CHECKLIST.length : 8,
    }));

  const handleConvert = (c: any) => {
    addEmployee({
      name: c.name,
      email: `${c.name.split(' ')[0].toLowerCase()}@example.com`,
      phone: "9999999999",
      role: "Employee",
      departments: [c.department] as any,
      designation: c.jobTitle,
      monthlyCtc: 50000,
    });
    updateCandidateStage(c.id, "Joined" as any);
  };

  return (
    <HiringLayout title="Joining Management" subtitle="Document collection, BGV, employee code">
      <div className="grid md:grid-cols-2 gap-4">
        {entries.map((e, idx) => (
          <div key={e.candidate.id} className="glass-strong rounded-2xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <img src={candidateAvatar(e.candidate.name, e.candidate.avatarHue)} className="size-12 rounded-full" alt={e.candidate.name} />
              <div className="flex-1">
                <div className="font-medium">{e.candidate.name}</div>
                <div className="text-xs text-muted-foreground">{e.candidate.jobTitle} · {e.candidate.department}</div>
                <div className="text-xs text-muted-foreground mt-1">Joining: <span className="text-foreground">{e.joiningDate}</span></div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] px-2 py-1 rounded-full ${e.status === "Joined" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{e.status}</div>
                <div className="text-[10px] mt-1 text-muted-foreground">BGV: {e.bgv}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Document checklist ({e.done}/{CHECKLIST.length})</div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {CHECKLIST.map((c, i) => (
                <div key={c} className="flex items-center gap-1.5 text-xs">
                  {i < e.done ? <CheckCircle2 className="size-3.5 text-emerald-400" /> : <Circle className="size-3.5 text-muted-foreground" />}
                  <span className={i < e.done ? "" : "text-muted-foreground"}>{c}</span>
                </div>
              ))}
            </div>
            {e.status !== "Joined" ? (
              <button onClick={() => handleConvert(e.candidate)} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg h-9 text-xs font-medium">
                <UserPlus className="size-3.5" /> Convert to Employee <ArrowRight className="size-3" />
              </button>
            ) : (
              <div className="w-full inline-flex items-center justify-center gap-2 glass border border-emerald-500/30 text-emerald-400 rounded-lg h-9 text-xs font-medium cursor-default">
                <CheckCircle2 className="size-3.5" /> Employee Created
              </div>
            )}
          </div>
        ))}
      </div>
    </HiringLayout>
  );
}
