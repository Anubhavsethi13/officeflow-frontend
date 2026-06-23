import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { decodeQrPayload, getLocationDisplay, useWmsStore, type SalesInvoiceInputLine } from "@/lib/wms-store";
import { fmtINR, type Product, type StockLot } from "@/lib/wms-data";
import { downloadSalesInvoicePdf } from "@/lib/sales-invoice-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download, FileText, Plus, QrCode, Save, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wms/stock-out")({
  head: () => ({ meta: [{ title: "Stock Out / Sales Invoice - WMS" }] }),
  component: StockOutPage,
});

const REASONS = ["Sale", "Client delivery", "Internal use", "Replacement", "Damage", "Return to vendor", "Project consumption"];
type TransactionMode = "si" | "stock-out";
type InvoiceLineForm = SalesInvoiceInputLine & { key: string };

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const lineKey = () => `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const sellerStateCode = "27";

function StockOutPage() {
  const products = useWmsStore((state) => state.products);
  const customers = useWmsStore((state) => state.customers);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const issueStock = useWmsStore((state) => state.issueStock);
  const createSalesInvoice = useWmsStore((state) => state.createSalesInvoice);
  const markSalesInvoicePdfGenerated = useWmsStore((state) => state.markSalesInvoicePdfGenerated);

  const firstProduct = products[0];
  const [mode, setMode] = useState<TransactionMode>("si");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [reason, setReason] = useState(REASONS[0]);
  const [reference, setReference] = useState("");
  const [scan, setScan] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(7));
  const [customerGstNumber, setCustomerGstNumber] = useState(customers[0]?.gstNumber ?? "");
  const [placeOfSupply, setPlaceOfSupply] = useState(customers[0]?.city ?? "Maharashtra");
  const [paymentTerms, setPaymentTerms] = useState("Net 7");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<InvoiceLineForm[]>(() => [makeLine(firstProduct?.id ?? "", products, stockLots)]);
  const [tallyDialogOpen, setTallyDialogOpen] = useState(false);
  const [tallyVoucherInput, setTallyVoucherInput] = useState("");

  const customer = customers.find((item) => item.id === customerId) ?? customers[0];

  useEffect(() => {
    if (!customer) return;
    setCustomerGstNumber(customer.gstNumber);
    setPlaceOfSupply(customer.city || "Maharashtra");
  }, [customer]);

  useEffect(() => {
    setLines((items) => (items.length ? items : [makeLine(products[0]?.id ?? "", products, stockLots)]));
  }, [products, stockLots]);

  const requestedByLot = useMemo(() => {
    const map = new Map<string, number>();
    lines.forEach((line) => {
      if (!line.lotId) return;
      map.set(line.lotId, (map.get(line.lotId) ?? 0) + Number(line.qty || 0));
    });
    return map;
  }, [lines]);

  const interState = useMemo(() => {
    const gstState = customerGstNumber.trim().slice(0, 2);
    if (/^\d{2}$/.test(gstState)) return gstState !== sellerStateCode;
    return placeOfSupply.trim().toLowerCase() !== "maharashtra";
  }, [customerGstNumber, placeOfSupply]);

  const totals = useMemo(() => {
    return lines.reduce(
      (sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        const gross = Number(line.qty || 0) * Number(line.rate || 0);
        const discount = gross * (Math.min(99, Math.max(0, Number(line.discountPct || 0))) / 100);
        const taxable = gross - discount;
        const gst = taxable * ((product?.gstRate ?? 0) / 100);
        return {
          qty: sum.qty + Number(line.qty || 0),
          subTotal: sum.subTotal + gross,
          discount: sum.discount + discount,
          taxable: sum.taxable + taxable,
          cgst: sum.cgst + (interState ? 0 : gst / 2),
          sgst: sum.sgst + (interState ? 0 : gst / 2),
          igst: sum.igst + (interState ? gst : 0),
          grand: sum.grand + taxable + gst,
        };
      },
      { qty: 0, subTotal: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, grand: 0 },
    );
  }, [interState, lines, products]);

  const hasInsufficientStock = lines.some((line) => {
    const lot = stockLots.find((item) => item.id === line.lotId);
    return !lot || (requestedByLot.get(line.lotId) ?? 0) > lot.quantity;
  });

  const addLine = () => setLines((items) => [...items, makeLine(products[0]?.id ?? "", products, stockLots)]);
  const removeLine = (key: string) => setLines((items) => (items.length === 1 ? items : items.filter((line) => line.key !== key)));
  const setLine = (key: string, patch: Partial<InvoiceLineForm>) =>
    setLines((items) => items.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const applyScan = () => {
    const payload = decodeQrPayload(scan);
    const lotMatch = stockLots.find((lot) => lot.id === payload?.lotId || lot.id === scan);
    const productMatch = products.find((item) => item.id === payload?.productId || item.sku === scan || item.barcode === scan || item.code === scan);
    const targetProduct = lotMatch ? products.find((item) => item.id === lotMatch.productId) : productMatch;

    if (!targetProduct) {
      toast.error("QR data did not match any product or stock lot.");
      return;
    }

    setLines((items) => {
      const [first, ...rest] = items.length ? items : [makeLine(targetProduct.id, products, stockLots)];
      return [
        {
          ...first,
          productId: targetProduct.id,
          lotId: lotMatch?.id ?? stockLots.find((lot) => lot.productId === targetProduct.id)?.id ?? "",
          rate: targetProduct.sellingPrice,
        },
        ...rest,
      ];
    });
    toast.success(lotMatch ? "Source lot loaded." : "Product loaded.");
  };

  const validateBeforeSave = (): boolean => {
    if (!customer) {
      toast.error("Select a customer.");
      return false;
    }
    if (hasInsufficientStock) {
      toast.error("One or more selected lots do not have enough stock.");
      return false;
    }
    if (lines.some((line) => !line.productId || !line.lotId || Number(line.qty || 0) <= 0)) {
      toast.error("Fill in all line items with valid product, lot and quantity.");
      return false;
    }
    return true;
  };

  const handleStockOutIssue = () => {
    if (!validateBeforeSave()) return;
    for (const line of lines) {
      const result = issueStock({
        productId: line.productId,
        lotId: line.lotId,
        customerId,
        qty: Number(line.qty || 0),
        reference,
        reason,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
    }
    toast.success("Stock issued successfully.");
    setReference("");
    setScan("");
    resetLinesFromStore(setLines);
  };

  const buildInvoicePayload = (pushedToTally: boolean, tallyVoucherNumber?: string) => ({
    customerId,
    customerGstNumber,
    placeOfSupply,
    paymentTerms,
    date: invoiceDate,
    dueDate,
    pushedToTally,
    tallyVoucherNumber,
    ewayBillNumber,
    notes,
    lines: lines.map(({ productId, lotId, qty, rate, discountPct }) => ({
      productId,
      lotId,
      qty: Number(qty || 0),
      rate: Number(rate || 0),
      discountPct: Number(discountPct || 0),
    })),
  });

  const resetForm = () => {
    setReference("");
    setScan("");
    setEwayBillNumber("");
    setNotes("");
    resetLinesFromStore(setLines);
  };

  const saveDraft = () => {
    if (!validateBeforeSave()) return;
    const result = createSalesInvoice(buildInvoicePayload(false));
    if (!result.ok || !result.invoice) {
      toast.error(result.message);
      return;
    }
    downloadSalesInvoicePdf(result.invoice, customer);
    markSalesInvoicePdfGenerated(result.invoice.id);
    toast.success(`${result.invoice.number} saved and PDF downloaded.`);
    resetForm();
  };

  const openTallyDialog = () => {
    if (!validateBeforeSave()) return;
    setTallyVoucherInput("");
    setTallyDialogOpen(true);
  };

  const confirmPushToTally = () => {
    if (!tallyVoucherInput.trim()) {
      toast.error("Enter the Tally voucher number.");
      return;
    }
    const result = createSalesInvoice(buildInvoicePayload(true, tallyVoucherInput.trim().toUpperCase()));
    toast[result.ok ? "success" : "error"](result.message);
    setTallyDialogOpen(false);
    if (!result.ok || !result.invoice) return;
    resetForm();
  };

  const saveDisabled =
    !customerId ||
    lines.length === 0 ||
    hasInsufficientStock ||
    lines.some((line) => !line.productId || !line.lotId || Number(line.qty || 0) <= 0);

  return (
    <WMSLayout title="Stock Out / SI" subtitle="Create sales invoice and issue stock in one flow">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="wms-form-panel">
          <div className="wms-form-header">
            <div>
              <h3 className="font-display text-lg font-semibold">{mode === "si" ? "SI - Sales Invoice" : "Stock Out Only"}</h3>
              <div className="mt-1 text-xs text-muted-foreground">{mode === "si" ? "Customer, GST and item issue details" : "Issue stock without creating SI"}</div>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMode("si")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "si" ? "bg-cyan-500 text-white" : "text-muted-foreground"}`}
              >
                SI
              </button>
              <button
                onClick={() => setMode("stock-out")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "stock-out" ? "bg-cyan-500 text-white" : "text-muted-foreground"}`}
              >
                Stock Out
              </button>
            </div>
          </div>

          <div className="wms-scan-card mb-5 grid gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <Label className="wms-form-label">Scan / Paste QR, SKU, Barcode or Lot ID</Label>
              <Input value={scan} onChange={(event) => setScan(event.target.value)} placeholder="Scan source lot or product" className="wms-control mt-1 h-11 border px-3" />
            </div>
            <Button onClick={applyScan} disabled={!scan.trim()} className="h-11 self-end rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
              <QrCode className="size-4" /> Load
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Customer">
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="wms-control h-11 w-full rounded-xl border px-3 text-sm">
                {customers.map((item) => (
                  <option key={item.id} value={item.id}>{item.company}</option>
                ))}
              </select>
            </Field>

            {mode === "si" ? (
              <>
                <Field label="Invoice Date">
                  <Input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} className="wms-control h-11 border px-3" />
                </Field>
                <Field label="Customer GSTIN">
                  <Input value={customerGstNumber} onChange={(event) => setCustomerGstNumber(event.target.value.toUpperCase())} className="wms-control h-11 border px-3" />
                </Field>
                <Field label="Place of Supply">
                  <Input value={placeOfSupply} onChange={(event) => setPlaceOfSupply(event.target.value)} className="wms-control h-11 border px-3" />
                </Field>
                <Field label="Due Date">
                  <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="wms-control h-11 border px-3" />
                </Field>
                <Field label="Payment Terms">
                  <Input value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} className="wms-control h-11 border px-3" />
                </Field>
                <Field label="E-way Bill">
                  <Input value={ewayBillNumber} onChange={(event) => setEwayBillNumber(event.target.value.toUpperCase())} placeholder="Optional" className="wms-control h-11 border px-3" />
                </Field>
              </>
            ) : (
              <>
                <Field label="Reason">
                  <select value={reason} onChange={(event) => setReason(event.target.value)} className="wms-control h-11 w-full rounded-xl border px-3 text-sm">
                    {REASONS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Reference">
                  <Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="INV / WO / Job no." className="wms-control h-11 border px-3" />
                </Field>
              </>
            )}
          </div>

          {mode === "si" && (
            <div className="mt-4">
              <Label className="wms-form-label">Notes</Label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="wms-control mt-1 min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Optional invoice note"
              />
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            <h4 className="font-display text-base font-semibold">Items</h4>
            <Button onClick={addLine} variant="outline" className="wms-secondary-button rounded-xl">
              <Plus className="size-4" /> Add Item
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            {lines.map((line) => {
              const product = products.find((item) => item.id === line.productId) ?? products[0];
              const lots = stockLots.filter((lot) => lot.productId === line.productId);
              const selectedLot = stockLots.find((lot) => lot.id === line.lotId);
              const requestedQty = requestedByLot.get(line.lotId) ?? 0;
              const insufficient = !selectedLot || requestedQty > selectedLot.quantity;

              return (
                <div key={line.key} className="wms-line-row grid grid-cols-12 items-end gap-3 rounded-2xl border p-4">
                  <div className="col-span-12 lg:col-span-3">
                    <Label className="wms-form-label">Product</Label>
                    <select
                      value={line.productId}
                      onChange={(event) => {
                        const nextProduct = products.find((item) => item.id === event.target.value);
                        const nextLot = stockLots.find((lot) => lot.productId === event.target.value);
                        setLine(line.key, {
                          productId: event.target.value,
                          lotId: nextLot?.id ?? "",
                          rate: nextProduct?.sellingPrice ?? 0,
                        });
                      }}
                      className="wms-control mt-1 h-10 w-full rounded-xl border px-3 text-sm"
                    >
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 lg:col-span-3">
                    <Label className="wms-form-label">Source Lot</Label>
                    <select value={line.lotId} onChange={(event) => setLine(line.key, { lotId: event.target.value })} className="wms-control mt-1 h-10 w-full rounded-xl border px-3 text-sm">
                      {lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>{getLocationDisplay(locations, lot.locationId)} / {lot.quantity} {product?.unit}</option>
                      ))}
                      {lots.length === 0 && <option value="">No stock available</option>}
                    </select>
                  </div>
                  <div className="col-span-6 lg:col-span-1">
                    <Label className="wms-form-label">Qty</Label>
                    <Input type="number" min={1} value={line.qty} onChange={(event) => setLine(line.key, { qty: Number(event.target.value) })} className="wms-control mt-1 h-10 border px-3" />
                  </div>
                  <div className="col-span-6 lg:col-span-2">
                    <Label className="wms-form-label">Rate</Label>
                    <Input type="number" min={0} value={line.rate} onChange={(event) => setLine(line.key, { rate: Number(event.target.value) })} className="wms-control mt-1 h-10 border px-3" />
                  </div>
                  <div className="col-span-6 lg:col-span-1">
                    <Label className="wms-form-label">Disc %</Label>
                    <Input type="number" min={0} max={99} value={line.discountPct} onChange={(event) => setLine(line.key, { discountPct: Number(event.target.value) })} className="wms-control mt-1 h-10 border px-3" />
                  </div>
                  <div className="col-span-4 lg:col-span-1">
                    <Label className="wms-form-label">GST</Label>
                    <div className="mt-1 flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm">{product?.gstRate ?? 0}%</div>
                  </div>
                  <div className="col-span-2 flex justify-end lg:col-span-1">
                    <button onClick={() => removeLine(line.key)} className="wms-icon-button text-[color:var(--destructive)]" title="Remove item">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {insufficient && (
                    <div className="col-span-12 flex items-center gap-2 text-xs text-[color:var(--destructive)]">
                      <AlertTriangle className="size-3.5" /> Selected lot has {selectedLot?.quantity ?? 0} units available.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="wms-summary-card h-fit">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Summary</h3>
            <span className="wms-form-badge">{mode === "si" ? "SI" : "Issue"}</span>
          </div>
          {customer && (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="font-medium">{customer.company}</div>
              <div className="mt-1 text-xs text-muted-foreground">{customerGstNumber || "GSTIN not entered"} / {placeOfSupply}</div>
            </div>
          )}
          <div className="space-y-3 text-sm">
            <div className="wms-summary-row"><span>Lines</span><strong>{lines.length}</strong></div>
            <div className="wms-summary-row"><span>Total Qty</span><strong>{totals.qty}</strong></div>
            <div className="wms-summary-row"><span>Subtotal</span><strong>{fmtINR(totals.subTotal)}</strong></div>
            <div className="wms-summary-row"><span>Discount</span><strong>{fmtINR(totals.discount)}</strong></div>
            <div className="wms-summary-row"><span>Taxable</span><strong>{fmtINR(totals.taxable)}</strong></div>
            {interState ? (
              <div className="wms-summary-row"><span>IGST</span><strong>{fmtINR(totals.igst)}</strong></div>
            ) : (
              <>
                <div className="wms-summary-row"><span>CGST</span><strong>{fmtINR(totals.cgst)}</strong></div>
                <div className="wms-summary-row"><span>SGST</span><strong>{fmtINR(totals.sgst)}</strong></div>
              </>
            )}
            <div className="wms-summary-total"><span>Grand Total</span><strong>{fmtINR(totals.grand)}</strong></div>
          </div>
          {mode === "si" && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><FileText className="size-3.5" /> Choose an action below to save this invoice.</span>
            </div>
          )}
          {mode === "si" ? (
            <div className="mt-4 grid gap-2">
              <Button disabled={saveDisabled} onClick={saveDraft} variant="outline" className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50">
                <Save className="size-4" /> Save as Draft
              </Button>
              <Button disabled={saveDisabled} onClick={openTallyDialog} className="w-full rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
                <Send className="size-4" /> Save & Push to Tally
              </Button>
            </div>
          ) : (
            <Button disabled={saveDisabled} onClick={handleStockOutIssue} className="mt-4 w-full rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
              <Save className="size-4" /> Issue Stock
            </Button>
          )}
        </aside>
      </div>

      {/* Tally Voucher Dialog */}
      {tallyDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTallyDialogOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(var(--card))] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-semibold">Push to Tally</h3>
                <p className="mt-1 text-xs text-muted-foreground">Enter the Tally voucher number to confirm</p>
              </div>
              <button onClick={() => setTallyDialogOpen(false)} className="size-8 grid place-items-center rounded-lg hover:bg-white/10 transition-colors">
                <X className="size-4" />
              </button>
            </div>
            <div>
              <Label className="wms-form-label">Tally Voucher Number</Label>
              <Input
                value={tallyVoucherInput}
                onChange={(event) => setTallyVoucherInput(event.target.value.toUpperCase())}
                placeholder="e.g. TV-2026-0001"
                className="wms-control mt-1 h-11 border px-3"
                autoFocus
                onKeyDown={(event) => { if (event.key === "Enter") confirmPushToTally(); }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setTallyDialogOpen(false)} className="rounded-xl border-white/10">
                Cancel
              </Button>
              <Button onClick={confirmPushToTally} disabled={!tallyVoucherInput.trim()} className="rounded-xl border-0 text-white gradient-primary disabled:opacity-50">
                <Send className="size-4" /> Confirm & Push
              </Button>
            </div>
          </div>
        </div>
      )}
    </WMSLayout>
  );
}

function makeLine(productId: string, products: Product[], stockLots: StockLot[]): InvoiceLineForm {
  const product = products.find((item) => item.id === productId) ?? products[0];
  const lot = stockLots.find((item) => item.productId === product?.id);
  return {
    key: lineKey(),
    productId: product?.id ?? "",
    lotId: lot?.id ?? "",
    qty: 1,
    rate: product?.sellingPrice ?? 0,
    discountPct: 0,
  };
}

function resetLinesFromStore(setLines: (lines: InvoiceLineForm[]) => void) {
  const state = useWmsStore.getState();
  setLines([makeLine(state.products[0]?.id ?? "", state.products, state.stockLots)]);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wms-form-field">
      <Label className="wms-form-label">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
