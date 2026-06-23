import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHrStore, type EmployeeRecord } from "@/lib/hr-store";
import type { DocumentType } from "@/lib/mock-data";
import { FileText, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DOCUMENT_TYPES: DocumentType[] = [
  "ID Proof",
  "Address Proof",
  "Educational Certificate",
  "Experience Letter",
  "Relieving Letter",
  "Offer Letter",
  "Other",
];

export function EmployeeManagementForms({ employee }: { employee: EmployeeRecord }) {
  const { uploadDocument, deleteDocument, recordIncrement } = useHrStore();
  
  // Document Form State
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<DocumentType>("ID Proof");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [docUploading, setDocUploading] = useState(false);

  // Increment Form State
  const [incDate, setIncDate] = useState(new Date().toISOString().slice(0, 10));
  const [incAmount, setIncAmount] = useState("");
  const [incAdding, setIncAdding] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select a file under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setDocFileUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docFileUrl) return;
    uploadDocument(employee.id, { name: docName, type: docType, fileUrl: docFileUrl });
    setDocName("");
    setDocFileUrl("");
    setDocUploading(false);
  };

  const handleIncrementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDate || !incAmount) return;
    recordIncrement(employee.id, incDate, Number(incAmount));
    setIncAmount("");
    setIncAdding(false);
  };

  return (
    <div className="mt-6 space-y-6 border-t border-border pt-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manage Salary Increments */}
        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Manage Salary Increments</h3>
            {!incAdding && (
              <Button type="button" onClick={() => setIncAdding(true)} size="sm" variant="ghost" className="h-8 rounded-lg px-2 text-xs">
                <Plus className="mr-1 size-3" /> Add Increment
              </Button>
            )}
          </div>
          
          {incAdding && (
            <div className="mb-4 rounded-lg bg-card/60 p-3 text-sm">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <label className="grid gap-1.5">
                  Date
                  <Input type="date" value={incDate} onChange={e => setIncDate(e.target.value)} className="h-9 bg-card/70 text-xs" />
                </label>
                <label className="grid gap-1.5">
                  New CTC
                  <Input type="number" value={incAmount} onChange={e => setIncAmount(e.target.value)} placeholder="Amount" className="h-9 bg-card/70 text-xs" />
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={handleIncrementSubmit} size="sm" className="h-8 flex-1 gradient-primary text-xs text-white">Save Increment</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setIncAdding(false)} className="h-8 text-xs text-foreground bg-card hover:bg-card/80">Cancel</Button>
              </div>
            </div>
          )}

          {employee.increments && employee.increments.length > 0 ? (
            <div className="space-y-2">
              {[...employee.increments].reverse().map((inc, i) => (
                <div key={i} className="flex justify-between rounded-lg border border-border bg-card/40 p-2 text-xs">
                  <span className="text-muted-foreground">{format(new Date(inc.date), "MMM d, yyyy")}</span>
                  <span className="font-medium">₹{inc.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No increments recorded.</div>
          )}
        </div>

        {/* Manage Documents */}
        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Manage Documents</h3>
            {!docUploading && (
              <Button type="button" onClick={() => setDocUploading(true)} size="sm" variant="ghost" className="h-8 rounded-lg px-2 text-xs">
                <Plus className="mr-1 size-3" /> Upload Doc
              </Button>
            )}
          </div>

          {docUploading && (
            <div className="mb-4 rounded-lg bg-card/60 p-3 text-sm">
              <div className="mb-3 grid gap-3">
                <label className="grid gap-1.5">
                  Type
                  <Select value={docType} onValueChange={(val) => setDocType(val as DocumentType)}>
                    <SelectTrigger className="h-9 rounded-lg border-border bg-card/70 text-xs shadow-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </label>
                <label className="grid gap-1.5">
                  Name
                  <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. PAN Card" className="h-9 bg-card/70 text-xs" />
                </label>
                <label className="grid gap-1.5">
                  File (Max 5MB)
                  <Input type="file" onChange={handleFileChange} className="h-9 bg-card/70 text-xs file:text-foreground file:font-medium" accept="image/*,.pdf" />
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={handleDocumentSubmit} size="sm" className="h-8 flex-1 gradient-primary text-xs text-white">Save Document</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDocUploading(false)} className="h-8 text-xs text-foreground bg-card hover:bg-card/80">Cancel</Button>
              </div>
            </div>
          )}

          {employee.documents && employee.documents.length > 0 ? (
            <div className="space-y-2">
              {employee.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{doc.name}</span>
                    <span className="hidden shrink-0 rounded-full bg-card/80 px-1.5 py-0.5 border border-border/50 text-[9px] text-muted-foreground sm:inline-block">{doc.type}</span>
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="size-6 text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/10 shrink-0" onClick={() => deleteDocument(employee.id, doc.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No documents uploaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
