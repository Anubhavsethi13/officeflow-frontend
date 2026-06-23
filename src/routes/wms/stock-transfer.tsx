import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { decodeQrPayload, getLocationDisplay, useWmsStore } from "@/lib/wms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, QrCode, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wms/stock-transfer")({
  head: () => ({ meta: [{ title: "Stock Transfer - WMS" }] }),
  component: TransferPage,
});

function TransferPage() {
  const products = useWmsStore((state) => state.products);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const transferStock = useWmsStore((state) => state.transferStock);
  const binLocations = useMemo(() => locations.filter((location) => ["Store Room", "Zone", "Rack", "Shelf", "Bin"].includes(location.type)), [locations]);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [fromLot, setFromLot] = useState("");
  const [to, setTo] = useState(binLocations.find((location) => location.type === "Bin")?.id ?? binLocations[1]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [scan, setScan] = useState("");
  const product = products.find((item) => item.id === productId) ?? products[0];
  const lots = useMemo(() => stockLots.filter((lot) => lot.productId === productId), [stockLots, productId]);
  const selectedLot = lots.find((lot) => lot.id === fromLot);

  useEffect(() => {
    if (!fromLot || !lots.some((lot) => lot.id === fromLot)) setFromLot(lots[0]?.id ?? "");
  }, [fromLot, lots]);

  const applyScan = () => {
    const payload = decodeQrPayload(scan);
    const lotMatch = stockLots.find((lot) => lot.id === payload?.lotId || lot.id === scan);
    const productMatch = products.find((item) => item.id === payload?.productId || item.sku === scan || item.barcode === scan || item.code === scan);
    if (lotMatch) {
      setProductId(lotMatch.productId);
      setFromLot(lotMatch.id);
      toast.success("Source lot loaded.");
      return;
    }
    if (productMatch) {
      setProductId(productMatch.id);
      setFromLot(stockLots.find((lot) => lot.productId === productMatch.id)?.id ?? "");
      toast.success("Product loaded.");
      return;
    }
    toast.error("QR data did not match any product or lot.");
  };

  const save = () => {
    const result = transferStock({ productId, fromLotId: fromLot, toLocationId: to, qty, reason });
    toast[result.ok ? "success" : "error"](result.message);
    if (result.ok) {
      setQty(1);
      setReason("");
      setScan("");
    }
  };

  return (
    <WMSLayout title="Stock Transfer" subtitle="Move stock between warehouse racks, shelves and bins">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
          <h3 className="mb-4 font-display font-semibold">Transfer Details</h3>
          <div className="mb-4 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label className="text-xs">Scan / Paste QR, SKU, Barcode or Lot ID</Label>
              <Input value={scan} onChange={(event) => setScan(event.target.value)} placeholder="Scan source lot" className="mt-1 h-10 border-white/10 bg-transparent" />
            </div>
            <Button onClick={applyScan} disabled={!scan.trim()} className="mt-5 rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
              <QrCode className="size-4" /> Load
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Product</Label>
              <select value={productId} onChange={(event) => { setProductId(event.target.value); setFromLot(stockLots.find((lot) => lot.productId === event.target.value)?.id ?? ""); }} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-transparent px-3 text-sm">
                {products.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <Label className="text-xs">From Location</Label>
                <select value={fromLot} onChange={(event) => setFromLot(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-transparent px-3 text-sm">
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>{getLocationDisplay(locations, lot.locationId)} / {lot.quantity} {product?.unit}</option>
                  ))}
                  {lots.length === 0 && <option>No stock available</option>}
                </select>
              </div>
              <ArrowRight className="mb-2.5 size-5 text-muted-foreground" />
              <div>
                <Label className="text-xs">To Location</Label>
                <select value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-transparent px-3 text-sm">
                  {binLocations.map((location) => (
                    <option key={location.id} value={location.id}>{location.code} / {location.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input type="number" min={1} max={selectedLot?.quantity ?? undefined} value={qty} onChange={(event) => setQty(Number(event.target.value))} className="mt-1 h-10 border-white/10 bg-transparent" />
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reorganisation, dispatch staging" className="mt-1 h-10 border-white/10 bg-transparent" />
            </div>
          </div>

          <Button disabled={!fromLot || !to || selectedLot?.locationId === to || qty <= 0 || qty > (selectedLot?.quantity ?? 0)} onClick={save} className="mt-6 rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
            <Save className="size-4" /> Save Transfer
          </Button>
        </div>

        <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <h3 className="mb-3 font-display font-semibold">Selected Lot</h3>
          {selectedLot ? (
            <div className="space-y-2 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="font-medium">{getLocationDisplay(locations, selectedLot.locationId)}</div>
                <div className="text-xs text-muted-foreground">{selectedLot.quantity} {product?.unit} available</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-muted-foreground">Destination</div>
                <div className="font-medium">{locations.find((location) => location.id === to)?.name}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Select a source lot or scan QR to start.</div>
          )}
        </div>
      </div>
    </WMSLayout>
  );
}
