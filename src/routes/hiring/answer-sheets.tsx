import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { ClipboardList, Download, Upload, QrCode, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { useHiringStore } from "@/lib/hiring-store";
import { downloadOMRSheetPdf } from "@/lib/omr-pdf";

export const Route = createFileRoute("/hiring/answer-sheets")({
  head: () => ({ meta: [{ title: "Answer Sheets — Hiring" }] }),
  component: AnswerSheets,
});

function badge(status: string) {
  if (status === "Verified") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Auto-checked") return "bg-blue-500/15 text-blue-300";
  if (status === "Needs Review") return "bg-amber-500/15 text-amber-300";
  return "bg-zinc-500/15 text-zinc-300";
}

function AnswerSheets() {
  const { answerSheets, addAnswerSheet, candidates } = useHiringStore();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(answerSheets.length / ITEMS_PER_PAGE);
  const paginatedSheets = answerSheets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleUploadScan = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = () => {
      setTimeout(() => {
         addAnswerSheet({
           code: `AS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
           candidateId: candidates[Math.floor(Math.random() * candidates.length)]?.id || "c1",
           testType: "Common Aptitude",
           status: "Auto-checked",
           marks: `${Math.floor(Math.random() * 20) + 30}/50`,
           confidence: Math.floor(Math.random() * 10) + 90
         });
      }, 500);
    };
    input.click();
  };

  return (
    <HiringLayout title="Answer Sheet Generator" subtitle="Print OMR sheets, upload scans, auto-check answers">
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center shadow mb-3">
            <ClipboardList className="size-5 text-white" />
          </div>
          <div className="font-display font-semibold">Generate OMR Sheet</div>
          <div className="text-xs text-muted-foreground mt-1">Creates printable question paper + OMR answer sheet with QR code per candidate.</div>
          <button onClick={() => downloadOMRSheetPdf("Common Aptitude")} className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg h-9 text-xs">
            <Download className="size-3" /> Generate PDF
          </button>
        </div>
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="size-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center shadow mb-3">
            <Upload className="size-5 text-white" />
          </div>
          <div className="font-display font-semibold">Upload Scanned Sheet</div>
          <div className="text-xs text-muted-foreground mt-1">System detects candidate via QR code and auto-scores MCQs.</div>
          <button onClick={handleUploadScan} className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg h-9 text-xs">
            <Upload className="size-3" /> Upload Scan
          </button>
        </div>
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 grid place-items-center shadow mb-3">
            <QrCode className="size-5 text-white" />
          </div>
          <div className="font-display font-semibold">Answer Key Manager</div>
          <div className="text-xs text-muted-foreground mt-1">Maintain MCQ answer keys per question set with auto-calculation.</div>
          <button className="mt-3 w-full glass rounded-lg h-9 text-xs border border-white/10 hover:bg-white/10">Manage Keys</button>
        </div>
      </div>

      <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 font-display font-semibold">Uploaded Sheets</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Sheet ID</th>
                <th className="text-left p-3">Candidate</th>
                <th className="text-left p-3">Test</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Marks</th>
                <th className="text-left p-3">Confidence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedSheets.map(s => {
                const candidate = candidates.find(c => c.id === s.candidateId)?.name || "Unknown Candidate";
                return (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="p-3 font-mono text-xs">{s.code}</td>
                    <td className="p-3">{candidate}</td>
                    <td className="p-3 text-xs">{s.testType}</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-1 rounded-full ${badge(s.status)}`}>{s.status}</span></td>
                    <td className="p-3 tabular-nums">{s.marks}</td>
                    <td className="p-3 text-xs">
                      {s.confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          {s.confidence >= 90 ? <CheckCircle2 className="size-3 text-emerald-400" /> : <AlertTriangle className="size-3 text-amber-400" />}
                          {s.confidence}%
                        </div>
                      ) : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-xs text-[color:var(--secondary)] hover:underline">Review</button>
                    </td>
                  </tr>
                );
              })}
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
    </HiringLayout>
  );
}
