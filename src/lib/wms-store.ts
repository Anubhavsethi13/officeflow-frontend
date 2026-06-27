import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { officeflowApi } from "./api/officeflow";
import {
  CATEGORIES,
  CUSTOMERS,
  LOCATIONS,
  MOVEMENTS,
  PRODUCTS,
  SALES_INVOICES,
  STOCK_LOTS,
  VENDORS,
  type Category,
  type Customer,
  type Location,
  type Movement,
  type Product,
  type SalesInvoice,
  type SalesInvoiceLine,
  type StockLot,
  type Vendor,
} from "./wms-data";

type Result = { ok: boolean; message: string };

export type WmsSettings = {
  trackSerial: boolean;
  trackBatch: boolean;
  requireApproval: boolean;
  lowStockPct: number;
  layoutName: string | null;
  autoGenerateQr: boolean;
  emailAlerts: boolean;
};

export type StockInLine = {
  productId: string;
  qty: number;
  rate: number;
  batch?: string;
  serial?: string;
};

type StockInPayload = {
  vendorId: string;
  locationId: string;
  invoice?: string;
  po?: string;
  lines: StockInLine[];
};

type StockOutPayload = {
  productId: string;
  lotId: string;
  customerId: string;
  qty: number;
  reference?: string;
  reason?: string;
};

type TransferPayload = {
  productId: string;
  fromLotId: string;
  toLocationId: string;
  qty: number;
  reason?: string;
};

export type SalesInvoiceInputLine = {
  productId: string;
  lotId: string;
  qty: number;
  rate: number;
  discountPct: number;
};

type SalesInvoicePayload = {
  customerId: string;
  customerGstNumber: string;
  placeOfSupply: string;
  paymentTerms: string;
  date: string;
  dueDate?: string;
  pushedToTally: boolean;
  tallyVoucherNumber?: string;
  ewayBillNumber?: string;
  notes?: string;
  lines: SalesInvoiceInputLine[];
};

type WmsState = {
  categories: Category[];
  products: Product[];
  locations: Location[];
  stockLots: StockLot[];
  movements: Movement[];
  salesInvoices: SalesInvoice[];
  vendors: Vendor[];
  customers: Customer[];
  settings: WmsSettings;
  addCategory: (category: Omit<Category, "id">) => string;
  updateCategory: (id: string, patch: Partial<Category>) => Result;
  deleteCategory: (id: string) => Result;
  addProduct: (product: Omit<Product, "id" | "barcode" | "sku" | "imageHue"> & Partial<Pick<Product, "barcode" | "sku" | "imageHue">>) => string;
  updateProduct: (id: string, patch: Partial<Product>) => Result;
  deleteProduct: (id: string) => Result;
  addLocation: (location: Omit<Location, "id">) => string;
  updateLocation: (id: string, patch: Partial<Location>) => Result;
  deleteLocation: (id: string) => Result;
  addVendor: (vendor: Omit<Vendor, "id">) => string;
  updateVendor: (id: string, patch: Partial<Vendor>) => Result;
  deleteVendor: (id: string) => Result;
  addCustomer: (customer: Omit<Customer, "id">) => string;
  updateCustomer: (id: string, patch: Partial<Customer>) => Result;
  deleteCustomer: (id: string) => Result;
  receiveStock: (payload: StockInPayload) => Promise<Result>;
  issueStock: (payload: StockOutPayload) => Promise<Result>;
  transferStock: (payload: TransferPayload) => Result;
  createSalesInvoice: (payload: SalesInvoicePayload) => Promise<Result & { invoice?: SalesInvoice }>;
  markSalesInvoicePdfGenerated: (invoiceId: string) => Result;
  pushSalesInvoiceToTally: (invoiceId: string, tallyVoucherNumber: string) => Result;
  importProducts: (products: Array<Partial<Product> & Pick<Product, "name" | "code">>) => Result;
  updateSettings: (patch: Partial<WmsSettings>) => void;
  resetWms: () => void;
  syncWithBackend: () => Promise<void>;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const getStorage = () => (typeof window === "undefined" ? noopStorage : window.localStorage);

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const today = () => new Date().toISOString().slice(0, 10);

const movementPrefix = (type: Movement["type"]) =>
  type === "IN" ? "IN" : type === "OUT" ? "OUT" : type === "TRANSFER" ? "TRF" : "ADJ";

const nextMovementNumber = (movements: Movement[], type: Movement["type"]) => {
  const prefix = movementPrefix(type);
  const count = movements.filter((m) => m.type === type).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
};

const nextSalesInvoiceNumber = (invoices: SalesInvoice[]) =>
  `SI-${String(invoices.length + 1).padStart(4, "0")}`;

const sellerGstStateCode = "27";

const isInterStateSale = (customerGstNumber: string, placeOfSupply: string) => {
  const gstStateCode = customerGstNumber.trim().slice(0, 2);
  if (/^\d{2}$/.test(gstStateCode)) return gstStateCode !== sellerGstStateCode;
  return placeOfSupply.trim().toLowerCase() !== "maharashtra";
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const seedLocations: Location[] = LOCATIONS.map((location) => ({ ...location }));
const seedStockLots: StockLot[] = STOCK_LOTS.map((lot) => ({ ...lot }));
const seedMovements: Movement[] = MOVEMENTS.map((movement) => ({ ...movement }));
const seedSalesInvoices: SalesInvoice[] = SALES_INVOICES.map((invoice) => ({ ...invoice }));

const seedSettings: WmsSettings = {
  trackSerial: true,
  trackBatch: true,
  requireApproval: true,
  lowStockPct: 20,
  layoutName: null,
  autoGenerateQr: true,
  emailAlerts: true,
};

const normalizeSalesInvoice = (invoice: SalesInvoice): SalesInvoice => {
  const pushedToTally = invoice.pushedToTally || invoice.status === "pushed";
  const pdfGenerated = Boolean(invoice.pdfGenerated || invoice.status === "pdf_generated");

  return {
    ...invoice,
    pushedToTally,
    pdfGenerated,
    status: pushedToTally ? "pushed" : pdfGenerated ? "pdf_generated" : "draft",
  };
};

const initialState = {
  categories: CATEGORIES,
  products: PRODUCTS,
  locations: seedLocations,
  stockLots: seedStockLots,
  movements: seedMovements,
  salesInvoices: seedSalesInvoices,
  vendors: VENDORS,
  customers: CUSTOMERS,
  settings: seedSettings,
};

const migrateWmsState = (persistedState: unknown): Partial<WmsState> => {
  const state = (persistedState ?? {}) as Partial<WmsState>;
  return {
    ...state,
    locations: state.locations ?? seedLocations,
    stockLots: state.stockLots ?? seedStockLots,
    movements: state.movements ?? seedMovements,
    salesInvoices: (state.salesInvoices ?? seedSalesInvoices).map(normalizeSalesInvoice),
    settings: { ...seedSettings, ...(state.settings ?? {}) },
  };
};

const adjustLocationOccupancy = (locations: Location[], locationId: string, delta: number) => {
  const parentIds = getLocationPath(locations, locationId).map((location) => location.id);
  return locations.map((location) =>
    parentIds.includes(location.id)
      ? { ...location, occupancy: Math.max(0, Math.min(location.capacity, location.occupancy + delta)) }
      : location,
  );
};

const updateProductStock = (products: Product[], productId: string, delta: number) =>
  products.map((product) =>
    product.id === productId ? { ...product, currentStock: Math.max(0, product.currentStock + delta) } : product,
  );

const sameLot = (lot: StockLot, line: StockInLine, locationId: string) =>
  lot.productId === line.productId &&
  lot.locationId === locationId &&
  (lot.batchNumber ?? "") === (line.batch ?? "") &&
  (lot.serialNumber ?? "") === (line.serial ?? "");

export const useWmsStore = create<WmsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addCategory: (category) => {
        const newId = id("cat");
        set((state) => ({ categories: [...state.categories, { ...category, id: newId }] }));
        return newId;
      },
      updateCategory: (categoryId, patch) => {
        const exists = get().categories.some((category) => category.id === categoryId);
        if (!exists) return { ok: false, message: "Category not found" };
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId ? { ...category, ...patch, id: category.id } : category,
          ),
        }));
        return { ok: true, message: "Category updated" };
      },
      deleteCategory: (categoryId) => {
        const state = get();
        const inUse =
          state.categories.some((category) => category.parentId === categoryId) ||
          state.products.some((product) => product.categoryId === categoryId || product.subCategoryId === categoryId);
        if (inUse) return { ok: false, message: "Category is in use. Move products or subcategories first." };
        set((current) => ({ categories: current.categories.filter((category) => category.id !== categoryId) }));
        return { ok: true, message: "Category deleted" };
      },
      addProduct: (product) => {
        const newId = id("prd");
        const sku = product.sku || product.code;
        const barcode = product.barcode || `BC${product.code}`;
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: newId,
              sku,
              barcode,
              imageHue: product.imageHue ?? Math.floor(Math.random() * 360),
              currentStock: product.currentStock ?? 0,
              reservedStock: product.reservedStock ?? 0,
            },
          ],
        }));
        return newId;
      },
      updateProduct: (productId, patch) => {
        const exists = get().products.some((product) => product.id === productId);
        if (!exists) return { ok: false, message: "Product not found" };
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, ...patch, id: product.id } : product,
          ),
        }));
        return { ok: true, message: "Product updated" };
      },
      deleteProduct: (productId) => {
        const state = get();
        const product = state.products.find((item) => item.id === productId);
        if (!product) return { ok: false, message: "Product not found" };
        if (product.currentStock > 0) return { ok: false, message: "Product has stock. Issue or transfer stock before deleting." };
        set((current) => ({
          products: current.products.filter((item) => item.id !== productId),
          stockLots: current.stockLots.filter((lot) => lot.productId !== productId),
        }));
        return { ok: true, message: "Product deleted" };
      },
      addLocation: (location) => {
        const newId = id("loc");
        set((state) => ({ locations: [...state.locations, { ...location, id: newId }] }));
        return newId;
      },
      updateLocation: (locationId, patch) => {
        const exists = get().locations.some((location) => location.id === locationId);
        if (!exists) return { ok: false, message: "Location not found" };
        set((state) => ({
          locations: state.locations.map((location) =>
            location.id === locationId ? { ...location, ...patch, id: location.id } : location,
          ),
        }));
        return { ok: true, message: "Location updated" };
      },
      deleteLocation: (locationId) => {
        const state = get();
        const inUse =
          state.locations.some((location) => location.parentId === locationId) ||
          state.stockLots.some((lot) => lot.locationId === locationId && lot.quantity > 0);
        if (inUse) return { ok: false, message: "Location contains child locations or stock." };
        set((current) => ({ locations: current.locations.filter((location) => location.id !== locationId) }));
        return { ok: true, message: "Location deleted" };
      },
      addVendor: (vendor) => {
        const newId = id("ven");
        set((state) => ({ vendors: [...state.vendors, { ...vendor, id: newId }] }));
        return newId;
      },
      updateVendor: (vendorId, patch) => {
        const exists = get().vendors.some((vendor) => vendor.id === vendorId);
        if (!exists) return { ok: false, message: "Vendor not found" };
        set((state) => ({
          vendors: state.vendors.map((vendor) => (vendor.id === vendorId ? { ...vendor, ...patch, id: vendor.id } : vendor)),
        }));
        return { ok: true, message: "Vendor updated" };
      },
      deleteVendor: (vendorId) => {
        set((state) => ({ vendors: state.vendors.filter((vendor) => vendor.id !== vendorId) }));
        return { ok: true, message: "Vendor deleted" };
      },
      addCustomer: (customer) => {
        const newId = id("cus");
        set((state) => ({ customers: [...state.customers, { ...customer, id: newId }] }));
        return newId;
      },
      updateCustomer: (customerId, patch) => {
        const exists = get().customers.some((customer) => customer.id === customerId);
        if (!exists) return { ok: false, message: "Customer not found" };
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, ...patch, id: customer.id } : customer,
          ),
        }));
        return { ok: true, message: "Customer updated" };
      },
      deleteCustomer: (customerId) => {
        set((state) => ({ customers: state.customers.filter((customer) => customer.id !== customerId) }));
        return { ok: true, message: "Customer deleted" };
      },
      receiveStock: async ({ vendorId, locationId, invoice, po, lines }) => {
        const validLines = lines.filter((line) => line.productId && line.qty > 0 && line.rate >= 0);
        if (!vendorId || !locationId || validLines.length === 0) {
          return { ok: false, message: "Select vendor, location and at least one valid item." };
        }
        try {
          for (const line of validLines) {
            await officeflowApi.inventory.stockIn(line.productId, line.qty);
          }
          await get().syncWithBackend();
          return { ok: true, message: `Saved inward for ${validLines.length} item${validLines.length === 1 ? "" : "s"}.` };
        } catch (err: any) {
          console.error("Failed to receive stock on backend:", err);
          return { ok: false, message: err.message || "Failed to receive stock on backend." };
        }
      },
      issueStock: async ({ productId, lotId, customerId, qty, reference, reason }) => {
        const state = get();
        const lot = state.stockLots.find((item) => item.id === lotId && item.productId === productId);
        if (!lot) return { ok: false, message: "Selected product/location lot is not available." };
        if (qty <= 0) return { ok: false, message: "Quantity must be greater than zero." };
        if (qty > lot.quantity) return { ok: false, message: `Only ${lot.quantity} units are available in that lot.` };
        try {
          await officeflowApi.inventory.stockOut(productId, qty);
          await get().syncWithBackend();
          return { ok: true, message: "Stock issued successfully." };
        } catch (err: any) {
          console.error("Failed to issue stock on backend:", err);
          return { ok: false, message: err.message || "Failed to issue stock on backend." };
        }
      },
      createSalesInvoice: async (payload) => {
        const state = get();
        const customer = state.customers.find((item) => item.id === payload.customerId);
        const lines = payload.lines
          .filter((line) => line.productId && line.qty > 0 && line.rate >= 0);

        if (!customer) return { ok: false, message: "Select a valid customer." };
        if (lines.length === 0) return { ok: false, message: "Add at least one invoice item." };

        try {
          const backendPayload = {
            customerId: payload.customerId,
            items: lines.map((line) => ({
              productId: line.productId,
              quantity: line.qty,
              price: line.rate,
            })),
          };

          const newInvoice = await officeflowApi.invoices.create(backendPayload);
          await get().syncWithBackend();

          const savedInvoice = get().salesInvoices.find((si) => si.id === newInvoice.id);

          return {
            ok: true,
            message: `Sales invoice ${savedInvoice?.number ?? ""} saved successfully.`,
            invoice: savedInvoice,
          };
        } catch (err: any) {
          console.error("Failed to create sales invoice on backend:", err);
          return { ok: false, message: err.message || "Failed to create sales invoice on backend." };
        }
      },
      markSalesInvoicePdfGenerated: (invoiceId) => {
        const invoice = get().salesInvoices.find((item) => item.id === invoiceId);
        if (!invoice) return { ok: false, message: "Sales invoice not found." };

        set((state) => ({
          salesInvoices: state.salesInvoices.map((item) =>
            item.id === invoiceId
              ? {
                  ...item,
                  pdfGenerated: true,
                  status: item.status === "pushed" || item.pushedToTally ? "pushed" : "pdf_generated",
                }
              : item,
          ),
        }));

        return { ok: true, message: `PDF status updated for ${invoice.number}.` };
      },
      pushSalesInvoiceToTally: (invoiceId, tallyVoucherNumber) => {
        const voucher = tallyVoucherNumber.trim().toUpperCase();
        if (!voucher) return { ok: false, message: "Enter the Tally voucher number." };

        const invoice = get().salesInvoices.find((item) => item.id === invoiceId);
        if (!invoice) return { ok: false, message: "Sales invoice not found." };

        set((state) => ({
          movements: state.movements.map((movement) =>
            movement.reference === invoice.number
              ? {
                  ...movement,
                  remarks: `SI pushed to Tally / ${voucher}`,
                }
              : movement,
          ),
          salesInvoices: state.salesInvoices.map((item) =>
            item.id === invoiceId
              ? {
                  ...item,
                  pushedToTally: true,
                  tallyVoucherNumber: voucher,
                  status: "pushed",
                }
              : item,
          ),
        }));

        return { ok: true, message: `${invoice.number} marked as pushed to Tally.` };
      },
      transferStock: ({ productId, fromLotId, toLocationId, qty, reason }) => {
        const state = get();
        const sourceLot = state.stockLots.find((lot) => lot.id === fromLotId && lot.productId === productId);
        if (!sourceLot) return { ok: false, message: "Source lot not found." };
        if (sourceLot.locationId === toLocationId) return { ok: false, message: "Choose a different destination location." };
        if (qty <= 0) return { ok: false, message: "Quantity must be greater than zero." };
        if (qty > sourceLot.quantity) return { ok: false, message: `Only ${sourceLot.quantity} units are available to transfer.` };
        set((current) => {
          let stockLots = current.stockLots
            .map((lot) => (lot.id === fromLotId ? { ...lot, quantity: lot.quantity - qty } : lot))
            .filter((lot) => lot.quantity > 0);
          const destinationIndex = stockLots.findIndex(
            (lot) =>
              lot.productId === productId &&
              lot.locationId === toLocationId &&
              (lot.batchNumber ?? "") === (sourceLot.batchNumber ?? "") &&
              (lot.serialNumber ?? "") === (sourceLot.serialNumber ?? ""),
          );
          if (destinationIndex >= 0) {
            stockLots = stockLots.map((lot, index) =>
              index === destinationIndex ? { ...lot, quantity: lot.quantity + qty } : lot,
            );
          } else {
            stockLots = [
              ...stockLots,
              {
                ...sourceLot,
                id: id("lot"),
                locationId: toLocationId,
                quantity: qty,
              },
            ];
          }
          return {
            stockLots,
            locations: adjustLocationOccupancy(adjustLocationOccupancy(current.locations, sourceLot.locationId, -qty), toLocationId, qty),
            movements: [
              ...current.movements,
              {
                id: id("mov"),
                number: nextMovementNumber(current.movements, "TRANSFER"),
                type: "TRANSFER" as const,
                productId,
                quantity: qty,
                fromLocationId: sourceLot.locationId,
                toLocationId,
                date: today(),
                createdBy: "u-admin",
                remarks: reason || undefined,
              },
            ],
          };
        });
        return { ok: true, message: "Transfer saved successfully." };
      },
      importProducts: (incoming) => {
        if (incoming.length === 0) return { ok: false, message: "No valid products found in the import file." };
        set((state) => {
          const products = [...state.products];
          incoming.forEach((row) => {
            const existingIndex = products.findIndex((product) => product.code === row.code || product.sku === row.sku);
            const fallbackCategory = state.categories.find((category) => category.parentId === null);
            const fallbackSubCategory =
              state.categories.find((category) => category.parentId === fallbackCategory?.id) ?? fallbackCategory;
            const nextProduct: Product = {
              id: existingIndex >= 0 ? products[existingIndex].id : id("prd"),
              name: row.name,
              code: row.code,
              sku: row.sku || row.code,
              barcode: row.barcode || `BC${row.code}`,
              categoryId: row.categoryId || fallbackCategory?.id || "c-hw",
              subCategoryId: row.subCategoryId || fallbackSubCategory?.id || row.categoryId || "c-hw-prn",
              type: row.type || "hardware",
              brand: row.brand || "Generic",
              modelNumber: row.modelNumber || "-",
              unit: row.unit || "pcs",
              hsnCode: row.hsnCode || "8443",
              gstRate: Number(row.gstRate ?? 18),
              minStock: Number(row.minStock ?? 1),
              maxStock: Number(row.maxStock ?? 100),
              reorderLevel: Number(row.reorderLevel ?? 5),
              purchasePrice: Number(row.purchasePrice ?? 0),
              sellingPrice: Number(row.sellingPrice ?? 0),
              currentStock: Number(row.currentStock ?? 0),
              reservedStock: Number(row.reservedStock ?? 0),
              imageHue: Number(row.imageHue ?? Math.floor(Math.random() * 360)),
              serialRequired: Boolean(row.serialRequired ?? row.type === "hardware"),
              batchRequired: Boolean(row.batchRequired ?? row.type === "consumable"),
              expiryRequired: Boolean(row.expiryRequired ?? false),
              warrantyMonths: row.warrantyMonths,
              status: row.status || "Active",
            };
            if (existingIndex >= 0) products[existingIndex] = nextProduct;
            else products.push(nextProduct);
          });
          return { products };
        });
        return { ok: true, message: `Imported ${incoming.length} product${incoming.length === 1 ? "" : "s"}.` };
      },
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetWms: () => set(initialState),
      syncWithBackend: async () => {
        try {
          const [beProducts, beInventory, beVendors, beCustomers] = await Promise.all([
            officeflowApi.products.list(),
            officeflowApi.inventory.list(),
            officeflowApi.vendors.list(),
            officeflowApi.customers.list(),
          ]);

          const beMovements = await officeflowApi.inventory.movements().catch(() => []);
          const beInvoices = await officeflowApi.invoices.list().catch(() => []);

          const vendors = beVendors.map((beVendor) => {
            const existing = get().vendors.find((v) => v.id === beVendor.id);
            if (existing) {
              return { ...existing, name: beVendor.name, phone: beVendor.phone || "" };
            }
            return {
              id: beVendor.id,
              name: beVendor.name,
              code: `V-${beVendor.id.slice(0, 4).toUpperCase()}`,
              contactPerson: beVendor.name,
              phone: beVendor.phone || "",
              email: `${beVendor.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
              gstNumber: "27AAACA1234A1Z5",
              city: "Mumbai",
              categories: [],
              paymentTerms: "Net 30",
              status: "Active" as const,
            };
          });

          const customers = beCustomers.map((beCustomer) => {
            const existing = get().customers.find((c) => c.id === beCustomer.id);
            if (existing) {
              return { ...existing, name: beCustomer.name, phone: beCustomer.phone || "" };
            }
            return {
              id: beCustomer.id,
              name: beCustomer.name,
              company: beCustomer.name,
              contactPerson: beCustomer.name,
              phone: beCustomer.phone || "",
              email: `${beCustomer.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
              gstNumber: "27AACCN9876R1Z1",
              city: "Pune",
              status: "Active" as const,
            };
          });

          let categories = [...get().categories];
          beProducts.forEach((p) => {
            if (p.category) {
              const catExists = categories.some((c) => c.id === p.categoryId || c.id === p.category?.id);
              if (!catExists && p.categoryId) {
                categories.push({
                  id: p.categoryId,
                  name: p.category.name,
                  code: p.category.name.substring(0, 4).toUpperCase(),
                  parentId: null,
                  type: "root",
                  defaultUnit: "pcs",
                  lowStockThreshold: 5,
                  description: "Synced from backend",
                  status: "Active",
                });
              }
            }
          });

          const products = beProducts.map((beProduct) => {
            const existing = get().products.find((p) => p.id === beProduct.id || p.sku === beProduct.sku);
            const fallbackCategory = categories.find((c) => c.parentId === null);
            const fallbackSubCategory = categories.find((c) => c.parentId === fallbackCategory?.id) ?? fallbackCategory;
            const categoryId = beProduct.categoryId || fallbackCategory?.id || "c-hw";
            const beInvQty = beInventory.find((item) => item.productId === beProduct.id)?.quantity ?? 0;

            if (existing) {
              return {
                ...existing,
                id: beProduct.id,
                name: beProduct.name,
                sku: beProduct.sku,
                code: beProduct.sku,
                categoryId,
                currentStock: beInvQty,
              };
            }

            return {
              id: beProduct.id,
              name: beProduct.name,
              code: beProduct.sku,
              sku: beProduct.sku,
              barcode: `BC${beProduct.sku}`,
              categoryId,
              subCategoryId: fallbackSubCategory?.id || categoryId,
              type: "hardware" as const,
              brand: "Generic",
              modelNumber: "-",
              unit: "pcs",
              hsnCode: "8443",
              gstRate: 18,
              minStock: 5,
              maxStock: 50,
              reorderLevel: 8,
              purchasePrice: 100,
              sellingPrice: 150,
              currentStock: beInvQty,
              reservedStock: 0,
              imageHue: Math.floor(Math.random() * 360),
              serialRequired: false,
              batchRequired: false,
              expiryRequired: false,
              status: "Active" as const,
            };
          });

          let stockLots = [...get().stockLots];
          const beProductIds = beProducts.map((p) => p.id);
          stockLots = stockLots.filter((lot) => beProductIds.includes(lot.productId));

          products.forEach((product) => {
            const beInvQty = beInventory.find((item) => item.productId === product.id)?.quantity ?? 0;
            const productLots = stockLots.filter((lot) => lot.productId === product.id);
            const lotsTotal = productLots.reduce((sum, lot) => sum + lot.quantity, 0);

            if (beInvQty === 0) {
              stockLots = stockLots.filter((lot) => lot.productId !== product.id);
            } else if (productLots.length > 0) {
              const diff = beInvQty - lotsTotal;
              if (diff !== 0) {
                const firstLotId = productLots[0].id;
                stockLots = stockLots.map((lot) => {
                  if (lot.id === firstLotId) {
                    const newQty = lot.quantity + diff;
                    return { ...lot, quantity: newQty > 0 ? newQty : beInvQty };
                  }
                  return lot;
                });
                const finalLotsTotal = stockLots.filter((lot) => lot.productId === product.id).reduce((sum, lot) => sum + lot.quantity, 0);
                if (finalLotsTotal !== beInvQty) {
                  stockLots = stockLots.filter((lot) => lot.productId !== product.id || lot.id === firstLotId);
                  stockLots = stockLots.map((lot) => lot.id === firstLotId ? { ...lot, quantity: beInvQty } : lot);
                }
              }
            } else {
              stockLots.push({
                id: `sl-${product.id}`,
                productId: product.id,
                locationId: "l-sr1",
                quantity: beInvQty,
                rate: product.purchasePrice || 100,
              });
            }
          });

          let locations = get().locations.map((loc) => ({ ...loc, occupancy: 0 }));
          stockLots.forEach((lot) => {
            const parentIds = getLocationPath(locations, lot.locationId).map((location) => location.id);
            locations = locations.map((loc) =>
              parentIds.includes(loc.id)
                ? { ...loc, occupancy: Math.min(loc.capacity, loc.occupancy + lot.quantity) }
                : loc
            );
          });

          const movements = beMovements.map((bm: any) => {
            const existing = get().movements.find((m) => m.id === bm.id);
            if (existing) return existing;
            return {
              id: bm.id,
              number: `MOV-${bm.id.slice(0, 4).toUpperCase()}`,
              type: bm.type as "IN" | "OUT",
              productId: bm.productId,
              quantity: bm.quantity,
              date: bm.createdAt ? bm.createdAt.slice(0, 10) : today(),
              createdBy: "u-admin",
            };
          });

          const salesInvoices = beInvoices.map((bi: any) => {
            const existing = get().salesInvoices.find((si) => si.id === bi.id || si.number === bi.invoiceNumber);
            const lines = (bi.items || []).map((line: any, idx: number) => ({
              id: line.id || `${bi.id}-ln-${idx + 1}`,
              productId: line.productId,
              lotId: `sl-${line.productId}`,
              locationId: "l-sr1",
              description: line.product?.name ?? "Product",
              hsnCode: line.product?.sku ?? "",
              quantity: line.quantity,
              unit: "pcs",
              rate: Number(line.price),
              discountPct: 0,
              taxableValue: line.quantity * Number(line.price),
              gstRate: 18,
              cgst: 0,
              sgst: 0,
              igst: 0,
              total: line.quantity * Number(line.price),
            }));

            const totalVal = Number(bi.total);

            if (existing) {
              return {
                ...existing,
                id: bi.id,
                number: bi.invoiceNumber,
                customerId: bi.customerId,
                grandTotal: totalVal,
                subTotal: totalVal,
                taxableTotal: totalVal,
                lines,
              };
            }

            return {
              id: bi.id,
              number: bi.invoiceNumber,
              date: bi.createdAt ? bi.createdAt.slice(0, 10) : today(),
              customerId: bi.customerId,
              customerGstNumber: "",
              placeOfSupply: "Maharashtra",
              paymentTerms: "Due on receipt",
              pushedToTally: false,
              lines,
              subTotal: totalVal,
              discountTotal: 0,
              taxableTotal: totalVal,
              cgstTotal: 0,
              sgstTotal: 0,
              igstTotal: 0,
              grandTotal: totalVal,
              status: "draft" as const,
              pdfGenerated: false,
              createdBy: "u-admin",
              createdAt: bi.createdAt || new Date().toISOString(),
            };
          });

          set({
            products,
            vendors,
            customers,
            stockLots,
            locations,
            movements,
            salesInvoices,
            categories,
          });
        } catch (err) {
          console.error("Failed to sync WMS with backend:", err);
        }
      },
    }),
    {
      name: "officeflow-wms-store",
      storage: createJSONStorage(getStorage),
      version: 4,
      migrate: migrateWmsState,
    },
  ),
);

export const getLocationPath = (locations: Location[], locationId: string) => {
  const path: Location[] = [];
  const visited = new Set<string>();
  let current = locations.find((location) => location.id === locationId);
  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = current.parentId ? locations.find((location) => location.id === current?.parentId) : undefined;
  }
  return path;
};

export const getLocationDisplay = (locations: Location[], locationId: string) => {
  const parts = getLocationPath(locations, locationId).filter((location) =>
    ["Store Room", "Zone", "Rack", "Shelf", "Bin"].includes(location.type),
  );
  return parts.length ? parts.map((location) => location.name).join(" / ") : "Unassigned";
};

export const getAncestor = (locations: Location[], locationId: string, type: Location["type"]) =>
  getLocationPath(locations, locationId).find((location) => location.type === type);

export const getDescendantIds = (locations: Location[], locationId: string) => {
  const ids = new Set([locationId]);
  let changed = true;
  while (changed) {
    changed = false;
    locations.forEach((location) => {
      if (location.parentId && ids.has(location.parentId) && !ids.has(location.id)) {
        ids.add(location.id);
        changed = true;
      }
    });
  }
  return ids;
};

export const stockInLocation = (locations: Location[], stockLots: StockLot[], locationId: string) => {
  const ids = getDescendantIds(locations, locationId);
  return stockLots.filter((lot) => ids.has(lot.locationId)).reduce((sum, lot) => sum + lot.quantity, 0);
};

export const locationPercent = (locations: Location[], stockLots: StockLot[], location: Location) => {
  const liveQty = stockInLocation(locations, stockLots, location.id);
  const basis = Math.max(liveQty, location.occupancy);
  return Math.min(100, Math.round((basis / Math.max(1, location.capacity)) * 100));
};

export const qrPayload = (type: "product" | "location" | "lot", payload: Record<string, string | number | boolean | null | undefined>) =>
  btoa(JSON.stringify({ type, ...payload, generatedAt: new Date().toISOString() }));

export const decodeQrPayload = (value: string) => {
  try {
    const parsed = JSON.parse(atob(value));
    return parsed as { type?: string; productId?: string; lotId?: string; locationId?: string };
  } catch {
    return null;
  }
};

export const downloadText = (filename: string, text: string, type = "text/plain;charset=utf-8") => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const toCsv = (rows: Array<Record<string, string | number | boolean | null | undefined>>) => {
  const headers = Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
};
