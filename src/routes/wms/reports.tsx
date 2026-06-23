import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { downloadText, getLocationDisplay, toCsv, useWmsStore } from "@/lib/wms-store";
import { fmtINR, stockStatus } from "@/lib/wms-data";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, Download, FileBarChart2, Replace, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wms/reports")({
  head: () => ({ meta: [{ title: "Reports - WMS" }] }),
  component: ReportsPage,
});

const reportMeta = {
  stock: { title: "Current Stock", icon: Boxes, desc: "On-hand quantity, value and stock status." },
  category: { title: "Category-wise Stock", icon: TrendingUp, desc: "Units and value grouped by category." },
  low: { title: "Low / Out Stock", icon: AlertTriangle, desc: "Items needing purchase action." },
  inward: { title: "Stock In", icon: ArrowDownToLine, desc: "Vendor inward movement history." },
  outward: { title: "Stock Out", icon: ArrowUpFromLine, desc: "Customer and department issues." },
  transfer: { title: "Transfers", icon: Replace, desc: "Location-to-location movements." },
  valuation: { title: "Stock Valuation", icon: FileBarChart2, desc: "Purchase and selling value." },
};

type ReportKey = keyof typeof reportMeta;

function ReportsPage() {
  const products = useWmsStore((state) => state.products);
  const categories = useWmsStore((state) => state.categories);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const movements = useWmsStore((state) => state.movements);
  const vendors = useWmsStore((state) => state.vendors);
  const customers = useWmsStore((state) => state.customers);
  const [activeReport, setActiveReport] = useState<ReportKey>("stock");

  const reports = useMemo(() => {
    const stockRows = products.map((product) => ({
      Product: product.name,
      SKU: product.sku,
      Category: categories.find((category) => category.id === product.subCategoryId)?.name ?? "",
      Stock: product.currentStock,
      Unit: product.unit,
      Status: stockStatus(product),
      PurchaseValue: product.currentStock * product.purchasePrice,
      SellingValue: product.currentStock * product.sellingPrice,
      Locations: stockLots.filter((lot) => lot.productId === product.id).map((lot) => `${getLocationDisplay(locations, lot.locationId)} (${lot.quantity})`).join("; "),
    }));
    const categoryRows = categories
      .filter((category) => category.parentId)
      .map((category) => {
        const categoryProducts = products.filter((product) => product.subCategoryId === category.id);
        return {
          Category: category.name,
          SKUs: categoryProducts.length,
          Units: categoryProducts.reduce((sum, product) => sum + product.currentStock, 0),
          PurchaseValue: categoryProducts.reduce((sum, product) => sum + product.currentStock * product.purchasePrice, 0),
        };
      });
    const lowRows = stockRows.filter((row) => row.Status !== "In Stock");
    const movementRows = movements.map((movement) => ({
      Number: movement.number,
      Type: movement.type,
      Date: movement.date,
      Product: products.find((product) => product.id === movement.productId)?.name ?? movement.productId,
      Quantity: movement.quantity,
      From: movement.fromLocationId ? getLocationDisplay(locations, movement.fromLocationId) : "",
      To: movement.toLocationId ? getLocationDisplay(locations, movement.toLocationId) : "",
      Vendor: vendors.find((vendor) => vendor.id === movement.vendorId)?.name ?? "",
      Customer: customers.find((customer) => customer.id === movement.customerId)?.company ?? "",
      Reference: movement.reference ?? "",
      Remarks: movement.remarks ?? "",
    }));
    const valuationRows = products.map((product) => ({
      Product: product.name,
      SKU: product.sku,
      Units: product.currentStock,
      PurchaseRate: product.purchasePrice,
      SellingRate: product.sellingPrice,
      PurchaseValue: product.currentStock * product.purchasePrice,
      SellingValue: product.currentStock * product.sellingPrice,
      MarginValue: product.currentStock * (product.sellingPrice - product.purchasePrice),
    }));
    return {
      stock: stockRows,
      category: categoryRows,
      low: lowRows,
      inward: movementRows.filter((row) => row.Type === "IN"),
      outward: movementRows.filter((row) => row.Type === "OUT"),
      transfer: movementRows.filter((row) => row.Type === "TRANSFER"),
      valuation: valuationRows,
    };
  }, [categories, customers, locations, movements, products, stockLots, vendors]);

  const byType = ["IN", "OUT", "TRANSFER"].map((type) => ({ type, count: movements.filter((movement) => movement.type === type).length }));
  const max = Math.max(1, ...byType.map((item) => item.count));
  const activeRows = reports[activeReport];

  const exportReport = (key: ReportKey) => {
    downloadText(`wms-${key}-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(reports[key]), "text/csv;charset=utf-8");
    toast.success(`${reportMeta[key].title} report downloaded.`);
  };

  return (
    <WMSLayout title="Reports & Analytics" subtitle="Inventory, movement and valuation reports">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total SKUs" value={products.length} />
        <Kpi label="Low Stock" value={products.filter((product) => stockStatus(product) === "Low Stock").length} tone="warn" />
        <Kpi label="Out of Stock" value={products.filter((product) => stockStatus(product) === "Out of Stock").length} tone="bad" />
        <Kpi label="Stock Value" value={fmtINR(products.reduce((sum, product) => sum + product.currentStock * product.purchasePrice, 0))} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <h3 className="mb-4 font-display font-semibold">Movement Summary</h3>
          <div className="space-y-3">
            {byType.map((item) => (
              <div key={item.type}>
                <div className="mb-1.5 flex justify-between text-xs"><span>{item.type}</span><span className="text-muted-foreground">{item.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600" style={{ width: `${(item.count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <h3 className="mb-4 font-display font-semibold">Top Stock Value Products</h3>
          <div className="space-y-2">
            {[...products].sort((a, b) => b.currentStock * b.purchasePrice - a.currentStock * a.purchasePrice).slice(0, 6).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-white/5">
                <span className="truncate">{product.name}</span>
                <span className="text-muted-foreground">{fmtINR(product.currentStock * product.purchasePrice)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(reportMeta) as ReportKey[]).map((key) => {
          const meta = reportMeta[key];
          return (
            <button key={key} onClick={() => setActiveReport(key)} className={`rounded-2xl border p-5 text-left transition-all ${activeReport === key ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[0.045] hover:bg-white/10"}`}>
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600">
                <meta.icon className="size-5 text-white" />
              </div>
              <div className="font-display font-semibold">{meta.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{meta.desc}</p>
              <div className="mt-3 text-xs text-muted-foreground">{reports[key].length} rows</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.045]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display font-semibold">{reportMeta[activeReport].title} Preview</h3>
            <div className="text-xs text-muted-foreground">Showing first 12 rows</div>
          </div>
          <Button variant="outline" onClick={() => exportReport(activeReport)} className="rounded-xl border-white/10 bg-transparent">
            <Download className="size-4" /> Download CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-xs text-muted-foreground">
              <tr>
                {Object.keys(activeRows[0] ?? { Empty: "" }).map((header) => (
                  <th key={header} className="p-3 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeRows.slice(0, 12).map((row, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex} className="max-w-[320px] truncate p-3">{typeof value === "number" && value > 999 ? value.toLocaleString("en-IN") : String(value ?? "")}</td>
                  ))}
                </tr>
              ))}
              {activeRows.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-muted-foreground">No data available for this report.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WMSLayout>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string | number; tone?: "warn" | "bad" }) {
  const color = tone === "bad" ? "from-rose-500 to-red-500" : tone === "warn" ? "from-amber-500 to-orange-500" : "from-emerald-500 to-cyan-600";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className={`absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`} />
      <div className="relative truncate text-2xl font-bold font-display">{value}</div>
      <div className="relative mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
