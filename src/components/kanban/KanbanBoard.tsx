import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEPARTMENTS,
  DEPT_COLUMNS,
  USERS,
  findUser,
  priorityColor,
  progressForStatus,
  type DeptKey,
  type Task,
  type TaskAttachment,
  type TaskNote,
  type User,
} from "@/lib/mock-data";
import { taskActions } from "@/lib/tasks-store";
import {
  PRODUCTS,
  findCategory,
  fmtINR,
  productImage,
  stockStatus,
  stockStatusColor,
} from "@/lib/wms-data";
import {
  Calendar,
  ClipboardList,
  Clock3,
  FileText,
  IndianRupee,
  MessageSquare,
  Paperclip,
  PackageSearch,
  PlusCircle,
  Tag,
  Upload,
  UserRound,
} from "lucide-react";

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function KanbanBoard({
  dept,
  tasks,
  currentUser,
}: {
  dept: DeptKey;
  tasks: Task[];
  currentUser: User;
}) {
  const cols = DEPT_COLUMNS[dept];
  const deptMeta = DEPARTMENTS.find((d) => d.key === dept)!;
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.id === selectedId);

  const onDrop = (col: string) => (event: DragEvent) => {
    event.preventDefault();
    if (dragId) {
      taskActions.update(dragId, {
        status: col,
        progress: progressForStatus(dept, col),
      });
    }
    setDragId(null);
    setOver(null);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {cols.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const isOver = over === col;
          return (
            <div
              key={col}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(col);
              }}
              onDragLeave={() => setOver((value) => (value === col ? null : value))}
              onDrop={onDrop(col)}
              className={`shrink-0 w-72 glass rounded-2xl p-3 transition-all ${isOver ? "ring-2 ring-[color:var(--primary)]/60 scale-[1.01]" : ""}`}
            >
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: deptMeta.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{col}</span>
                </div>
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-20">
                {colTasks.map((task) => {
                  const assignee = findUser(task.assignedTo);
                  const noteCount = task.notes?.length ?? task.comments;
                  const attachmentCount = task.attachmentItems?.length ?? task.attachments;
                  return (
                    <div
                      key={task.id}
                      role="button"
                      tabIndex={0}
                      draggable
                      onClick={() => setSelectedId(task.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelectedId(task.id);
                      }}
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`glass-strong rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-white/30 hover:translate-y-[-2px] transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/60 ${dragId === task.id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-sm font-medium leading-snug mb-2">{task.title}</div>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {task.department === "consumables" && task.amount ? (
                        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-foreground">
                          <IndianRupee className="size-3 text-[color:var(--secondary)]" />
                          {fmtINR(task.amount)}
                        </div>
                      ) : null}
                      <div className="h-1 rounded-full bg-white/5 mb-2 overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {task.dueDate.slice(5)}
                          </span>
                          {noteCount > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              {noteCount}
                            </span>
                          )}
                          {attachmentCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="size-3" />
                              {attachmentCount}
                            </span>
                          )}
                        </div>
                        {assignee && (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            title={assignee.name}
                            className="size-6 rounded-full ring-2 ring-white/10"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailDialog
        currentUser={currentUser}
        open={Boolean(selectedTask)}
        task={selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}

function TaskDetailDialog({
  currentUser,
  open,
  task,
  onOpenChange,
}: {
  currentUser: User;
  open: boolean;
  task?: Task;
  onOpenChange: (open: boolean) => void;
}) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteStep, setNoteStep] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const previousTaskId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!task) {
      previousTaskId.current = undefined;
      return;
    }

    if (previousTaskId.current === task.id) return;
    previousTaskId.current = task.id;
    setNoteTitle("");
    setNoteBody("");
    setNoteStep(task.status);
    setAmountValue(task.amount ? String(task.amount) : "");
    setUploadInputKey((key) => key + 1);
  }, [task]);

  if (!task) {
    return <Dialog open={open} onOpenChange={onOpenChange} />;
  }

  const department = DEPARTMENTS.find((d) => d.key === task.department);
  const columns = DEPT_COLUMNS[task.department];
  const currentIndex = Math.max(columns.indexOf(task.status), 0);
  const assignee = findUser(task.assignedTo);
  const creator = findUser(task.createdBy);
  const availableUsers = USERS.filter((user) => user.departments.includes(task.department));
  const notes = [...(task.notes ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const attachments = task.attachmentItems ?? [];
  const productLines = task.productLines ?? [];
  const isConsumablesTask = task.department === "consumables";

  const updateAmount = (value: string) => {
    setAmountValue(value);
    const parsedAmount = Number(value);
    taskActions.update(task.id, {
      amount:
        value.trim() && Number.isFinite(parsedAmount) && parsedAmount > 0
          ? parsedAmount
          : undefined,
    });
  };

  const addAttachmentFiles = (files: File[]) => {
    if (files.length === 0) return;

    const now = new Date().toISOString();
    const newAttachments: TaskAttachment[] = files.map((file, index) => ({
      id: `${task.id}-att-${Date.now()}-${index}`,
      name: file.name,
      uploadedAt: now,
      uploadedBy: currentUser.id,
      sizeLabel: formatFileSize(file.size),
      url: typeof URL !== "undefined" ? URL.createObjectURL(file) : undefined,
    }));
    const nextAttachments = [...attachments, ...newAttachments];

    taskActions.update(task.id, {
      attachmentItems: nextAttachments,
      attachments: nextAttachments.length,
    });
    setUploadInputKey((key) => key + 1);
  };

  const updateStep = (value: string) => {
    setNoteStep(value);
    taskActions.update(task.id, {
      status: value,
      progress: progressForStatus(task.department, value),
    });
  };

  const handleAddNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = noteBody.trim();
    if (!body) return;

    const step = noteStep || task.status;
    const note: TaskNote = {
      id: `${task.id}-note-${Date.now()}`,
      title: noteTitle.trim() || step,
      body,
      step,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    taskActions.addNote(task.id, note);
    if (step !== task.status) {
      taskActions.update(task.id, {
        status: step,
        progress: progressForStatus(task.department, step),
      });
    }
    setNoteTitle("");
    setNoteBody("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong flex flex-col gap-0 p-0 max-h-[95vh] w-[95vw] max-w-5xl border-white/10 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10 pr-12 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{task.id}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
            {department && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ color: department.color, borderColor: department.color }}
              >
                {department.name}
              </span>
            )}
            {isConsumablesTask && task.amount ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground">
                <IndianRupee className="size-3 text-[color:var(--secondary)]" />
                {fmtINR(task.amount)}
              </span>
            ) : null}
          </div>
          <DialogTitle className="text-2xl leading-tight">{task.title}</DialogTitle>
          <DialogDescription>{task.category}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
            <section className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4 text-[color:var(--secondary)]" />
                Description
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description added yet."}
              </p>
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardList className="size-4 text-[color:var(--secondary)]" />
                  Progress
                </div>
                <span className="text-xs text-muted-foreground">{task.progress}% complete</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-4">
                <div
                  className="h-full gradient-primary rounded-full"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-3 pb-1">
                {columns.map((column, index) => {
                  const state =
                    index < currentIndex ? "done" : index === currentIndex ? "current" : "pending";
                  return (
                    <div key={column} className="min-w-24 flex-1">
                      <div
                        className={`mb-2 h-1 rounded-full ${
                          state === "pending" ? "bg-white/10" : "gradient-primary"
                        }`}
                      />
                      <div
                        className={`text-[11px] leading-snug ${
                          state === "pending" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {column}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-[color:var(--secondary)]" />
                Process Notes
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {notes.map((note) => {
                  const author = findUser(note.createdBy);
                  return (
                    <div key={note.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium text-sm">{note.title}</div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(note.createdAt)}
                        </span>
                      </div>
                      <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {note.step} {author ? `by ${author.name}` : ""}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {note.body}
                      </p>
                    </div>
                  );
                })}
                {notes.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-muted-foreground">
                    No detailed notes yet. Add inquiry, demo, quotation, and follow-up updates here.
                  </div>
                )}
              </div>

              <form onSubmit={handleAddNote} className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Note title</Label>
                    <Input
                      id="note-title"
                      value={noteTitle}
                      onChange={(event) => setNoteTitle(event.target.value)}
                      placeholder="Demo shown, quotation sent, first follow-up..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Step</Label>
                    <Select value={noteStep || task.status} onValueChange={setNoteStep}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select step" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-body">Note details</Label>
                  <Textarea
                    id="note-body"
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                    placeholder="Write what happened, what is pending, and what management should know."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gradient-primary text-white border-0">
                    <PlusCircle className="size-4" />
                    Add Note
                  </Button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <UserRound className="size-4 text-[color:var(--secondary)]" />
                Ownership
              </div>
              <div className="space-y-3">
                <InfoRow
                  label="Created by"
                  value={creator?.name ?? "Unknown"}
                  icon={<UserRound className="size-4" />}
                />
                <InfoRow
                  label="Due date"
                  value={task.dueDate}
                  icon={<Calendar className="size-4" />}
                />
                {isConsumablesTask && (
                  <div className="space-y-2 rounded-xl bg-white/5 p-3">
                    <Label htmlFor={`task-detail-amount-${task.id}`}>Amount</Label>
                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id={`task-detail-amount-${task.id}`}
                        type="number"
                        min={0}
                        value={amountValue}
                        onChange={(event) => updateAmount(event.target.value)}
                        className="pl-9"
                        placeholder="Add amount"
                      />
                    </div>
                  </div>
                )}
                <InfoRow
                  label="Current step"
                  value={task.status}
                  icon={<Clock3 className="size-4" />}
                />
                <div className="space-y-2">
                  <Label>Assigned to</Label>
                  <Select
                    value={task.assignedTo}
                    onValueChange={(value) => taskActions.update(task.id, { assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {assignee && (
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="size-8 rounded-full"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{assignee.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {assignee.designation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Update current step</Label>
                  <Select value={task.status} onValueChange={updateStep}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current step" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <PackageSearch className="size-4 text-[color:var(--secondary)]" />
                WMS Products
              </div>
              <div className="space-y-2">
                {productLines.map((line) => {
                  const product = PRODUCTS.find((item) => item.id === line.productId);
                  if (!product) return null;
                  const category = findCategory(product.subCategoryId);
                  const status = stockStatus(product);

                  return (
                    <div key={line.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={productImage(product)}
                          alt={product.name}
                          className="size-10 rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{product.name}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                            <span>{product.sku}</span>
                            <span>{category?.name ?? product.type}</span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 ${stockStatusColor(status)}`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <LineMetric label="Qty" value={String(line.quantity)} />
                        <LineMetric label="Rate" value={fmtINR(line.rate)} />
                        <LineMetric label="Amount" value={fmtINR(line.amount)} />
                      </div>
                    </div>
                  );
                })}
                {productLines.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-muted-foreground">
                    No WMS products linked.
                  </div>
                )}
              </div>
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Paperclip className="size-4 text-[color:var(--secondary)]" />
                Attachments
              </div>
              <div className="mb-3 space-y-2">
                <Label htmlFor={`task-detail-attachments-${task.id}`}>Upload files</Label>
                <div className="relative">
                  <Input
                    key={uploadInputKey}
                    id={`task-detail-attachments-${task.id}`}
                    type="file"
                    multiple
                    className="pl-9"
                    onChange={(event) => addAttachmentFiles(Array.from(event.target.files ?? []))}
                  />
                  <Upload className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                {attachments.map((attachment) => {
                  const uploader = findUser(attachment.uploadedBy);
                  return (
                    <a
                      key={attachment.id}
                      href={attachment.url ?? "#"}
                      onClick={(event) => {
                        if (!attachment.url) event.preventDefault();
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm transition-colors hover:bg-white/10"
                    >
                      <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{attachment.name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {attachment.sizeLabel ?? "File"} {uploader ? `by ${uploader.name}` : ""}
                        </span>
                      </span>
                    </a>
                  );
                })}
                {attachments.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-muted-foreground">
                    No attachments added.
                  </div>
                )}
              </div>
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Tag className="size-4 text-[color:var(--secondary)]" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags added.</span>
                )}
              </div>
              </section>
            </aside>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-white/10 shrink-0 bg-black/20">
          <Button onClick={() => onOpenChange(false)} className="gradient-primary text-white border-0 px-8">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      <div className="grid size-8 place-items-center rounded-lg bg-white/5 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function LineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-medium">{value}</div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
