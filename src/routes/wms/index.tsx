import { createFileRoute, Link } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import {
  STOCK_REQUESTS,
  fmtINR,
  stockStatus,
  stockStatusColor,
} from "@/lib/wms-data";
import { getLocationDisplay, locationPercent, useWmsStore } from "@/lib/wms-store";
import {
  Package, Boxes, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, XCircle,
  TrendingUp, Activity, Plus, Search, Replace, MapPin, QrCode, FileBarChart2,
  Warehouse, Box as BoxIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/wms/")({
  head: () => ({ meta: [{ title: "WMS Dashboard - officeflow" }] }),
  component: WMSDashboard,
});

function WMSDashboard() {
  const products = useWmsStore((state) => state.products);
  const categories = useWmsStore((state) => state.categories);
  const movements = useWmsStore((state) => state.movements);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const vendors = useWmsStore((state) => state.vendors);
  const customers = useWmsStore((state) => state.customers);
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const lowStockItems = products.filter((product) => stockStatus(product) === "Low Stock");
  const outOfStockItems = products.filter((product) => stockStatus(product) === "Out of Stock");
  const todayIn = movements.filter(m => m.type === "IN" && m.date === today).length;
  const todayOut = movements.filter(m => m.type === "OUT" && m.date === today).length;
  const totalStockValue = products.reduce((sum, product) => sum + product.currentStock * product.purchasePrice, 0);
  const stockOfType = (type: "hardware" | "consumable") =>
    products.filter((product) => product.type === type).reduce((sum, product) => sum + product.currentStock * product.purchasePrice, 0);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "from-emerald-500 to-cyan-600" },
    { label: "Stock Value", value: fmtINR(totalStockValue), icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
    { label: "Hardware Stock", value: fmtINR(stockOfType("hardware")), icon: Boxes, color: "from-sky-500 to-blue-500" },
    { label: "Consumable Stock", value: fmtINR(stockOfType("consumable")), icon: Boxes, color: "from-amber-500 to-orange-500" },
    { label: "Low Stock", value: lowStockItems.length, icon: AlertTriangle, color: "from-yellow-500 to-orange-500" },
    { label: "Out of Stock", value: outOfStockItems.length, icon: XCircle, color: "from-rose-500 to-red-500" },
    { label: "Today's Stock In", value: todayIn, icon: ArrowDownToLine, color: "from-cyan-500 to-blue-500" },
    { label: "Today's Stock Out", value: todayOut, icon: ArrowUpFromLine, color: "from-pink-500 to-fuchsia-500" },
  ];

  const quick = [
    { to: "/wms/products", label: "Add Product", icon: Plus },
    { to: "/wms/stock-in", label: "Stock In", icon: ArrowDownToLine },
    { to: "/wms/stock-out", label: "SI / Stock Out", icon: ArrowUpFromLine },
    { to: "/wms/stock-transfer", label: "Transfer", icon: Replace },
    { to: "/wms/locations", label: "Locations", icon: MapPin },
    { to: "/wms/3d-view", label: "3D View", icon: BoxIcon },
    { to: "/wms/categories", label: "Categories", icon: Package },
    { to: "/wms/reports", label: "Reports", icon: FileBarChart2 },
  ];

  return (
    <WMSLayout title="Warehouse Dashboard" subtitle={`Overview as of ${today}`}>
      {/* Hero + search */}
      <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 size-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
            <Warehouse className="size-3.5" /> Warehouse Management
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold">
            Real-time view of <span className="gradient-text">stock & locations</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track every roll, cartridge, printer and SSD across rooms, racks and bins. Search instantly,
            scan QR codes, and keep the warehouse optimised.
          </p>
          <div className="mt-5 max-w-xl flex items-center gap-2 glass rounded-2xl px-4 h-12">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && search.trim()) window.location.href = `/wms/products`;
              }}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search product, SKU, barcode, location, vendor, invoice..."
            />
            <button onClick={() => { window.location.href = "/wms/products"; }} className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 grid place-items-center" title="Open product search">
              <QrCode className="size-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {quick.map(q => (
          <Link key={q.to} to={q.to} className="glass rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:border-white/30 hover:translate-y-[-2px] transition-all">
            <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500/80 to-blue-600/80 grid place-items-center">
              <q.icon className="size-4 text-white" />
            </div>
            <div className="text-[11px] text-center text-muted-foreground">{q.label}</div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 size-28 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl`} />
            <div className={`relative size-10 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-3`}>
              <s.icon className="size-5 text-white" />
            </div>
            <div className="relative text-2xl font-display font-bold truncate">{s.value}</div>
            <div className="relative text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Recent movements */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><Activity className="size-4" /> Recent Stock Movements</h3>
            <Link to="/wms/reports" className="text-xs text-[color:var(--secondary)] hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {movements.slice().reverse().slice(0, 8).map(m => {
              const p = products.find(product => product.id === m.productId);
              const tone = m.type === "IN" ? "from-emerald-500 to-teal-500"
                : m.type === "OUT" ? "from-rose-500 to-red-500"
                : "from-amber-500 to-orange-500";
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`size-9 rounded-xl bg-gradient-to-br ${tone} grid place-items-center text-white text-[10px] font-bold`}>{m.type}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p?.name ?? m.productId}</div>
                    <div className="text-xs text-muted-foreground">{m.number} · Qty {m.quantity} · {m.date}</div>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {m.fromLocationId && `From ${getLocationDisplay(locations, m.fromLocationId)}`}
                    {m.fromLocationId && m.toLocationId && " -> "}
                    {m.toLocationId && `To ${getLocationDisplay(locations, m.toLocationId)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4 text-[color:var(--warning)]" /> Low / Out of Stock
          </h3>
          <div className="space-y-2">
            {[...lowStockItems, ...outOfStockItems].slice(0, 6).map(p => {
              const s = stockStatus(p);
              return (
                <Link key={p.id} to="/wms/inventory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku} · Stock {p.currentStock} {p.unit}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${stockStatusColor(s)}`}>{s}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category-wise + occupancy */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Category-wise Stock</h3>
          <div className="space-y-3">
            {categories.filter(c => c.parentId).slice(0, 8).map(c => {
              const prods = products.filter(p => p.subCategoryId === c.id);
              const total = prods.reduce((s, p) => s + p.currentStock, 0);
              const max = 600;
              const pct = Math.min(100, (total / max) * 100);
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-foreground/80">{c.name}</span>
                    <span className="text-muted-foreground">{total} units · {prods.length} SKUs</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Warehouse Occupancy</h3>
          <div className="space-y-3">
            {locations.filter(l => ["Store Room", "Zone", "Rack"].includes(l.type)).slice(0, 8).map(l => {
              const pct = locationPercent(locations, stockLots, l);
              const tone = pct > 85 ? "from-rose-500 to-red-500" : pct > 60 ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500";
              return (
                <div key={l.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span>{l.name} <span className="text-muted-foreground">· {l.code}</span></span>
                    <span className="text-muted-foreground">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vendors + customers + requests */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Top Vendors</h3>
          <div className="space-y-2">
            {vendors.map(v => (
              <div key={v.id} className="text-sm flex justify-between"><span>{v.name}</span><span className="text-muted-foreground text-xs">{v.city}</span></div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Active Customers</h3>
          <div className="space-y-2">
            {customers.map(c => (
              <div key={c.id} className="text-sm flex justify-between"><span>{c.company}</span><span className="text-muted-foreground text-xs">{c.city}</span></div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {STOCK_REQUESTS.map(r => (
              <div key={r.id} className="text-sm">
                <div className="font-medium">{r.number} · {products.find(product => product.id === r.productId)?.name}</div>
                <div className="text-xs text-muted-foreground">{r.requestedBy} · {r.qty} pcs · {r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WMSLayout>
  );
}
