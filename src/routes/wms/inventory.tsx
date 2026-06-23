import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { getLocationDisplay, useWmsStore } from "@/lib/wms-store";
import { fmtINR, productImage, stockStatus, stockStatusColor } from "@/lib/wms-data";
import { Boxes, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const Route = createFileRoute("/wms/inventory")({
  head: () => ({ meta: [{ title: "Inventory - WMS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const products = useWmsStore((state) => state.products);
  const categories = useWmsStore((state) => state.categories);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return products.filter((product) => {
      const lots = stockLots.filter((lot) => lot.productId === product.id);
      const lotLocations = lots.map((lot) => getLocationDisplay(locations, lot.locationId)).join(" ");
      const categoryName = categories.find((item) => item.id === product.subCategoryId)?.name ?? "";
      const currentStatus = stockStatus(product);
      if (category !== "all" && product.categoryId !== category && product.subCategoryId !== category) return false;
      if (status !== "all" && currentStatus !== status) return false;
      if (location !== "all" && !lots.some((lot) => lot.locationId === location || getLocationDisplay(locations, lot.locationId).includes(locations.find((item) => item.id === location)?.name ?? ""))) return false;
      if (needle && !`${product.name} ${product.sku} ${product.barcode} ${product.brand} ${categoryName} ${lotLocations}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [products, stockLots, locations, categories, query, category, status, location]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedInventory = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const stockLocations = locations.filter((item) => ["Store Room", "Zone", "Rack", "Shelf", "Bin"].includes(item.type));

  return (
    <WMSLayout title="Inventory" subtitle="Live stock across all racks, shelves and bins">
      <div className="mb-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="wms-search-field flex h-11 items-center gap-2 rounded-xl border px-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            placeholder="Search product, SKU, category, rack, shelf, bin"
          />
        </div>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setCurrentPage(1); }} className="h-10 rounded-xl border border-white/10 bg-transparent px-3 text-sm">
          <option value="all">All Categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setCurrentPage(1); }} className="h-10 rounded-xl border border-white/10 bg-transparent px-3 text-sm">
          <option value="all">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Overstock">Overstock</option>
        </select>
        <select value={location} onChange={(event) => { setLocation(event.target.value); setCurrentPage(1); }} className="h-10 rounded-xl border border-white/10 bg-transparent px-3 text-sm">
          <option value="all">All Locations</option>
          {stockLocations.map((item) => (
            <option key={item.id} value={item.id}>{item.code}</option>
          ))}
        </select>
        <Button variant="outline" className="rounded-xl border-white/10 bg-transparent" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); setLocation("all"); }}>
          Clear
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3 text-right">Reserved</th>
              <th className="p-3 text-left">Rack / Shelf / Bin</th>
              <th className="p-3 text-right">Stock Value</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((product) => {
              const lots = stockLots.filter((lot) => lot.productId === product.id);
              const currentStatus = stockStatus(product);
              return (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={productImage(product)} className="size-9 rounded-lg" alt={product.name} />
                      <div>
                        <div className="max-w-[230px] truncate font-medium">{product.name}</div>
                        <div className="text-[10px] text-muted-foreground">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{categories.find((item) => item.id === product.subCategoryId)?.name}</td>
                  <td className="p-3 text-right font-medium">{product.currentStock} {product.unit}</td>
                  <td className="p-3 text-right">{Math.max(0, product.currentStock - product.reservedStock)}</td>
                  <td className="p-3 text-right text-muted-foreground">{product.reservedStock}</td>
                  <td className="p-3 text-xs">
                    {lots.length === 0 ? (
                      <span className="text-muted-foreground">Unassigned</span>
                    ) : (
                      <div className="flex max-w-md flex-wrap gap-1">
                        {lots.slice(0, 4).map((lot) => (
                          <span key={lot.id} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                            <MapPin className="size-3" /> {getLocationDisplay(locations, lot.locationId)} / {lot.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">{fmtINR(product.currentStock * product.purchasePrice)}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-[10px] ${stockStatusColor(currentStatus)}`}>{currentStatus}</span></td>
                  <td className="p-3 text-right">
                    <a href={`/wms/3d-view?product=${product.id}`} className="inline-grid size-8 place-items-center rounded-lg hover:bg-white/10" title="Show in 3D location view">
                      <Boxes className="size-4" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-white/5 p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </WMSLayout>
  );
}
