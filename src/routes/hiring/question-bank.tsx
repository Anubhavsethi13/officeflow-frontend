import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { useHiringStore } from "@/lib/hiring-store";

export const Route = createFileRoute("/hiring/question-bank")({
  head: () => ({ meta: [{ title: "Question Bank — Hiring" }] }),
  component: QuestionBank,
});

const CATEGORIES = [
  { name: "Common Aptitude", color: "from-blue-500 to-cyan-500" },
  { name: "Common Reasoning", color: "from-indigo-500 to-purple-500" },
  { name: "Common Personality", color: "from-purple-500 to-pink-500" },
  { name: "Software – Logic", color: "from-violet-500 to-fuchsia-500" },
  { name: "Hardware – Networking", color: "from-emerald-500 to-teal-500" },
  { name: "Accounts – GST", color: "from-amber-500 to-orange-500" },
  { name: "Support – Communication", color: "from-cyan-500 to-teal-500" },
];

function QuestionBank() {
  const { questions, addQuestion } = useHiringStore();
  const [showModal, setShowModal] = useState(false);
  const [fText, setFText] = useState("");
  const [fCat, setFCat] = useState("Common Aptitude");
  const [fOpt0, setFOpt0] = useState("");
  const [fOpt1, setFOpt1] = useState("");
  const [fOpt2, setFOpt2] = useState("");
  const [fOpt3, setFOpt3] = useState("");
  const [fCorrect, setFCorrect] = useState(0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addQuestion({
      testType: fCat,
      text: fText,
      options: [fOpt0, fOpt1, fOpt2, fOpt3],
      correctOption: fCorrect
    });
    setShowModal(false);
  };
  return (
    <HiringLayout title="Question Bank" subtitle="Common + department-specific questions">
      <div className="flex justify-end mb-4 gap-2">
        <button className="inline-flex items-center gap-2 glass border border-white/10 rounded-xl px-4 h-10 text-sm font-medium hover:bg-white/10">
          Upload CSV
        </button>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl px-4 h-10 text-sm font-medium shadow">
          <Plus className="size-4" /> Add Question
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {CATEGORIES.map(c => {
          const count = questions.filter(q => q.testType === c.name).length;
          return (
            <div key={c.name} className="glass-strong rounded-2xl border border-white/10 p-4 flex items-center gap-3">
              <div className={`size-11 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center shadow`}>
                <BookOpen className="size-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{count} questions</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-strong rounded-2xl border border-white/10 p-5">
        <div className="font-display font-semibold mb-3">Recent Questions</div>
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="glass rounded-xl p-3 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm flex-1 font-medium">{q.text}</div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 whitespace-nowrap text-muted-foreground">ID: {q.id}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1 mb-2">
                {q.options.map((opt, i) => (
                  <div key={i} className={`px-2 py-1 rounded ${i === q.correctOption ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5'}`}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-white/10 pt-2">
                <span>{q.testType}</span>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div className="text-sm text-muted-foreground">No questions found.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg">
            <h3 className="font-display font-semibold text-xl mb-4">Add Question</h3>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <label className="block">
                Question Text
                <input required value={fText} onChange={e=>setFText(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" />
              </label>
              <label className="block">
                Category
                <select value={fCat} onChange={e=>setFCat(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500">
                  {CATEGORIES.map(c => <option key={c.name} className="bg-slate-900">{c.name}</option>)}
                </select>
              </label>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Options & Correct Answer</div>
                {[fOpt0, fOpt1, fOpt2, fOpt3].map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={fCorrect === i} 
                      onChange={() => setFCorrect(i)} 
                      className="size-4"
                    />
                    <input 
                      required 
                      value={opt} 
                      onChange={e => {
                        if (i === 0) setFOpt0(e.target.value);
                        if (i === 1) setFOpt1(e.target.value);
                        if (i === 2) setFOpt2(e.target.value);
                        if (i === 3) setFOpt3(e.target.value);
                      }} 
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 h-10 px-3 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-pink-500" 
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-xl glass border border-white/10 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-4 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HiringLayout>
  );
}
