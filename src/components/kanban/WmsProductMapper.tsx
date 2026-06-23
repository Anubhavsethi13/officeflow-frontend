import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TaskProductLine } from "@/lib/mock-data";
import {
  CATEGORIES,
  PRODUCTS,
  findCategory,
  fmtINR,
  productImage,
  stockStatus,
  stockStatusColor,
  type Product,
  type ProductType,
} from "@/lib/wms-data";
import { Barcode, Boxes, PackagePlus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type ProductFilter = "all" | ProductType;

export function WmsProductMapper({
  lines,
  onChange,
}: {
  lines: TaskProductLine[];
  onChange: (lines: TaskProductLine[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      if (filter !== "all" && product.type !== filter) return false;
      if (!normalized) return true;

      const category = findCategory(product.subCategoryId)?.name ?? "";
      return `${product.name} ${product.sku} ${product.barcode} ${product.brand} ${category}`
        .toLowerCase()
        .includes(normalized);
    }).slice(0, 6);
  }, [filter, query]);

  const addProduct = (product: Product) => {
    const existing = lines.find((line) => line.productId === product.id);
    if (existing) {
      onChange(
        lines.map((line) => {
          if (line.id !== existing.id) return line;
          const quantity = line.quantity + 1;
          return { ...line, quantity, amount: quantity * line.rate };
        }),
      );
      setQuery("");
      return;
    }

    onChange([
      ...lines,
      {
        id: `line-${Date.now()}-${product.id}`,
        productId: product.id,
        quantity: 1,
        rate: product.sellingPrice,
        amount: product.sellingPrice,
      },
    ]);
    setQuery("");
  };

  const scanProduct = () => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    const exact =
      PRODUCTS.find(
        (product) =>
          product.barcode.toLowerCase() === normalized || product.sku.toLowerCase() === normalized,
      ) ?? matches[0];

    if (exact) addProduct(exact);
  };

  const updateLine = (
    lineId: string,
    patch: Partial<Pick<TaskProductLine, "quantity" | "rate">>,
  ) => {
    onChange(
      lines.map((line) => {
        if (line.id !== lineId) return line;
        const quantity = patch.quantity ?? line.quantity;
        const rate = patch.rate ?? line.rate;
        return { ...line, quantity, rate, amount: quantity * rate };
      }),
    );
  };

  return (
    <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Boxes className="size-4 text-[color:var(--secondary)]" />
            WMS Product Mapping
          </div>
          <div className="text-xs text-muted-foreground">
            {lines.length} linked SKU{lines.length === 1 ? "" : "s"} - {fmtINR(total)}
          </div>
        </div>
        <div className="flex rounded-lg bg-white/5 p-1">
          {(["all", "hardware", "consumable"] as ProductFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-md px-2.5 py-1 text-xs capitalize transition-colors ${
                filter === value ? "bg-white/15 text-foreground" : "text-muted-foreground"
              }`}
            >
              {value === "consumable" ? "rolls" : value}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                scanProduct();
              }
            }}
            className="pl-9"
            placeholder="Scan barcode or search SKU / product"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={scanProduct}
          className="border-white/10 bg-transparent"
        >
          <Barcode className="size-4" />
          Scan
        </Button>
      </div>

      {query.trim() && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {matches.map((product) => {
            const category = CATEGORIES.find((item) => item.id === product.subCategoryId);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-left transition-colors hover:bg-white/10"
              >
                <img
                  src={productImage(product)}
                  alt={product.name}
                  className="size-10 rounded-lg"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {product.sku} - {category?.name ?? product.type}
                  </span>
                </span>
                <PackagePlus className="size-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
          {matches.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
              No WMS products found.
            </div>
          )}
        </div>
      )}

      {lines.length > 0 && (
        <div className="mt-4 space-y-2">
          {lines.map((line) => {
            const product = PRODUCTS.find((item) => item.id === line.productId);
            if (!product) return null;
            const status = stockStatus(product);
            return (
              <div
                key={line.id}
                className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 lg:grid-cols-[1fr_84px_110px_110px_auto] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={productImage(product)}
                    alt={product.name}
                    className="size-10 rounded-lg"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{product.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                      <span>{product.sku}</span>
                      <span className={`rounded-full px-1.5 py-0.5 ${stockStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Qty</Label>
                  <Input
                    type="number"
                    min={0}
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.id, { quantity: Number(event.target.value) })
                    }
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Rate</Label>
                  <Input
                    type="number"
                    min={0}
                    value={line.rate}
                    onChange={(event) => updateLine(line.id, { rate: Number(event.target.value) })}
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Amount</Label>
                  <div className="mt-1 flex h-8 items-center rounded-md border border-input px-2 text-sm">
                    {fmtINR(line.amount)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(lines.filter((item) => item.id !== line.id))}
                  className="size-8 justify-self-end text-[color:var(--destructive)]"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
