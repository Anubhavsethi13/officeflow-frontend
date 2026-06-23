import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import {
  getDescendantIds,
  getLocationDisplay,
  getLocationPath,
  stockInLocation,
  useWmsStore,
} from "@/lib/wms-store";
import { type Location, type Product, type StockLot } from "@/lib/wms-data";
import {
  Boxes,
  Crosshair,
  Layers,
  LocateFixed,
  MapPinned,
  Navigation,
  PackageSearch,
  Plus,
  QrCode,
  RotateCcw,
  Route as RouteIcon,
  ScanLine,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/wms/3d-view")({
  head: () => ({ meta: [{ title: "3D Warehouse View - WMS" }] }),
  component: ThreeDView,
});

type RackCode = "R1" | "R2" | "R3";
type RouteName = "rack" | "kitchen";
type ViewMode = "walk" | "overview";

type RackDef = {
  code: RackCode;
  key: "a1" | "b1" | "c1";
  locationId: string;
  name: string;
};

type StorageZone = {
  id: string;
  label: string;
  name: string;
  locationId: string;
  route: RouteName;
  mapX?: number;
  mapY?: number;
  mapW?: number;
  mapH?: number;
};

type BinTarget = {
  rack: RackCode;
  shelf: number;
  bin: number;
  locationId: string;
  locationLabel: string;
};

type ProductRoute = {
  product: Product;
  lots: StockLot[];
  target: BinTarget | null;
  quantity: number;
};

const RACKS: RackDef[] = [
  { code: "R1", key: "a1", locationId: "l-r-a1", name: "Rack R1" },
  { code: "R2", key: "b1", locationId: "l-r-b1", name: "Rack R2" },
  { code: "R3", key: "c1", locationId: "l-r-c1", name: "Rack R3" },
];

const STORAGE_ZONES: StorageZone[] = [
  { id: "s1", label: "S1", name: "Storage Area (S1)", locationId: "l-sr1", route: "rack" },
  { id: "s2", label: "S2", name: "Storage Zone S2", locationId: "l-sr2", route: "rack" },
  { id: "s3", label: "S3", name: "Storage Zone S3", locationId: "l-sz-s3", route: "kitchen" },
];

const STATIC_ROOM_LOCATION_IDS = new Set([
  "l-utility-toilet-nw",
  "l-sr1",
  "l-dept-support",
  "l-sr2",
  "l-dept-hardware",
  "l-cabin-kush",
  "l-cabin-rakesh",
  "l-temple",
  "l-dept-software",
  "l-dept-account",
  "l-common-lunch",
  "l-utility-toilet-se",
  "l-kitchen",
  "l-sz-s3",
  "l-rack-bay",
]);

const STORAGE_LOCATION_TYPES: Location["type"][] = ["Store Room", "Zone", "Rack", "Dispatch Area", "Receiving Area"];
const STORAGE_TYPE_OPTIONS: Location["type"][] = ["Store Room", "Zone", "Rack", "Dispatch Area", "Receiving Area"];

const storagePresets = [
  { label: "Top Left", x: 4, y: 8, w: 16, h: 12 },
  { label: "Top Right", x: 78, y: 8, w: 16, h: 12 },
  { label: "Bottom Left", x: 5, y: 72, w: 18, h: 12 },
  { label: "Bottom Right", x: 76, y: 75, w: 18, h: 12 },
  { label: "Center Bay", x: 42, y: 42, w: 18, h: 12 },
];

type StorageForm = {
  name: string;
  code: string;
  type: Location["type"];
  capacity: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const RACK_BY_KEY: Record<RackDef["key"], RackCode> = {
  a1: "R1",
  b1: "R2",
  c1: "R3",
};

const RACK_BY_LOCATION: Record<string, RackCode> = {
  "l-r-a1": "R1",
  "l-r-b1": "R2",
  "l-r-c1": "R3",
};

const DEFAULT_PRODUCT_ID = "p-ssd-1";
const OFFICE_WIDTH = 14.4;
const OFFICE_DEPTH = 18.6;
const RACK_BAY_OFFSET_X = 3.15;
const RACK_BAY_Z = -6.05;

type OfficeRoomKind = "office" | "storage" | "utility" | "kitchen" | "temple" | "table";

type OfficeRoom = {
  label: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: number;
  kind: OfficeRoomKind;
  storageId?: string;
};

const OFFICE_ROOMS: OfficeRoom[] = [
  { label: "Toilet", x: -6.0, z: -7.65, w: 1.65, d: 1.35, color: 0x6e829c, kind: "utility" },
  { label: "Storage Area (S1)", x: -5.85, z: -5.85, w: 1.95, d: 2.15, color: 0x2379ac, kind: "storage", storageId: "l-sr1" },
  { label: "Support Department", x: -4.75, z: -2.8, w: 3.95, d: 2.15, color: 0x243b58, kind: "office" },
  { label: "Storage Zone S2", x: -4.75, z: -0.9, w: 3.95, d: 0.85, color: 0x2399d1, kind: "storage", storageId: "l-sr2" },
  { label: "Hardware Department", x: -4.75, z: 0.95, w: 3.95, d: 2.0, color: 0x22344d, kind: "office" },
  { label: "Kush Sir Cabin", x: -4.9, z: 3.35, w: 4.15, d: 1.55, color: 0x293c52, kind: "office" },
  { label: "Rakesh Sir Cabin", x: -4.75, z: 5.9, w: 4.45, d: 2.35, color: 0x28384c, kind: "office" },
  { label: "Temple", x: 6.0, z: -7.65, w: 1.65, d: 1.35, color: 0x7a5c27, kind: "temple" },
  { label: "Software Department", x: 4.5, z: -2.65, w: 4.6, d: 2.0, color: 0x203c5e, kind: "office" },
  { label: "Account Department", x: 4.5, z: -0.15, w: 4.6, d: 2.05, color: 0x26324e, kind: "office" },
  { label: "Lunch Table", x: 2.8, z: 3.25, w: 2.35, d: 1.55, color: 0x4a3b2b, kind: "table" },
  { label: "Toilet", x: 2.55, z: 5.05, w: 2.05, d: 1.45, color: 0x6e829c, kind: "utility" },
  { label: "Kitchen", x: 5.75, z: 4.85, w: 2.0, d: 2.9, color: 0x344d45, kind: "kitchen" },
  { label: "Storage Zone S3", x: 5.75, z: 6.7, w: 1.75, d: 1.05, color: 0x1d9b65, kind: "storage", storageId: "l-sz-s3" },
];

function ThreeDView() {
  const products = useWmsStore((state) => state.products);
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const addLocation = useWmsStore((state) => state.addLocation);
  const [q, setQ] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(DEFAULT_PRODUCT_ID);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [cameraResetToken, setCameraResetToken] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [storageForm, setStorageForm] = useState<StorageForm>(() => blankStorageForm(1));

  const productRoutes = useMemo(
    () => buildProductRoutes(products, stockLots, locations),
    [locations, products, stockLots],
  );

  const storageZones = useMemo(() => buildStorageZones(locations), [locations]);
  const customStorageRooms = useMemo(() => buildCustomStorageRooms(locations), [locations]);
  const selectedLocation = useMemo(
    () => (selectedLocationId ? locations.find((location) => location.id === selectedLocationId) ?? null : null),
    [locations, selectedLocationId],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    const location = params.get("location");
    const defaultProduct = productRoutes.find((route) => route.product.id === DEFAULT_PRODUCT_ID) ?? productRoutes[0];

    if (product) {
      setSelectedProductId(product);
      setSelectedLocationId(null);
      return;
    }

    if (location) {
      setSelectedLocationId(location);
      setSelectedProductId(null);
      return;
    }

    const selectedProductExists = productRoutes.some((route) => route.product.id === selectedProductId);
    if ((!selectedProductId || !selectedProductExists) && !selectedLocationId && defaultProduct) {
      setSelectedProductId(defaultProduct.product.id);
    }
  }, [productRoutes, selectedLocationId, selectedProductId]);

  const selectedRoute = useMemo(
    () => productRoutes.find((route) => route.product.id === selectedProductId) ?? null,
    [productRoutes, selectedProductId],
  );

  useEffect(() => {
    if (!selectedRoute) {
      setSelectedLotId(null);
      return;
    }
    if (!selectedRoute.lots.some((lot) => lot.id === selectedLotId)) {
      setSelectedLotId(selectedRoute.lots[0]?.id ?? null);
    }
  }, [selectedLotId, selectedRoute]);

  const selectedLot = useMemo(() => {
    if (!selectedRoute) return null;
    return selectedRoute.lots.find((lot) => lot.id === selectedLotId) ?? selectedRoute.lots[0] ?? null;
  }, [selectedLotId, selectedRoute]);

  const selectedTarget = useMemo(() => {
    if (selectedLot) return parseBinTarget(locations, selectedLot.locationId);
    if (selectedLocationId) return parseBinTarget(locations, selectedLocationId);
    return null;
  }, [locations, selectedLocationId, selectedLot]);

  const selectedZone = useMemo(
    () => storageZones.find((zone) => zone.locationId === selectedLocationId) ?? null,
    [selectedLocationId, storageZones],
  );

  const highlightedLocationIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedRoute) {
      selectedRoute.lots.forEach((lot) => {
        getLocationPath(locations, lot.locationId).forEach((location) => ids.add(location.id));
        ids.add(lot.locationId);
      });
    }
    if (selectedLocationId) {
      getDescendantIds(locations, selectedLocationId).forEach((id) => ids.add(id));
      getLocationPath(locations, selectedLocationId).forEach((location) => ids.add(location.id));
    }
    return ids;
  }, [locations, selectedLocationId, selectedRoute]);

  const productMatches = useMemo(() => {
    const value = q.trim().toLowerCase();
    if (!value) return productRoutes;
    return productRoutes.filter(({ product }) =>
      `${product.name} ${product.sku} ${product.barcode} ${product.brand}`.toLowerCase().includes(value),
    );
  }, [productRoutes, q]);

  const targetTitle = selectedRoute?.product.name ?? selectedZone?.name ?? "Select a demo product";
  const targetMeta = selectedTarget
    ? `${selectedTarget.rack} / Shelf ${selectedTarget.shelf} / Bin ${selectedTarget.bin}`
    : selectedZone
      ? `${selectedZone.label} / storage zone`
      : "Route and target will appear in the scene";
  const targetCode = selectedTarget
    ? `${selectedTarget.rack}-S${selectedTarget.shelf}-B${selectedTarget.bin}`
    : selectedZone?.label ?? "Ready";
  const targetQuantity = selectedRoute
    ? `${selectedRoute.quantity} ${selectedRoute.product.unit}`
    : selectedZone
      ? `${stockInLocation(locations, stockLots, selectedZone.locationId)} units`
      : "-";
  const targetRoute = selectedZone?.route === "kitchen" ? "Gate 1 -> S3" : "Gate 1 -> Rack bay";
  const targetContext = selectedRoute
    ? `${selectedRoute.product.sku} / HSN ${selectedRoute.product.hsnCode}`
    : selectedZone
      ? "Zone-level QR route"
      : "Select a product or zone";

  const resetSelection = () => {
    const defaultProduct = productRoutes.find((route) => route.product.id === DEFAULT_PRODUCT_ID) ?? productRoutes[0];
    setSelectedProductId(defaultProduct?.product.id ?? null);
    setSelectedLotId(defaultProduct?.lots[0]?.id ?? null);
    setSelectedLocationId(null);
    setQ("");
    setViewMode("overview");
    setCameraResetToken((value) => value + 1);
  };

  const openStorageDialog = () => {
    const nextNumber = locations.filter((location) => location.code.startsWith("ST-")).length + 1;
    setStorageForm(blankStorageForm(nextNumber));
    setStorageDialogOpen(true);
  };

  const saveStorage = () => {
    const name = storageForm.name.trim();
    const code = storageForm.code.trim().toUpperCase();
    if (!name || !code) {
      toast.error("Storage name and code are required.");
      return;
    }
    if (locations.some((location) => location.code.toUpperCase() === code)) {
      toast.error("Location code already exists in Location Master.");
      return;
    }
    const w = clampSize(storageForm.w, 4, 40);
    const h = clampSize(storageForm.h, 4, 32);
    const x = clampPosition(storageForm.x, w);
    const y = clampPosition(storageForm.y, h);
    const newId = addLocation({
      code,
      name,
      parentId: "l-wh",
      type: storageForm.type,
      capacity: Math.max(0, Number(storageForm.capacity) || 0),
      occupancy: 0,
      x,
      y,
      w,
      h,
    });
    setSelectedLocationId(newId);
    setSelectedProductId(null);
    setSelectedLotId(null);
    setViewMode("overview");
    setCameraResetToken((value) => value + 1);
    setStorageDialogOpen(false);
    toast.success("Storage created in Location Master and added to 3D view.");
  };

  return (
    <WMSLayout title="3D Warehouse View" subtitle="Walkable office layout with QR routes and bin-level targets">
      <div className="wms-3d-layout">
        <aside className="wms-3d-side">
          <Panel title="Route Product">
            <div className="wms-search-field flex h-11 items-center gap-2 rounded-xl border px-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                placeholder="Search demo product, SKU, brand..."
              />
            </div>
            <div className="mt-3 space-y-2">
              {productMatches.slice(0, 8).map((route) => (
                <button
                  key={route.product.id}
                  onClick={() => {
                    setSelectedProductId(route.product.id);
                    setSelectedLotId(route.lots[0]?.id ?? null);
                    setSelectedLocationId(null);
                  }}
                  className={`wms-3d-product-card ${selectedProductId === route.product.id ? "is-active" : ""}`}
                >
                  <span className="wms-3d-product-avatar" style={{ "--hue": route.product.imageHue } as CSSProperties}>
                    {route.product.code.split("-")[1] ?? route.product.code.slice(0, 3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{route.product.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {route.product.sku} / {route.quantity} {route.product.unit}
                    </span>
                  </span>
                  <span className="wms-3d-target-pill">{route.target?.rack ?? "Zone"}</span>
                </button>
              ))}
            </div>
          </Panel>

          {selectedRoute && (
            <Panel title="Lot Target">
              <div className="space-y-2">
                {selectedRoute.lots.map((lot) => {
                  const target = parseBinTarget(locations, lot.locationId);
                  return (
                    <button
                      key={lot.id}
                      onClick={() => {
                        setSelectedLotId(lot.id);
                        setSelectedLocationId(null);
                      }}
                      className={`wms-3d-lot-card ${selectedLot?.id === lot.id ? "is-active" : ""}`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Crosshair className="size-3.5" />
                        {target ? `${target.rack} / S${target.shelf} / B${target.bin}` : getLocationDisplay(locations, lot.locationId)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {lot.quantity} units{lot.batchNumber ? ` / ${lot.batchNumber}` : ""}{lot.serialNumber ? ` / ${lot.serialNumber}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          <Panel title="Storage Zones">
            <div className="grid grid-cols-3 gap-2">
              {storageZones.map((zone) => {
                const qty = stockInLocation(locations, stockLots, zone.locationId);
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedLocationId(zone.locationId);
                      setSelectedProductId(null);
                      setSelectedLotId(null);
                    }}
                    className={`wms-3d-zone-chip ${selectedLocationId === zone.locationId ? "is-active" : ""}`}
                  >
                    <QrCode className="size-4" />
                    <strong>{zone.label}</strong>
                    <span>{qty}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Route Steps">
            <div className="wms-3d-steps">
              <RouteStep label="Start" value="Gate 1 scan point" active />
              <RouteStep label="Path" value={selectedZone?.route === "kitchen" ? "Kitchen corridor to S3" : `Main aisle to ${selectedTarget?.rack ?? "rack bay"}`} active={Boolean(selectedTarget || selectedZone)} />
              <RouteStep label="Target" value={targetMeta} active={Boolean(selectedTarget || selectedZone)} />
            </div>
          </Panel>
        </aside>

        <section className="wms-3d-stage">
          <div className="wms-3d-stage-header">
            <div className="wms-3d-title-block">
              <div className="wms-3d-eyebrow">
                <Layers className="size-3.5" /> Live 3D office demo
              </div>
              <h2 className="wms-3d-stage-title">
                {targetTitle}
                <span className="wms-demo-badge"><Sparkles className="size-3.5" /> Demo target</span>
              </h2>
              <div className="wms-3d-meta-row">
                <span><Navigation className="size-3.5" /> Gate 1 route</span>
                <span><LocateFixed className="size-3.5" /> {targetMeta}</span>
                <span><Boxes className="size-3.5" /> {targetQuantity}</span>
              </div>
            </div>
            <div className="wms-3d-actions">
              <div className="wms-3d-mode-switch" aria-label="3D camera mode">
                <button
                  onClick={() => {
                    setViewMode("walk");
                    setCameraResetToken((value) => value + 1);
                  }}
                  className={viewMode === "walk" ? "is-active" : ""}
                  title="Walk camera"
                >
                  Walk
                </button>
                <button
                  onClick={() => {
                    setViewMode("overview");
                    setCameraResetToken((value) => value + 1);
                  }}
                  className={viewMode === "overview" ? "is-active" : ""}
                  title="Overview camera"
                >
                  Overview
                </button>
              </div>
              <button onClick={() => setCameraResetToken((value) => value + 1)} className="wms-icon-button" title="Reset 3D camera">
                <RotateCcw className="size-4" />
              </button>
              <button onClick={resetSelection} className="wms-demo-button">
                <PackageSearch className="size-4" /> Demo Target
              </button>
              <button onClick={openStorageDialog} className="wms-add-storage-button">
                <Plus className="size-4" /> Add Storage
              </button>
            </div>
          </div>

          <div className="wms-3d-demo-strip">
            <div className="wms-3d-demo-target-card">
              <span className="wms-3d-demo-icon"><Target className="size-5" /></span>
              <span>
                <span className="block text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-200/80">Target locked</span>
                <strong>{targetCode}</strong>
              </span>
            </div>
            <Metric label="Item" value={selectedRoute?.product.code ?? selectedZone?.label ?? "-"} />
            <Metric label="Quantity" value={targetQuantity} />
            <Metric label="Route" value={targetRoute} />
          </div>

          <WarehouseThreeScene
            products={products}
            locations={locations}
            stockLots={stockLots}
            target={selectedTarget}
            selectedLocationId={selectedLocationId}
            highlightedLocationIds={highlightedLocationIds}
            cameraResetToken={cameraResetToken}
            viewMode={viewMode}
            selectedLocation={selectedLocation}
            customStorageRooms={customStorageRooms}
            targetTitle={targetTitle}
            targetMeta={targetMeta}
            targetQuantity={targetQuantity}
            targetContext={targetContext}
          />

          <div className="wms-3d-bottom">
            <MiniOfficeMap target={selectedTarget} selectedZone={selectedZone} />
            <div className="wms-3d-summary">
              <div className="flex items-center gap-2 font-display font-semibold">
                <MapPinned className="size-4 text-cyan-300" /> Storage Position
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <Metric label="Rack" value={selectedTarget?.rack ?? selectedZone?.label ?? "-"} />
                <Metric label="Shelf" value={selectedTarget ? `Shelf ${selectedTarget.shelf}` : selectedZone ? "Zone" : "-"} />
                <Metric label="Bin" value={selectedTarget ? `Bin ${selectedTarget.bin}` : selectedZone ? "QR area" : "-"} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen}>
        <DialogContent className="max-w-3xl border-white/10">
          <DialogHeader>
            <DialogTitle>Add Storage to 3D Map</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="grid gap-4 sm:grid-cols-2">
              <StorageField label="Storage Name">
                <Input
                  value={storageForm.name}
                  onChange={(event) => setStorageForm((state) => ({ ...state, name: event.target.value }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Location Code">
                <Input
                  value={storageForm.code}
                  onChange={(event) => setStorageForm((state) => ({ ...state, code: event.target.value.toUpperCase() }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Type">
                <select
                  value={storageForm.type}
                  onChange={(event) => setStorageForm((state) => ({ ...state, type: event.target.value as Location["type"] }))}
                  className="wms-control h-10 w-full rounded-md px-3 text-sm"
                >
                  {STORAGE_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </StorageField>
              <StorageField label="Capacity">
                <Input
                  type="number"
                  min={0}
                  value={storageForm.capacity}
                  onChange={(event) => setStorageForm((state) => ({ ...state, capacity: Number(event.target.value) }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Map X (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={storageForm.x}
                  onChange={(event) => setStorageForm((state) => ({ ...state, x: Number(event.target.value) }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Map Y (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={storageForm.y}
                  onChange={(event) => setStorageForm((state) => ({ ...state, y: Number(event.target.value) }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Width (%)">
                <Input
                  type="number"
                  min={4}
                  max={40}
                  value={storageForm.w}
                  onChange={(event) => setStorageForm((state) => ({ ...state, w: Number(event.target.value) }))}
                  className="wms-control h-10"
                />
              </StorageField>
              <StorageField label="Height (%)">
                <Input
                  type="number"
                  min={4}
                  max={32}
                  value={storageForm.h}
                  onChange={(event) => setStorageForm((state) => ({ ...state, h: Number(event.target.value) }))}
                  className="wms-control h-10"
                />
              </StorageField>
            </div>
            <div className="wms-storage-map-preview">
              <div className="wms-storage-preview-title">Map Placement</div>
              <div className="wms-storage-preview-box">
                <span
                  style={{
                    left: `${clampPosition(storageForm.x, clampSize(storageForm.w, 4, 40))}%`,
                    top: `${clampPosition(storageForm.y, clampSize(storageForm.h, 4, 32))}%`,
                    width: `${clampSize(storageForm.w, 4, 40)}%`,
                    height: `${clampSize(storageForm.h, 4, 32)}%`,
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {storagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setStorageForm((state) => ({ ...state, ...preset }))}
                    className="wms-storage-preset"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStorageDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveStorage} className="text-white gradient-primary">Save Storage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WMSLayout>
  );
}

function StorageField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function blankStorageForm(nextNumber: number): StorageForm {
  return {
    name: `Storage Area ${nextNumber}`,
    code: `ST-${String(nextNumber).padStart(2, "0")}`,
    type: "Zone",
    capacity: 500,
    x: 76,
    y: 75,
    w: 18,
    h: 12,
  };
}

function clampSize(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function clampPosition(value: number, size: number) {
  return Math.max(0, Math.min(100 - size, Number.isFinite(value) ? value : 0));
}

function hasMapBox(location: Location) {
  return [location.x, location.y, location.w, location.h].every((value) => typeof value === "number");
}

function isMapStorageLocation(location: Location) {
  return (
    location.parentId === "l-wh" &&
    STORAGE_LOCATION_TYPES.includes(location.type) &&
    hasMapBox(location)
  );
}

function locationCenterToWorld(location: Location) {
  const x = ((location.x ?? 0) + (location.w ?? 0) / 2) / 100 * OFFICE_WIDTH - OFFICE_WIDTH / 2;
  const z = ((location.y ?? 0) + (location.h ?? 0) / 2) / 100 * OFFICE_DEPTH - OFFICE_DEPTH / 2;
  return { x, z };
}

function locationToOfficeRoom(location: Location): OfficeRoom {
  const center = locationCenterToWorld(location);
  return {
    label: location.name,
    x: center.x,
    z: center.z,
    w: Math.max(0.65, ((location.w ?? 10) / 100) * OFFICE_WIDTH),
    d: Math.max(0.55, ((location.h ?? 8) / 100) * OFFICE_DEPTH),
    color: location.type === "Rack" ? 0x24527c : location.type === "Store Room" ? 0x1f8ab9 : 0x1d9b65,
    kind: "storage",
    storageId: location.id,
  };
}

function buildCustomStorageRooms(locations: Location[]) {
  return locations
    .filter((location) => isMapStorageLocation(location) && !STATIC_ROOM_LOCATION_IDS.has(location.id))
    .map(locationToOfficeRoom);
}

function routeNameForLocation(location: Location): RouteName {
  const center = locationCenterToWorld(location);
  return center.z > 2.2 ? "kitchen" : "rack";
}

function buildStorageZones(locations: Location[]): StorageZone[] {
  const staticZones = STORAGE_ZONES.map((zone) => {
    const location = locations.find((item) => item.id === zone.locationId);
    return {
      ...zone,
      mapX: location?.x,
      mapY: location?.y,
      mapW: location?.w,
      mapH: location?.h,
    };
  });
  const staticIds = new Set(STORAGE_ZONES.map((zone) => zone.locationId));
  const customZones = locations
    .filter((location) => isMapStorageLocation(location) && !staticIds.has(location.id) && !STATIC_ROOM_LOCATION_IDS.has(location.id))
    .map((location): StorageZone => ({
      id: location.id,
      label: location.code,
      name: location.name,
      locationId: location.id,
      route: routeNameForLocation(location),
      mapX: location.x,
      mapY: location.y,
      mapW: location.w,
      mapH: location.h,
    }));
  return [...staticZones, ...customZones];
}

function WarehouseThreeScene({
  products,
  locations,
  stockLots,
  target,
  selectedLocationId,
  highlightedLocationIds,
  cameraResetToken,
  viewMode,
  selectedLocation,
  customStorageRooms,
  targetTitle,
  targetMeta,
  targetQuantity,
  targetContext,
}: {
  products: Product[];
  locations: Location[];
  stockLots: StockLot[];
  target: BinTarget | null;
  selectedLocationId: string | null;
  highlightedLocationIds: Set<string>;
  cameraResetToken: number;
  viewMode: ViewMode;
  selectedLocation: Location | null;
  customStorageRooms: OfficeRoom[];
  targetTitle: string;
  targetMeta: string;
  targetQuantity: string;
  targetContext: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inventory = useMemo(() => buildSlotInventory(stockLots, locations), [locations, stockLots]);
  const signature = useMemo(
    () => stockLots.map((lot) => `${lot.id}:${lot.locationId}:${lot.quantity}`).join("|"),
    [stockLots],
  );

  useEffect(() => {
    let disposed = false;
    let animationId = 0;
    const host = hostRef.current;
    if (!host) return;

    host.replaceChildren();

    const setup = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed || !hostRef.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0b1222, 12, 28);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      hostRef.current.appendChild(renderer.domElement);
      renderer.domElement.tabIndex = 0;
      renderer.domElement.setAttribute("aria-label", viewMode === "walk" ? "Walkable 3D office scene" : "3D office overview scene");

      const camera = new THREE.PerspectiveCamera(viewMode === "walk" ? 62 : 42, 1, 0.1, 80);
      if (viewMode === "walk") {
        camera.position.set(-3.75, 1.58, -8.15);
      } else {
        camera.position.set(8.8, 7.2, 7.8);
      }

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enabled = viewMode === "overview";
      controls.target.set(2.4, 1.4, -4.5);
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.minDistance = 3.5;
      controls.maxDistance = 38;
      controls.maxPolarAngle = Math.PI * 0.5;

      let walkYaw = 1.86;
      let walkPitch = -0.02;
      let dragging = false;
      const keys = new Set<string>();
      const walkDirection = new THREE.Vector3(0, 0, -1);
      const walkRight = new THREE.Vector3(1, 0, 0);
      const lookTarget = new THREE.Vector3();

      const applyWalkCamera = () => {
        walkDirection.set(
          Math.sin(walkYaw) * Math.cos(walkPitch),
          Math.sin(walkPitch),
          -Math.cos(walkYaw) * Math.cos(walkPitch),
        );
        lookTarget.copy(camera.position).add(walkDirection);
        camera.lookAt(lookTarget);
      };

      if (viewMode === "walk") {
        applyWalkCamera();
      } else {
        controls.update();
      }

      const resize = () => {
        if (!hostRef.current) return;
        const { width, height } = hostRef.current.getBoundingClientRect();
        const safeWidth = Math.max(320, width);
        const safeHeight = Math.max(360, height);
        renderer.setSize(safeWidth, safeHeight, false);
        camera.aspect = safeWidth / safeHeight;
        camera.updateProjectionMatrix();
      };

      resize();
      window.addEventListener("resize", resize);

      scene.add(new THREE.HemisphereLight(0xd8f4ff, 0x172033, 2.35));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(5, 9, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      scene.add(key);
      const rim = new THREE.PointLight(0x39d5ff, 2.2, 18);
      rim.position.set(-4.8, 3.6, 2.5);
      scene.add(rim);
      const accent = new THREE.PointLight(0x27f2a3, 1.4, 12);
      accent.position.set(4.8, 2.8, -1.5);
      scene.add(accent);

      const root = new THREE.Group();
      scene.add(root);

      createOfficeBase(THREE, root, selectedLocationId, customStorageRooms);

      const targetObjects: Array<import("three").Object3D> = [];
      RACKS.forEach((rack, index) => {
        const rackGroup = createRack(THREE, {
          rack,
          index,
          inventory,
          products,
          target,
          highlightedLocationIds,
          targetObjects,
        });
        root.add(rackGroup);
      });

      const routeCurve = createRoute(THREE, root, target, selectedLocation);
      const routeDots = createRouteDots(THREE, root, routeCurve);

      if (target) {
        const rackIndex = RACKS.findIndex((rack) => rack.code === target.rack);
        const endpoint = slotWorldPosition(rackIndex, target.shelf, target.bin);
        const label = createLabelSprite(THREE, `${target.rack} / S${target.shelf} / B${target.bin}`, {
          background: "rgba(3, 13, 28, 0.86)",
          color: "#eaffff",
          border: "#55f3ff",
        });
        label.position.set(endpoint.x, endpoint.y + 0.92, endpoint.z + 0.4);
        label.scale.set(1.65, 0.44, 1);
        root.add(label);
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (viewMode !== "walk") return;
        if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
          event.preventDefault();
          keys.add(event.code);
        }
      };
      const handleKeyUp = (event: KeyboardEvent) => {
        keys.delete(event.code);
      };
      const handlePointerDown = (event: PointerEvent) => {
        if (viewMode !== "walk") return;
        dragging = true;
        renderer.domElement.setPointerCapture?.(event.pointerId);
        renderer.domElement.focus();
      };
      const handlePointerUp = (event: PointerEvent) => {
        dragging = false;
        if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
          renderer.domElement.releasePointerCapture(event.pointerId);
        }
      };
      const handlePointerMove = (event: PointerEvent) => {
        if (viewMode !== "walk" || !dragging) return;
        walkYaw -= event.movementX * 0.003;
        walkPitch = Math.max(-0.58, Math.min(0.42, walkPitch - event.movementY * 0.0024));
        applyWalkCamera();
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointerup", handlePointerUp);
      renderer.domElement.addEventListener("pointerleave", handlePointerUp);
      renderer.domElement.addEventListener("pointermove", handlePointerMove);

      const startedAt = performance.now();
      let previousAt = startedAt;
      const animate = () => {
        if (disposed) return;
        const now = performance.now();
        const elapsed = (now - startedAt) / 1000;
        const delta = Math.min(0.05, (now - previousAt) / 1000);
        previousAt = now;
        if (viewMode === "walk") {
          const move = new THREE.Vector3();
          walkDirection.set(Math.sin(walkYaw), 0, -Math.cos(walkYaw)).normalize();
          walkRight.set(Math.cos(walkYaw), 0, Math.sin(walkYaw)).normalize();
          if (keys.has("KeyW") || keys.has("ArrowUp")) move.add(walkDirection);
          if (keys.has("KeyS") || keys.has("ArrowDown")) move.sub(walkDirection);
          if (keys.has("KeyD") || keys.has("ArrowRight")) move.add(walkRight);
          if (keys.has("KeyA") || keys.has("ArrowLeft")) move.sub(walkRight);
          if (move.lengthSq() > 0) {
            move.normalize().multiplyScalar(3.35 * delta);
            camera.position.add(move);
            camera.position.x = Math.max(-7.05, Math.min(7.05, camera.position.x));
            camera.position.z = Math.max(-9.05, Math.min(9.05, camera.position.z));
          }
          camera.position.y = 1.45;
          applyWalkCamera();
        }
        targetObjects.forEach((object, index) => {
          const pulse = 1 + Math.sin(elapsed * 4.2 + index) * 0.045;
          object.scale.setScalar(pulse);
        });
        routeDots.forEach((dot, index) => {
          const point = routeCurve.getPoint((elapsed * 0.12 + index / routeDots.length) % 1);
          dot.position.copy(point);
        });
        if (viewMode === "overview") controls.update();
        renderer.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointerup", handlePointerUp);
        renderer.domElement.removeEventListener("pointerleave", handlePointerUp);
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        controls.dispose();
        renderer.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    setup().then((dispose) => {
      cleanup = dispose;
      if (disposed) cleanup?.();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationId);
      cleanup?.();
      host.replaceChildren();
    };
  }, [cameraResetToken, customStorageRooms, highlightedLocationIds, inventory, locations, products, selectedLocation, selectedLocationId, signature, target, viewMode]);

  return (
    <div className="wms-3d-canvas-shell">
      <div ref={hostRef} className="wms-3d-canvas" aria-label="Interactive 3D warehouse rack view" />
      <div className="wms-3d-canvas-overlay">
        <span className="wms-3d-live-chip"><ScanLine className="size-3.5" /> Demo target</span>
        <strong>{targetTitle}</strong>
        <span>{targetMeta}</span>
        <small>{targetQuantity} / {targetContext}</small>
      </div>
      <div className="wms-3d-canvas-note">
        <span><Navigation className="size-3.5" /> Gate 1</span>
        <strong>Gate 1 to selected storage point</strong>
      </div>
    </div>
  );
}

function createOfficeBase(
  THREE: typeof import("three"),
  root: import("three").Group,
  selectedLocationId: string | null,
  customStorageRooms: OfficeRoom[],
) {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x162238,
    roughness: 0.76,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(OFFICE_WIDTH, 0.08, OFFICE_DEPTH), floorMat);
  floor.position.set(0, -0.08, 0);
  floor.receiveShadow = true;
  root.add(floor);

  const corridorMat = new THREE.MeshStandardMaterial({
    color: 0x203452,
    roughness: 0.6,
    metalness: 0.12,
    transparent: true,
    opacity: 0.74,
  });
  const mainCorridor = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.035, OFFICE_DEPTH - 1.2), corridorMat);
  mainCorridor.position.set(0, -0.015, 0.25);
  mainCorridor.receiveShadow = true;
  root.add(mainCorridor);

  const crossCorridor = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.036, 1.1), corridorMat);
  crossCorridor.position.set(2.45, -0.012, 2.25);
  crossCorridor.receiveShadow = true;
  root.add(crossCorridor);

  const grid = new THREE.GridHelper(OFFICE_DEPTH, 32, 0x2f8ed5, 0x24334c);
  grid.position.y = -0.025;
  root.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a3850, roughness: 0.62, metalness: 0.18 });
  const wallPositions: Array<[number, number, number, number]> = [
    [-3.65, -9.25, 7.1, 0.1],
    [3.95, -9.25, 6.2, 0.1],
    [0, 9.25, OFFICE_WIDTH, 0.1],
    [-7.2, 0, 0.1, OFFICE_DEPTH],
    [7.2, -3.2, 0.1, 11.9],
    [7.2, 6.9, 0.1, 4.2],
  ];

  wallPositions.forEach(([x, z, w, d]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 1.85, d), wallMat);
    wall.position.set(x, 0.86, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);
  });

  OFFICE_ROOMS.forEach((room) => createOfficeRoom(THREE, root, room, selectedLocationId));
  customStorageRooms.forEach((room) => createOfficeRoom(THREE, root, room, selectedLocationId));
  createRackBayFloor(THREE, root);
  createGate(THREE, root, "Gate 1", 0.15, -9.2, 0);
  createGate(THREE, root, "Gate 2", 7.12, 1.35, Math.PI / 2);

  const entryDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 22, 22),
    new THREE.MeshBasicMaterial({ color: 0x42c7ff }),
  );
  entryDot.position.set(0.05, 0.17, -8.6);
  root.add(entryDot);
}

function createOfficeRoom(
  THREE: typeof import("three"),
  root: import("three").Group,
  room: OfficeRoom,
  selectedLocationId: string | null,
) {
  const active = Boolean(room.storageId && selectedLocationId === room.storageId);
  const floorMat = new THREE.MeshStandardMaterial({
    color: active ? 0x61edff : room.color,
    roughness: 0.58,
    metalness: 0.08,
    transparent: true,
    opacity: room.kind === "storage" ? 0.62 : 0.48,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(room.w, 0.055, room.d), floorMat);
  floor.position.set(room.x, 0.015, room.z);
  floor.receiveShadow = true;
  root.add(floor);

  const edgeColor = active ? 0xbffcff : room.kind === "storage" ? 0x63d8ff : 0x8aa4bf;
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(floor.geometry),
    new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: active ? 1 : 0.62 }),
  );
  floor.add(edges);

  addRoomWalls(THREE, root, room, active);
  addRoomLabel(THREE, root, room, active);

  if (room.kind === "storage") {
    addStorageMarker(THREE, root, room, active);
  } else if (room.kind === "kitchen") {
    addKitchenFurniture(THREE, root, room);
  } else if (room.kind === "table") {
    addLunchFurniture(THREE, root, room);
  } else if (room.kind === "temple") {
    addTempleFurniture(THREE, root, room);
  } else if (room.kind === "utility") {
    addUtilityFurniture(THREE, root, room);
  } else {
    addOfficeFurniture(THREE, root, room);
  }
}

function addRoomWalls(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom, active: boolean) {
  const wallMat = new THREE.MeshStandardMaterial({
    color: active ? 0x48e9ff : 0x314158,
    roughness: 0.58,
    metalness: 0.18,
    transparent: true,
    opacity: active ? 0.72 : 0.58,
  });
  const h = room.kind === "storage" ? 0.95 : 1.18;
  const t = 0.055;
  const segments: Array<[number, number, number, number]> = [
    [room.x, room.z - room.d / 2, room.w, t],
    [room.x, room.z + room.d / 2, room.w, t],
    [room.x - room.w / 2, room.z, t, room.d],
    [room.x + room.w / 2, room.z, t, room.d],
  ];
  segments.forEach(([x, z, w, d]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.set(x, h / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);
  });
}

function addRoomLabel(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom, active: boolean) {
  const label = createLabelSprite(THREE, room.label, {
    background: active ? "rgba(44, 219, 255, 0.92)" : "rgba(11, 25, 45, 0.78)",
    color: "#eaf8ff",
    border: active ? "#ffffff" : "rgba(126, 198, 255, 0.55)",
  });
  label.position.set(room.x, room.kind === "storage" ? 0.65 : 0.5, room.z);
  label.scale.set(Math.min(1.55, Math.max(0.8, room.w * 0.32)), 0.28, 1);
  root.add(label);
}

function addStorageMarker(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom, active: boolean) {
  const code = room.label.includes("S1") ? "S1" : room.label.includes("S2") ? "S2" : "S3";
  const marker = createLabelSprite(THREE, `QR ${code}`, {
    background: active ? "rgba(235, 255, 255, 0.96)" : "rgba(244, 251, 255, 0.9)",
    color: "#053e65",
    border: active ? "#44f2ff" : "#0877bb",
  });
  marker.position.set(room.x, 1.22, room.z + room.d * 0.16);
  marker.scale.set(0.78, 0.28, 1);
  root.add(marker);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.08, 28),
    new THREE.MeshBasicMaterial({ color: active ? 0x7df7ff : 0x3ed3ff, transparent: true, opacity: 0.88 }),
  );
  beacon.position.set(room.x, 0.09, room.z + room.d * 0.36);
  root.add(beacon);
}

function addOfficeFurniture(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom) {
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x6c7a8d, roughness: 0.5, metalness: 0.08 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x1a2538, roughness: 0.52, metalness: 0.18 });
  const count = room.w > 4.3 ? 3 : room.w > 4 ? 2 : 1;
  for (let i = 0; i < count; i += 1) {
    const x = room.x - room.w * 0.25 + i * Math.min(1.25, room.w / Math.max(2, count));
    const z = room.z + (i % 2 === 0 ? -0.18 : 0.32);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.42), deskMat);
    desk.position.set(x, 0.28, z);
    desk.castShadow = true;
    root.add(desk);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), chairMat);
    chair.position.set(x, 0.18, z + 0.45);
    chair.castShadow = true;
    root.add(chair);
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.25, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x9ee7ff, roughness: 0.18, metalness: 0.18, emissive: 0x12344a, emissiveIntensity: 0.35 }),
    );
    screen.position.set(x, 0.52, z - 0.16);
    screen.castShadow = true;
    root.add(screen);
  }
}

function addLunchFurniture(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom) {
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x8a6847, roughness: 0.48, metalness: 0.06 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x334258, roughness: 0.58, metalness: 0.1 });
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 0.64), tableMat);
  table.position.set(room.x, 0.32, room.z);
  table.castShadow = true;
  root.add(table);
  [
    [-0.74, 0],
    [0.74, 0],
    [0, -0.58],
    [0, 0.58],
  ].forEach(([dx, dz]) => {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), chairMat);
    chair.position.set(room.x + dx, 0.18, room.z + dz);
    chair.castShadow = true;
    root.add(chair);
  });
}

function addKitchenFurniture(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom) {
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x8d9a92, roughness: 0.38, metalness: 0.14 });
  const counter = new THREE.Mesh(new THREE.BoxGeometry(room.w * 0.78, 0.38, 0.38), counterMat);
  counter.position.set(room.x, 0.28, room.z - room.d * 0.26);
  counter.castShadow = true;
  root.add(counter);
  const sink = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.26),
    new THREE.MeshStandardMaterial({ color: 0xbfd9e6, roughness: 0.18, metalness: 0.55 }),
  );
  sink.position.set(room.x + 0.38, 0.51, room.z - room.d * 0.26);
  root.add(sink);
  const stove = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.09, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.32, metalness: 0.35 }),
  );
  stove.position.set(room.x - 0.45, 0.52, room.z - room.d * 0.26);
  root.add(stove);
}

function addUtilityFurniture(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom) {
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0xe4eef7, roughness: 0.24, metalness: 0.08 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.22, 24), fixtureMat);
  base.position.set(room.x, 0.19, room.z);
  base.castShadow = true;
  root.add(base);
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.14), fixtureMat);
  tank.position.set(room.x, 0.45, room.z - 0.28);
  tank.castShadow = true;
  root.add(tank);
}

function addTempleFurniture(THREE: typeof import("three"), root: import("three").Group, room: OfficeRoom) {
  const templeMat = new THREE.MeshStandardMaterial({ color: 0xd2aa4a, roughness: 0.36, metalness: 0.24 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.46), templeMat);
  base.position.set(room.x, 0.22, room.z + 0.08);
  base.castShadow = true;
  root.add(base);
  const shrine = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.52, 6), templeMat);
  shrine.position.set(room.x, 0.57, room.z + 0.08);
  shrine.castShadow = true;
  root.add(shrine);
  const dome = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.32, 24), templeMat);
  dome.position.set(room.x, 1.0, room.z + 0.08);
  dome.castShadow = true;
  root.add(dome);
}

function createRackBayFloor(THREE: typeof import("three"), root: import("three").Group) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0x223d60,
    roughness: 0.5,
    metalness: 0.08,
    transparent: true,
    opacity: 0.56,
  });
  const bay = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.05, 1.75), mat);
  bay.position.set(RACK_BAY_OFFSET_X + 0.03, 0.02, RACK_BAY_Z);
  bay.receiveShadow = true;
  root.add(bay);
  const label = createLabelSprite(THREE, "Rack Storage Bay", {
    background: "rgba(10, 23, 42, 0.82)",
    color: "#e8fbff",
    border: "#59d9ff",
  });
  label.position.set(RACK_BAY_OFFSET_X + 0.03, 0.48, RACK_BAY_Z - 1.0);
  label.scale.set(1.35, 0.28, 1);
  root.add(label);
}

function createGate(
  THREE: typeof import("three"),
  root: import("three").Group,
  label: string,
  x: number,
  z: number,
  rotationY: number,
) {
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, roughness: 0.25, metalness: 0.15 });
  [-0.55, 0.55].forEach((offset) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.32, 0.08), gateMat);
    post.position.set(x + Math.cos(rotationY) * offset, 0.66, z + Math.sin(rotationY) * offset);
    post.castShadow = true;
    root.add(post);
  });
  const sign = createLabelSprite(THREE, label, {
    background: "rgba(255, 255, 255, 0.94)",
    color: "#0c3764",
    border: "#61bfff",
  });
  sign.position.set(x, 1.55, z);
  sign.scale.set(0.95, 0.3, 1);
  root.add(sign);
}

function createRack(
  THREE: typeof import("three"),
  {
    rack,
    index,
    inventory,
    products,
    target,
    highlightedLocationIds,
    targetObjects,
  }: {
    rack: RackDef;
    index: number;
    inventory: Map<string, SlotInventory>;
    products: Product[];
    target: BinTarget | null;
    highlightedLocationIds: Set<string>;
    targetObjects: Array<import("three").Object3D>;
  },
) {
  const group = new THREE.Group();
  const rackX = rackXPosition(index);
  group.position.set(RACK_BAY_OFFSET_X + rackX, 0, RACK_BAY_Z);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c2838, roughness: 0.48, metalness: 0.62 });
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x34465f, roughness: 0.46, metalness: 0.42 });
  const uprightGeometry = new THREE.BoxGeometry(0.08, 3.8, 0.08);
  const beamGeometry = new THREE.BoxGeometry(2.2, 0.08, 0.08);
  const depthBeamGeometry = new THREE.BoxGeometry(0.08, 0.08, 1.12);

  [-1.1, 1.1].forEach((x) => {
    [-0.55, 0.55].forEach((z) => {
      const post = new THREE.Mesh(uprightGeometry, frameMat);
      post.position.set(x, 1.85, z);
      post.castShadow = true;
      group.add(post);
    });
  });

  for (let shelf = 1; shelf <= 4; shelf += 1) {
    const y = shelfY(shelf);
    [-0.58, 0.58].forEach((z) => {
      const beam = new THREE.Mesh(beamGeometry, frameMat);
      beam.position.set(0, y - 0.42, z);
      beam.castShadow = true;
      group.add(beam);
    });
    [-1.1, 1.1].forEach((x) => {
      const side = new THREE.Mesh(depthBeamGeometry, frameMat);
      side.position.set(x, y - 0.42, 0);
      side.castShadow = true;
      group.add(side);
    });

    const shelfDeck = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.06, 1.2), shelfMat);
    shelfDeck.position.set(0, y - 0.64, 0);
    shelfDeck.receiveShadow = true;
    shelfDeck.castShadow = true;
    group.add(shelfDeck);

    const shelfLabel = createLabelSprite(THREE, `S${shelf}`, {
      background: "rgba(5, 18, 36, 0.9)",
      color: "#c8f2ff",
      border: "#3dc7ff",
    });
    shelfLabel.position.set(-1.42, y - 0.3, 0.58);
    shelfLabel.scale.set(0.38, 0.24, 1);
    group.add(shelfLabel);
  }

  for (let shelf = 1; shelf <= 4; shelf += 1) {
    for (let bin = 1; bin <= 3; bin += 1) {
      const slot = `${rack.code}-S${shelf}-B${bin}`;
      const slotData = inventory.get(slot);
      const isTarget = target?.rack === rack.code && target.shelf === shelf && target.bin === bin;
      const hasHighlightedLot = slotData?.locationId ? highlightedLocationIds.has(slotData.locationId) : false;
      const hasStock = Boolean(slotData && slotData.quantity > 0);
      const product = slotData?.lots[0] ? products.find((item) => item.id === slotData.lots[0].productId) : null;
      const hue = product?.imageHue ?? (hasStock ? 220 : 210);
      const color = isTarget ? 0x36fff4 : hasStock ? colorFromHue(THREE, hue) : new THREE.Color(0x415066);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: isTarget ? 0x0aa8c9 : hasHighlightedLot ? 0x143d63 : 0x000000,
        emissiveIntensity: isTarget ? 0.85 : hasHighlightedLot ? 0.35 : 0,
        roughness: 0.42,
        metalness: 0.18,
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.62), mat);
      const position = slotLocalPosition(shelf, bin);
      box.position.copy(position);
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(box.geometry),
        new THREE.LineBasicMaterial({ color: isTarget ? 0xffffff : 0x9fb3ca, transparent: true, opacity: isTarget ? 0.95 : 0.3 }),
      );
      box.add(edges);

      if (hasStock) {
        const packCount = Math.min(4, Math.max(1, Math.ceil((slotData?.quantity ?? 0) / 60)));
        for (let i = 0; i < packCount; i += 1) {
          const pack = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.09, 0.16),
            new THREE.MeshStandardMaterial({ color: isTarget ? 0xe8ffff : 0xd8e8ff, roughness: 0.5, metalness: 0.05 }),
          );
          pack.position.set(
            position.x - 0.18 + (i % 2) * 0.18,
            position.y + 0.26 + Math.floor(i / 2) * 0.1,
            position.z + 0.22,
          );
          pack.castShadow = true;
          group.add(pack);
        }
      }

      if (isTarget) {
        const halo = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.58, 0.78),
          new THREE.MeshBasicMaterial({ color: 0x52f6ff, wireframe: true, transparent: true, opacity: 0.85 }),
        );
        halo.position.copy(position);
        group.add(halo);
        targetObjects.push(halo);
        targetObjects.push(box);
      }
    }
  }

  const rackLabel = createLabelSprite(THREE, rack.name, {
    background: "rgba(8, 20, 39, 0.92)",
    color: "#e8fbff",
    border: "#58d8ff",
  });
  rackLabel.position.set(0, 4.12, 0.68);
  rackLabel.scale.set(1.25, 0.34, 1);
  group.add(rackLabel);

  const qr = createLabelSprite(THREE, `QR ${rack.code}`, {
    background: "rgba(244, 251, 255, 0.94)",
    color: "#063765",
    border: "#0b77bd",
  });
  qr.position.set(-0.7, 3.58, 0.72);
  qr.scale.set(0.72, 0.3, 1);
  group.add(qr);

  return group;
}

function createRoute(
  THREE: typeof import("three"),
  root: import("three").Group,
  target: BinTarget | null,
  selectedLocation: Location | null,
) {
  const selectedPoint = selectedLocation && hasMapBox(selectedLocation) ? locationCenterToWorld(selectedLocation) : null;
  const useKitchenRoute = selectedLocation?.id === "l-sz-s3" || Boolean(selectedPoint && selectedPoint.z > 2.2);
  const targetRackIndex = target ? RACKS.findIndex((rack) => rack.code === target.rack) : 1;
  const targetX = target
    ? RACK_BAY_OFFSET_X + rackXPosition(targetRackIndex)
    : selectedPoint?.x ?? RACK_BAY_OFFSET_X;
  const targetZ = target
    ? RACK_BAY_Z + 0.86
    : selectedPoint?.z ?? RACK_BAY_Z + 0.86;
  const routeColor = useKitchenRoute ? 0x2cf49f : 0x37c7ff;
  const points =
    useKitchenRoute
      ? [
          new THREE.Vector3(0.05, 0.08, -8.65),
          new THREE.Vector3(0.05, 0.08, 2.25),
          new THREE.Vector3(5.75, 0.08, 2.25),
          new THREE.Vector3(targetX, 0.08, targetZ),
        ]
      : [
          new THREE.Vector3(0.05, 0.08, -8.65),
          new THREE.Vector3(0.05, 0.08, -6.55),
          new THREE.Vector3(targetX, 0.08, -6.55),
          new THREE.Vector3(targetX, 0.08, targetZ),
        ];
  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.035, 10, false),
    new THREE.MeshBasicMaterial({ color: routeColor, transparent: true, opacity: 0.78 }),
  );
  root.add(tube);

  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.32, 20),
    new THREE.MeshBasicMaterial({ color: routeColor }),
  );
  arrow.position.copy(points[points.length - 1]);
  arrow.position.y = 0.22;
  arrow.rotation.x = Math.PI * 0.5;
  root.add(arrow);

  return curve;
}

function createRouteDots(
  THREE: typeof import("three"),
  root: import("three").Group,
  routeCurve: import("three").CatmullRomCurve3,
) {
  return Array.from({ length: 7 }, (_, index) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0xb9ffff : 0x58d8ff, transparent: true, opacity: 0.95 }),
    );
    dot.position.copy(routeCurve.getPoint(index / 7));
    root.add(dot);
    return dot;
  });
}

function MiniOfficeMap({ target, selectedZone }: { target: BinTarget | null; selectedZone: StorageZone | null }) {
  const route = selectedZone?.route ?? (target ? "rack" : "rack");
  const selectedZoneTarget =
    selectedZone?.mapX !== undefined &&
    selectedZone.mapY !== undefined &&
    selectedZone.mapW !== undefined &&
    selectedZone.mapH !== undefined
      ? {
          cx: selectedZone.mapX + selectedZone.mapW / 2,
          cy: selectedZone.mapY + selectedZone.mapH / 2,
        }
      : null;
  return (
    <div className="wms-mini-map">
      <svg viewBox="0 0 100 70" aria-label="Mapped office route">
        <rect x="2" y="2" width="96" height="66" rx="3" className="map-shell" />
        <rect x="6" y="8" width="16" height="12" className="map-room" />
        <rect x="6" y="23" width="26" height="15" className="map-room" />
        <rect x="6" y="42" width="26" height="12" className="map-room" />
        <rect x="56" y="8" width="36" height="10" className="map-rack-bay" />
        <rect x="56" y="26" width="34" height="12" className="map-room" />
        <rect x="56" y="41" width="34" height="12" className="map-room" />
        <rect x="78" y="54" width="16" height="10" className="map-zone" />
        <rect x="42" y="0" width="13" height="6" rx="1" className="map-gate" />
        <path className={`map-route ${route === "kitchen" ? "is-muted" : ""}`} d="M48 66 V20 C48 16 52 13 58 13 H74" />
        <path className={`map-route-green ${route === "kitchen" ? "" : "is-muted"}`} d="M48 66 V48 C48 44 54 42 61 42 H86 V58" />
        <circle cx={target?.rack === "R1" ? 62 : target?.rack === "R3" ? 86 : 74} cy="13" r={target ? 3 : 0} className="map-target" />
        <circle cx={selectedZoneTarget?.cx ?? -10} cy={selectedZoneTarget?.cy ?? -10} r={selectedZoneTarget ? 3 : 0} className="map-target" />
      </svg>
      <div>
        <div className="font-display font-semibold">Office Layout</div>
        <div className="text-xs text-muted-foreground">Clean map reference. The active 3D target is highlighted above.</div>
      </div>
    </div>
  );
}

function RouteStep({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`wms-3d-step ${active ? "is-active" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="wms-3d-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="wms-3d-panel-block">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <RouteIcon className="size-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

type SlotInventory = {
  quantity: number;
  locationId: string;
  lots: StockLot[];
};

function buildProductRoutes(products: Product[], stockLots: StockLot[], locations: Location[]): ProductRoute[] {
  return products
    .map((product) => {
      const lots = stockLots.filter((lot) => lot.productId === product.id && lot.quantity > 0);
      const target = lots[0] ? parseBinTarget(locations, lots[0].locationId) : null;
      const quantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
      return { product, lots, target, quantity };
    })
    .filter((route) => route.quantity > 0)
    .sort((a, b) => Number(Boolean(b.target)) - Number(Boolean(a.target)) || a.product.name.localeCompare(b.product.name));
}

function buildSlotInventory(stockLots: StockLot[], locations: Location[]) {
  const map = new Map<string, SlotInventory>();
  stockLots.forEach((lot) => {
    const target = parseBinTarget(locations, lot.locationId);
    if (!target) return;
    const key = `${target.rack}-S${target.shelf}-B${target.bin}`;
    const existing = map.get(key) ?? { quantity: 0, locationId: target.locationId, lots: [] };
    existing.quantity += lot.quantity;
    existing.lots.push(lot);
    map.set(key, existing);
  });
  return map;
}

function parseBinTarget(locations: Location[], locationId: string): BinTarget | null {
  const direct = parseTargetFromId(locationId);
  if (direct) return withLocationLabel(locations, locationId, direct);

  const path = getLocationPath(locations, locationId);
  for (const location of [...path].reverse()) {
    const parsed = parseTargetFromId(location.id);
    if (parsed) return withLocationLabel(locations, location.id, parsed);
    const rack = RACK_BY_LOCATION[location.id];
    if (rack) return withLocationLabel(locations, location.id, { rack, shelf: 1, bin: 1 });
  }

  const rack = RACK_BY_LOCATION[locationId];
  if (rack) return withLocationLabel(locations, locationId, { rack, shelf: 1, bin: 1 });

  return null;
}

function parseTargetFromId(locationId: string): Omit<BinTarget, "locationId" | "locationLabel"> | null {
  const match = locationId.match(/^l-bin-(a1|b1|c1)-s([1-4])-b([1-3])$/);
  if (!match) return null;
  const rackKey = match[1] as RackDef["key"];
  return {
    rack: RACK_BY_KEY[rackKey],
    shelf: Number(match[2]),
    bin: Number(match[3]),
  };
}

function withLocationLabel(
  locations: Location[],
  locationId: string,
  target: Omit<BinTarget, "locationId" | "locationLabel">,
): BinTarget {
  const display = getLocationDisplay(locations, locationId);
  return {
    ...target,
    locationId,
    locationLabel: display === "Unknown" || display === "Unassigned" ? `${target.rack} / Shelf ${target.shelf} / Bin ${target.bin}` : display,
  };
}

function rackXPosition(index: number) {
  return (index - 1) * 2.85;
}

function shelfY(shelf: number) {
  return 0.64 + (shelf - 1) * 0.82;
}

function slotLocalPosition(shelf: number, bin: number) {
  const x = -0.58 + (bin - 1) * 0.58;
  const y = shelfY(shelf) - 0.28;
  return { x, y, z: 0.08 } as import("three").Vector3;
}

function slotWorldPosition(rackIndex: number, shelf: number, bin: number) {
  const local = slotLocalPosition(shelf, bin);
  return {
    x: RACK_BAY_OFFSET_X + rackXPosition(rackIndex) + local.x,
    y: local.y,
    z: RACK_BAY_Z + local.z,
  };
}

function colorFromHue(THREE: typeof import("three"), hue: number) {
  return new THREE.Color(`hsl(${hue}, 78%, 55%)`);
}

function createLabelSprite(
  THREE: typeof import("three"),
  text: string,
  options: { background: string; color: string; border: string },
) {
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = 320 * scale;
  canvas.height = 92 * scale;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();
  context.scale(scale, scale);
  context.clearRect(0, 0, 320, 92);
  context.fillStyle = options.background;
  roundedRect(context, 8, 8, 304, 76, 16);
  context.fill();
  context.strokeStyle = options.border;
  context.lineWidth = 3;
  roundedRect(context, 8, 8, 304, 76, 16);
  context.stroke();
  context.fillStyle = options.color;
  context.font = "700 34px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 160, 47, 280);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 10;
  return sprite;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
