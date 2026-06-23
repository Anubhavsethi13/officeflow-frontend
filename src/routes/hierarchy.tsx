import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, type DeptKey } from "@/lib/mock-data";
import {
  canManagePeople,
  findEmployee,
  getDepartmentStats,
  getReportingChain,
  isCompanyAdmin,
  useHrStore,
  type EmployeeRecord,
} from "@/lib/hr-store";
import { Crown, Network, Save, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/hierarchy")({
  head: () => ({ meta: [{ title: "Company Hierarchy - officeflow" }] }),
  component: Hierarchy,
});

function PersonCard({
  employee,
  color,
  compact = false,
  delay = 0,
}: {
  employee: EmployeeRecord;
  color?: string;
  compact?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`hierarchy-card group relative overflow-hidden rounded-lg border bg-card/55 text-left transition-all hover:-translate-y-1 hover:bg-card/80 ${
        compact ? "p-3" : "p-4"
      }`}
      style={{
        borderColor: color ? `${color}55` : undefined,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-90"
        style={{ background: color ?? "var(--gradient-primary)" }}
      />
      <div className="flex items-center gap-3">
        <img
          src={employee.avatar}
          alt={employee.name}
          className={`${compact ? "size-10" : "size-12"} rounded-full ring-2 ring-white/10 transition-transform group-hover:scale-105`}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{employee.name}</div>
          <div className="truncate text-xs text-muted-foreground">{employee.designation}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className="truncate">{employee.role}</span>
        <span
          className="size-2 rounded-full"
          style={{ background: color ?? "var(--color-primary)" }}
        />
      </div>
    </div>
  );
}

function DepartmentBranch({
  department,
  members,
  index,
}: {
  department: (typeof DEPARTMENTS)[number];
  members: EmployeeRecord[];
  index: number;
}) {
  const head =
    members.find((employee) => employee.role === "Department Head") ??
    members.find((employee) => !employee.reportingManagerId);
  const team = members.filter((employee) => employee.id !== head?.id);
  const visibleTeam = team.slice(0, 5);
  const hiddenCount = Math.max(0, team.length - visibleTeam.length);

  return (
    <div
      className="hierarchy-card rounded-lg border bg-card/40 p-4"
      style={{ borderColor: `${department.color}45`, animationDelay: `${index * 90}ms` }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold" style={{ color: department.color }}>
            {department.name}
          </div>
          <div className="text-xs text-muted-foreground">{members.length} people</div>
        </div>
        <div
          className="grid size-10 place-items-center rounded-lg"
          style={{ background: `${department.color}20` }}
        >
          <span className="size-3 rounded-full" style={{ background: department.color }} />
        </div>
      </div>

      {head ? (
        <PersonCard employee={head} color={department.color} delay={index * 90 + 60} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Head not assigned
        </div>
      )}

      <div className="mx-auto h-6 w-px bg-gradient-to-b from-border to-transparent" />

      <div className="grid gap-2">
        {visibleTeam.map((employee, memberIndex) => (
          <PersonCard
            key={employee.id}
            employee={employee}
            color={department.color}
            compact
            delay={index * 90 + 110 + memberIndex * 28}
          />
        ))}
        {hiddenCount > 0 && (
          <div className="rounded-lg border border-border bg-card/45 p-3 text-center text-xs text-muted-foreground">
            +{hiddenCount} more
          </div>
        )}
      </div>
    </div>
  );
}

function ChainStep({
  employee,
  color,
  index,
}: {
  employee: EmployeeRecord;
  color: string;
  index: number;
}) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-3 top-0 h-full w-px bg-border" />
      <span
        className="absolute left-0 top-5 grid size-6 place-items-center rounded-full border bg-background text-[10px] font-bold"
        style={{ borderColor: color, color }}
      >
        {index + 1}
      </span>
      <PersonCard employee={employee} color={color} compact delay={index * 80} />
    </div>
  );
}

function Hierarchy() {
  const { user } = useAuth();
  const { state, updateEmployee } = useHrStore();
  const [selectedDept, setSelectedDept] = useState<DeptKey>("software");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const departmentStats = useMemo(() => getDepartmentStats(state.employees), [state.employees]);

  if (!user) return null;

  const adminView = isCompanyAdmin(user);
  const editable = canManagePeople(user);
  const leadership = state.employees.filter(
    (employee) => employee.role === "MD" || employee.role === "MD2" || employee.role === "MD3",
  );
  const self = findEmployee(state.employees, user.id);
  const selfChain = self ? getReportingChain(self.id, state.employees) : [];
  const activeDept = adminView ? selectedDept : (user.departments?.[0] ?? selectedDept);
  const selectedDeptMeta =
    DEPARTMENTS.find((department) => department.key === activeDept) ?? DEPARTMENTS[0];
  const visibleDepartments = adminView
    ? DEPARTMENTS
    : DEPARTMENTS.filter((department) => user.departments?.includes(department.key));
  const selfTeam = self?.departments?.length
    ? state.employees.filter((employee) => employee.departments?.some((d) => self.departments?.includes(d)))
    : leadership;
  const editorEmployees = adminView ? state.employees : selfTeam;
  const selectedDepartmentEmployees = state.employees.filter(
    (employee) => employee.departments?.includes(activeDept),
  );
  const selectedHead =
    selectedDepartmentEmployees.find((employee) => employee.role === "Department Head") ??
    selectedDepartmentEmployees.find((employee) => !employee.reportingManagerId);
  const selectedEmployee =
    findEmployee(state.employees, selectedEmployeeId) ??
    selectedDepartmentEmployees.find((employee) => employee.id !== selectedHead?.id) ??
    selectedDepartmentEmployees[0];

  const changeDepartmentHead = (department: DeptKey, headId: string) => {
    if (!adminView) return;
    const previousHeads = state.employees.filter(
      (employee) => employee.departments?.includes(department) && employee.role === "Department Head",
    );
    previousHeads.forEach((employee) => {
      if (employee.id !== headId) updateEmployee(employee.id, { role: "Employee" });
    });
    const head = findEmployee(state.employees, headId);
    if (!head) return;
    const newDepts = head.departments?.includes(department)
      ? head.departments
      : [...(head.departments ?? []), department];
    updateEmployee(headId, { role: "Department Head", departments: newDepts });
  };

  return (
    <AppLayout title="Company Hierarchy">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="glass-strong overflow-hidden rounded-lg">
          <div className="border-b border-border bg-card/35 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Network className="size-4 text-[color:var(--secondary)]" />
                  Reporting structure
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {adminView ? "Company hierarchy" : "Your hierarchy and team"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleDepartments.map((department) => (
                  <button
                    key={department.key}
                    type="button"
                    onClick={() => setSelectedDept(department.key)}
                    className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                      activeDept === department.key
                        ? "border-transparent text-white shadow-lg"
                        : "border-border bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                    style={
                      activeDept === department.key
                        ? {
                            background: `linear-gradient(135deg, ${department.color}, oklch(0.68 0.22 320))`,
                          }
                        : undefined
                    }
                  >
                    {department.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="mb-6 grid gap-3 md:grid-cols-3">
              {leadership.map((leader, index) => (
                <div key={leader.id} className="relative">
                  <div className="absolute left-1/2 top-full hidden h-6 w-px bg-gradient-to-b from-primary/50 to-transparent md:block" />
                  <PersonCard employee={leader} color="oklch(0.65 0.21 275)" delay={index * 80} />
                </div>
              ))}
            </div>

            {adminView ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x sm:gap-6">
                {DEPARTMENTS.map((department, index) => (
                  <div key={department.key} className="min-w-[260px] flex-1 snap-start sm:min-w-[300px]">
                    <DepartmentBranch
                      department={department}
                      members={state.employees.filter(
                        (employee) => employee.departments?.includes(department.key),
                      )}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="rounded-lg border border-border bg-card/40 p-4">
                  <div className="mb-4 flex items-center gap-2 font-semibold">
                    <Crown className="size-4 text-[color:var(--warning)]" />
                    Reporting chain
                  </div>
                  <div className="space-y-3">
                    {[...selfChain, ...(self ? [self] : [])].map((employee, index) => (
                      <ChainStep
                        key={employee.id}
                        employee={employee}
                        color={selectedDeptMeta.color}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/40 p-4">
                  <div className="mb-4 flex items-center gap-2 font-semibold">
                    <Sparkles className="size-4 text-[color:var(--secondary)]" />
                    Team constellation
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selfTeam.map((employee, index) => (
                      <PersonCard
                        key={employee.id}
                        employee={employee}
                        color={selectedDeptMeta.color}
                        compact
                        delay={index * 42}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass rounded-lg p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="size-4 text-[color:var(--info)]" />
              Department summary
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {departmentStats.map((department) => (
                <div
                  key={department.key}
                  className="rounded-lg border bg-card/55 p-3"
                  style={{ borderColor: `${department.color}35` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{department.name}</span>
                    <span className="text-sm font-bold">{department.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-card/70">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(8, Math.min(100, department.count * 9))}%`,
                        background: department.color,
                      }}
                    />
                  </div>
                  <div className="mt-2 truncate text-xs text-muted-foreground">
                    Head: {department.head?.name ?? "Not assigned"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editable && (
            <div className="glass-strong rounded-lg p-5">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <Save className="size-4 text-[color:var(--success)]" />
                Hierarchy editor
              </div>
              <div className="space-y-4">
                <label className="grid gap-1.5 text-sm">
                  Department
                  <select
                    value={activeDept}
                    onChange={(event) => setSelectedDept(event.target.value as DeptKey)}
                    className="h-11 rounded-lg border border-border bg-card/70 px-3"
                  >
                    {visibleDepartments.map((department) => (
                      <option key={department.key} value={department.key}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                {adminView && (
                  <label className="grid gap-1.5 text-sm">
                    Department head
                    <select
                      value={selectedHead?.id ?? ""}
                      onChange={(event) => changeDepartmentHead(selectedDept, event.target.value)}
                      className="h-11 rounded-lg border border-border bg-card/70 px-3"
                    >
                      <option value="">Select head</option>
                      {state.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="grid gap-1.5 text-sm">
                  Employee
                  <select
                    value={selectedEmployee?.id ?? ""}
                    onChange={(event) => setSelectedEmployeeId(event.target.value)}
                    className="h-11 rounded-lg border border-border bg-card/70 px-3"
                  >
                    {editorEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedEmployee && (
                  <>
                    <label className="grid gap-1.5 text-sm">
                      Reporting manager
                      <select
                        value={selectedEmployee.reportingManagerId ?? ""}
                        onChange={(event) =>
                          updateEmployee(selectedEmployee.id, {
                            reportingManagerId: event.target.value || undefined,
                          })
                        }
                        className="h-11 rounded-lg border border-border bg-card/70 px-3"
                      >
                        <option value="">No manager</option>
                        {editorEmployees
                          .filter((employee) => employee.id !== selectedEmployee.id)
                          .map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} - {employee.role}
                            </option>
                          ))}
                      </select>
                    </label>
                    <div className="grid gap-1.5 text-sm">
                      <span className="font-medium text-muted-foreground">Department assignment</span>
                      <div className="flex flex-wrap gap-2">
                        {(adminView ? DEPARTMENTS : visibleDepartments).map((department) => {
                          const isAssigned = selectedEmployee.departments?.includes(department.key);
                          return (
                            <label
                              key={department.key}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                                isAssigned
                                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10"
                                  : "border-border bg-card/70 hover:bg-card"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="size-3 rounded border-border"
                                checked={isAssigned}
                                onChange={(e) => {
                                  const current = selectedEmployee.departments ?? [];
                                  const next = e.target.checked
                                    ? [...current, department.key]
                                    : current.filter((d) => d !== department.key);
                                  updateEmployee(selectedEmployee.id, { departments: next });
                                }}
                              />
                              {department.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}
