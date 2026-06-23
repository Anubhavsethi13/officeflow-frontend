import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { useWmsStore } from "@/lib/wms-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wms/settings")({
  head: () => ({ meta: [{ title: "WMS Settings - officeflow" }] }),
  component: SettingsPage,
});

const units = ["pcs", "box", "roll", "packet", "litre", "kg", "meter", "cartridge", "set"];
const locationTypes = [
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

function SettingsPage() {
  const settings = useWmsStore((state) => state.settings);
  const updateSettings = useWmsStore((state) => state.updateSettings);
  const resetWms = useWmsStore((state) => state.resetWms);

  return (
    <WMSLayout title="WMS Settings" subtitle="Configure tracking, approvals, alerts and warehouse layout">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="wms-settings-panel">
          <h3 className="mb-4 font-display font-semibold">Tracking & Approvals</h3>
          <div className="space-y-3">
            <SettingSwitch title="Serial number tracking" desc="Use serial numbers for hardware stock in, out and transfer." value={settings.trackSerial} onChange={(value) => updateSettings({ trackSerial: value })} />
            <SettingSwitch title="Batch and expiry tracking" desc="Use batch references for consumables and expiry-sensitive items." value={settings.trackBatch} onChange={(value) => updateSettings({ trackBatch: value })} />
            <SettingSwitch title="High-value stock-out approval" desc="Mark expensive outward movements for approval before dispatch." value={settings.requireApproval} onChange={(value) => updateSettings({ requireApproval: value })} />
            <SettingSwitch title="Auto-generate QR payloads" desc="Generate copyable QR payloads for products, lots and locations." value={settings.autoGenerateQr} onChange={(value) => updateSettings({ autoGenerateQr: value })} />
            <SettingSwitch title="Email stock alerts" desc="Send alerts when a product enters low or out-of-stock state." value={settings.emailAlerts} onChange={(value) => updateSettings({ emailAlerts: value })} />
            <div className="wms-settings-control wms-settings-range-control">
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-medium">Low stock alert buffer</Label>
                <span className="text-sm text-muted-foreground">{settings.lowStockPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={settings.lowStockPct}
                onChange={(event) => updateSettings({ lowStockPct: Number(event.target.value) })}
                className="wms-settings-range"
              />
            </div>
          </div>
        </section>

        <section className="wms-settings-panel">
          <h3 className="mb-4 font-display font-semibold">Masters</h3>
          <div className="mb-6">
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Units of Measurement</div>
            <div className="flex flex-wrap gap-2">
              {units.map((unit) => (
                <span key={unit} className="wms-settings-chip">{unit}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Location Types</div>
            <div className="flex flex-wrap gap-2">
              {locationTypes.map((type) => (
                <span key={type} className="wms-settings-chip">{type}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="wms-settings-panel lg:col-span-2">
          <h3 className="mb-2 font-display font-semibold">3D Warehouse Layout</h3>
          <div className="mb-4 text-xs text-muted-foreground">
            Upload the warehouse floor image name here. The live view uses the three-rack layout until your exact drawing is mapped.
          </div>
          <label className="wms-settings-dropzone">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{settings.layoutName ?? "Click to upload layout image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => updateSettings({ layoutName: event.target.files?.[0]?.name ?? null })}
            />
          </label>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-transparent"
          onClick={() => {
            if (!window.confirm("Reset WMS data back to the sample warehouse?")) return;
            resetWms();
            toast.success("WMS sample data restored.");
          }}
        >
          <RotateCcw className="size-4" /> Reset Demo Data
        </Button>
        <Button onClick={() => toast.success("Settings saved.")} className="rounded-xl border-0 text-white gradient-primary">
          <Save className="size-4" /> Save Settings
        </Button>
      </div>
    </WMSLayout>
  );
}

function SettingSwitch({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="wms-settings-control">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} className="data-[state=checked]:bg-[color:var(--success)]" />
    </div>
  );
}
