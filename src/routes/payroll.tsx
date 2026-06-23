import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import {
  canGenerateSalaries,
  canViewSalaryStructure,
  findEmployee,
  getApprovedAdvanceBalance,
  getOutstandingAdvanceAmount,
  getScopedEmployees,
  useHrStore,
} from "@/lib/hr-store";
import { downloadSalarySlipPdf } from "@/lib/salary-pdf";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import {
  Banknote,
  Download,
  FileText,
  HandCoins,
  LockKeyhole,
  ReceiptIndianRupee,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll - officeflow" }] }),
  component: Payroll,
});

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const asAmount = (value: string) => Math.max(0, Number(value) || 0);

const totalSlipDeductions = (slip: { deductions: number; tax: number; advanceRecovered: number }) =>
  slip.deductions + slip.tax + slip.advanceRecovered;

function Payroll() {
  const { user } = useAuth();
  const { state, addAdvance, generateSalarySlip, updateAdvance } = useHrStore();
  const [selectedId, setSelectedId] = useState<string | undefined>(user?.id);
  const [advanceAmount, setAdvanceAmount] = useState("5000");
  const [advanceReason, setAdvanceReason] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [advanceRecovery, setAdvanceRecovery] = useState("0");

  if (!user) return null;

  const generatorAccess = canGenerateSalaries(user, state.salarySettings);
  const scopedEmployees = generatorAccess
    ? state.employees
    : getScopedEmployees(user, state.employees);
  const selected =
    findEmployee(scopedEmployees, selectedId) ??
    findEmployee(scopedEmployees, user.id) ??
    scopedEmployees[0];
  const salary = selected
    ? state.salaryProfiles.find((profile) => profile.userId === selected.id)
    : undefined;
  const advances = selected
    ? state.advances.filter((advance) => advance.userId === selected.id)
    : [];
  const slips = selected ? state.salarySlips.filter((slip) => slip.userId === selected.id) : [];
  const canSeeStructure = canViewSalaryStructure(user, selected, state.salarySettings);
  const pendingAdvance = advances
    .filter((advance) => advance.status === "Pending")
    .reduce((total, advance) => total + getOutstandingAdvanceAmount(advance), 0);
  const approvedAdvance = selected ? getApprovedAdvanceBalance(state.advances, selected.id) : 0;
  const recoveryAmount = Math.min(asAmount(advanceRecovery), approvedAdvance);
  const grossBeforeAdvance = (salary?.monthlyCtc ?? 0) + (salary?.incentives ?? 0);
  const netBeforeAdvance = grossBeforeAdvance - (salary?.deductions ?? 0) - (salary?.tax ?? 0);
  const structureRows: Array<[string, number]> = [
    ["Basic Pay", salary?.basic ?? 0],
    ["Professional Tax", salary?.tax ?? 0],
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(slips.length / ITEMS_PER_PAGE);
  const paginatedSlips = slips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const requestAdvance = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const amount = asAmount(advanceAmount);
    if (amount <= 0) return;

    addAdvance({
      userId: selected.id,
      amount,
      reason: advanceReason || "Salary advance",
      status: generatorAccess ? "Approved" : "Pending",
    });
    setAdvanceReason("");
  };

  const submitSalaryGeneration = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !generatorAccess) return;
    generateSalarySlip({
      userId: selected.id,
      month: selectedMonth || currentMonth(),
      advanceRecovered: recoveryAmount,
    });
    setAdvanceRecovery("0");
  };

  return (
    <AppLayout title="Payroll">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass rounded-lg p-4">
          <Banknote className="mb-3 size-9 rounded-lg bg-[color:var(--success)]/15 p-2 text-[color:var(--success)]" />
          <div className="text-2xl font-bold">{money.format(salary?.monthlyCtc ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Monthly CTC</div>
        </div>
        <div className="glass rounded-lg p-4">
          <WalletCards className="mb-3 size-9 rounded-lg bg-sky-500/15 p-2 text-sky-400" />
          <div className="text-2xl font-bold">{money.format(salary?.incentives ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Incentives</div>
        </div>
        <div className="glass rounded-lg p-4">
          <HandCoins className="mb-3 size-9 rounded-lg bg-[color:var(--warning)]/15 p-2 text-[color:var(--warning)]" />
          <div className="text-2xl font-bold">{money.format(pendingAdvance)}</div>
          <div className="text-xs text-muted-foreground">Pending advance</div>
        </div>
        <div className="glass rounded-lg p-4">
          <ReceiptIndianRupee className="mb-3 size-9 rounded-lg bg-fuchsia-500/15 p-2 text-fuchsia-400" />
          <div className="text-2xl font-bold">{slips.length}</div>
          <div className="text-xs text-muted-foreground">Salary slips</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <div className="glass rounded-lg p-4">
            <div className="mb-3 text-sm font-semibold">Employee</div>
            <select
              value={selected?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card/70 px-3 text-sm"
            >
              {scopedEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.designation}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={requestAdvance} className="glass-strong rounded-lg p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <HandCoins className="size-4 text-[color:var(--warning)]" />
              {generatorAccess ? "Record advance" : "Request advance"}
            </div>
            <div className="space-y-3">
              <label className="grid gap-1.5 text-sm">
                Amount
                <input
                  value={advanceAmount}
                  onChange={(event) => setAdvanceAmount(event.target.value)}
                  type="number"
                  min="0"
                  className="h-11 rounded-lg border border-border bg-card/70 px-3"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                Reason
                <textarea
                  value={advanceReason}
                  onChange={(event) => setAdvanceReason(event.target.value)}
                  className="min-h-24 rounded-lg border border-border bg-card/70 p-3 text-sm"
                  placeholder="Reason for advance"
                />
              </label>
              <Button
                type="submit"
                className="w-full rounded-lg border-0 gradient-primary text-white"
              >
                Save advance
              </Button>
            </div>
          </form>

          {generatorAccess && selected && (
            <form onSubmit={submitSalaryGeneration} className="glass rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="size-4 text-[color:var(--secondary)]" />
                Generate salary
              </div>
              <div className="space-y-3">
                <label className="grid gap-1.5 text-sm">
                  Month
                  <input
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    type="month"
                    className="h-11 rounded-lg border border-border bg-card/70 px-3"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  Advance recovery
                  <input
                    value={advanceRecovery}
                    onChange={(event) => setAdvanceRecovery(event.target.value)}
                    type="number"
                    min="0"
                    max={approvedAdvance}
                    className="h-11 rounded-lg border border-border bg-card/70 px-3"
                  />
                </label>
                <div className="rounded-lg bg-card/60 p-3 text-xs text-muted-foreground">
                  Approved balance: {money.format(approvedAdvance)}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg border-0 gradient-primary text-white"
                >
                  <FileText className="size-4" />
                  Generate salary slip
                </Button>
              </div>
            </form>
          )}
        </aside>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="glass rounded-lg p-5">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Salary structure</h2>
              <p className="text-sm text-muted-foreground">
                {selected?.name ?? "Employee"} payroll profile
              </p>
            </div>
            {canSeeStructure ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between rounded-lg bg-card/60 p-3">
                  <span>Basic Pay</span>
                  <strong className="text-[color:var(--success)]">{money.format(salary?.basic ?? 0)}</strong>
                </div>
                <div className="flex justify-between rounded-lg bg-card/60 p-3">
                  <span>Professional Tax</span>
                  <strong className="text-[color:var(--destructive)]">-{money.format(salary?.tax ?? 0)}</strong>
                </div>
                <div className="flex justify-between rounded-lg border border-border bg-card/80 p-3 text-base">
                  <span>Net before advance</span>
                  <strong>{money.format(netBeforeAdvance)}</strong>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <LockKeyhole className="mx-auto mb-3 size-9 rounded-lg bg-card/80 p-2" />
                Salary structure access is not assigned.
              </div>
            )}
          </div>

          <div className="glass rounded-lg p-5">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Advances</h2>
              <p className="text-sm text-muted-foreground">
                Approved balance: {money.format(approvedAdvance)}
              </p>
            </div>
            <div className="space-y-3">
              {advances.map((advance) => (
                <div key={advance.id} className="rounded-lg bg-card/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{money.format(advance.amount)}</strong>
                    <span className="rounded-full bg-card/80 px-2 py-1 text-xs text-muted-foreground">
                      {advance.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {advance.date} - {advance.reason}
                  </div>
                  {advance.recoveredAmount > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Recovered {money.format(advance.recoveredAmount)} of{" "}
                      {money.format(advance.amount)}
                    </div>
                  )}
                  {generatorAccess && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs text-muted-foreground">
                        Adjust amount
                        <input
                          value={advance.amount}
                          onChange={(event) =>
                            updateAdvance(advance.id, { amount: Number(event.target.value) || 0 })
                          }
                          type="number"
                          min="0"
                          className="h-9 rounded-lg border border-border bg-card/70 px-3 text-sm text-foreground"
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-muted-foreground">
                        Status
                        <select
                          value={advance.status}
                          onChange={(event) =>
                            updateAdvance(advance.id, {
                              status: event.target.value as "Pending" | "Approved" | "Recovered",
                            })
                          }
                          className="h-9 rounded-lg border border-border bg-card/70 px-3 text-sm text-foreground"
                        >
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Recovered</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              ))}
              {advances.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No advances recorded.
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-lg p-5 xl:col-span-2">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Salary slips</h2>
              <p className="text-sm text-muted-foreground">
                Employees can view only their own salary slips.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 text-left font-medium">Month</th>
                    <th className="py-3 text-left font-medium">Gross</th>
                    <th className="py-3 text-left font-medium">Deductions</th>
                    <th className="py-3 text-left font-medium">Advance recovered</th>
                    <th className="py-3 text-left font-medium">Net pay</th>
                    <th className="py-3 text-left font-medium">Generated</th>
                    <th className="py-3 text-left font-medium">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {selected &&
                    paginatedSlips.map((slip) => (
                      <tr key={slip.id} className="border-b border-border/70">
                        <td className="py-3">{slip.month}</td>
                        <td className="py-3">{money.format(slip.gross)}</td>
                        <td className="py-3">{money.format(totalSlipDeductions(slip))}</td>
                        <td className="py-3">{money.format(slip.advanceRecovered)}</td>
                        <td className="py-3 font-semibold">{money.format(slip.netPay)}</td>
                        <td className="py-3 text-muted-foreground">{slip.generatedAt}</td>
                        <td className="py-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              downloadSalarySlipPdf({
                                employee: selected,
                                slip,
                                showStructure: canSeeStructure,
                              })
                            }
                            className="rounded-lg"
                          >
                            <Download className="size-4" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {slips.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No salary slips yet.
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-border mt-4">
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
        </section>
      </div>
    </AppLayout>
  );
}
