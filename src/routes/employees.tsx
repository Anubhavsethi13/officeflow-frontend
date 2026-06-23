import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { officeflowApi } from "@/lib/api/officeflow";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, type DeptKey, type Role } from "@/lib/mock-data";
import {
  canEditEmployee,
  canGenerateSalaries,
  canManagePeople,
  findEmployee,
  getScopedEmployees,
  getDepartmentStats,
  isCompanyAdmin,
  type EmployeeRecord,
  useHrStore,
} from "@/lib/hr-store";
import { EmployeeManagementForms } from "@/components/employee/EmployeeManagementForms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Banknote,
  Building2,
  CalendarCheck,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserPen,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees - officeflow" }] }),
  component: Employees,
});

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

type EmployeeForm = {
  id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  departments: DeptKey[];
  designation: string;
  reportingManagerId: string;
  monthlyCtc: string;
  status: "Active" | "Inactive";
  avatar: string;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  password: "",
  phone: "+91 98765 43210",
  role: "Employee",
  departments: [],
  designation: "",
  reportingManagerId: "",
  monthlyCtc: "42000",
  status: "Active",
  avatar: "",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/40 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute -right-6 -top-6 size-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40 ${tone}`} />
      <div className="relative z-10">
        <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg shadow-inner ${tone}`}>
          <Icon className="size-5 text-white drop-shadow-md" />
        </div>
        <div className="text-3xl font-black tracking-tight drop-shadow-sm">{value}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Employees() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, addEmployee, updateEmployee, updateSalary } = useHrStore();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<DeptKey | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const scopedEmployees = useMemo(
    () => (user ? getScopedEmployees(user, state.employees) : []),
    [state.employees, user],
  );

  const visibleEmployees = useMemo(() => {
    const term = q.trim().toLowerCase();
    return scopedEmployees.filter((employee) => {
      const deptMatch = dept === "all" || employee.departments?.includes(dept);
      const queryMatch =
        !term ||
        `${employee.name} ${employee.email} ${employee.designation} ${employee.employeeCode}`
          .toLowerCase()
          .includes(term);
      return deptMatch && queryMatch;
    });
  }, [dept, q, scopedEmployees]);

  if (!user) return null;
  const adminView = isCompanyAdmin(user);
  const managerView = canManagePeople(user);
  const salaryEditor = canGenerateSalaries(user, state.salarySettings);

  const departmentStats = getDepartmentStats(state.employees);

  const startCreate = () => {
    setForm(emptyForm);
    setShowPassword(false);
    setFormOpen(true);
  };

  const startEdit = (employee: EmployeeRecord) => {
    setForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      password: "",
      phone: employee.phone,
      role: employee.role,
      departments: employee.departments ?? [],
      designation: employee.designation,
      reportingManagerId: employee.reportingManagerId ?? "",
      monthlyCtc: String(
        state.salaryProfiles.find((salary) => salary.userId === employee.id)?.monthlyCtc ?? 42000,
      ),
      status: employee.status,
      avatar: employee.avatar,
    });
    setShowPassword(false);
    setFormOpen(true);
  };

  const saveEmployee = (event: React.FormEvent) => {
    event.preventDefault();
    const monthlyCtc = Number(form.monthlyCtc) || 0;
    const departments = form.departments;
    const reportingManagerId = form.reportingManagerId || undefined;

    if (form.id) {
      updateEmployee(form.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        departments,
        designation: form.designation,
        reportingManagerId,
        status: form.status,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        ...(form.avatar ? { avatar: form.avatar } : {}),
      });
      if (salaryEditor) updateSalary(form.id, monthlyCtc);
    } else {
      const created = addEmployee({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        departments,
        designation: form.designation,
        reportingManagerId,
        monthlyCtc,
        password: form.password.trim(),
      });
    }

    setFormOpen(false);
  };

  return (
    <AppLayout title={adminView ? "Employee Management" : "My Employee Profile"}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label={adminView ? "Employees in company" : "Visible employees"}
          value={scopedEmployees.length}
          tone="bg-gradient-to-br from-sky-500 to-cyan-500"
        />
        <MetricCard
          icon={Building2}
          label="Departments"
          value={departmentStats.filter((item) => item.count > 0).length}
          tone="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <MetricCard
          icon={CalendarCheck}
          label="Pending leave requests"
          value={state.leaveRequests.filter((request) => request.status === "Pending").length}
          tone="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <MetricCard
          icon={Banknote}
          label="Active payroll profiles"
          value={state.salaryProfiles.length}
          tone="bg-gradient-to-br from-fuchsia-500 to-pink-500"
        />
      </div>

      <div className="mt-5 space-y-4">
        {adminView && (
          <div className="grid gap-3 md:grid-cols-5">
            {departmentStats.map((department) => (
              <div
                key={department.key}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/40 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08]"
                  style={{ background: `linear-gradient(135deg, ${department.color}, transparent)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                      {department.name}
                    </div>
                    <span
                      className="size-2 rounded-full"
                      style={{ background: department.color, boxShadow: `0 0 10px ${department.color}` }}
                    />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-3xl font-black tracking-tighter drop-shadow-sm">{department.count}</div>
                      <div className="text-[10px] font-medium uppercase text-muted-foreground">
                        {department.active} active
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 truncate text-xs text-muted-foreground">
                    Head: <span className="font-medium text-foreground">{department.head?.name ?? "Not assigned"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-border bg-card/60 px-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search employees, code, designation..."
                className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {managerView && (
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setDept("all")}
                  className={`rounded-lg px-3 py-2 text-xs ${dept === "all" ? "gradient-primary text-white" : "bg-card/60 text-muted-foreground hover:text-foreground"}`}
                >
                  All
                </button>
                {DEPARTMENTS.map((department) => (
                  <button
                    key={department.key}
                    onClick={() => setDept(department.key)}
                    className={`rounded-lg px-3 py-2 text-xs ${dept === department.key ? "gradient-primary text-white" : "bg-card/60 text-muted-foreground hover:text-foreground"}`}
                  >
                    {department.name}
                  </button>
                ))}
              </div>
            )}
            {managerView && (
              <Button
                onClick={startCreate}
                className="h-11 rounded-lg border-0 gradient-primary text-white"
              >
                <Plus className="size-4" />
                Add Employee
              </Button>
            )}
          </div>
        </div>

        {formOpen && (
          <div className="glass rounded-lg p-4">
            <form onSubmit={saveEmployee}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {form.id ? "Edit employee" : "Create employee"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Assign department, reporting manager, role, and salary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              {/* Profile Photo Upload */}
              <div className="mb-5 flex items-center gap-4">
                <div className="relative group">
                  <div className="size-20 overflow-hidden rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-transparent">
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="Profile"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-slate-600 to-slate-700 grid place-items-center">
                        <Camera className="size-7 text-white/40" />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result;
                          if (typeof result === "string") {
                            setForm({ ...form, avatar: result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Profile photo</span>
                  <span className="text-xs text-muted-foreground">Click to upload or change photo</span>
                  {form.avatar && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatar: "" })}
                      className="mt-1 flex items-center gap-1 text-xs text-[color:var(--destructive)] hover:underline"
                    >
                      <X className="size-3" />
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Employee name"
                  className="h-11 rounded-lg bg-card/70"
                />
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Email"
                  className="h-11 rounded-lg bg-card/70"
                />
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required={!form.id}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={form.id ? "New password (optional)" : "Login password"}
                    minLength={6}
                    className="h-11 rounded-lg bg-card/70 pl-9 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Input
                  required
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="Phone"
                  className="h-11 rounded-lg bg-card/70"
                />
                <Input
                  required
                  value={form.designation}
                  onChange={(event) => setForm({ ...form, designation: event.target.value })}
                  placeholder="Designation"
                  className="h-11 rounded-lg bg-card/70"
                />
                <Select
                  value={form.role}
                  onValueChange={(val) => setForm({ ...form, role: val as Role })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border bg-card/70 text-sm shadow-none">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="md:col-span-2 xl:col-span-3">
                  <span className="mb-2 block text-sm font-medium">Departments</span>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map((department) => (
                      <label
                        key={department.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${form.departments.includes(department.key)
                          ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10"
                          : "border-border bg-card/70 hover:bg-card"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={form.departments.includes(department.key)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.departments, department.key]
                              : form.departments.filter((d) => d !== department.key);
                            setForm({ ...form, departments: next });
                          }}
                        />
                        {department.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Select
                  value={form.reportingManagerId}
                  onValueChange={(val) => setForm({ ...form, reportingManagerId: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border bg-card/70 text-sm shadow-none">
                    <SelectValue placeholder="No manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager</SelectItem>
                    {state.employees
                      .filter((employee) => employee.id !== form.id)
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {salaryEditor && (
                  <Input
                    value={form.monthlyCtc}
                    onChange={(event) => setForm({ ...form, monthlyCtc: event.target.value })}
                    placeholder="Monthly salary"
                    className="h-11 rounded-lg bg-card/70"
                  />
                )}
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val as "Active" | "Inactive" })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border bg-card/70 text-sm shadow-none">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="mt-4 rounded-lg border-0 gradient-primary text-white"
              >
                Save employee
              </Button>
            </form>

            {form.id && salaryEditor && (
              <EmployeeManagementForms employee={findEmployee(state.employees, form.id)!} />
            )}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {visibleEmployees.map((employee) => {
            const manager = findEmployee(state.employees, employee.reportingManagerId);
            return (
              <button
                key={employee.id}
                onClick={() => navigate({ to: "/profile/$employeeId", params: { employeeId: employee.id } })}
                className="glass rounded-lg border-border p-4 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="size-12 rounded-full ring-2 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-semibold">{employee.name}</div>
                      <span className="rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 text-[10px] text-[color:var(--success)]">
                        {employee.status}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {employee.designation}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span className="rounded-full bg-card/70 px-2 py-1">
                        {employee.employeeCode}
                      </span>
                      <span className="rounded-full bg-card/70 px-2 py-1">
                        {employee.departments?.length
                          ? employee.departments
                            .map((d) => DEPARTMENTS.find((item) => item.key === d)?.name)
                            .filter(Boolean)
                            .join(", ")
                          : employee.role}
                      </span>
                    </div>
                  </div>
                  {canEditEmployee(user, employee) && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        startEdit(employee);
                      }}
                      className="grid size-8 place-items-center rounded-lg bg-card/70 text-muted-foreground hover:text-foreground"
                    >
                      <UserPen className="size-4" />
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2 truncate">
                    <Mail className="size-3.5" />
                    {employee.email}
                  </span>
                  <span className="flex items-center gap-2 truncate">
                    <Phone className="size-3.5" />
                    {employee.phone}
                  </span>
                  <span className="truncate">Manager: {manager?.name ?? "Not assigned"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
