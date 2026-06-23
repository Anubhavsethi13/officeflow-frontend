import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officeflowApi } from "@/lib/api/officeflow";

export const Route = createFileRoute("/wms/products")({
  head: () => ({ meta: [{ title: "Products - officeflow" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<Record<string, string>>({});

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: officeflowApi.products.list,
  });

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: officeflowApi.inventory.list,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return officeflowApi.products.update(editingId, { name, sku });
      return officeflowApi.products.create({ name, sku });
    },
    onSuccess: async () => {
      toast.success(editingId ? "Product updated." : "Product created.");
      setName("");
      setSku("");
      setEditingId(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => officeflowApi.products.remove(id),
    onSuccess: async () => {
      toast.success("Product deleted.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stockInMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      officeflowApi.inventory.stockIn(productId, quantity),
    onSuccess: async () => {
      toast.success("Stock added.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stockOutMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      officeflowApi.inventory.stockOut(productId, quantity),
    onSuccess: async () => {
      toast.success("Stock deducted.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stockByProductId = useMemo(() => {
    const map = new Map<string, number>();
    (inventoryQuery.data ?? []).forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [inventoryQuery.data]);

  const products = productsQuery.data ?? [];

  return (
    <WMSLayout title="Products" subtitle="Backend-backed product catalog and inventory adjustments">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
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
              <Label>SKU</Label>
              <Input value={sku} onChange={(event) => setSku(event.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending || !name.trim() || !sku.trim()}>
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setSku("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="glass rounded-lg p-5">
          <h2 className="font-display text-xl font-bold">Product Inventory</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-3">Name</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Current Stock</th>
                  <th className="py-3">Adjust</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/60">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3">{product.sku}</td>
                    <td className="py-3">{product.category?.name ?? "-"}</td>
                    <td className="py-3">{stockByProductId.get(product.id) ?? product.inventory?.quantity ?? 0}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={adjustQuantity[product.id] ?? ""}
                          onChange={(event) =>
                            setAdjustQuantity((current) => ({
                              ...current,
                              [product.id]: event.target.value,
                            }))
                          }
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            stockInMutation.mutate({
                              productId: product.id,
                              quantity: Number(adjustQuantity[product.id] || 0),
                            })
                          }
                        >
                          In
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            stockOutMutation.mutate({
                              productId: product.id,
                              quantity: Number(adjustQuantity[product.id] || 0),
                            })
                          }
                        >
                          Out
                        </Button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(product.id);
                            setName(product.name);
                            setSku(product.sku);
                          }}
                        >
                          Edit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => deleteMutation.mutate(product.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!productsQuery.isLoading && products.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No products found.</div>
            )}
          </div>
        </section>
      </div>
    </WMSLayout>
  );
}
