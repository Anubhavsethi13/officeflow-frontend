import api from "./api";

type ApiEnvelope<T> = { success: boolean; data: T };

export type BackendRole =
  | "SUPER_ADMIN"
  | "MD"
  | "DEPARTMENT_HEAD"
  | "PAYROLL_MANAGER"
  | "EMPLOYEE";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: BackendRole;
    employee: {
      id: string;
      name: string;
      phone?: string | null;
      designation: string;
      status: "ACTIVE" | "DISABLED";
      joiningDate: string;
      department?: { id: string; name: string } | null;
    } | null;
  };
};

export type AuthMeResponse = {
  id: string;
  role: BackendRole;
  employeeId?: string;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY";
  employee?: { id: string; name: string; designation: string };
};

export type LeaveRecord = {
  id: string;
  employeeId: string;
  type: string;
  fromDate: string;
  toDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  employee?: { id: string; name: string; designation: string };
};

export type ProductRecord = {
  id: string;
  name: string;
  sku: string;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  inventory?: { quantity: number } | null;
};

export type InventoryRecord = {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: { id: string; name: string } | null;
  };
};

export type ContactRecord = { id: string; name: string; phone?: string | null };

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await promise;
  return response.data.data;
}

export const officeflowApi = {
  login: (email: string, password: string) =>
    unwrap<AuthResponse>(api.post("/auth/login", { email, password })),
  me: () => unwrap<AuthMeResponse>(api.get("/auth/me")),
  logout: () => unwrap<{ message: string }>(api.post("/auth/logout")),

  attendance: {
    list: () => unwrap<AttendanceRecord[]>(api.get("/attendance")),
    byEmployee: (employeeId: string) =>
      unwrap<AttendanceRecord[]>(api.get(`/attendance/employee/${employeeId}`)),
    checkIn: () => unwrap<AttendanceRecord>(api.post("/attendance/check-in")),
    checkOut: () => unwrap<AttendanceRecord>(api.post("/attendance/check-out")),
    upsert: (input: {
      employeeId: string;
      date: string;
      status: "PRESENT" | "ABSENT" | "HALF_DAY";
      checkIn?: string;
      checkOut?: string;
    }) => unwrap<AttendanceRecord>(api.put("/attendance", input)),
  },

  leaves: {
    list: () => unwrap<LeaveRecord[]>(api.get("/leaves")),
    byEmployee: (employeeId: string) =>
      unwrap<LeaveRecord[]>(api.get(`/leaves/employee/${employeeId}`)),
    request: (input: { type: string; fromDate: string; toDate: string; employeeId?: string }) =>
      unwrap<LeaveRecord>(api.post("/leaves/request", input)),
    approve: (id: string) => unwrap<LeaveRecord>(api.put(`/leaves/${id}/approve`)),
    reject: (id: string) => unwrap<LeaveRecord>(api.put(`/leaves/${id}/reject`)),
  },

  products: {
    list: () => unwrap<ProductRecord[]>(api.get("/products")),
    create: (input: { name: string; sku: string; categoryId?: string }) =>
      unwrap<ProductRecord>(api.post("/products", input)),
    update: (id: string, input: { name?: string; sku?: string; categoryId?: string | null }) =>
      unwrap<ProductRecord>(api.put(`/products/${id}`, input)),
    remove: (id: string) => api.delete(`/products/${id}`),
  },

  inventory: {
    list: () => unwrap<InventoryRecord[]>(api.get("/inventory")),
    lowStock: (threshold = 10) =>
      unwrap<InventoryRecord[]>(api.get(`/inventory/low-stock?threshold=${threshold}`)),
    stockIn: (productId: string, quantity: number) =>
      unwrap<InventoryRecord>(api.post("/inventory/stock-in", { productId, quantity })),
    stockOut: (productId: string, quantity: number) =>
      unwrap<InventoryRecord>(api.post("/inventory/stock-out", { productId, quantity })),
  },

  vendors: {
    list: () => unwrap<ContactRecord[]>(api.get("/vendors")),
    create: (input: { name: string; phone?: string }) =>
      unwrap<ContactRecord>(api.post("/vendors", input)),
    update: (id: string, input: { name?: string; phone?: string }) =>
      unwrap<ContactRecord>(api.put(`/vendors/${id}`, input)),
    remove: (id: string) => api.delete(`/vendors/${id}`),
  },

  customers: {
    list: () => unwrap<ContactRecord[]>(api.get("/customers")),
    create: (input: { name: string; phone?: string }) =>
      unwrap<ContactRecord>(api.post("/customers", input)),
    update: (id: string, input: { name?: string; phone?: string }) =>
      unwrap<ContactRecord>(api.put(`/customers/${id}`, input)),
    remove: (id: string) => api.delete(`/customers/${id}`),
  },

  employees: {
    list: () => unwrap<any[]>(api.get("/employees")),
    create: (input: any) => unwrap<any>(api.post("/employees", input)),
    update: (id: string, input: any) => unwrap<any>(api.patch(`/employees/${id}`, input)),
    remove: (id: string) => unwrap<any>(api.delete(`/employees/${id}`)),
    profile: (id: string) => unwrap<any>(api.get(`/employees/${id}/profile`)),
    uploadDocument: (id: string, formData: FormData) =>
      unwrap<any>(api.post(`/employees/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })),
    deleteDocument: (docId: string) =>
      unwrap<any>(api.delete(`/employees/documents/${docId}`)),
  },

  hierarchy: {
    list: () => unwrap<any[]>(api.get("/hierarchy")),
    assignManager: (input: { employeeId: string; managerId: string; level?: number }) =>
      unwrap<any>(api.post("/hierarchy/assign-manager", input)),
  },

  tasks: {
    list: () => unwrap<any[]>(api.get("/tasks")),
    create: (input: any) => unwrap<any>(api.post("/tasks", input)),
    update: (id: string, input: any) => unwrap<any>(api.patch(`/tasks/${id}`, input)),
    assign: (id: string, assignedTo: string) => unwrap<any>(api.post(`/tasks/${id}/assign`, { assignedTo })),
    history: (id: string) => unwrap<any[]>(api.get(`/tasks/${id}/history`)),
  },

  dashboard: {
    stats: () => unwrap<any>(api.get("/dashboard/stats")),
  },

  payroll: {
    history: () => unwrap<any[]>(api.get("/payroll/history")),
    salaryGraph: () => unwrap<any[]>(api.get("/payroll/salary-graph")),
  },

  accessControl: {
    modules: () => unwrap<any[]>(api.get("/modules")),
    createPermission: (input: any) => unwrap<any>(api.post("/permissions", input)),
    updatePermission: (id: string, input: any) => unwrap<any>(api.patch(`/permissions/${id}`, input)),
  },

  invoices: {
    list: () => unwrap<any[]>(api.get("/invoices")),
    create: (input: any) => unwrap<any>(api.post("/invoices", input)),
    get: (id: string) => unwrap<any>(api.get(`/invoices/${id}`)),
    pdfUrl: (id: string) => `${api.defaults.baseURL}/invoices/${id}/pdf`,
  },

  departments: {
    list: () => unwrap<any[]>(api.get("/departments")),
  },
};
