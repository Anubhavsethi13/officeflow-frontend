import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/mock-data";
import {
  calculateAttendanceSummary,
  getAttendanceForUser,
  calculateLeaveBalance,
  getReportingChain,
  useHrStore,
  canViewSalaryStructure,
} from "@/lib/hr-store";
import { getAccessProfile, MODULE_CATALOG } from "@/lib/access-control";
import { IncrementGraph } from "@/components/employee/IncrementGraph";
import { EmployeeDocuments } from "@/components/employee/EmployeeDocuments";
import { CalendarCheck, ShieldCheck, Mail, Phone, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$employeeId")({
  component: ProfilePage,
});

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ProfilePage() {
  const { employeeId } = Route.useParams();
  const { user } = useAuth();
  const { state } = useHrStore();

  const selectedId = employeeId === "me" ? user?.id : employeeId;
  const selected = state.employees.find((e) => e.id === selectedId);

  if (!selected || !user) {
    return (
      <AppLayout title="Profile">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="text-lg font-semibold mb-2">Employee not found.</div>
          <Link to="/employees" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="size-4" /> Back to Employees
          </Link>
        </div>
      </AppLayout>
    );
  }

  const selectedSalary = state.salaryProfiles.find((salary) => salary.userId === selected.id);
  const canSeeSelectedSalary = canViewSalaryStructure(user, selected, state.salarySettings);
  const selectedAttendance = calculateAttendanceSummary(getAttendanceForUser(state.attendance, selected.id));
  const selectedLeave = calculateLeaveBalance(selected.id, state);
  const selectedAccess = getAccessProfile(selected);
  const reportingChain = getReportingChain(selected.id, state.employees);

  const manager = state.employees.find((e) => e.id === selected.reportingManagerId);

  return (
    <AppLayout title={`${selected.name}'s Profile`}>
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <div className="flex items-center mb-2">
          <Link to="/employees" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Directory
          </Link>
        </div>

        {/* Header Hero Section */}
        <div className="glass-strong relative overflow-hidden rounded-2xl border border-white/10 p-8">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[color:var(--primary)] opacity-10 blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <img src={selected.avatar} alt={selected.name} className="size-32 rounded-full shadow-2xl ring-4 ring-background/50" />
            <div className="flex-1 text-center sm:text-left pt-2">
              <h2 className="font-display text-4xl font-bold tracking-tight text-foreground">{selected.name}</h2>
              <p className="text-xl font-medium text-[color:var(--primary)] mt-1">{selected.designation}</p>
              
              <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
                <span className="flex items-center gap-2 rounded-full bg-card/60 px-4 py-1.5 border border-white/5">
                  <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">ID</span> 
                  <span className="font-medium">{selected.employeeCode}</span>
                </span>
                <span className="flex items-center gap-2 rounded-full bg-card/60 px-4 py-1.5 border border-white/5">
                  <Mail className="size-4 text-muted-foreground" /> 
                  <span className="font-medium">{selected.email}</span>
                </span>
                <span className="flex items-center gap-2 rounded-full bg-card/60 px-4 py-1.5 border border-white/5">
                  <Phone className="size-4 text-muted-foreground" /> 
                  <span className="font-medium">{selected.phone}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-card/40 border border-white/5 p-5 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Departments</div>
              <div className="mt-2 font-semibold text-lg">
                {selected.departments?.length
                  ? selected.departments
                      .map((d) => DEPARTMENTS.find((item) => item.key === d)?.name)
                      .filter(Boolean)
                      .join(", ")
                  : "Leadership"}
              </div>
            </div>
            <div className="rounded-xl bg-card/40 border border-white/5 p-5 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reporting chain</div>
              <div className="mt-2 font-semibold text-lg truncate" title={reportingChain.length ? reportingChain.map((person) => person.name).join(" → ") : "Top level"}>
                {reportingChain.length
                  ? reportingChain.map((person) => person.name).join(" → ")
                  : "Top level"}
              </div>
            </div>
            {canSeeSelectedSalary && (
              <div className="rounded-xl bg-card/40 border border-white/5 p-5 backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly salary</div>
                <div className="mt-2 font-semibold text-xl text-[color:var(--success)] drop-shadow-sm">
                  {money.format(selectedSalary?.monthlyCtc ?? 0)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            {canSeeSelectedSalary && (
               <IncrementGraph increments={selected.increments} />
            )}
            <EmployeeDocuments documents={selected.documents} />
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="mb-6 flex items-center gap-3 font-semibold text-lg">
                <div className="grid size-10 place-items-center rounded-xl bg-[color:var(--info)]/10 shadow-inner">
                  <CalendarCheck className="size-5 text-[color:var(--info)] drop-shadow" />
                </div>
                Attendance & Leave
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-card/40 border border-white/5 p-5 text-center">
                  <div className="text-4xl font-black text-foreground drop-shadow-sm">{selectedAttendance?.currentStreak ?? 0}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Continuous days</div>
                </div>
                <div className="rounded-xl bg-card/40 border border-white/5 p-5 text-center">
                  <div className="text-4xl font-black text-[color:var(--success)] drop-shadow-sm">{selectedLeave?.earnedAvailable ?? 0}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Earned leave</div>
                </div>
                <div className="rounded-xl bg-card/40 border border-white/5 p-5 text-center">
                  <div className="text-4xl font-black text-[color:var(--warning)] drop-shadow-sm">{selectedLeave?.medicalAvailable ?? 0}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Medical leave</div>
                </div>
                <div className="rounded-xl bg-card/40 border border-white/5 p-5 text-center">
                  <div className="text-4xl font-black text-[color:var(--destructive)] drop-shadow-sm">{selectedAttendance?.lateDays ?? 0}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Late marks</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="mb-6 flex items-center gap-3 font-semibold text-lg">
                <div className="grid size-10 place-items-center rounded-xl bg-[color:var(--success)]/10 shadow-inner">
                  <ShieldCheck className="size-5 text-[color:var(--success)] drop-shadow" />
                </div>
                Module Access
              </div>
              <div className="flex flex-wrap gap-2.5">
                {selectedAccess?.modules.map((module) => (
                  <span
                    key={module}
                    className="rounded-full bg-card/80 px-4 py-2 text-xs font-semibold text-foreground border border-white/10 shadow-sm"
                  >
                    {MODULE_CATALOG[module].label}
                  </span>
                ))}
                {!selectedAccess?.modules.length && (
                  <div className="text-sm text-muted-foreground p-2">No modules assigned.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
