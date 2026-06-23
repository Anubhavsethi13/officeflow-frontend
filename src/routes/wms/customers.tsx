import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officeflowApi } from "@/lib/api/officeflow";

export const Route = createFileRoute("/wms/customers")({
  head: () => ({ meta: [{ title: "Customers - officeflow" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: officeflowApi.customers.list,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return officeflowApi.customers.update(editingId, { name, phone });
      return officeflowApi.customers.create({ name, phone });
    },
    onSuccess: async () => {
      toast.success(editingId ? "Customer updated." : "Customer created.");
      setEditingId(null);
      setName("");
      setPhone("");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => officeflowApi.customers.remove(id),
    onSuccess: async () => {
      toast.success("Customer deleted.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const customers = customersQuery.data ?? [];

  return (
    <WMSLayout title="Customers" subtitle="Live CRUD for `/api/customers`">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">{editingId ? "Edit Customer" : "Add Customer"}</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending || !name.trim()}>
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Customer" : "Create Customer"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setName(""); setPhone(""); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">Customer List</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-3">Name</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/60">
                    <td className="py-3">{customer.name}</td>
                    <td className="py-3">{customer.phone || "-"}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => { setEditingId(customer.id); setName(customer.name); setPhone(customer.phone || ""); }}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => deleteMutation.mutate(customer.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!customersQuery.isLoading && customers.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No customers found.</div>
            )}
          </div>
        </section>
      </div>
    </WMSLayout>
  );
}
