import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { officeflowApi } from "@/lib/api/officeflow";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance - officeflow" }] }),
  component: AttendancePage,
});

const attendanceStatuses = [
  { value: "PRESENT", label: "Present" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "ABSENT", label: "Absent" },
] as const;

const today = () => new Date().toISOString().slice(0, 10);

function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState(user?.id ?? "");
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<(typeof attendanceStatuses)[number]["value"]>("PRESENT");
  const [checkIn, setCheckIn] = useState("09:30");
  const [checkOut, setCheckOut] = useState("18:30");

  const attendanceQuery = useQuery({
    queryKey: ["attendance"],
    queryFn: officeflowApi.attendance.list,
    enabled: Boolean(user),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["attendance"] });
  };

  const checkInMutation = useMutation({
    mutationFn: officeflowApi.attendance.checkIn,
    onSuccess: async () => {
      toast.success("Checked in.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const checkOutMutation = useMutation({
    mutationFn: officeflowApi.attendance.checkOut,
    onSuccess: async () => {
      toast.success("Checked out.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { employeeId: string; date: string; status: "PRESENT" | "ABSENT" | "HALF_DAY"; checkIn?: string; checkOut?: string }) =>
      officeflowApi.attendance.upsert(payload),
    onSuccess: async () => {
      toast.success("Attendance saved.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const records = attendanceQuery.data ?? [];
  const employees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; designation: string }>();
    records.forEach((record) => {
      if (record.employee) map.set(record.employee.id, record.employee);
    });
    if (user && !map.has(user.id)) {
      map.set(user.id, { id: user.id, name: user.name, designation: user.designation });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [records, user]);

  const visibleRecords = useMemo(() => {
    const base = user?.role === "Employee" ? records.filter((record) => record.employeeId === user.id) : records;
    return base.filter((record) => !employeeId || record.employeeId === employeeId);
  }, [employeeId, records, user]);

  const monthRecords = visibleRecords.filter((record) => record.date.slice(0, 7) === today().slice(0, 7));
  const presentCount = monthRecords.filter((record) => record.status === "PRESENT").length;
  const halfDayCount = monthRecords.filter((record) => record.status === "HALF_DAY").length;
  const absentCount = monthRecords.filter((record) => record.status === "ABSENT").length;
  const canEditAll = user?.role !== "Employee";

  if (!user) return null;

  return (
    <AppLayout title="Attendance Management">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Present This Month" value={presentCount} />
        <Metric label="Half Days" value={halfDayCount} />
        <Metric label="Absences" value={absentCount} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the self-service actions for today, or save a specific record if your role can edit attendance.</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending || checkOutMutation.isPending}>
              Check In
            </Button>
            <Button variant="outline" onClick={() => checkOutMutation.mutate()} disabled={checkInMutation.isPending || checkOutMutation.isPending}>
              Check Out
            </Button>
          </div>

          {canEditAll && (
            <form
              className="mt-6 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate({
                  employeeId,
                  date,
                  status,
                  checkIn: status === "ABSENT" ? undefined : `${date}T${checkIn}:00`,
                  checkOut: status === "ABSENT" ? undefined : `${date}T${checkOut}:00`,
                });
              }}
            >
              <div>
                <Label>Employee</Label>
                <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.designation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    {attendanceStatuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Check In</Label>
                  <Input type="time" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Check Out</Label>
                  <Input type="time" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1" />
                </div>
              </div>
              <Button type="submit" disabled={saveMutation.isPending || !employeeId} className="w-full">
                {saveMutation.isPending ? "Saving..." : "Save Attendance"}
              </Button>
            </form>
          )}
        </section>

        <section className="glass rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Attendance Records</h2>
              <p className="text-sm text-muted-foreground">Live data from `/api/attendance`.</p>
            </div>
            {canEditAll && (
              <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-3">Employee</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Check In</th>
                  <th className="py-3">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border/60">
                    <td className="py-3">{record.employee?.name ?? user.name}</td>
                    <td className="py-3">{record.date.slice(0, 10)}</td>
                    <td className="py-3">{record.status.replace("_", " ")}</td>
                    <td className="py-3">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="py-3">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!attendanceQuery.isLoading && visibleRecords.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No attendance records found.</div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
