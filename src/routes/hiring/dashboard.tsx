import { createFileRoute, Link } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { CANDIDATES, JOBS, HIRING_STAGES, stageColor, candidateAvatar, HIRING_DEPTS } from "@/lib/hiring-data";
import { Briefcase, Users, CheckCircle2, Clock, TrendingUp, FileText, MessagesSquare, FileSignature, UserPlus, GraduationCap, Plus, Upload, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/hiring/dashboard")({
  head: () => ({ meta: [{ title: "Hiring Dashboard - officeflow" }] }),
  component: HiringDashboard,
});

function Stat({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: number | string; gradient: string }) {
  return (
    <div className="glass-strong rounded-2xl p-4 border border-white/10 relative overflow-hidden">
      <div className={`absolute -top-8 -right-8 size-28 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative flex items-center gap-3">
        <div className={`size-10 rounded-xl bg-gradient-to-br ${gradient} grid place-items-center shadow`}>
          <Icon className="size-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function HiringDashboard() {
  const byStage = (s: string) => CANDIDATES.filter(c => c.stage === s).length;
  const totalJobs = JOBS.length;
  const openJobs = JOBS.filter(j => j.status === "Open").length;
  const closedJobs = JOBS.filter(j => j.status === "Closed").length;
  const offers = byStage("Offer Shared") + byStage("Offer Accepted");
  const joined = byStage("Joined");
  const rejected = byStage("Rejected");

  const funnel = HIRING_STAGES.filter(s => s !== "Hold" && s !== "Rejected").map(s => ({ stage: s, count: byStage(s) }));
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1);

  return (
    <HiringLayout title="Hiring Dashboard" subtitle="Recruitment pipeline at a glance">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <Stat icon={Briefcase} label="Total Jobs" value={totalJobs} gradient="from-violet-500 to-purple-600" />
        <Stat icon={Briefcase} label="Open Jobs" value={openJobs} gradient="from-blue-500 to-cyan-500" />
        <Stat icon={CheckCircle2} label="Closed Jobs" value={closedJobs} gradient="from-zinc-500 to-zinc-600" />
        <Stat icon={Users} label="Candidates" value={CANDIDATES.length} gradient="from-pink-500 to-rose-600" />
        <Stat icon={FileText} label="HR Screening" value={byStage("HR Screening")} gradient="from-cyan-500 to-teal-500" />
        <Stat icon={FileText} label="Aptitude Test" value={byStage("Aptitude Test")} gradient="from-indigo-500 to-purple-500" />
        <Stat icon={Clock} label="Practical Test" value={byStage("Practical Test")} gradient="from-purple-500 to-pink-500" />
        <Stat icon={MessagesSquare} label="Interviews" value={byStage("Face-to-Face Interview")} gradient="from-amber-500 to-orange-500" />
        <Stat icon={MessagesSquare} label="Final HR" value={byStage("Final HR Round")} gradient="from-orange-500 to-red-500" />
        <Stat icon={FileSignature} label="Offers" value={offers} gradient="from-emerald-500 to-teal-500" />
        <Stat icon={UserPlus} label="Joined" value={joined} gradient="from-green-500 to-lime-500" />
        <Stat icon={TrendingUp} label="Rejected" value={rejected} gradient="from-rose-500 to-red-600" />
      </div>

      {/* Quick actions */}
      <div className="mt-6 glass-strong rounded-2xl border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          {[
            { to: "/hiring/jobs", label: "Create Job", icon: Plus },
            { to: "/hiring/candidates", label: "Add Candidate", icon: Plus },
            { to: "/hiring/candidates", label: "Import from Excel", icon: Upload },
            { to: "/hiring/question-bank", label: "Create Question Set", icon: FileText },
            { to: "/hiring/exam-center", label: "Schedule Exam", icon: CalendarPlus },
            { to: "/hiring/answer-sheets", label: "Upload Answer Sheet", icon: Upload },
            { to: "/hiring/interviews", label: "Schedule Interview", icon: CalendarPlus },
            { to: "/hiring/offers", label: "Create Offer", icon: FileSignature },
            { to: "/hiring/joining", label: "Convert to Employee", icon: GraduationCap },
          ].map(a => (
            <Link key={a.label} to={a.to} className="inline-flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm hover:bg-white/10 transition-colors border border-white/10">
              <a.icon className="size-4 text-[color:var(--secondary)]" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        {/* Funnel */}
        <div className="lg:col-span-2 glass-strong rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">Hiring Funnel</div>
              <div className="text-xs text-muted-foreground">Stage-wise candidate distribution</div>
            </div>
          </div>
          <div className="space-y-2">
            {funnel.map(f => (
              <div key={f.stage} className="flex items-center gap-3">
                <div className="w-44 text-xs text-muted-foreground shrink-0">{f.stage}</div>
                <div className="flex-1 h-7 rounded-lg bg-white/5 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stageColor(f.stage as any)} flex items-center justify-end px-2 text-xs font-semibold text-white`} style={{ width: `${(f.count / maxFunnel) * 100}%` }}>
                    {f.count > 0 && f.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="font-display font-semibold mb-1">Department-wise</div>
          <div className="text-xs text-muted-foreground mb-4">Active candidate counts</div>
          <div className="space-y-3">
            {HIRING_DEPTS.map(d => {
              const count = CANDIDATES.filter(c => c.department === d).length;
              return (
                <div key={d} className="flex items-center justify-between">
                  <span className="text-sm">{d}</span>
                  <span className="text-sm font-semibold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent candidates */}
      <div className="mt-6 glass-strong rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display font-semibold">Recent Candidates</div>
            <div className="text-xs text-muted-foreground">Latest 8 applicants in the pipeline</div>
          </div>
          <Link to="/hiring/candidates" className="text-xs text-[color:var(--secondary)] hover:underline">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {CANDIDATES.slice(0, 8).map(c => (
            <div key={c.id} className="glass rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <img src={candidateAvatar(c.name, c.avatarHue)} alt={c.name} className="size-10 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">{c.jobTitle}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full bg-gradient-to-r ${stageColor(c.stage)} text-white font-medium whitespace-nowrap`}>{c.stage}</span>
            </div>
          ))}
        </div>
      </div>
    </HiringLayout>
  );
}
