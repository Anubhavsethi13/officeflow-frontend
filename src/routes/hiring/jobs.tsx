import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { HIRING_DEPTS, type Job } from "@/lib/hiring-data";
import { useHiringStore } from "@/lib/hiring-store";
import { Briefcase, MapPin, Users, Plus, Filter, Search } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/hiring/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Hiring" }] }),
  component: JobsPage,
});

function JobsPage() {
  const [dept, setDept] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [q, setQ] = useState("");

  const { jobs, addJob, updateJob } = useHiringStore();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [fTitle, setFTitle] = useState("");
  const [fDept, setFDept] = useState<any>("Software");
  const [fDesignation, setFDesignation] = useState("");
  const [fExp, setFExp] = useState("");
  const [fSalMin, setFSalMin] = useState(0);
  const [fSalMax, setFSalMax] = useState(0);
  const [fOpenings, setFOpenings] = useState(1);
  const [fLocation, setFLocation] = useState("");
  const [fStatus, setFStatus] = useState<any>("Open");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateJob(editingJob.id, {
        title: fTitle, department: fDept, designation: fDesignation,
        experience: fExp, salaryMin: fSalMin, salaryMax: fSalMax,
        openings: fOpenings, location: fLocation, status: fStatus
      });
    } else {
      addJob({
        jobCode: `JOB-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        title: fTitle, department: fDept, designation: fDesignation,
        experience: fExp, salaryMin: fSalMin, salaryMax: fSalMax,
        openings: fOpenings, location: fLocation, status: fStatus,
        employmentType: "Full-time"
      });
    }
    setShowModal(false);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setFTitle(job.title); setFDept(job.department); setFDesignation(job.designation);
    setFExp(job.experience); setFSalMin(job.salaryMin); setFSalMax(job.salaryMax);
    setFOpenings(job.openings); setFLocation(job.location); setFStatus(job.status);
    setShowModal(true);
  };

  const openNew = () => {
    setEditingJob(null);
    setFTitle(""); setFDept("Software"); setFDesignation("");
    setFExp(""); setFSalMin(0); setFSalMax(0); setFOpenings(1); setFLocation(""); setFStatus("Draft");
    setShowModal(true);
  };

  const filtered = jobs.filter(j =>
    (dept === "All" || j.department === dept) &&
    (status === "All" || j.status === status) &&
    (q === "" || j.title.toLowerCase().includes(q.toLowerCase()))
  );

  const statusColor = (s: string) =>
    s === "Open" ? "bg-emerald-500/15 text-emerald-300" :
    s === "Hold" ? "bg-amber-500/15 text-amber-300" :
    s === "Closed" ? "bg-zinc-500/15 text-zinc-300" :
    "bg-blue-500/15 text-blue-300";

  return (
    <HiringLayout title="Job Management" subtitle={`${filtered.length} of ${jobs.length} openings`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 glass rounded-xl px-3 h-10 flex-1 min-w-[200px] border border-white/10">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search job title…" className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <div className="w-full sm:w-40">
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="bg-transparent border-black/10 dark:border-white/10 h-10 rounded-xl">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              {HIRING_DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-transparent border-black/10 dark:border-white/10 h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["All","Draft","Open","Hold","Closed"].map(s => <SelectItem key={s} value={s}>{s === "All" ? "All Statuses" : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl px-4 h-10 text-sm font-medium shadow">
          <Plus className="size-4" /> New Job
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(j => (
          <div key={j.id} className="glass-strong rounded-2xl border border-white/10 p-5 relative overflow-hidden hover:border-white/20 transition-all">
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 opacity-10 blur-2xl" />
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="size-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 grid place-items-center shadow">
                <Briefcase className="size-5 text-white" />
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusColor(j.status)}`}>{j.status}</span>
            </div>
            <div className="text-xs text-muted-foreground">{j.jobCode} · {j.department}</div>
            <div className="font-display font-semibold text-lg mt-0.5">{j.title}</div>
            <div className="text-xs text-muted-foreground">{j.designation} · {j.experience}</div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{j.location}</span>
              <span className="inline-flex items-center gap-1"><Users className="size-3" />{j.candidates} candidates</span>
              <span>{j.openings} openings</span>
            </div>
            <div className="mt-3 text-xs">
              <span className="text-muted-foreground">Salary: </span>
              <span className="font-medium">₹{(j.salaryMin/100000).toFixed(1)}L – ₹{(j.salaryMax/100000).toFixed(1)}L</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 glass rounded-lg h-9 text-xs border border-white/10 hover:bg-white/10">View Pipeline</button>
              <button onClick={() => openEdit(j)} className="flex-1 glass rounded-lg h-9 text-xs border border-white/10 hover:bg-white/10">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg">
            <h3 className="font-display font-semibold text-xl mb-4">{editingJob ? "Edit Job" : "New Job"}</h3>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Title
                  <input required value={fTitle} onChange={e=>setFTitle(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Designation
                  <input required value={fDesignation} onChange={e=>setFDesignation(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Department
                  <select value={fDept} onChange={e=>setFDept(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                    {HIRING_DEPTS.map(d => <option key={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  Experience
                  <input required value={fExp} onChange={e=>setFExp(e.target.value)} placeholder="e.g. 2-4 yrs" className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  Openings
                  <input required type="number" value={fOpenings} onChange={e=>setFOpenings(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Min Salary
                  <input required type="number" value={fSalMin} onChange={e=>setFSalMin(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Max Salary
                  <input required type="number" value={fSalMax} onChange={e=>setFSalMax(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Location
                  <input required value={fLocation} onChange={e=>setFLocation(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Status
                  <select value={fStatus} onChange={e=>setFStatus(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                    <option className="bg-slate-900">Draft</option>
                    <option className="bg-slate-900">Open</option>
                    <option className="bg-slate-900">Hold</option>
                    <option className="bg-slate-900">Closed</option>
                  </select>
                </label>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HiringLayout>
  );
}
