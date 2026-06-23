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

export const Route = createFileRoute("/leaves")({
  head: () => ({ meta: [{ title: "Leave Management - officeflow" }] }),
  component: LeavesPage,
});

const leaveTypes = ["Earned Leave", "Medical Leave", "Casual Leave"];
const today = () => new Date().toISOString().slice(0, 10);

function LeavesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState("Earned Leave");
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());

  const leavesQuery = useQuery({
    queryKey: ["leaves"],
    queryFn: officeflowApi.leaves.list,
    enabled: Boolean(user),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["leaves"] });
  };

  const requestMutation = useMutation({
    mutationFn: () => officeflowApi.leaves.request({ type, fromDate, toDate }),
    onSuccess: async () => {
      toast.success("Leave request submitted.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => officeflowApi.leaves.approve(id),
    onSuccess: async () => {
      toast.success("Leave approved.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => officeflowApi.leaves.reject(id),
    onSuccess: async () => {
      toast.success("Leave rejected.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const leaves = leavesQuery.data ?? [];
  const myLeaves = leaves.filter((leave) => leave.employeeId === user?.id);
  const pending = leaves.filter((leave) => leave.status === "PENDING");
  const canApprove = user?.role === "Super Admin" || user?.role === "MD" || user?.role === "Department Head";

  const summary = useMemo(() => ({
    total: myLeaves.length,
    pending: myLeaves.filter((leave) => leave.status === "PENDING").length,
    approved: myLeaves.filter((leave) => leave.status === "APPROVED").length,
    rejected: myLeaves.filter((leave) => leave.status === "REJECTED").length,
  }), [myLeaves]);

  if (!user) return null;

  return (
    <AppLayout title="Leave Management">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="My Requests" value={summary.total} />
        <Metric label="Pending" value={summary.pending} />
        <Metric label="Approved" value={summary.approved} />
        <Metric label="Rejected" value={summary.rejected} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">Request Leave</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              requestMutation.mutate();
            }}
          >
            <div>
              <Label>Leave Type</Label>
              <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                {leaveTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1" />
            </div>
            <Button type="submit" disabled={requestMutation.isPending} className="w-full">
              {requestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          {canApprove && (
            <div className="glass rounded-lg p-5">
              <h2 className="font-display text-xl font-bold">Approval Queue</h2>
              <div className="mt-4 space-y-3">
                {pending.map((leave) => (
                  <div key={leave.id} className="rounded-lg border border-border p-4">
                    <div className="font-medium">{leave.employee?.name ?? leave.employeeId}</div>
                    <div className="text-sm text-muted-foreground">
                      {leave.type} · {leave.fromDate.slice(0, 10)} to {leave.toDate.slice(0, 10)}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => approveMutation.mutate(leave.id)} disabled={approveMutation.isPending}>
                        Approve
                      </Button>
                      <Button variant="outline" onClick={() => rejectMutation.mutate(leave.id)} disabled={rejectMutation.isPending}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && <div className="text-sm text-muted-foreground">No leave requests are waiting.</div>}
              </div>
            </div>
          )}

          <div className="glass rounded-lg p-5">
            <h2 className="font-display text-xl font-bold">Leave History</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-3">Employee</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">From</th>
                    <th className="py-3">To</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-border/60">
                      <td className="py-3">{leave.employee?.name ?? leave.employeeId}</td>
                      <td className="py-3">{leave.type}</td>
                      <td className="py-3">{leave.fromDate.slice(0, 10)}</td>
                      <td className="py-3">{leave.toDate.slice(0, 10)}</td>
                      <td className="py-3">{leave.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!leavesQuery.isLoading && leaves.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No leave requests found.</div>
              )}
            </div>
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
