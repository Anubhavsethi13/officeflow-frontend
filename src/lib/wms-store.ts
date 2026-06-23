import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
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
  receiveStock: (payload: StockInPayload) => Result;
  issueStock: (payload: StockOutPayload) => Result;
  transferStock: (payload: TransferPayload) => Result;
  createSalesInvoice: (payload: SalesInvoicePayload) => Result & { invoice?: SalesInvoice };
  markSalesInvoicePdfGenerated: (invoiceId: string) => Result;
  pushSalesInvoiceToTally: (invoiceId: string, tallyVoucherNumber: string) => Result;
  importProducts: (products: Array<Partial<Product> & Pick<Product, "name" | "code">>) => Result;
  updateSettings: (patch: Partial<WmsSettings>) => void;
  resetWms: () => void;
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
      receiveStock: ({ vendorId, locationId, invoice, po, lines }) => {
        const validLines = lines.filter((line) => line.productId && line.qty > 0 && line.rate >= 0);
        if (!vendorId || !locationId || validLines.length === 0) {
          return { ok: false, message: "Select vendor, location and at least one valid item." };
        }
        set((state) => {
          let stockLots = [...state.stockLots];
          let products = [...state.products];
          let locations = [...state.locations];
          let movements = [...state.movements];
          validLines.forEach((line) => {
            const lotIndex = stockLots.findIndex((lot) => sameLot(lot, line, locationId));
            if (lotIndex >= 0) {
              stockLots = stockLots.map((lot, index) => (index === lotIndex ? { ...lot, quantity: lot.quantity + line.qty } : lot));
            } else {
              stockLots = [
                ...stockLots,
                {
                  id: id("lot"),
                  productId: line.productId,
                  locationId,
                  quantity: line.qty,
                  batchNumber: line.batch || undefined,
                  serialNumber: line.serial || undefined,
                  rate: line.rate,
                },
              ];
            }
            products = updateProductStock(products, line.productId, line.qty);
            locations = adjustLocationOccupancy(locations, locationId, line.qty);
            movements = [
              ...movements,
              {
                id: id("mov"),
                number: nextMovementNumber(movements, "IN"),
                type: "IN",
                productId: line.productId,
                quantity: line.qty,
                toLocationId: locationId,
                vendorId,
                reference: invoice || po || undefined,
                rate: line.rate,
                date: today(),
                createdBy: "u-admin",
                remarks: po ? `PO ${po}` : undefined,
              },
            ];
          });
          return { stockLots, products, locations, movements };
        });
        return { ok: true, message: `Saved inward for ${validLines.length} item${validLines.length === 1 ? "" : "s"}.` };
      },
      issueStock: ({ productId, lotId, customerId, qty, reference, reason }) => {
        const state = get();
        const lot = state.stockLots.find((item) => item.id === lotId && item.productId === productId);
        if (!lot) return { ok: false, message: "Selected product/location lot is not available." };
        if (qty <= 0) return { ok: false, message: "Quantity must be greater than zero." };
        if (qty > lot.quantity) return { ok: false, message: `Only ${lot.quantity} units are available in that lot.` };
        set((current) => {
          const stockLots = current.stockLots
            .map((item) => (item.id === lotId ? { ...item, quantity: item.quantity - qty } : item))
            .filter((item) => item.quantity > 0);
          const movements = [
            ...current.movements,
            {
              id: id("mov"),
              number: nextMovementNumber(current.movements, "OUT"),
              type: "OUT" as const,
              productId,
              quantity: qty,
              fromLocationId: lot.locationId,
              customerId,
              reference: reference || undefined,
              date: today(),
              createdBy: "u-admin",
              remarks: reason || undefined,
            },
          ];
          return {
            stockLots,
            products: updateProductStock(current.products, productId, -qty),
            locations: adjustLocationOccupancy(current.locations, lot.locationId, -qty),
            movements,
          };
        });
        return { ok: true, message: "Stock issued successfully." };
      },
      createSalesInvoice: (payload) => {
        const state = get();
        const customer = state.customers.find((item) => item.id === payload.customerId);
        const lines = payload.lines
          .filter((line) => line.productId && line.lotId && line.qty > 0 && line.rate >= 0)
          .map((line) => ({ ...line, discountPct: Math.min(99, Math.max(0, Number(line.discountPct || 0))) }));

        if (!customer) return { ok: false, message: "Select a valid customer." };
        if (lines.length === 0) return { ok: false, message: "Add at least one invoice item." };
        if (payload.pushedToTally && !payload.tallyVoucherNumber?.trim()) {
          return { ok: false, message: "Enter the Tally voucher number for pushed invoices." };
        }

        const quantityByLot = new Map<string, number>();
        for (const line of lines) {
          const lot = state.stockLots.find((item) => item.id === line.lotId && item.productId === line.productId);
          if (!lot) return { ok: false, message: "One or more selected stock lots are no longer available." };
          quantityByLot.set(line.lotId, (quantityByLot.get(line.lotId) ?? 0) + line.qty);
        }

        for (const [lotId, requestedQty] of quantityByLot) {
          const lot = state.stockLots.find((item) => item.id === lotId);
          if (!lot || requestedQty > lot.quantity) {
            return { ok: false, message: `Selected lot has only ${lot?.quantity ?? 0} units available.` };
          }
        }

        let savedInvoice: SalesInvoice | undefined;
        set((current) => {
          const invoiceId = id("si");
          const invoiceNumber = nextSalesInvoiceNumber(current.salesInvoices);
          const interState = isInterStateSale(payload.customerGstNumber, payload.placeOfSupply);
          let stockLots = [...current.stockLots];
          let products = [...current.products];
          let locations = [...current.locations];
          let movements = [...current.movements];

          const invoiceLines: SalesInvoiceLine[] = lines.map((line, index) => {
            const product = current.products.find((item) => item.id === line.productId);
            const lot = current.stockLots.find((item) => item.id === line.lotId);
            const gross = line.qty * line.rate;
            const discount = gross * (line.discountPct / 100);
            const taxableValue = roundMoney(gross - discount);
            const gstAmount = roundMoney(taxableValue * ((product?.gstRate ?? 0) / 100));
            const cgst = interState ? 0 : roundMoney(gstAmount / 2);
            const sgst = interState ? 0 : roundMoney(gstAmount / 2);
            const igst = interState ? gstAmount : 0;

            return {
              id: `${invoiceId}-ln-${index + 1}`,
              productId: line.productId,
              lotId: line.lotId,
              locationId: lot?.locationId ?? "",
              description: product?.name ?? line.productId,
              hsnCode: product?.hsnCode ?? "",
              quantity: line.qty,
              unit: product?.unit ?? "pcs",
              rate: line.rate,
              discountPct: line.discountPct,
              taxableValue,
              gstRate: product?.gstRate ?? 0,
              cgst,
              sgst,
              igst,
              total: roundMoney(taxableValue + cgst + sgst + igst),
            };
          });

          invoiceLines.forEach((line) => {
            stockLots = stockLots
              .map((lot) => (lot.id === line.lotId ? { ...lot, quantity: lot.quantity - line.quantity } : lot))
              .filter((lot) => lot.quantity > 0);
            products = updateProductStock(products, line.productId, -line.quantity);
            locations = adjustLocationOccupancy(locations, line.locationId, -line.quantity);
            movements = [
              ...movements,
              {
                id: id("mov"),
                number: nextMovementNumber(movements, "OUT"),
                type: "OUT" as const,
                productId: line.productId,
                quantity: line.quantity,
                fromLocationId: line.locationId,
                customerId: payload.customerId,
                reference: invoiceNumber,
                date: payload.date,
                createdBy: "u-admin",
                remarks: payload.pushedToTally
                  ? `SI pushed to Tally${payload.tallyVoucherNumber ? ` / ${payload.tallyVoucherNumber}` : ""}`
                  : "SI PDF generated locally",
              },
            ];
          });

          const subTotal = roundMoney(invoiceLines.reduce((sum, line) => sum + line.quantity * line.rate, 0));
          const taxableTotal = roundMoney(invoiceLines.reduce((sum, line) => sum + line.taxableValue, 0));
          const discountTotal = roundMoney(subTotal - taxableTotal);
          const cgstTotal = roundMoney(invoiceLines.reduce((sum, line) => sum + line.cgst, 0));
          const sgstTotal = roundMoney(invoiceLines.reduce((sum, line) => sum + line.sgst, 0));
          const igstTotal = roundMoney(invoiceLines.reduce((sum, line) => sum + line.igst, 0));
          const grandTotal = roundMoney(taxableTotal + cgstTotal + sgstTotal + igstTotal);

          const invoice: SalesInvoice = {
            id: invoiceId,
            number: invoiceNumber,
            date: payload.date,
            dueDate: payload.dueDate || undefined,
            customerId: payload.customerId,
            customerGstNumber: payload.customerGstNumber.trim(),
            placeOfSupply: payload.placeOfSupply.trim() || customer.city,
            paymentTerms: payload.paymentTerms.trim() || "Due on receipt",
            pushedToTally: payload.pushedToTally,
            tallyVoucherNumber: payload.tallyVoucherNumber?.trim() || undefined,
            ewayBillNumber: payload.ewayBillNumber?.trim() || undefined,
            notes: payload.notes?.trim() || undefined,
            lines: invoiceLines,
            subTotal,
            discountTotal,
            taxableTotal,
            cgstTotal,
            sgstTotal,
            igstTotal,
            grandTotal,
            status: payload.pushedToTally ? "pushed" : "draft",
            pdfGenerated: false,
            createdBy: "u-admin",
            createdAt: new Date().toISOString(),
          };
          savedInvoice = invoice;

          return {
            stockLots,
            products,
            locations,
            movements,
            salesInvoices: [...current.salesInvoices, invoice],
          };
        });

        return {
          ok: true,
          message: savedInvoice?.pushedToTally
            ? `Sales invoice ${savedInvoice.number} saved with Tally voucher.`
            : `Sales invoice ${savedInvoice?.number ?? ""} saved as draft.`,
          invoice: savedInvoice,
        };
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
