// Mock data + types for the Warehouse Management System (WMS) module.
// Backend-ready shapes — designed to be replaced by API calls later.

export type ProductType = "hardware" | "consumable";
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Overstock";
export type MovementType = "IN" | "OUT" | "TRANSFER" | "ADJUST";
export type SalesInvoiceStatus = "draft" | "pdf_generated" | "pushed";
export type LocationType =
  | "Warehouse"
  | "Gate"
  | "Office"
  | "Department"
  | "Cabin"
  | "Store Room"
  | "Zone"
  | "Rack"
  | "Shelf"
  | "Bin"
  | "Kitchen"
  | "Utility"
  | "Temple"
  | "Common Area"
  | "Dispatch Area"
  | "Receiving Area";

export interface Category {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  type: ProductType | "root";
  defaultUnit: string;
  lowStockThreshold: number;
  description: string;
  status: "Active" | "Inactive";
}

export interface Product {
  id: string;
  name: string;
  code: string;
  sku: string;
  barcode: string;
  categoryId: string;
  subCategoryId: string;
  type: ProductType;
  brand: string;
  modelNumber: string;
  unit: string;
  hsnCode: string;
  gstRate: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  reservedStock: number;
  imageHue: number;
  serialRequired: boolean;
  batchRequired: boolean;
  expiryRequired: boolean;
  warrantyMonths?: number;
  status: "Active" | "Inactive";
}

export interface Location {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  type: LocationType;
  capacity: number;
  occupancy: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface StockLot {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  rate: number;
}

export interface Movement {
  id: string;
  number: string;
  type: MovementType;
  productId: string;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  vendorId?: string;
  customerId?: string;
  reference?: string;
  rate?: number;
  date: string;
  createdBy: string;
  remarks?: string;
}

export interface SalesInvoiceLine {
  id: string;
  productId: string;
  lotId: string;
  locationId: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPct: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  customerId: string;
  customerGstNumber: string;
  placeOfSupply: string;
  paymentTerms: string;
  pushedToTally: boolean;
  tallyVoucherNumber?: string;
  ewayBillNumber?: string;
  notes?: string;
  lines: SalesInvoiceLine[];
  subTotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  status: SalesInvoiceStatus;
  pdfGenerated: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  city: string;
  categories: string[];
  paymentTerms: string;
  status: "Active" | "Inactive";
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  city: string;
  status: "Active" | "Inactive";
}

export interface StockRequest {
  id: string;
  number: string;
  requestedBy: string;
  department: string;
  productId: string;
  qty: number;
  purpose: string;
  requiredDate: string;
  priority: "Low" | "Medium" | "High";
  status: "Submitted" | "Approved" | "Issued" | "Rejected";
}

// ---------- CATEGORIES ----------
export const CATEGORIES: Category[] = [
  { id: "c-hw", name: "Hardware", code: "HW", parentId: null, type: "hardware", defaultUnit: "pcs", lowStockThreshold: 5, description: "IT hardware products", status: "Active" },
  { id: "c-cn", name: "Consumables", code: "CN", parentId: null, type: "consumable", defaultUnit: "pcs", lowStockThreshold: 20, description: "Consumable items", status: "Active" },
  // hardware sub
  { id: "c-hw-prn", name: "Printers", code: "HW-PRN", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 3, description: "", status: "Active" },
  { id: "c-hw-scn", name: "Scanners", code: "HW-SCN", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 3, description: "", status: "Active" },
  { id: "c-hw-ssd", name: "SSD", code: "HW-SSD", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 10, description: "", status: "Active" },
  { id: "c-hw-hdd", name: "Hard Disk", code: "HW-HDD", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 10, description: "", status: "Active" },
  { id: "c-hw-lap", name: "Laptops", code: "HW-LAP", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 2, description: "", status: "Active" },
  { id: "c-hw-mon", name: "Monitors", code: "HW-MON", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 2, description: "", status: "Active" },
  { id: "c-hw-net", name: "Networking", code: "HW-NET", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 5, description: "", status: "Active" },
  { id: "c-hw-cbl", name: "Cables", code: "HW-CBL", parentId: "c-hw", type: "hardware", defaultUnit: "pcs", lowStockThreshold: 20, description: "", status: "Active" },
  // consumables sub
  { id: "c-cn-roll", name: "Rolls", code: "CN-ROLL", parentId: "c-cn", type: "consumable", defaultUnit: "roll", lowStockThreshold: 50, description: "Thermal/paper rolls", status: "Active" },
  { id: "c-cn-ink", name: "Ink", code: "CN-INK", parentId: "c-cn", type: "consumable", defaultUnit: "cartridge", lowStockThreshold: 10, description: "", status: "Active" },
  { id: "c-cn-lbl", name: "Labels", code: "CN-LBL", parentId: "c-cn", type: "consumable", defaultUnit: "box", lowStockThreshold: 20, description: "", status: "Active" },
  { id: "c-cn-rib", name: "Ribbons", code: "CN-RIB", parentId: "c-cn", type: "consumable", defaultUnit: "pcs", lowStockThreshold: 20, description: "", status: "Active" },
  { id: "c-cn-crt", name: "Cartridges", code: "CN-CRT", parentId: "c-cn", type: "consumable", defaultUnit: "pcs", lowStockThreshold: 10, description: "", status: "Active" },
  { id: "c-cn-tnr", name: "Toners", code: "CN-TNR", parentId: "c-cn", type: "consumable", defaultUnit: "pcs", lowStockThreshold: 10, description: "", status: "Active" },
];

// ---------- LOCATIONS ----------
const RACK_MASTERS = [
  { key: "a1", id: "l-r-a1", code: "R1", name: "Rack R1", x: 56, y: 15 },
  { key: "b1", id: "l-r-b1", code: "R2", name: "Rack R2", x: 69, y: 15 },
  { key: "c1", id: "l-r-c1", code: "R3", name: "Rack R3", x: 82, y: 15 },
] as const;

export const LOCATIONS: Location[] = [
  { id: "l-wh", code: "OFFICE-MAP", name: "Office Warehouse Map", parentId: null, type: "Warehouse", capacity: 5600, occupancy: 0, x: 2, y: 2, w: 96, h: 96 },
  { id: "l-gate-1", code: "GATE-1", name: "Gate 1 Scan Point", parentId: "l-wh", type: "Gate", capacity: 0, occupancy: 0, x: 42, y: 0, w: 13, h: 6 },
  { id: "l-utility-toilet-nw", code: "TOILET-NW", name: "Toilet (North West)", parentId: "l-wh", type: "Utility", capacity: 0, occupancy: 0, x: 4, y: 8, w: 12, h: 8 },
  { id: "l-sr1", code: "S1", name: "Storage Area (S1)", parentId: "l-wh", type: "Store Room", capacity: 800, occupancy: 0, x: 4, y: 16, w: 15, h: 12 },
  { id: "l-dept-support", code: "SUPPORT", name: "Support Department", parentId: "l-wh", type: "Department", capacity: 0, occupancy: 0, x: 6, y: 28, w: 26, h: 12 },
  { id: "l-sr2", code: "S2", name: "Storage Zone S2", parentId: "l-wh", type: "Zone", capacity: 800, occupancy: 0, x: 6, y: 40, w: 26, h: 6 },
  { id: "l-dept-hardware", code: "HARDWARE", name: "Hardware Department", parentId: "l-wh", type: "Department", capacity: 0, occupancy: 0, x: 6, y: 48, w: 26, h: 12 },
  { id: "l-cabin-kush", code: "CABIN-KUSH", name: "Kush Sir Cabin", parentId: "l-wh", type: "Cabin", capacity: 0, occupancy: 0, x: 5, y: 61, w: 28, h: 9 },
  { id: "l-cabin-rakesh", code: "CABIN-RAKESH", name: "Rakesh Sir Cabin", parentId: "l-wh", type: "Cabin", capacity: 0, occupancy: 0, x: 5, y: 73, w: 31, h: 13 },
  { id: "l-temple", code: "TEMPLE", name: "Temple", parentId: "l-wh", type: "Temple", capacity: 0, occupancy: 0, x: 84, y: 8, w: 12, h: 8 },
  { id: "l-dept-software", code: "SOFTWARE", name: "Software Department", parentId: "l-wh", type: "Department", capacity: 0, occupancy: 0, x: 56, y: 28, w: 32, h: 12 },
  { id: "l-dept-account", code: "ACCOUNT", name: "Account Department", parentId: "l-wh", type: "Department", capacity: 0, occupancy: 0, x: 56, y: 41, w: 32, h: 12 },
  { id: "l-common-lunch", code: "LUNCH", name: "Lunch Table", parentId: "l-wh", type: "Common Area", capacity: 0, occupancy: 0, x: 58, y: 57, w: 17, h: 9 },
  { id: "l-utility-toilet-se", code: "TOILET-SE", name: "Toilet (South East)", parentId: "l-wh", type: "Utility", capacity: 0, occupancy: 0, x: 60, y: 66, w: 14, h: 9 },
  { id: "l-kitchen", code: "KITCHEN", name: "Kitchen", parentId: "l-wh", type: "Kitchen", capacity: 0, occupancy: 0, x: 78, y: 63, w: 14, h: 16 },
  { id: "l-sz-s3", code: "S3", name: "Storage Zone S3", parentId: "l-wh", type: "Zone", capacity: 600, occupancy: 0, x: 79, y: 77, w: 18, h: 11 },
  { id: "l-rack-bay", code: "RACK-BAY", name: "Rack Storage Bay", parentId: "l-wh", type: "Zone", capacity: 1800, occupancy: 0, x: 56, y: 8, w: 36, h: 12 },
  ...RACK_MASTERS.map((rack): Location => ({
    id: rack.id,
    code: rack.code,
    name: rack.name,
    parentId: "l-rack-bay",
    type: "Rack",
    capacity: 480,
    occupancy: 0,
    x: rack.x,
    y: rack.y,
    w: 13,
    h: 11,
  })),
  ...RACK_MASTERS.flatMap((rack) =>
    [1, 2, 3, 4].map((shelf): Location => ({
      id: `l-s-${rack.key}-${shelf}`,
      code: `${rack.code}-S${shelf}`,
      name: `Shelf ${shelf}`,
      parentId: rack.id,
      type: "Shelf",
      capacity: 120,
      occupancy: 0,
    })),
  ),
  ...RACK_MASTERS.flatMap((rack) =>
    [1, 2, 3, 4].flatMap((shelf) =>
      [1, 2, 3].map((bin): Location => ({
        id: `l-bin-${rack.key}-s${shelf}-b${bin}`,
        code: `${rack.code}-S${shelf}-B${bin}`,
        name: `Bin ${rack.code}-${shelf}-${bin}`,
        parentId: `l-s-${rack.key}-${shelf}`,
        type: "Bin",
        capacity: 40,
        occupancy: 0,
      })),
    ),
  ),
];

// ---------- PRODUCTS ----------
const p = (
  id: string, name: string, code: string, categoryId: string, subId: string,
  type: ProductType, brand: string, model: string, unit: string,
  current: number, min: number, max: number, purchase: number, selling: number, hue: number,
  extra: Partial<Product> = {}
): Product => ({
  id, name, code, sku: code, barcode: `BC${code}`, categoryId, subCategoryId: subId, type,
  brand, modelNumber: model, unit, hsnCode: "8443", gstRate: 18,
  minStock: min, maxStock: max, reorderLevel: Math.ceil(min * 1.5),
  purchasePrice: purchase, sellingPrice: selling, currentStock: current, reservedStock: 0,
  imageHue: hue, serialRequired: type === "hardware", batchRequired: type === "consumable",
  expiryRequired: false, warrantyMonths: type === "hardware" ? 12 : undefined,
  status: "Active", ...extra,
});

export const PRODUCTS: Product[] = [
  p("p-prn-1", "HP LaserJet Pro M1136", "HW-PRN-001", "c-hw", "c-hw-prn", "hardware", "HP", "M1136", "pcs", 8, 3, 20, 12500, 15800, 220),
  p("p-prn-2", "Epson L3250 EcoTank", "HW-PRN-002", "c-hw", "c-hw-prn", "hardware", "Epson", "L3250", "pcs", 4, 3, 15, 13800, 17200, 240),
  p("p-scn-1", "Canon LiDE 300", "HW-SCN-001", "c-hw", "c-hw-scn", "hardware", "Canon", "LiDE 300", "pcs", 6, 3, 12, 6200, 7800, 200),
  p("p-ssd-1", "Samsung 870 EVO 500GB", "HW-SSD-001", "c-hw", "c-hw-ssd", "hardware", "Samsung", "870 EVO", "pcs", 22, 10, 50, 4200, 5400, 275),
  p("p-ssd-2", "WD Blue SN570 1TB NVMe", "HW-SSD-002", "c-hw", "c-hw-ssd", "hardware", "WD", "SN570", "pcs", 14, 10, 40, 6500, 7900, 260),
  p("p-hdd-1", "Seagate Barracuda 2TB", "HW-HDD-001", "c-hw", "c-hw-hdd", "hardware", "Seagate", "ST2000", "pcs", 3, 10, 30, 4400, 5500, 180),
  p("p-lap-1", "Dell Latitude 3520", "HW-LAP-001", "c-hw", "c-hw-lap", "hardware", "Dell", "L3520", "pcs", 5, 2, 10, 58000, 68000, 220),
  p("p-mon-1", "LG 24\" IPS Monitor", "HW-MON-001", "c-hw", "c-hw-mon", "hardware", "LG", "24MK430H", "pcs", 9, 2, 20, 9500, 11900, 200),
  p("p-net-1", "TP-Link 8-port Switch", "HW-NET-001", "c-hw", "c-hw-net", "hardware", "TP-Link", "TL-SG108", "pcs", 12, 5, 30, 1300, 1750, 160),
  p("p-cbl-1", "CAT6 Patch Cable 2m", "HW-CBL-001", "c-hw", "c-hw-cbl", "hardware", "D-Link", "CAT6-2M", "pcs", 80, 20, 200, 120, 220, 140, { serialRequired: false }),
  // consumables
  p("p-roll-1", "Thermal Roll 80mm x 50m", "CN-ROLL-001", "c-cn", "c-cn-roll", "consumable", "Generic", "80x50", "roll", 500, 50, 1000, 22, 35, 320, { batchRequired: true }),
  p("p-roll-2", "Thermal Roll 57mm x 30m", "CN-ROLL-002", "c-cn", "c-cn-roll", "consumable", "Generic", "57x30", "roll", 18, 50, 800, 15, 28, 310, { batchRequired: true }),
  p("p-ink-1", "HP 678 Black Ink Cartridge", "CN-INK-001", "c-cn", "c-cn-ink", "consumable", "HP", "678", "cartridge", 24, 10, 60, 540, 720, 260),
  p("p-ink-2", "Epson 003 Magenta Bottle", "CN-INK-002", "c-cn", "c-cn-ink", "consumable", "Epson", "003-M", "cartridge", 6, 10, 60, 280, 380, 340),
  p("p-lbl-1", "Barcode Labels 50x25 (1000)", "CN-LBL-001", "c-cn", "c-cn-lbl", "consumable", "Generic", "50x25", "box", 120, 20, 400, 180, 260, 140, { batchRequired: true }),
  p("p-rib-1", "Wax Resin Ribbon 110x300", "CN-RIB-001", "c-cn", "c-cn-rib", "consumable", "Armor", "110x300", "pcs", 0, 20, 200, 320, 440, 30),
  p("p-tnr-1", "HP 88A Toner Cartridge", "CN-TNR-001", "c-cn", "c-cn-tnr", "consumable", "HP", "88A", "pcs", 9, 10, 40, 2800, 3600, 250),
];

// ---------- STOCK LOTS (location-wise) ----------
export const STOCK_LOTS: StockLot[] = [
  { id: "sl-1", productId: "p-roll-1", locationId: "l-bin-a1-s4-b1", quantity: 300, batchNumber: "B-2026-04", rate: 22 },
  { id: "sl-2", productId: "p-roll-1", locationId: "l-bin-a1-s4-b2", quantity: 200, batchNumber: "B-2026-04", rate: 22 },
  { id: "sl-3", productId: "p-ssd-1", locationId: "l-bin-b1-s1-b2", quantity: 22, serialNumber: "SAM-870-001..022", rate: 4200 },
  { id: "sl-4", productId: "p-lap-1", locationId: "l-bin-c1-s3-b1", quantity: 5, serialNumber: "DEL-L-001..005", rate: 58000 },
  { id: "sl-5", productId: "p-ink-1", locationId: "l-bin-a1-s2-b2", quantity: 24, batchNumber: "B-2026-01", rate: 540 },
  { id: "sl-6", productId: "p-prn-1", locationId: "l-bin-c1-s1-b1", quantity: 8, serialNumber: "HP-M1136-001..008", rate: 12500 },
  { id: "sl-7", productId: "p-mon-1", locationId: "l-bin-b1-s3-b2", quantity: 9, serialNumber: "LG-24-001..009", rate: 9500 },
  { id: "sl-8", productId: "p-cbl-1", locationId: "l-bin-a1-s1-b3", quantity: 80, rate: 120 },
];

// ---------- MOVEMENTS ----------
export const MOVEMENTS: Movement[] = [
  { id: "m-1", number: "IN-0001", type: "IN", productId: "p-roll-1", quantity: 500, toLocationId: "l-bin-a1-s4-b1", vendorId: "v-1", reference: "PO-1001", rate: 22, date: "2026-06-01", createdBy: "u-admin" },
  { id: "m-2", number: "IN-0002", type: "IN", productId: "p-ssd-1", quantity: 22, toLocationId: "l-bin-b1-s1-b2", vendorId: "v-2", reference: "PO-1002", rate: 4200, date: "2026-06-02", createdBy: "u-admin" },
  { id: "m-3", number: "OUT-0001", type: "OUT", productId: "p-roll-1", quantity: 50, fromLocationId: "l-bin-a1-s4-b1", customerId: "cu-1", reference: "INV-2001", date: "2026-06-03", createdBy: "u-admin" },
  { id: "m-4", number: "TRF-0001", type: "TRANSFER", productId: "p-cbl-1", quantity: 20, fromLocationId: "l-bin-a1-s1-b2", toLocationId: "l-bin-a1-s1-b3", date: "2026-06-04", createdBy: "u-admin" },
  { id: "m-5", number: "OUT-0002", type: "OUT", productId: "p-prn-1", quantity: 1, fromLocationId: "l-bin-c1-s1-b1", customerId: "cu-2", reference: "INV-2002", date: "2026-06-04", createdBy: "u-admin" },
];

export const SALES_INVOICES: SalesInvoice[] = [];

// ---------- VENDORS ----------
export const VENDORS: Vendor[] = [
  { id: "v-1", name: "Apex Stationers", code: "V-001", contactPerson: "Manoj Shah", phone: "+91 98200 11111", email: "sales@apexstat.in", gstNumber: "27AAACA1234A1Z5", city: "Mumbai", categories: ["c-cn"], paymentTerms: "Net 30", status: "Active" },
  { id: "v-2", name: "Compunet Distributors", code: "V-002", contactPerson: "Reena Iyer", phone: "+91 98765 22222", email: "reena@compunet.in", gstNumber: "29AABCC2345B1Z7", city: "Bengaluru", categories: ["c-hw"], paymentTerms: "Net 45", status: "Active" },
  { id: "v-3", name: "PrintHub Supplies", code: "V-003", contactPerson: "Arun Mehta", phone: "+91 99100 33333", email: "arun@printhub.in", gstNumber: "07AABCP3456C1Z9", city: "Delhi", categories: ["c-cn", "c-hw"], paymentTerms: "Advance", status: "Active" },
];

// ---------- CUSTOMERS ----------
export const CUSTOMERS: Customer[] = [
  { id: "cu-1", name: "Nova Retail", company: "Nova Retail Pvt Ltd", contactPerson: "Sahil Khan", phone: "+91 98000 44444", email: "purchase@novaretail.in", gstNumber: "27AACCN9876R1Z1", city: "Pune", status: "Active" },
  { id: "cu-2", name: "Bharat Logistics", company: "Bharat Logistics Co", contactPerson: "Geeta Rao", phone: "+91 98000 55555", email: "ops@bharatlog.in", gstNumber: "29AAACB1122L1Z3", city: "Hyderabad", status: "Active" },
  { id: "cu-3", name: "Skyline Hotels", company: "Skyline Hospitality", contactPerson: "Vikas Jain", phone: "+91 98000 66666", email: "it@skylinehotels.in", gstNumber: "06AACCS5544H1Z7", city: "Gurugram", status: "Active" },
];

// ---------- STOCK REQUESTS ----------
export const STOCK_REQUESTS: StockRequest[] = [
  { id: "r-1", number: "REQ-0001", requestedBy: "Neha Verma", department: "Support", productId: "p-cbl-1", qty: 5, purpose: "Site installation", requiredDate: "2026-06-07", priority: "Medium", status: "Submitted" },
  { id: "r-2", number: "REQ-0002", requestedBy: "Karan Patel", department: "Software", productId: "p-ssd-1", qty: 2, purpose: "Dev workstations", requiredDate: "2026-06-08", priority: "High", status: "Approved" },
  { id: "r-3", number: "REQ-0003", requestedBy: "Pooja Reddy", department: "Accounts", productId: "p-roll-1", qty: 20, purpose: "Billing counter", requiredDate: "2026-06-06", priority: "High", status: "Issued" },
];

// ---------- Helpers ----------
export const stockStatus = (p: Product): StockStatus => {
  if (p.currentStock <= 0) return "Out of Stock";
  if (p.currentStock < p.minStock) return "Low Stock";
  if (p.currentStock > p.maxStock) return "Overstock";
  return "In Stock";
};

export const stockStatusColor = (s: StockStatus) =>
  s === "In Stock" ? "text-[color:var(--success)] bg-[color:var(--success)]/15"
  : s === "Low Stock" ? "text-[color:var(--warning)] bg-[color:var(--warning)]/15"
  : s === "Out of Stock" ? "text-[color:var(--destructive)] bg-[color:var(--destructive)]/15"
  : "text-[color:var(--secondary)] bg-[color:var(--secondary)]/15";

export const findCategory = (id: string) => CATEGORIES.find(c => c.id === id);
export const findProduct = (id: string) => PRODUCTS.find(p => p.id === id);
export const findLocation = (id: string) => LOCATIONS.find(l => l.id === id);
export const findVendor = (id: string) => VENDORS.find(v => v.id === id);
export const findCustomer = (id: string) => CUSTOMERS.find(c => c.id === id);

export const productImage = (p: Product) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${p.imageHue},75%25,60%25)'/><stop offset='1' stop-color='hsl(${(p.imageHue + 60) % 360},75%25,45%25)'/></linearGradient></defs><rect width='80' height='80' rx='14' fill='url(%23g)'/><text x='50%25' y='54%25' text-anchor='middle' font-family='Inter,sans-serif' font-size='28' font-weight='700' fill='white'>${p.code.split("-")[1] ?? "P"}</text></svg>`;

export const totalStockValue = () =>
  PRODUCTS.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);

export const stockOfType = (t: ProductType) =>
  PRODUCTS.filter(p => p.type === t).reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);

export const lowStockItems = () => PRODUCTS.filter(p => stockStatus(p) === "Low Stock");
export const outOfStockItems = () => PRODUCTS.filter(p => stockStatus(p) === "Out of Stock");

export const locationsOfProduct = (productId: string) =>
  STOCK_LOTS.filter(l => l.productId === productId);

export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
