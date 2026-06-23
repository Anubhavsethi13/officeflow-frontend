import { useEffect, useState } from "react";
import { type Task, type TaskProductLine } from "./mock-data";
import { PRODUCTS, stockStatus } from "./wms-data";

const TARGET_KEY = "ctms.sales.targets.v2";

export const DEFAULT_SALES_TARGET = 2_000_000;

export interface SalesTargetSummary {
  monthKey: string;
  monthLabel: string;
  totalTarget: number;
  totalAchieved: number;
  remaining: number;
  overallPercent: number;
  linkedProductCount: number;
  lowStockCount: number;
}

export const currentMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(year, (month || 1) - 1, 1),
  );
};

function readTargets(): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(TARGET_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeTargets(targets: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TARGET_KEY, JSON.stringify(targets));
}

export function useSalesTargets(monthKey = currentMonthKey()) {
  const [target, setTarget] = useState<number>(DEFAULT_SALES_TARGET);

  useEffect(() => {
    const stored = readTargets()[monthKey];
    setTarget(stored ?? DEFAULT_SALES_TARGET);
  }, [monthKey]);

  const updateTarget = (value: number) => {
    const safeValue = Math.max(0, Number.isFinite(value) ? value : 0);
    const allTargets = readTargets();
    allTargets[monthKey] = safeValue;
    writeTargets(allTargets);
    setTarget(safeValue);
  };

  return { target, updateTarget };
}

function splitTaskAmount(task: Task): number {
  const productLines = task.productLines ?? [];
  if (productLines.length > 0) {
    return productLines.reduce((acc, line) => acc + line.amount, 0);
  }
  return task.amount ?? 0;
}

function isCurrentMonthTask(task: Task, monthKey: string) {
  const dateValue = task.createdAt || task.dueDate;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return currentMonthKey(date) === monthKey;
}

function lineProducts(lines: TaskProductLine[]) {
  return lines
    .map((line) => PRODUCTS.find((product) => product.id === line.productId))
    .filter(Boolean);
}

export function summarizeSalesMonth(
  tasks: Task[],
  target: number,
  monthKey = currentMonthKey(),
): SalesTargetSummary {
  let totalAchieved = 0;
  const productIds = new Set<string>();

  const monthTasks = tasks.filter(
    (task) => task.department === "consumables" && isCurrentMonthTask(task, monthKey),
  );

  monthTasks.forEach((task) => {
    totalAchieved += splitTaskAmount(task);

    lineProducts(task.productLines ?? []).forEach((product) => {
      if (!product) return;
      productIds.add(product.id);
    });
  });

  const linkedProducts = PRODUCTS.filter((product) => productIds.has(product.id));
  const lowStockCount = linkedProducts.filter((product) =>
    ["Low Stock", "Out of Stock"].includes(stockStatus(product)),
  ).length;

  return {
    monthKey,
    monthLabel: monthLabel(monthKey),
    totalTarget: target,
    totalAchieved,
    remaining: Math.max(0, target - totalAchieved),
    overallPercent: target > 0 ? Math.min(100, Math.round((totalAchieved / target) * 100)) : 0,
    linkedProductCount: productIds.size,
    lowStockCount,
  };
}
