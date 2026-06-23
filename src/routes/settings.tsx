import { createFileRoute } from "@tanstack/react-router";
import { TaskLayout } from "@/components/task/TaskLayout";
import { useAuth } from "@/lib/auth";
import { useTheme, type Theme } from "@/lib/theme";
import { DEPARTMENTS, type Role } from "@/lib/mock-data";
import { useHrStore, type SalaryStructureSettings } from "@/lib/hr-store";
import { Check, IndianRupee, Moon, ShieldCheck, Sun } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - officeflow" }] }),
  component: Settings,
});

const BASE_PERMS = [
  ["View all boards", ["Super Admin", "MD", "MD2", "MD3"]],
  ["View own board", ["Department Head", "Team Lead", "Employee"]],
  ["Create task", ["Super Admin", "MD", "MD2", "MD3", "Department Head"]],
  ["Edit task", ["Super Admin", "MD", "MD2", "MD3", "Department Head"]],
  ["Delete task", ["Super Admin"]],
  ["Assign task", ["Super Admin", "MD", "MD2", "MD3", "Department Head"]],
  ["Manage employees", ["Super Admin", "MD"]],
  ["View reports", ["Super Admin", "MD", "MD2", "MD3", "Department Head"]],
  ["Manage hierarchy", ["Super Admin"]],
  ["Change settings", ["Super Admin"]],
] as const;

const ROLES: Role[] = [
  "Super Admin",
  "MD",
  "MD2",
  "MD3",
  "Payroll Manager",
  "Department Head",
  "Team Lead",
  "Employee",
];
const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

// Salary structure configuration is now fixed

type RoleAccessKey = "generatorRoles" | "structureViewerRoles";
type UserAccessKey = "generatorUserIds" | "structureViewerUserIds";

function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { state, updateSalaryStructureSettings } = useHrStore();
  if (!user) return null;

  const salarySettings = state.salarySettings;
  const permissionRows: Array<readonly [string, readonly string[]]> = [
    ...BASE_PERMS,
    ["Generate salaries", salarySettings.generatorRoles],
    ["View salary structure", salarySettings.structureViewerRoles],
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(permissionRows.length / ITEMS_PER_PAGE);
  const paginatedPermissions = permissionRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);



  const toggleRole = (key: RoleAccessKey, role: Role) => {
    const values = salarySettings[key];
    const next = values.includes(role) ? values.filter((item) => item !== role) : [...values, role];
    updateSalaryStructureSettings({ [key]: next } as Partial<SalaryStructureSettings>);
  };

  const toggleUser = (key: UserAccessKey, userId: string) => {
    const values = salarySettings[key];
    const next = values.includes(userId)
      ? values.filter((item) => item !== userId)
      : [...values, userId];
    updateSalaryStructureSettings({ [key]: next } as Partial<SalaryStructureSettings>);
  };

  const AccessPanel = ({
    title,
    roleKey,
    userKey,
  }: {
    title: string;
    roleKey: RoleAccessKey;
    userKey: UserAccessKey;
  }) => (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-[color:var(--success)]" />
        {title}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROLES.map((role) => {
          const active = salarySettings[roleKey].includes(role);
          return (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(roleKey, role)}
              aria-pressed={active}
              className={`flex h-10 items-center justify-between gap-2 rounded-lg border px-3 text-left text-xs transition-colors ${
                active
                  ? "gradient-primary border-transparent text-white"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <span className="truncate">{role}</span>
              {active && <Check className="size-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
        {state.employees.map((employee) => {
          const active = salarySettings[userKey].includes(employee.id);
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => toggleUser(userKey, employee.id)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                active
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-card/50 hover:bg-card/80"
              }`}
            >
              <img src={employee.avatar} alt={employee.name} className="size-8 rounded-full" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{employee.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {employee.role}
                </span>
              </span>
              {active && <Check className="size-4 text-[color:var(--success)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <TaskLayout title="Settings">
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-4 font-display font-semibold">Departments</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEPARTMENTS.map((department) => (
              <div
                key={department.key}
                className="glass flex items-center gap-3 rounded-xl p-4"
                style={{ borderColor: `${department.color}40` }}
              >
                <div
                  className="grid size-10 place-items-center rounded-xl"
                  style={{ background: `${department.color}25` }}
                >
                  <span className="size-3 rounded-full" style={{ background: department.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{department.name}</div>
                  <div className="text-xs text-muted-foreground">Active board</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-display font-semibold">Company Profile</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              officeflow
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Theme</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                        active
                          ? "gradient-primary border-transparent text-white"
                          : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                      {active && <Check className="size-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Departments</div>
              {DEPARTMENTS.length} active
            </div>
          </div>
        </div>
      </div>

      <div className="glass mb-6 rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <IndianRupee className="size-5 text-[color:var(--secondary)]" />
          <h3 className="font-display font-semibold">Salary Structure</h3>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <AccessPanel
            title="Salary generators"
            roleKey="generatorRoles"
            userKey="generatorUserIds"
          />
          <AccessPanel
            title="Structure viewers"
            roleKey="structureViewerRoles"
            userKey="structureViewerUserIds"
          />
        </div>
      </div>

      <div className="glass overflow-x-auto rounded-2xl p-5">
        <h3 className="mb-4 font-display font-semibold">Permission Matrix</h3>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-muted-foreground">
              <th className="py-2 text-left font-medium">Permission</th>
              {ROLES.map((role) => (
                <th key={role} className="px-2 py-2 text-center font-medium">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedPermissions.map(([permission, roles]) => (
              <tr key={permission} className="border-b border-white/5">
                <td className="py-3">{permission}</td>
                {ROLES.map((role) => (
                  <td key={role} className="text-center">
                    {roles.includes(role) ? (
                      <Check className="mx-auto size-4 text-[color:var(--success)]" />
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
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
    </TaskLayout>
  );
}
