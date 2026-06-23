import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { locationPercent, qrPayload, useWmsStore } from "@/lib/wms-store";
import { type Location } from "@/lib/wms-data";
import { Box, ChevronRight, Eye, MapPin, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/wms/locations")({
  head: () => ({ meta: [{ title: "Locations - WMS" }] }),
  component: LocationsPage,
});

const locationTypes: Location["type"][] = [
  "Warehouse",
  "Gate",
  "Office",
  "Department",
  "Cabin",
  "Store Room",
  "Zone",
  "Rack",
  "Shelf",
  "Bin",
  "Kitchen",
  "Utility",
  "Temple",
  "Common Area",
  "Dispatch Area",
  "Receiving Area",
];

const blankLocation = (parentId: string | null = null): Omit<Location, "id"> => ({
  code: "",
  name: "",
  parentId,
  type: parentId ? "Bin" : "Warehouse",
  capacity: 100,
  occupancy: 0,
});

function LocationsPage() {
  const locations = useWmsStore((state) => state.locations);
  const stockLots = useWmsStore((state) => state.stockLots);
  const addLocation = useWmsStore((state) => state.addLocation);
  const updateLocation = useWmsStore((state) => state.updateLocation);
  const deleteLocation = useWmsStore((state) => state.deleteLocation);
  const [openTree, setOpenTree] = useState<Record<string, boolean>>({
    "l-wh": true,
    "l-rack-bay": true,
    "l-r-a1": true,
    "l-r-b1": true,
    "l-r-c1": true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<Omit<Location, "id">>(blankLocation());
  const roots = locations.filter((location) => location.parentId === null);

  const openAdd = (parentId: string | null = null) => {
    setEditing(null);
    setForm(blankLocation(parentId));
    setDialogOpen(true);
  };

  const openEdit = (location: Location) => {
    setEditing(location);
    setForm({
      code: location.code,
      name: location.name,
      parentId: location.parentId,
      type: location.type,
      capacity: location.capacity,
      occupancy: location.occupancy,
      x: location.x,
      y: location.y,
      w: location.w,
      h: location.h,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Location name and code are required.");
      return;
    }
    if (editing) {
      const result = updateLocation(editing.id, form);
      toast[result.ok ? "success" : "error"](result.message);
    } else {
      addLocation({ ...form, code: form.code.toUpperCase() });
      toast.success("Location added.");
    }
    setDialogOpen(false);
  };

  const remove = (location: Location) => {
    if (!window.confirm(`Delete ${location.name}?`)) return;
    const result = deleteLocation(location.id);
    toast[result.ok ? "success" : "error"](result.message);
  };

  const renderNode = (locationId: string, depth = 0): ReactNode => {
    const location = locations.find((item) => item.id === locationId);
    if (!location) return null;
    const children = locations.filter((item) => item.parentId === locationId);
    const hasKids = children.length > 0;
    const isOpen = openTree[locationId];
    const pct = locationPercent(locations, stockLots, location);
    return (
      <div key={locationId}>
        <div className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
          <button
            onClick={() => hasKids && setOpenTree((state) => ({ ...state, [locationId]: !state[locationId] }))}
            className={`grid size-6 place-items-center rounded-md ${hasKids ? "hover:bg-white/10" : ""}`}
            title={hasKids ? "Expand location" : undefined}
          >
            {hasKids ? <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} /> : <span />}
          </button>
          <MapPin className="size-4 shrink-0 text-[color:var(--secondary)]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{location.name}</div>
            <div className="text-[10px] text-muted-foreground">{location.code} / {location.type}</div>
          </div>
          <div className="hidden w-40 items-center gap-2 sm:flex">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 text-right text-[10px] text-muted-foreground">{pct}%</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(qrPayload("location", { locationId: location.id, code: location.code }));
              toast.success("Location QR payload copied.");
            }}
            className="rounded-lg p-1.5 hover:bg-white/10"
            title="Copy location QR"
          >
            <QrCode className="size-3.5" />
          </button>
          <a href={`/wms/3d-view?location=${location.id}`} className="rounded-lg p-1.5 hover:bg-white/10" title="Open in 3D warehouse view">
            <Eye className="size-3.5" />
          </a>
          <button onClick={() => openAdd(location.id)} className="rounded-lg p-1.5 hover:bg-white/10" title={`Add child under ${location.name}`}>
            <Plus className="size-3.5" />
          </button>
          <button onClick={() => openEdit(location)} className="rounded-lg p-1.5 hover:bg-white/10" title={`Edit ${location.name}`}>
            <Pencil className="size-3.5" />
          </button>
          <button onClick={() => remove(location)} className="rounded-lg p-1.5 text-[color:var(--destructive)] hover:bg-white/10" title={`Delete ${location.name}`}>
            <Trash2 className="size-3.5" />
          </button>
        </div>
        {hasKids && isOpen && children.map((child) => renderNode(child.id, depth + 1))}
      </div>
    );
  };

  return (
    <WMSLayout title="Location Master" subtitle="Warehouse to rack, shelf and bin mapping">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-muted-foreground">Create locations and open any rack, shelf or bin in the live 3D view.</div>
        <Button onClick={() => openAdd()} className="rounded-xl border-0 text-white gradient-primary">
          <Plus className="size-4" /> Add Location
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          {roots.map((root) => renderNode(root.id))}
        </div>
        <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-3 flex items-center gap-2 font-display font-semibold">
            <Box className="size-4" /> Warehouse Layout
          </div>
          <div className="space-y-3 text-sm">
            {locations.filter((location) => location.type === "Rack").slice(0, 3).map((location) => {
              const pct = locationPercent(locations, stockLots, location);
              return (
                <a key={location.id} href={`/wms/3d-view?location=${location.id}`} className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10">
                  <div className="flex justify-between">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Location" : "Add Location"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
            </Field>
            <Field label="Code">
              <Input value={form.code} onChange={(event) => setForm((state) => ({ ...state, code: event.target.value.toUpperCase() }))} />
            </Field>
            <Field label="Parent">
              <select value={form.parentId ?? "root"} onChange={(event) => setForm((state) => ({ ...state, parentId: event.target.value === "root" ? null : event.target.value }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="root">Root location</option>
                {locations.filter((item) => item.id !== editing?.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.code} / {item.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(event) => setForm((state) => ({ ...state, type: event.target.value as Location["type"] }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                {locationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Capacity">
              <Input type="number" value={form.capacity} onChange={(event) => setForm((state) => ({ ...state, capacity: Number(event.target.value) }))} />
            </Field>
            <Field label="Current Occupancy">
              <Input type="number" value={form.occupancy} onChange={(event) => setForm((state) => ({ ...state, occupancy: Number(event.target.value) }))} />
            </Field>
            <Field label="Layout X (%)">
              <Input type="number" value={form.x ?? ""} onChange={(event) => setForm((state) => ({ ...state, x: event.target.value ? Number(event.target.value) : undefined }))} />
            </Field>
            <Field label="Layout Y (%)">
              <Input type="number" value={form.y ?? ""} onChange={(event) => setForm((state) => ({ ...state, y: event.target.value ? Number(event.target.value) : undefined }))} />
            </Field>
            <Field label="Layout W (%)">
              <Input type="number" value={form.w ?? ""} onChange={(event) => setForm((state) => ({ ...state, w: event.target.value ? Number(event.target.value) : undefined }))} />
            </Field>
            <Field label="Layout H (%)">
              <Input type="number" value={form.h ?? ""} onChange={(event) => setForm((state) => ({ ...state, h: event.target.value ? Number(event.target.value) : undefined }))} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="text-white gradient-primary">Save Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WMSLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
