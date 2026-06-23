import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ConsumablesTargetPanel } from "@/components/kanban/ConsumablesTargetPanel";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { WmsProductMapper } from "@/components/kanban/WmsProductMapper";
import { TaskLayout } from "@/components/task/TaskLayout";
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
import { useAuth, canViewAllDepartments } from "@/lib/auth";
import {
  type ConsumablesTargetSegment,
  DEPARTMENTS,
  DEPT_COLUMNS,
  USERS,
  initialStatusFor,
  progressForStatus,
  type DeptKey,
  type Priority,
  type Task,
  type TaskAttachment,
  type TaskNote,
  type TaskProductLine,
} from "@/lib/mock-data";
import { taskActions, useTasks } from "@/lib/tasks-store";
import { IndianRupee, Plus, Upload } from "lucide-react";

export const Route = createFileRoute("/task-management")({
  head: () => ({ meta: [{ title: "Task Management - officeflow" }] }),
  component: TaskManagement,
});

type DepartmentOption = (typeof DEPARTMENTS)[number];

const TASK_PREFIX: Record<DeptKey, string> = {
  support: "SUP",
  software: "SW",
  hardware: "HW",
  accounts: "AC",
  consumables: "CN",
};

const nextWeek = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const createTaskId = (dept: DeptKey) =>
  `${TASK_PREFIX[dept]}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

function TaskManagement() {
  const { user } = useAuth();
  const tasks = useTasks();
  const all = user ? canViewAllDepartments(user.role) : false;
  const viewableDepts = all
    ? DEPARTMENTS
    : DEPARTMENTS.filter((d) => user?.departments?.includes(d.key));

  const initial: DeptKey = viewableDepts[0]?.key ?? "support";
  const [active, setActive] = useState<DeptKey>(initial);
  const [createOpen, setCreateOpen] = useState(false);

  if (!user) return null;

  const dept = active;
  const deptTasks = tasks.filter((t) => t.department === dept);
  const meta = DEPARTMENTS.find((d) => d.key === dept) ?? DEPARTMENTS[0];

  return (
    <TaskLayout title="Task Management">
      {viewableDepts.length > 1 && (
        <div className="glass rounded-2xl p-2 mb-5 flex gap-1 overflow-x-auto">
          {viewableDepts.map((d) => (
            <button
              key={d.key}
              onClick={() => setActive(d.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                active === d.key
                  ? "gradient-primary text-white glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-xl grid place-items-center"
            style={{ background: `${meta.color}25`, border: `1px solid ${meta.color}40` }}
          >
            <span className="size-3 rounded-full" style={{ background: meta.color }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{meta.name} Board</h2>
            <div className="text-xs text-muted-foreground">
              {deptTasks.length} tasks - Drag cards to update status
            </div>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={viewableDepts.length === 0}
          className="gradient-primary text-white border-0 rounded-xl sm:self-auto"
        >
          <Plus className="size-4" />
          Create Task
        </Button>
      </div>

      {viewableDepts.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No department access is assigned to your user yet.
        </div>
      ) : (
        <>
          {dept === "consumables" && <ConsumablesTargetPanel tasks={tasks} />}
          <KanbanBoard dept={dept} tasks={deptTasks} currentUser={user} />
        </>
      )}

      <CreateTaskDialog
        activeDept={dept}
        departments={viewableDepts}
        open={createOpen}
        userId={user.id}
        onOpenChange={setCreateOpen}
        onCreated={setActive}
      />
    </TaskLayout>
  );
}

function CreateTaskDialog({
  activeDept,
  departments,
  open,
  userId,
  onOpenChange,
  onCreated,
}: {
  activeDept: DeptKey;
  departments: DepartmentOption[];
  open: boolean;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (dept: DeptKey) => void;
}) {
  const defaultDept = departments.some((d) => d.key === activeDept)
    ? activeDept
    : (departments[0]?.key ?? "support");
  const [department, setDepartment] = useState<DeptKey>(defaultDept);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("New Project");
  const [status, setStatus] = useState(initialStatusFor(defaultDept));
  const [priority, setPriority] = useState<Priority>("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(nextWeek());
  const [tags, setTags] = useState("");
  const [openingNote, setOpeningNote] = useState("");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [amount, setAmount] = useState("");
  const [targetSegment, setTargetSegment] = useState<ConsumablesTargetSegment>("rolls");
  const [productLines, setProductLines] = useState<TaskProductLine[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const availableUsers = USERS.filter((u) => u.departments.includes(department));
  const selectedDepartment = departments.find((d) => d.key === department);
  const canChooseDepartment = departments.length > 1;
  const productLineTotal = productLines.reduce((sum, line) => sum + line.amount, 0);
  const isConsumablesTask = department === "consumables";

  useEffect(() => {
    if (!open) return;
    const nextDept = departments.some((d) => d.key === activeDept)
      ? activeDept
      : (departments[0]?.key ?? "support");
    setDepartment(nextDept);
    setStatus(initialStatusFor(nextDept));
  }, [activeDept, departments, open]);

  useEffect(() => {
    const users = USERS.filter((u) => u.departments.includes(department));
    if (!users.some((u) => u.id === assignedTo)) setAssignedTo(users[0]?.id ?? userId);
  }, [assignedTo, department, userId]);

  useEffect(() => {
    if (department !== "consumables" && productLines.length > 0) setProductLines([]);
  }, [department, productLines.length]);

  useEffect(() => {
    if (department === "consumables" && productLines.length > 0) {
      setAmount(String(productLineTotal));
    }
  }, [department, productLineTotal, productLines.length]);

  const reset = (dept = department) => {
    setTitle("");
    setDescription("");
    setCategory("New Project");
    setStatus(initialStatusFor(dept));
    setPriority("Medium");
    setDueDate(nextWeek());
    setTags("");
    setOpeningNote("");
    setAttachments([]);
    setAmount("");
    setTargetSegment("rolls");
    setProductLines([]);
    setFileInputKey((key) => key + 1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || departments.length === 0) return;

    const taskId = createTaskId(department);
    const parsedAmount = Number(amount);
    const cleanNote = openingNote.trim();
    const notes: TaskNote[] = cleanNote
      ? [
          {
            id: `${taskId}-note-${Date.now()}`,
            title: status,
            body: cleanNote,
            step: status,
            createdBy: userId,
            createdAt: new Date().toISOString(),
          },
        ]
      : [];

    const task: Task = {
      id: taskId,
      title: cleanTitle,
      description: description.trim() || "No description added yet.",
      createdAt: new Date().toISOString(),
      department,
      category: category.trim() || "General",
      status,
      priority,
      assignedTo: assignedTo || availableUsers[0]?.id || userId,
      createdBy: userId,
      dueDate,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      attachments: attachments.length,
      attachmentItems: attachments,
      comments: notes.length,
      notes,
      progress: progressForStatus(department, status),
      amount:
        isConsumablesTask && Number.isFinite(parsedAmount) && parsedAmount > 0
          ? parsedAmount
          : undefined,
      targetSegment: isConsumablesTask ? targetSegment : undefined,
      productLines: isConsumablesTask && productLines.length > 0 ? productLines : undefined,
    };

    taskActions.add(task);
    onCreated(department);
    reset(department);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[92vh] overflow-y-auto border-white/10 sm:max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a task to the Kanban board with department, owner, step, files, and the first
              process note.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-title">Task title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="New inquiry, onboarding, quotation follow-up..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              {canChooseDepartment ? (
                <Select
                  value={department}
                  onValueChange={(value) => {
                    const nextDept = value as DeptKey;
                    setDepartment(nextDept);
                    setStatus(initialStatusFor(nextDept));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.key} value={dept.key}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-9 items-center rounded-md border border-input px-3 text-sm text-muted-foreground">
                  {selectedDepartment?.name ?? "Department restricted"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Current step</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {DEPT_COLUMNS[department].map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned to</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                  {availableUsers.length === 0 && <SelectItem value={userId}>{userId}</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(["Low", "Medium", "High", "Critical"] as Priority[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isConsumablesTask && (
              <div className="space-y-2">
                <Label htmlFor="task-amount">Amount</Label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="task-amount"
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="pl-9"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            {isConsumablesTask && (
              <div className="space-y-2">
                <Label>Target bucket</Label>
                <Select
                  value={targetSegment}
                  onValueChange={(value) => setTargetSegment(value as ConsumablesTargetSegment)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware Section</SelectItem>
                    <SelectItem value="rolls">Rolls & Consumables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isConsumablesTask && (
              <WmsProductMapper lines={productLines} onChange={setProductLines} />
            )}

            <div className="space-y-2">
              <Label htmlFor="task-category">Category</Label>
              <Input
                id="task-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Inquiry, Demo, Quotation..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24"
                placeholder="Add client requirement, scope, promise made, or management context."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-note">Opening note</Label>
              <Textarea
                id="task-note"
                value={openingNote}
                onChange={(event) => setOpeningNote(event.target.value)}
                placeholder="Example: First inquiry received, demo shown, quotation to be shared, first follow-up call pending."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-tags">Tags</Label>
              <Input
                id="task-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="client, demo, follow-up"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-attachments">Attachments</Label>
              <div className="relative">
                <Input
                  key={fileInputKey}
                  id="task-attachments"
                  type="file"
                  multiple
                  className="pl-9"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    const now = new Date().toISOString();
                    setAttachments(
                      files.map((file, index) => ({
                        id: `new-att-${Date.now()}-${index}`,
                        name: file.name,
                        uploadedAt: now,
                        uploadedBy: userId,
                        sizeLabel: formatFileSize(file.size),
                      })),
                    );
                  }}
                />
                <Upload className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              </div>
              {attachments.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {attachments.length} file{attachments.length === 1 ? "" : "s"} selected
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary text-white border-0">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
