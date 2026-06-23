import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { HIRING_STAGES, candidateAvatar, stageColor } from "@/lib/hiring-data";
import { useHiringStore } from "@/lib/hiring-store";
import { GripVertical, FileText } from "lucide-react";

export const Route = createFileRoute("/hiring/pipeline")({
  head: () => ({ meta: [{ title: "Hiring Pipeline - officeflow" }] }),
  component: PipelinePage,
});

function PipelinePage() {
  const { candidates, updateCandidateStage } = useHiringStore();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("candidateId", id);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("candidateId");
    if (id) updateCandidateStage(id, stage as any);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <HiringLayout title="Hiring Pipeline" subtitle="Drag-and-drop Kanban connected to store">
      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="flex gap-3 min-w-max">
          {HIRING_STAGES.map(stage => {
            const list = candidates.filter(c => c.stage === stage);
            return (
              <div key={stage} className="w-72 shrink-0">
                <div className={`rounded-t-xl px-3 py-2 text-xs font-semibold bg-gradient-to-r ${stageColor(stage)} text-white flex items-center justify-between`}>
                  <span>{stage}</span>
                  <span className="bg-white/20 rounded-full px-2 py-0.5 text-[10px]">{list.length}</span>
                </div>
                <div 
                  className="bg-white/5 rounded-b-xl p-2 min-h-[400px] space-y-2 border border-white/10 border-t-0"
                  onDrop={(e) => handleDrop(e, stage)}
                  onDragOver={handleDragOver}
                >
                  {list.map(c => (
                    <div 
                      key={c.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      className="glass rounded-xl p-3 border border-white/10 cursor-grab hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <img src={candidateAvatar(c.name, c.avatarHue)} className="size-9 rounded-full shrink-0" alt={c.name} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{c.jobTitle}</div>
                        </div>
                        <GripVertical className="size-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{c.department}</span>
                        <span className="inline-flex items-center gap-1"><FileText className="size-3" /> Resume</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${stageColor(c.stage)}`} style={{ width: `${c.overallScore}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums">{c.overallScore}</span>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-8">No candidates</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HiringLayout>
  );
}
