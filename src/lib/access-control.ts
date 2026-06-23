import { USERS, type Role, type User } from "./mock-data";

export type ModuleKey = "tasks" | "employees" | "warehouse" | "hiring";

export type PageKey =
  | "tasks.dashboard"
  | "tasks.board"
  | "tasks.reports"
  | "tasks.settings"
  | "employees.records"
  | "employees.hierarchy"
  | "employees.attendance"
  | "employees.leaves"
  | "employees.payroll"
  | "employees.access"
  | "employees.profile"
  | "employees.month-report"
  | "warehouse.dashboard"
  | "warehouse.categories"
  | "warehouse.products"
  | "warehouse.inventory"
  | "warehouse.stockIn"
  | "warehouse.stockOut"
  | "warehouse.salesInvoices"
  | "warehouse.transfer"
  | "warehouse.locations"
  | "warehouse.view3d"
  | "warehouse.vendors"
  | "warehouse.customers"
  | "warehouse.reports"
  | "warehouse.settings"
  | "hiring.dashboard"
  | "hiring.jobs"
  | "hiring.candidates"
  | "hiring.pipeline"
  | "hiring.examCenter"
  | "hiring.questionBank"
  | "hiring.answerSheets"
  | "hiring.interviews"
  | "hiring.offers"
  | "hiring.joining"
  | "hiring.onboarding"
  | "hiring.reports"
  | "hiring.settings";

export interface AccessProfile {
  modules: ModuleKey[];
  pages: PageKey[];
}

export const ACCESS_STORAGE_KEY = "officeflow.access.v1";

export const MODULE_CATALOG: Record<ModuleKey, { label: string; description: string }> = {
  tasks: {
    label: "Task Management",
    description: "Kanban boards, assignments, progress, and task reports.",
  },
  employees: {
    label: "Employee Management",
    description: "People, hierarchy, attendance, leave, payroll, and access.",
  },
  warehouse: {
    label: "Warehouse Management",
    description: "Inventory, products, stock movement, locations, and reports.",
  },
  hiring: {
    label: "Hiring Management",
    description: "Jobs, candidates, exams, interviews, offers, and onboarding.",
  },
};

export const PAGE_CATALOG: Record<PageKey, { label: string; module: ModuleKey; route: string }> = {
  "tasks.dashboard": { label: "Dashboard", module: "tasks", route: "/dashboard" },
  "tasks.board": { label: "Task Board", module: "tasks", route: "/task-management" },
  "tasks.reports": { label: "Reports", module: "tasks", route: "/reports" },
  "tasks.settings": { label: "Settings", module: "tasks", route: "/settings" },

  "employees.records": { label: "Employees", module: "employees", route: "/employees" },
  "employees.hierarchy": { label: "Company Hierarchy", module: "employees", route: "/hierarchy" },
  "employees.attendance": { label: "Attendance", module: "employees", route: "/attendance" },
  "employees.leaves": { label: "Leave Management", module: "employees", route: "/leaves" },
  "employees.payroll": { label: "Payroll", module: "employees", route: "/payroll" },
  "employees.access": { label: "Access Control", module: "employees", route: "/access-control" },
  "employees.profile": { label: "Profile", module: "employees", route: "/profile" },
  "employees.month-report": { label: "Employee Month Report", module: "employees", route: "/employee-report" },

  "warehouse.dashboard": { label: "Dashboard", module: "warehouse", route: "/wms" },
  "warehouse.categories": { label: "Categories", module: "warehouse", route: "/wms/categories" },
  "warehouse.products": { label: "Products", module: "warehouse", route: "/wms/products" },
  "warehouse.inventory": { label: "Inventory", module: "warehouse", route: "/wms/inventory" },
  "warehouse.stockIn": { label: "Stock In", module: "warehouse", route: "/wms/stock-in" },
  "warehouse.stockOut": { label: "SI / Stock Out", module: "warehouse", route: "/wms/stock-out" },
  "warehouse.salesInvoices": { label: "Sales Invoices", module: "warehouse", route: "/wms/sales-invoices" },
  "warehouse.transfer": { label: "Transfer", module: "warehouse", route: "/wms/stock-transfer" },
  "warehouse.locations": { label: "Locations", module: "warehouse", route: "/wms/locations" },
  "warehouse.view3d": { label: "3D Warehouse", module: "warehouse", route: "/wms/3d-view" },
  "warehouse.vendors": { label: "Vendors", module: "warehouse", route: "/wms/vendors" },
  "warehouse.customers": { label: "Customers", module: "warehouse", route: "/wms/customers" },
  "warehouse.reports": { label: "Reports", module: "warehouse", route: "/wms/reports" },
  "warehouse.settings": { label: "Settings", module: "warehouse", route: "/wms/settings" },

  "hiring.dashboard": { label: "Dashboard", module: "hiring", route: "/hiring/dashboard" },
  "hiring.jobs": { label: "Jobs", module: "hiring", route: "/hiring/jobs" },
  "hiring.candidates": { label: "Candidates", module: "hiring", route: "/hiring/candidates" },
  "hiring.pipeline": { label: "Pipeline", module: "hiring", route: "/hiring/pipeline" },
  "hiring.examCenter": { label: "Exam Center", module: "hiring", route: "/hiring/exam-center" },
  "hiring.questionBank": {
    label: "Question Bank",
    module: "hiring",
    route: "/hiring/question-bank",
  },
  "hiring.answerSheets": {
    label: "Answer Sheets",
    module: "hiring",
    route: "/hiring/answer-sheets",
  },
  "hiring.interviews": { label: "Interviews", module: "hiring", route: "/hiring/interviews" },
  "hiring.offers": { label: "Offers", module: "hiring", route: "/hiring/offers" },
  "hiring.joining": { label: "Joining", module: "hiring", route: "/hiring/joining" },
  "hiring.onboarding": { label: "Onboarding", module: "hiring", route: "/hiring/onboarding" },
  "hiring.reports": { label: "Reports", module: "hiring", route: "/hiring/reports" },
  "hiring.settings": { label: "Settings", module: "hiring", route: "/hiring/settings" },
};

const ALL_MODULES = Object.keys(MODULE_CATALOG) as ModuleKey[];
const ALL_PAGES = Object.keys(PAGE_CATALOG) as PageKey[];

const EMPLOYEE_SELF_PAGES: PageKey[] = [
  "employees.records",
  "employees.hierarchy",
  "employees.attendance",
  "employees.leaves",
  "employees.payroll",
  "employees.profile",
  "employees.month-report",
];

const TASK_STANDARD_PAGES: PageKey[] = ["tasks.dashboard", "tasks.board", "tasks.reports"];

const ROLE_DEFAULT_ACCESS: Record<Role, AccessProfile> = {
  "Super Admin": { modules: ALL_MODULES, pages: ALL_PAGES },
  MD: { modules: ALL_MODULES, pages: ALL_PAGES },
  MD2: { modules: ALL_MODULES, pages: ALL_PAGES },
  MD3: { modules: ALL_MODULES, pages: ALL_PAGES },
  "Payroll Manager": {
    modules: ["employees"],
    pages: ["employees.records", "employees.payroll"],
  },
  "Department Head": {
    modules: ["tasks", "employees"],
    pages: [...TASK_STANDARD_PAGES, ...EMPLOYEE_SELF_PAGES],
  },
  "Team Lead": {
    modules: ["tasks", "employees"],
    pages: [...TASK_STANDARD_PAGES, ...EMPLOYEE_SELF_PAGES],
  },
  Employee: {
    modules: ["employees"],
    pages: EMPLOYEE_SELF_PAGES,
  },
};

const USER_DEFAULT_OVERRIDES: Record<string, Partial<AccessProfile>> = {
  "u-admin": { modules: ALL_MODULES, pages: ALL_PAGES },
};

const normalisePath = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
};

const isExactRoute = (pathname: string, route: string) => {
  const path = normalisePath(pathname);
  const candidate = normalisePath(route);
  return path === candidate;
};

const routeAliases: Partial<Record<PageKey, string[]>> = {
  "warehouse.dashboard": ["/wms/"],
  "hiring.dashboard": ["/hiring", "/hiring/"],
};

export function getPagesForModule(module: ModuleKey) {
  return ALL_PAGES.filter((page) => PAGE_CATALOG[page].module === module);
}

function readStoredAccess(): Record<string, AccessProfile> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ACCESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredAccess(access: Record<string, AccessProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access));
}

function cleanProfile(profile: AccessProfile): AccessProfile {
  const modules = profile.modules.filter((module): module is ModuleKey => module in MODULE_CATALOG);
  const pages = profile.pages.filter((page): page is PageKey => {
    const pageMeta = PAGE_CATALOG[page];
    return Boolean(pageMeta && modules.includes(pageMeta.module));
  });

  return {
    modules: Array.from(new Set(modules)),
    pages: Array.from(new Set(pages)),
  };
}

export function getDefaultAccessProfile(user: User): AccessProfile {
  const roleProfile = ROLE_DEFAULT_ACCESS[user.role] ?? ROLE_DEFAULT_ACCESS.Employee;
  const userOverride = USER_DEFAULT_OVERRIDES[user.id];

  return cleanProfile({
    modules: userOverride?.modules ?? roleProfile.modules,
    pages: userOverride?.pages ?? roleProfile.pages,
  });
}

export function getAccessProfile(user?: User | null): AccessProfile {
  if (!user) return { modules: [], pages: [] };

  const stored = readStoredAccess()[user.id];
  return cleanProfile(stored ?? getDefaultAccessProfile(user));
}

export function getAccessProfiles(users: User[] = USERS): Record<string, AccessProfile> {
  const stored = readStoredAccess();

  return users.reduce<Record<string, AccessProfile>>((profiles, user) => {
    profiles[user.id] = cleanProfile(stored[user.id] ?? getDefaultAccessProfile(user));
    return profiles;
  }, {});
}

export function saveAccessProfile(userId: string, profile: AccessProfile) {
  const stored = readStoredAccess();
  stored[userId] = cleanProfile(profile);
  writeStoredAccess(stored);
}

export function getPageForPath(pathname: string): PageKey | undefined {
  const entries = Object.entries(PAGE_CATALOG) as Array<[PageKey, (typeof PAGE_CATALOG)[PageKey]]>;

  for (const [page, meta] of entries) {
    if (isExactRoute(pathname, meta.route)) return page;
    if (routeAliases[page]?.some((route) => isExactRoute(pathname, route))) return page;
  }

  if (pathname.startsWith("/profile")) return "employees.profile";

  return undefined;
}

export function canAccessModule(user: User | null | undefined, module: ModuleKey) {
  return getAccessProfile(user).modules.includes(module);
}

export function canAccessPage(user: User | null | undefined, page: PageKey) {
  const profile = getAccessProfile(user);
  return profile.pages.includes(page) && profile.modules.includes(PAGE_CATALOG[page].module);
}

export function canAccessPath(user: User | null | undefined, pathname: string) {
  const path = normalisePath(pathname);
  if (path === "/" || path === "/login" || path === "/welcome") return true;

  const page = getPageForPath(path);
  return page ? canAccessPage(user, page) : false;
}

export function getVisibleModuleKeys(user: User | null | undefined) {
  const profile = getAccessProfile(user);
  return ALL_MODULES.filter((module) => profile.modules.includes(module));
}
