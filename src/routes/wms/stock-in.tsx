import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { useWmsStore, type StockInLine } from "@/lib/wms-store";
import { fmtINR } from "@/lib/wms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wms/stock-in")({
  head: () => ({ meta: [{ title: "Stock In - WMS" }] }),
  component: StockInPage,
});

function StockInPage() {
  const products = useWmsStore((state) => state.products);
  const vendors = useWmsStore((state) => state.vendors);
  const locations = useWmsStore((state) => state.locations);
  const receiveStock = useWmsStore((state) => state.receiveStock);
  const stockLocations = useMemo(() => locations.filter((location) => ["Store Room", "Zone", "Rack", "Shelf", "Bin"].includes(location.type)), [locations]);
  const firstProduct = products[0];
  const [vendor, setVendor] = useState(vendors[0]?.id ?? "");
  const [invoice, setInvoice] = useState("");
  const [po, setPo] = useState("");
  const [location, setLocation] = useState(stockLocations.find((item) => item.type === "Bin")?.id ?? stockLocations[0]?.id ?? "");
  const [lines, setLines] = useState<StockInLine[]>([
    { productId: firstProduct?.id ?? "", qty: 1, rate: firstProduct?.purchasePrice ?? 0 },
  ]);

  const addLine = () => {
    const product = products[0];
    if (!product) return;
    setLines((items) => [...items, { productId: product.id, qty: 1, rate: product.purchasePrice }]);
  };
  const removeLine = (index: number) => setLines((items) => items.filter((_, itemIndex) => itemIndex !== index));
  const setLine = (index: number, patch: Partial<StockInLine>) =>
    setLines((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));

  const total = lines.reduce((sum, line) => sum + line.qty * line.rate, 0);

  const save = () => {
    const result = receiveStock({ vendorId: vendor, locationId: location, invoice, po, lines });
    toast[result.ok ? "success" : "error"](result.message);
    if (result.ok) {
      setInvoice("");
      setPo("");
      setLines([{ productId: products[0]?.id ?? "", qty: 1, rate: products[0]?.purchasePrice ?? 0 }]);
    }
  };

  return (
    <WMSLayout title="Stock In / Inward" subtitle="Record incoming stock from vendors">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="wms-form-panel">
          <div className="wms-form-header">
            <div>
              <h3 className="font-display text-lg font-semibold">Inward Details</h3>
              <div className="mt-1 text-xs text-muted-foreground">GRN Draft</div>
            </div>
            <span className="wms-form-badge">{lines.length} line{lines.length === 1 ? "" : "s"}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="wms-form-field">
              <Label className="wms-form-label">Vendor</Label>
              <select value={vendor} onChange={(event) => setVendor(event.target.value)} className="wms-control mt-1 h-11 w-full rounded-xl border px-3 text-sm">
                {vendors.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="wms-form-field">
              <Label className="wms-form-label">Storage Location</Label>
              <select value={location} onChange={(event) => setLocation(event.target.value)} className="wms-control mt-1 h-11 w-full rounded-xl border px-3 text-sm">
                {stockLocations.map((item) => (
                  <option key={item.id} value={item.id}>{item.code} / {item.name}</option>
                ))}
              </select>
            </div>
            <div className="wms-form-field">
              <Label className="wms-form-label">Invoice Number</Label>
              <Input value={invoice} onChange={(event) => setInvoice(event.target.value)} placeholder="INV-..." className="wms-control mt-1 h-11 border px-3" />
            </div>
            <div className="wms-form-field">
              <Label className="wms-form-label">PO Number</Label>
              <Input value={po} onChange={(event) => setPo(event.target.value)} placeholder="PO-..." className="wms-control mt-1 h-11 border px-3" />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <h4 className="font-display text-base font-semibold">Items</h4>
            <Button onClick={addLine} variant="outline" className="wms-secondary-button rounded-xl">
              <Plus className="size-4" /> Add Item
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            {lines.map((line, index) => {
              const product = products.find((item) => item.id === line.productId) ?? products[0];
              return (
                <div key={index} className="wms-line-row grid grid-cols-12 items-end gap-3 rounded-2xl border p-4">
                  <div className="col-span-12 md:col-span-5">
                    <Label className="wms-form-label">Product</Label>
                    <select
                      value={line.productId}
                      onChange={(event) => {
                        const nextProduct = products.find((item) => item.id === event.target.value);
                        setLine(index, { productId: event.target.value, rate: nextProduct?.purchasePrice ?? 0, batch: "", serial: "" });
                      }}
                      className="wms-control mt-1 h-10 w-full rounded-xl border px-3 text-sm"
                    >
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="wms-form-label">Qty</Label>
                    <Input type="number" value={line.qty} min={1} onChange={(event) => setLine(index, { qty: Number(event.target.value) })} className="wms-control mt-1 h-10 border px-3" />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="wms-form-label">Rate</Label>
                    <Input type="number" value={line.rate} min={0} onChange={(event) => setLine(index, { rate: Number(event.target.value) })} className="wms-control mt-1 h-10 border px-3" />
                  </div>
                  <div className="col-span-10 md:col-span-2">
                    <Label className="wms-form-label">{product?.serialRequired ? "Serial" : "Batch"}</Label>
                    <Input
                      value={product?.serialRequired ? (line.serial ?? "") : (line.batch ?? "")}
                      onChange={(event) => setLine(index, product?.serialRequired ? { serial: event.target.value } : { batch: event.target.value })}
                      placeholder={product?.serialRequired ? "SN-001" : "BATCH-001"}
                      className="wms-control mt-1 h-10 border px-3"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end md:col-span-1">
                    <button onClick={() => removeLine(index)} className="wms-icon-button text-[color:var(--destructive)]" title="Remove item">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="wms-summary-card h-fit">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Summary</h3>
            <span className="wms-form-badge">Inward</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="wms-summary-row"><span>Lines</span><strong>{lines.length}</strong></div>
            <div className="wms-summary-row"><span>Total Qty</span><strong>{lines.reduce((sum, line) => sum + line.qty, 0)}</strong></div>
            <div className="wms-summary-total"><span>Total Value</span><strong>{fmtINR(total)}</strong></div>
          </div>
          <Button onClick={save} disabled={!vendor || !location || lines.length === 0} className="mt-4 w-full rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
            <Save className="size-4" /> Save Inward
          </Button>
        </aside>
      </div>
    </WMSLayout>
  );
}
