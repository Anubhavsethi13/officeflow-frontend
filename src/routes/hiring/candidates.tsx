import { createFileRoute } from "@tanstack/react-router";
import { candidateAvatar, stageColor, HIRING_DEPTS, HIRING_STAGES, type HiringDept } from "@/lib/hiring-data";
import { useHiringStore } from "@/lib/hiring-store";
import { Plus, Upload, Search, Mail, Phone, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { HiringLayout } from "@/components/hiring/HiringLayout";

export const Route = createFileRoute("/hiring/candidates")({
  head: () => ({ meta: [{ title: "Candidates — Hiring" }] }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const [dept, setDept] = useState("All");
  const [stage, setStage] = useState("All");
  const [q, setQ] = useState("");

  const { candidates, addCandidate } = useHiringStore();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fDept, setFDept] = useState<HiringDept>("Software");
  const [fJob, setFJob] = useState("");
  const [fExp, setFExp] = useState("");
  const [fCompany, setFCompany] = useState("");
  const [fSalary, setFSalary] = useState(0);
  const [fNotice, setFNotice] = useState("");
  const [fSource, setFSource] = useState("");
  const [fLocation, setFLocation] = useState("");
  const [fResumeName, setFResumeName] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addCandidate({
      name: fName, email: fEmail, phone: fPhone, department: fDept, jobTitle: fJob,
      experience: fExp, currentCompany: fCompany, expectedSalary: fSalary,
      noticePeriod: fNotice, source: fSource, location: fLocation, stage: "New Candidate",
      resumeFileName: fResumeName
    });
    setShowModal(false);
  };

  const filtered = candidates.filter(c =>
    (dept === "All" || c.department === dept) &&
    (stage === "All" || c.stage === stage) &&
    (q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.jobTitle.toLowerCase().includes(q.toLowerCase()))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <HiringLayout title="Candidates" subtitle={`${filtered.length} of ${candidates.length} candidates`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 glass rounded-xl px-3 h-10 flex-1 min-w-[200px] border border-white/10">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or job…" className="bg-transparent outline-none text-sm flex-1" />
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
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="bg-transparent border-black/10 dark:border-white/10 h-10 rounded-xl">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stages</SelectItem>
              {HIRING_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <button className="inline-flex items-center gap-2 glass rounded-xl px-4 h-10 text-sm border border-white/10 hover:bg-white/10">
          <Upload className="size-4" /> Import Excel
        </button>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl px-4 h-10 text-sm font-medium shadow">
          <Plus className="size-4" /> Add Candidate
        </button>
      </div>

      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Candidate</th>
                <th className="text-left p-3">Job / Dept</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Exp</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCandidates.map(c => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={candidateAvatar(c.name, c.avatarHue)} className="size-9 rounded-full" alt={c.name} />
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.candidateCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{c.jobTitle}</div>
                    <div className="text-xs text-muted-foreground">{c.department}</div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Mail className="size-3" />{c.email}</div>
                    <div className="flex items-center gap-1"><Phone className="size-3" />{c.phone}</div>
                    <div className="flex items-center gap-1"><MapPin className="size-3" />{c.location}</div>
                  </td>
                  <td className="p-3 text-xs">{c.source}</td>
                  <td className="p-3 text-xs">{c.experience}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-600" style={{ width: `${c.overallScore}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{c.overallScore}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full bg-gradient-to-r ${stageColor(c.stage)} text-white font-medium whitespace-nowrap`}>{c.stage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 mt-4">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-xl">
            <h3 className="font-display font-semibold text-xl mb-4">Add Candidate</h3>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Full Name
                  <input required value={fName} onChange={e=>setFName(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Email
                  <input required type="email" value={fEmail} onChange={e=>setFEmail(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Phone
                  <input required value={fPhone} onChange={e=>setFPhone(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Location
                  <input required value={fLocation} onChange={e=>setFLocation(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Department
                  <select value={fDept} onChange={e=>setFDept(e.target.value as HiringDept)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                    {HIRING_DEPTS.map(d => <option key={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  Job Title
                  <input required value={fJob} onChange={e=>setFJob(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Experience
                  <input required value={fExp} onChange={e=>setFExp(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Current Company
                  <input value={fCompany} onChange={e=>setFCompany(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  Expected Salary
                  <input required type="number" value={fSalary} onChange={e=>setFSalary(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Notice Period
                  <input required value={fNotice} onChange={e=>setFNotice(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
                <label className="block">
                  Source
                  <input required value={fSource} onChange={e=>setFSource(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
                </label>
              </div>
              <div>
                <label className="block">
                  Resume (Optional)
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => { if(e.target.files?.[0]) setFResumeName(e.target.files[0].name); }} className="w-full mt-1 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 bg-black/20 rounded-lg p-1.5 border border-white/10" />
                </label>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HiringLayout>
  );
}
