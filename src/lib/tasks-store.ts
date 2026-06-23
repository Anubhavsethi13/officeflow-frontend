import { useEffect, useState } from "react";
import {
  INITIAL_TASKS,
  initialStatusFor,
  progressForStatus,
  type ConsumablesTargetSegment,
  type Task,
  type TaskAttachment,
  type TaskNote,
  type TaskProductLine,
} from "./mock-data";
import { PRODUCTS } from "./wms-data";

const KEY = "ctms.tasks.v1";

function fallbackAttachments(task: Task): TaskAttachment[] {
  if (Array.isArray(task.attachmentItems)) return task.attachmentItems;

  return Array.from({ length: task.attachments ?? 0 }, (_, index) => ({
    id: `${task.id}-legacy-attachment-${index + 1}`,
    name: `Attachment ${index + 1}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: task.createdBy,
  }));
}

function normaliseProductLines(task: Task): TaskProductLine[] {
  if (!Array.isArray(task.productLines)) return [];

  return task.productLines.map((line, index) => {
    const quantity = Number(line.quantity) || 0;
    const rate = Number(line.rate) || 0;

    return {
      id: line.id || `${task.id}-line-${index + 1}`,
      productId: line.productId,
      quantity,
      rate,
      amount: Number(line.amount) || quantity * rate,
    };
  });
}

function inferTargetSegment(
  task: Task,
  productLines: TaskProductLine[],
): ConsumablesTargetSegment | undefined {
  if (task.targetSegment) return task.targetSegment;
  if (task.department !== "consumables") return undefined;

  const firstLinkedProduct = productLines
    .map((line) => PRODUCTS.find((product) => product.id === line.productId))
    .find(Boolean);

  if (firstLinkedProduct?.type === "hardware") return "hardware";
  return "rolls";
}

function normalise(task: Task): Task {
  const status = task.status || initialStatusFor(task.department);
  const attachmentItems = fallbackAttachments(task);
  const notes = Array.isArray(task.notes) ? task.notes : [];
  const productLines = normaliseProductLines(task);
  const lineTotal = productLines.reduce((sum, line) => sum + line.amount, 0);

  return {
    ...task,
    createdAt: task.createdAt || task.dueDate || new Date().toISOString(),
    status,
    attachmentItems,
    attachments: attachmentItems.length,
    notes,
    comments: notes.length || task.comments || 0,
    progress: task.progress || progressForStatus(task.department, status),
    amount: typeof task.amount === "number" ? task.amount : lineTotal || undefined,
    targetSegment: inferTargetSegment(task, productLines),
    productLines: productLines.length > 0 ? productLines : undefined,
  };
}

function load(): Task[] {
  if (typeof window === "undefined") return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return (JSON.parse(raw) as Task[]).map(normalise);
  } catch {
    return INITIAL_TASKS;
  }
  return INITIAL_TASKS;
}

let memory: Task[] = INITIAL_TASKS;
const listeners = new Set<(t: Task[]) => void>();

function emit() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(memory));
  listeners.forEach((l) => l(memory));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(memory);
  useEffect(() => {
    memory = load();
    setTasks(memory);
    const l = (t: Task[]) => setTasks([...t]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return tasks;
}

export const taskActions = {
  update(id: string, patch: Partial<Task>) {
    memory = memory.map((t) => (t.id === id ? { ...t, ...patch } : t));
    emit();
  },
  add(t: Task) {
    memory = [normalise(t), ...memory];
    emit();
  },
  addNote(id: string, note: TaskNote) {
    memory = memory.map((t) => {
      if (t.id !== id) return t;
      const notes = [...(t.notes ?? []), note];
      return { ...t, notes, comments: notes.length };
    });
    emit();
  },
  remove(id: string) {
    memory = memory.filter((t) => t.id !== id);
    emit();
  },
};
