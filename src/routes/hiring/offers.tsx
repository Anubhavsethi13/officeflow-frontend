import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { candidateAvatar } from "@/lib/hiring-data";
import { FileSignature, Download, Send } from "lucide-react";
import { useState } from "react";
import { useHiringStore } from "@/lib/hiring-store";
import { downloadOfferPdf } from "@/lib/offer-pdf";

export const Route = createFileRoute("/hiring/offers")({
  head: () => ({ meta: [{ title: "Offers — Hiring" }] }),
  component: OffersPage,
});

// Dynamic from store
function statusBadge(s: string) {
  return s === "Accepted" ? "bg-emerald-500/15 text-emerald-300" :
         s === "Rejected" ? "bg-rose-500/15 text-rose-300" :
         s === "Shared" ? "bg-blue-500/15 text-blue-300" :
         "bg-zinc-500/15 text-zinc-300";
}

function OffersPage() {
  const { offers, candidates, createOffer, updateOfferStatus } = useHiringStore();
  const [showModal, setShowModal] = useState(false);
  const [fCandidate, setFCandidate] = useState("");
  const [fSalary, setFSalary] = useState(600000);
  const [fDate, setFDate] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer({
      candidateId: fCandidate,
      salary: fSalary,
      joiningDate: fDate
    });
    setShowModal(false);
  };

  return (
    <HiringLayout title="Offer Management" subtitle="Generate, share and track offer letters">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl px-4 h-10 text-sm font-medium shadow">
          <FileSignature className="size-4" /> Create Offer
        </button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map(o => {
          const c = candidates.find(c => c.id === o.candidateId);
          if (!c) return null;
          return (
            <div key={o.id} className="glass-strong rounded-2xl border border-white/10 p-5">
              <div className="flex items-start justify-between mb-3">
                <img src={candidateAvatar(c.name, c.avatarHue)} className="size-11 rounded-full" alt={c.name} />
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusBadge(o.status)}`}>{o.status}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">{o.id}</div>
              <div className="font-display font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.jobTitle} · {c.department}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Salary</div>
                  <div className="font-medium">₹{(o.salary/100000).toFixed(1)}L</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Joining</div>
                  <div className="font-medium">{o.joiningDate}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => downloadOfferPdf(o, c.name, c.jobTitle)} className="flex-1 inline-flex items-center justify-center gap-1 glass rounded-lg h-9 text-xs border border-white/10 hover:bg-white/10">
                  <Download className="size-3" /> PDF
                </button>
                <button onClick={() => updateOfferStatus(o.id, "Shared")} className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg h-9 text-xs hover:opacity-90 transition-opacity">
                  <Send className="size-3" /> Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-display font-semibold text-xl mb-4">Create Offer</h3>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <label className="block">
                Candidate
                <select required value={fCandidate} onChange={e=>setFCandidate(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                  <option value="" className="bg-slate-900">Select Candidate...</option>
                  {candidates.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.jobTitle})</option>)}
                </select>
              </label>
              <label className="block">
                Annual Salary (INR)
                <input required type="number" step="1000" value={fSalary} onChange={e=>setFSalary(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <label className="block">
                Expected Joining Date
                <input required type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HiringLayout>
  );
}
