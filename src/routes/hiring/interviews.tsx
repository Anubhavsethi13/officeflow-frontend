import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { candidateAvatar } from "@/lib/hiring-data";
import { CalendarPlus, Video, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { useHiringStore, type Interview } from "@/lib/hiring-store";

export const Route = createFileRoute("/hiring/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Hiring" }] }),
  component: InterviewsPage,
});

// Dynamic from store

function InterviewsPage() {
  const { interviews, candidates, addInterviewFeedback, scheduleInterview } = useHiringStore();
  
  const [showFeedback, setShowFeedback] = useState<Interview | null>(null);
  const [showReschedule, setShowReschedule] = useState<Interview | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const [fRating, setFRating] = useState(0);
  const [fNotes, setFNotes] = useState("");
  const [fDate, setFDate] = useState("");
  const [fCandidate, setFCandidate] = useState("");
  const [fRound, setFRound] = useState("Technical Round");

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback) {
      addInterviewFeedback(showFeedback.id, fNotes, fRating);
      setShowFeedback(null);
    }
  };

  const submitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming updating interview time (mocked as scheduling new or adding store func)
    if (showReschedule) {
      scheduleInterview({
        candidateId: showReschedule.candidateId,
        round: showReschedule.round,
        scheduledAt: fDate,
      });
      setShowReschedule(null);
    }
  };

  const submitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInterview({
      candidateId: fCandidate,
      round: fRound,
      scheduledAt: fDate,
    });
    setShowSchedule(false);
  };

  return (
    <HiringLayout title="Interviews" subtitle="Schedule, evaluate and track interview feedback">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowSchedule(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl px-4 h-10 text-sm font-medium shadow">
          <CalendarPlus className="size-4" /> Schedule Interview
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {interviews.map((iv) => {
          const c = candidates.find(c => c.id === iv.candidateId);
          if (!c) return null;
          return (
            <div key={iv.id} className="glass-strong rounded-2xl border border-white/10 p-4">
              <div className="flex items-start gap-3">
                <img src={candidateAvatar(c.name, c.avatarHue)} alt={c.name} className="size-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.jobTitle} · {c.department}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-300">{iv.round}</span>
                    <span className="px-2 py-1 rounded-full bg-white/10 inline-flex items-center gap-1">
                      <Video className="size-3" /> {iv.status}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold">{new Date(iv.scheduledAt).toLocaleDateString()}</div>
                  <div className="text-muted-foreground">{new Date(iv.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="text-muted-foreground">Interviewer: <span className="text-foreground">{iv.interviewerId || 'Unassigned'}</span></div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`size-3 ${n <= (iv.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setShowFeedback(iv); setFRating(iv.rating || 0); setFNotes(iv.feedback || ""); }} className="flex-1 glass rounded-lg h-8 text-xs border border-white/10 hover:bg-white/10">Add Feedback</button>
                <button onClick={() => { setShowReschedule(iv); setFDate(iv.scheduledAt); }} className="flex-1 glass rounded-lg h-8 text-xs border border-white/10 hover:bg-white/10">Reschedule</button>
              </div>
            </div>
          );
        })}
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-display font-semibold text-xl mb-4">Interview Feedback</h3>
            <form onSubmit={submitFeedback} className="space-y-4 text-sm">
              <label className="block">
                Rating (1-5)
                <input required type="number" min="1" max="5" value={fRating} onChange={e=>setFRating(Number(e.target.value))} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <label className="block">
                Notes
                <textarea required value={fNotes} onChange={e=>setFNotes(e.target.value)} className="w-full h-24 px-3 py-2 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowFeedback(null)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Save Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-display font-semibold text-xl mb-4">Reschedule Interview</h3>
            <form onSubmit={submitReschedule} className="space-y-4 text-sm">
              <label className="block">
                New Date & Time
                <input required type="datetime-local" value={fDate.slice(0, 16)} onChange={e=>setFDate(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowReschedule(null)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-display font-semibold text-xl mb-4">Schedule Interview</h3>
            <form onSubmit={submitSchedule} className="space-y-4 text-sm">
              <label className="block">
                Candidate
                <select required value={fCandidate} onChange={e=>setFCandidate(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                  <option value="" className="bg-slate-900">Select Candidate...</option>
                  {candidates.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.jobTitle})</option>)}
                </select>
              </label>
              <label className="block">
                Round
                <input required value={fRound} onChange={e=>setFRound(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <label className="block">
                Date & Time
                <input required type="datetime-local" value={fDate} onChange={e=>setFDate(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowSchedule(false)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HiringLayout>
  );
}
