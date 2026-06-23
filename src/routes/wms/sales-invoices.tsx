import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Download,
  FileDown,
  FileText,
  IndianRupee,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { WMSLayout } from "@/components/wms/WMSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadSalesInvoicePdf } from "@/lib/sales-invoice-pdf";
import { downloadText, toCsv, useWmsStore } from "@/lib/wms-store";
import { fmtINR, type SalesInvoice } from "@/lib/wms-data";

export const Route = createFileRoute("/wms/sales-invoices")({
  head: () => ({ meta: [{ title: "Sales Invoices - WMS" }] }),
  component: SalesInvoicesPage,
});

type InvoiceStatusFilter = "all" | SalesInvoice["status"];

function SalesInvoicesPage() {
  const invoices = useWmsStore((state) => state.salesInvoices);
  const customers = useWmsStore((state) => state.customers);
  const markSalesInvoicePdfGenerated = useWmsStore((state) => state.markSalesInvoicePdfGenerated);
  const pushSalesInvoiceToTally = useWmsStore((state) => state.pushSalesInvoiceToTally);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatusFilter>("all");
  const [pushInvoiceId, setPushInvoiceId] = useState<string | null>(null);
  const [tallyVoucherInput, setTallyVoucherInput] = useState("");
  const pushInvoice = invoices.find((invoice) => invoice.id === pushInvoiceId);

  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort((a, b) => {
        const byCreated = b.createdAt.localeCompare(a.createdAt);
        return byCreated || b.number.localeCompare(a.number);
      }),
    [invoices],
  );

  const filteredInvoices = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sortedInvoices.filter((invoice) => {
      const customer = customers.find((item) => item.id === invoice.customerId);
      const invoiceStatus = getInvoiceStatus(invoice);
      const haystack = [
        invoice.number,
        invoice.date,
        invoice.dueDate,
        invoiceStatus,
        statusLabel(invoice),
        invoice.tallyVoucherNumber,
        invoice.ewayBillNumber,
        invoice.customerGstNumber,
        invoice.placeOfSupply,
        customer?.company,
        customer?.contactPerson,
        customer?.phone,
        customer?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (status !== "all" && invoiceStatus !== status) return false;
      return !needle || haystack.includes(needle);
    });
  }, [customers, query, sortedInvoices, status]);

  const summary = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);

    return {
      total: invoices.length,
      pushed: invoices.filter((invoice) => getInvoiceStatus(invoice) === "pushed").length,
      pdfGenerated: invoices.filter((invoice) => getInvoiceStatus(invoice) === "pdf_generated").length,
      draft: invoices.filter((invoice) => getInvoiceStatus(invoice) === "draft").length,
      monthValue: invoices
        .filter((invoice) => invoice.date.startsWith(monthKey))
        .reduce((sum, invoice) => sum + invoice.grandTotal, 0),
    };
  }, [invoices]);

  const exportCsv = () => {
    if (filteredInvoices.length === 0) {
      toast.info("No sales invoices to export.");
      return;
    }

    const rows = filteredInvoices.map((invoice) => {
      const customer = customers.find((item) => item.id === invoice.customerId);
      return {
        Number: invoice.number,
        Date: invoice.date,
        Customer: customer?.company ?? invoice.customerId,
        GSTIN: invoice.customerGstNumber,
        Status: statusLabel(invoice),
        TallyVoucher: invoice.tallyVoucherNumber ?? "",
        PDFGenerated: invoice.pdfGenerated ? "Yes" : "No",
        EwayBill: invoice.ewayBillNumber ?? "",
        Lines: invoice.lines.length,
        Taxable: invoice.taxableTotal,
        CGST: invoice.cgstTotal,
        SGST: invoice.sgstTotal,
        IGST: invoice.igstTotal,
        GrandTotal: invoice.grandTotal,
        DueDate: invoice.dueDate ?? "",
        CreatedAt: invoice.createdAt,
      };
    });

    downloadText(
      `sales-invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
      "text/csv;charset=utf-8",
    );
    toast.success("Sales invoices exported.");
  };

  const downloadPdf = (invoice: SalesInvoice) => {
    const customer = customers.find((item) => item.id === invoice.customerId);

    if (!customer) {
      toast.error("Customer details are missing for this invoice.");
      return;
    }

    downloadSalesInvoicePdf(invoice, customer);
    markSalesInvoicePdfGenerated(invoice.id);
    toast.success(`${invoice.number} PDF downloaded.`);
  };

  const openPushDialog = (invoice: SalesInvoice) => {
    setPushInvoiceId(invoice.id);
    setTallyVoucherInput(invoice.tallyVoucherNumber ?? "");
  };

  const closePushDialog = () => {
    setPushInvoiceId(null);
    setTallyVoucherInput("");
  };

  const confirmPushToTally = () => {
    if (!pushInvoice) {
      toast.error("Select a sales invoice first.");
      return;
    }

    const result = pushSalesInvoiceToTally(pushInvoice.id, tallyVoucherInput);
    toast[result.ok ? "success" : "error"](result.message);
    if (result.ok) closePushDialog();
  };

  return (
    <WMSLayout
      title="Sales Invoices"
      subtitle="Created sales invoices, Tally status and PDF downloads"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={FileText} label="Created Invoices" value={summary.total} />
        <Kpi icon={IndianRupee} label="This Month Value" value={fmtINR(summary.monthValue)} />
        <Kpi icon={Send} label="Pushed to Tally" value={summary.pushed} tone="good" />
        <Kpi icon={CalendarDays} label="PDF Generated" value={summary.pdfGenerated} tone="warn" />
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 xl:flex-row xl:items-center">
        <div className="wms-search-field flex h-11 min-w-[240px] flex-1 items-center gap-2 rounded-xl border px-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            placeholder="Search invoice, customer, GSTIN, Tally voucher"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as InvoiceStatusFilter)}
          className="h-10 rounded-xl border border-white/10 bg-transparent px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pdf_generated">PDF Generated</option>
          <option value="pushed">Pushed to Tally</option>
        </select>
        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-transparent"
          onClick={() => {
            setQuery("");
            setStatus("all");
          }}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          onClick={exportCsv}
          className="rounded-xl border-white/10 bg-transparent"
        >
          <Download className="size-4" /> Export CSV
        </Button>
        <Button asChild className="rounded-xl border-0 text-white gradient-primary">
          <Link to="/wms/stock-out">
            <Plus className="size-4" /> New SI
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-left">SI Number</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Lines</th>
              <th className="p-3 text-right">Taxable</th>
              <th className="p-3 text-right">GST</th>
              <th className="p-3 text-right">Grand Total</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => {
              const customer = customers.find((item) => item.id === invoice.customerId);
              const gstTotal = invoice.cgstTotal + invoice.sgstTotal + invoice.igstTotal;
              const invoiceStatus = getInvoiceStatus(invoice);

              return (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium">{invoice.number}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Created {formatDate(invoice.createdAt)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="max-w-[230px] truncate font-medium">
                      {customer?.company ?? "Unknown customer"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {invoice.customerGstNumber || "GSTIN not entered"}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{invoice.date}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Due {invoice.dueDate ?? "-"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${statusClass(invoiceStatus)}`}
                    >
                      {statusLabel(invoice)}
                    </span>
                  </td>
                  <td className="p-3 text-right">{invoice.lines.length}</td>
                  <td className="p-3 text-right">{fmtINR(invoice.taxableTotal)}</td>
                  <td className="p-3 text-right">{fmtINR(gstTotal)}</td>
                  <td className="p-3 text-right font-semibold">{fmtINR(invoice.grandTotal)}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {invoice.tallyVoucherNumber ? (
                      <span>Tally: {invoice.tallyVoucherNumber}</span>
                    ) : invoice.ewayBillNumber ? (
                      <span>E-way: {invoice.ewayBillNumber}</span>
                    ) : (
                      <span>{invoice.pdfGenerated ? "PDF generated" : "Not pushed"}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {invoiceStatus !== "pushed" && (
                        <button
                          onClick={() => openPushDialog(invoice)}
                          className="inline-grid size-8 place-items-center rounded-lg hover:bg-white/10"
                          title={`Push ${invoice.number} to Tally`}
                        >
                          <Send className="size-4" />
                        </button>
                      )}
                      <button
                        onClick={() => downloadPdf(invoice)}
                        className="inline-grid size-8 place-items-center rounded-lg hover:bg-white/10"
                        title={`Download ${invoice.number} PDF`}
                      >
                        <FileDown className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8">
                  <div className="mx-auto max-w-md text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-xl bg-white/10">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold">
                      {invoices.length === 0
                        ? "No sales invoices created yet"
                        : "No matching sales invoices"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invoices.length === 0
                        ? "Create an SI from Stock Out and it will appear here with totals, status and PDF actions."
                        : "Adjust the search or status filter to see more invoices."}
                    </p>
                    {invoices.length === 0 && (
                      <Button
                        asChild
                        className="mt-4 rounded-xl border-0 text-white gradient-primary"
                      >
                        <Link to="/wms/stock-out">
                          <Plus className="size-4" /> Create Sales Invoice
                        </Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pushInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePushDialog} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(var(--card))] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Push to Tally</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pushInvoice.number} - enter the Tally voucher number
                </p>
              </div>
              <button onClick={closePushDialog} className="grid size-8 place-items-center rounded-lg hover:bg-white/10">
                <X className="size-4" />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tally Voucher Number</label>
              <Input
                value={tallyVoucherInput}
                onChange={(event) => setTallyVoucherInput(event.target.value.toUpperCase())}
                placeholder="e.g. TV-2026-0001"
                className="mt-1 h-11 rounded-xl border px-3"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") confirmPushToTally();
                }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={closePushDialog} className="rounded-xl border-white/10">
                Cancel
              </Button>
              <Button
                onClick={confirmPushToTally}
                disabled={!tallyVoucherInput.trim()}
                className="rounded-xl border-0 text-white gradient-primary disabled:opacity-50"
              >
                <Send className="size-4" /> Confirm & Push
              </Button>
            </div>
          </div>
        </div>
      )}
    </WMSLayout>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  value: string | number;
  tone?: "good" | "warn";
}) {
  const iconClass =
    tone === "good"
      ? "from-emerald-500 to-cyan-600"
      : tone === "warn"
        ? "from-amber-500 to-orange-500"
        : "from-cyan-500 to-blue-600";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div
        className={`mb-4 grid size-10 place-items-center rounded-xl bg-gradient-to-br ${iconClass}`}
      >
        <Icon className="size-5 text-white" />
      </div>
      <div className="truncate font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function getInvoiceStatus(invoice: SalesInvoice): SalesInvoice["status"] {
  if (invoice.status === "pushed" || invoice.pushedToTally) return "pushed";
  if (invoice.status === "pdf_generated" || invoice.pdfGenerated) return "pdf_generated";
  return "draft";
}

function statusLabel(invoice: SalesInvoice) {
  const status = getInvoiceStatus(invoice);
  if (status === "pushed") return "Pushed";
  if (status === "pdf_generated") return "PDF Generated";
  return "Draft";
}

function statusClass(status: SalesInvoice["status"]) {
  if (status === "pushed") return "bg-[color:var(--success)]/15 text-[color:var(--success)]";
  if (status === "pdf_generated") return "bg-cyan-400/15 text-cyan-200";
  return "bg-amber-400/15 text-amber-200";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
