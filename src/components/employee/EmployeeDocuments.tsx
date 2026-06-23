import { Button } from "@/components/ui/button";
import type { EmployeeDocument } from "@/lib/mock-data";
import { FileText, Download, Trash2, Plus, FileBadge2 } from "lucide-react";
import { format } from "date-fns";

export function EmployeeDocuments({ documents = [] }: { documents?: EmployeeDocument[] }) {
  


  const handleDownload = (doc: EmployeeDocument) => {
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = `${doc.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <FileBadge2 className="size-4 text-[color:var(--primary)]" />
          Documents
        </div>
      </div>



      {documents.length > 0 ? (
        <div className="grid gap-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3 transition-colors hover:bg-card/80">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="grid size-8 shrink-0 place-items-center rounded bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{doc.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="rounded-full bg-card/80 px-1.5 py-0.5 border border-border/50">{doc.type}</span>
                    <span>Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="size-8" onClick={() => handleDownload(doc)} title="Download">
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          No documents uploaded yet.
        </div>
      )}
    </div>
  );
}
