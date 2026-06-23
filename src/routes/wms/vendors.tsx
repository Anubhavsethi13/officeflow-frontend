import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officeflowApi } from "@/lib/api/officeflow";

export const Route = createFileRoute("/wms/vendors")({
  head: () => ({ meta: [{ title: "Vendors - officeflow" }] }),
  component: VendorsPage,
});

function VendorsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const vendorsQuery = useQuery({
    queryKey: ["vendors"],
    queryFn: officeflowApi.vendors.list,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["vendors"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return officeflowApi.vendors.update(editingId, { name, phone });
      return officeflowApi.vendors.create({ name, phone });
    },
    onSuccess: async () => {
      toast.success(editingId ? "Vendor updated." : "Vendor created.");
      setEditingId(null);
      setName("");
      setPhone("");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => officeflowApi.vendors.remove(id),
    onSuccess: async () => {
      toast.success("Vendor deleted.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const vendors = vendorsQuery.data ?? [];

  return (
    <WMSLayout title="Vendors" subtitle="Live CRUD for `/api/vendors`">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">{editingId ? "Edit Vendor" : "Add Vendor"}</h2>
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
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Vendor" : "Create Vendor"}
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
          <h2 className="font-display text-xl font-bold">Vendor List</h2>
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
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-border/60">
                    <td className="py-3">{vendor.name}</td>
                    <td className="py-3">{vendor.phone || "-"}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => { setEditingId(vendor.id); setName(vendor.name); setPhone(vendor.phone || ""); }}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => deleteMutation.mutate(vendor.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!vendorsQuery.isLoading && vendors.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No vendors found.</div>
            )}
          </div>
        </section>
      </div>
    </WMSLayout>
  );
}
