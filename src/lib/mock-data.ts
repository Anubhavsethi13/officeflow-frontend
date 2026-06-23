export type Role =
  | "Super Admin"
  | "MD"
  | "MD2"
  | "MD3"
  | "Payroll Manager"
  | "Department Head"
  | "Team Lead"
  | "Employee";
export type DeptKey = "support" | "software" | "hardware" | "accounts" | "consumables";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export const DEFAULT_EMPLOYEE_PASSWORD = "demo1234";

export interface TaskAttachment {
  id: string;
  name: string;
  uploadedAt: string;
  uploadedBy: string;
  sizeLabel?: string;
  url?: string;
}

export interface TaskNote {
  id: string;
  title: string;
  body: string;
  step: string;
  createdBy: string;
  createdAt: string;
}

export interface TaskProductLine {
  id: string;
  productId: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type DocumentType =
  | "ID Proof"
  | "Address Proof"
  | "Educational Certificate"
  | "Experience Letter"
  | "Relieving Letter"
  | "Offer Letter"
  | "Other";

export interface EmployeeDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: Role;
  departments: DeptKey[];
  designation: string;
  reportingManagerId?: string;
  status: "Active" | "Inactive";
  joiningDate: string;
  avatar: string;
  increments?: { date: string; amount: number }[];
  documents?: EmployeeDocument[];
}

export type ConsumablesTargetSegment = "hardware" | "rolls";

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  department: DeptKey;
  category: string;
  status: string;
  priority: Priority;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  tags: string[];
  attachments: number;
  attachmentItems?: TaskAttachment[];
  comments: number;
  notes?: TaskNote[];
  progress: number;
  amount?: number;
  targetSegment?: ConsumablesTargetSegment;
  productLines?: TaskProductLine[];
}

export const DEPARTMENTS: { key: DeptKey; name: string; color: string; icon: string }[] = [
  { key: "support", name: "Support", color: "oklch(0.72 0.18 155)", icon: "Headphones" },
  { key: "software", name: "Software", color: "oklch(0.65 0.21 275)", icon: "Code2" },
  { key: "hardware", name: "Hardware", color: "oklch(0.72 0.16 220)", icon: "Cpu" },
  { key: "accounts", name: "Accounts", color: "oklch(0.8 0.17 80)", icon: "Wallet" },
  { key: "consumables", name: "Consumables", color: "oklch(0.68 0.22 320)", icon: "Package" },
];

export const DEPT_COLUMNS: Record<DeptKey, string[]> = {
  support: ["New Ticket", "Assigned", "In Progress", "Waiting for Client", "Resolved", "Closed"],
  software: ["Backlog", "To Do", "Development", "Code Review", "Testing", "Done"],
  hardware: ["New Request", "Assigned", "On Site", "Waiting for Parts", "Completed", "Closed"],
  accounts: ["Pending", "In Process", "Waiting for Approval", "Payment Done", "Completed"],
  consumables: ["Requirement", "Quotation", "Procurement", "Dispatch", "Completed"],
};

export const initialStatusFor = (dept: DeptKey) => DEPT_COLUMNS[dept][0];

export const progressForStatus = (dept: DeptKey, status: string) => {
  const columns = DEPT_COLUMNS[dept];
  const index = columns.indexOf(status);
  if (index < 0) return 0;
  return Math.round(((index + 1) / columns.length) * 100);
};

const initials = (n: string) =>
  n
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const avatar = (n: string, hue: number) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},70%25,60%25)'/><stop offset='1' stop-color='hsl(${(hue + 60) % 360},70%25,50%25)'/></linearGradient></defs><rect width='64' height='64' rx='32' fill='url(%23g)'/><text x='50%25' y='50%25' dy='.35em' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='600' fill='white'>${initials(n)}</text></svg>`;

const mk = (
  id: string,
  name: string,
  role: Role,
  designation: string,
  dept?: DeptKey | DeptKey[],
  mgr?: string,
  hue = 260,
): User => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
  password: DEFAULT_EMPLOYEE_PASSWORD,
  phone: "+91 98765 43210",
  role,
  departments: dept ? (Array.isArray(dept) ? dept : [dept]) : [],
  designation,
  reportingManagerId: mgr,
  status: "Active",
  joiningDate: "2023-04-15",
  avatar: avatar(name, hue),
});

export const USERS: User[] = [
  mk("u-md1", "Rakesh Andhare", "MD", "Managing Director", undefined, undefined, 220),
  mk("u-md2", "Sanjeevain Andhare", "MD2", "Managing Director", undefined, undefined, 320),
  mk("u-admin", "Vrujen Andhare", "Super Admin", "HR Director", undefined, undefined, 275),

  mk("u-ac-h", "Pankaj Vairagade", "Department Head", "Head of Accounts", "accounts", "u-md1", 80),

  mk("u-sw-h", "Kush Bhargava", "Department Head", "Technical Head", "software", "u-md2", 275),
  mk("u-sw-1", "Niraj Tete", "Employee", "Software Developer Level 1", "software", "u-sw-h", 280),
  mk("u-sw-2", "Nikita Joshi", "Employee", "Software Tester Level 1", "software", "u-sw-h", 270),

  mk(
    "u-sup-h",
    "Priyanka Paul",
    "Department Head",
    "Associate Software Engineer",
    "support",
    "u-admin",
    155,
  ),

  mk("u-hw-h", "Praful Rane", "Department Head", "Field Manager", "hardware", "u-md1", 220),
  mk("u-hw-1", "Pankaj Shripad", "Employee", "Associate Engineer", "hardware", "u-hw-h", 210),

  mk("u-cn-h", "Pammi Gour", "Department Head", "Senior Executive", "consumables", "u-md2", 320),
  mk("u-cn-1", "Mukesh Sawarkar", "Employee", "Junior Executive", "consumables", "u-cn-h", 310),
  mk("u-cn-2", "Nitin Pande", "Employee", "Junior Executive", "consumables", "u-cn-h", 330),
];

const PRI: Priority[] = ["Low", "Medium", "High", "Critical"];
const TAGS = ["urgent", "client", "internal", "Q4", "review", "new"];

const CONSUMABLE_PRODUCT_SEEDS: Array<{
  lines: Array<{ productId: string; quantity: number; rate: number }>;
}> = [
  { lines: [{ productId: "p-tnr-1", quantity: 60, rate: 3600 }] },
  { lines: [{ productId: "p-roll-1", quantity: 10000, rate: 35 }] },
  { lines: [{ productId: "p-lap-1", quantity: 4, rate: 68000 }] },
  { lines: [{ productId: "p-prn-1", quantity: 8, rate: 15800 }] },
  { lines: [{ productId: "p-lbl-1", quantity: 600, rate: 260 }] },
  { lines: [{ productId: "p-roll-2", quantity: 5000, rate: 28 }] },
];

const tasksFor = (dept: DeptKey, prefix: string): Task[] => {
  const cols = DEPT_COLUMNS[dept];
  const deptUsers = USERS.filter((u) => u.departments.includes(dept));
  const titles: Record<DeptKey, string[]> = {
    support: [
      "Client login issue",
      "Remote support – ABC Corp",
      "Installation at site",
      "Bug report from XYZ",
      "Training session",
      "Network outage report",
      "App crash investigation",
    ],
    software: [
      "Build dashboard widgets",
      "Refactor auth module",
      "Fix payment gateway bug",
      "API rate limit changes",
      "Migrate DB to v3",
      "Code review PR #214",
      "Deploy v2.4 to staging",
    ],
    hardware: [
      "Server rack installation",
      "Replace SSD on workstation",
      "Networking at branch office",
      "Firewall configuration",
      "UPS battery replacement",
      "Site visit – Pune",
    ],
    accounts: [
      "GST filing September",
      "Vendor payment – Acme",
      "Process payroll",
      "Reconcile bank statement",
      "Invoice generation – Q3",
      "Approve purchase order",
    ],
    consumables: [
      "Printer toner request",
      "Stationery quotation",
      "Procurement – laptops",
      "Dispatch to client site",
      "Stock audit – warehouse",
      "Vendor billing follow-up",
    ],
  };
  return titles[dept].map((title, i) => {
    const status = cols[i % cols.length];
    const assignedTo = deptUsers[(i + 1) % deptUsers.length]?.id ?? deptUsers[0]?.id;
    const createdBy = deptUsers[0]?.id ?? "u-admin";
    const createdAt = new Date(Date.now() - (i + 3) * 86400000).toISOString();
    const productSeed =
      dept === "consumables"
        ? CONSUMABLE_PRODUCT_SEEDS[i % CONSUMABLE_PRODUCT_SEEDS.length]
        : undefined;
    const productLines: TaskProductLine[] =
      productSeed?.lines.map((line, lineIndex) => ({
        id: `${prefix}-${i + 1}-line-${lineIndex + 1}`,
        productId: line.productId,
        quantity: line.quantity,
        rate: line.rate,
        amount: line.quantity * line.rate,
      })) ?? [];
    const amount = productLines.reduce((sum, line) => sum + line.amount, 0);
    const notes: TaskNote[] = [
      {
        id: `${prefix}-${i + 1}-note-1`,
        title: "Initial inquiry recorded",
        body: `The request for ${title.toLowerCase()} was logged and assigned for review.`,
        step: cols[0],
        createdBy,
        createdAt,
      },
    ];

    if (i % 2 === 0) {
      notes.push({
        id: `${prefix}-${i + 1}-note-2`,
        title: `${status} update`,
        body: "Progress updated after the latest client or internal discussion.",
        step: status,
        createdBy: assignedTo ?? createdBy,
        createdAt: new Date(Date.now() - (i + 1) * 43200000).toISOString(),
      });
    }

    const attachmentItems: TaskAttachment[] = Array.from({ length: i % 3 }, (_, a) => ({
      id: `${prefix}-${i + 1}-att-${a + 1}`,
      name: `${title.replace(/\s+/g, "-").toLowerCase()}-${a + 1}.pdf`,
      uploadedAt: new Date(Date.now() - (i + a + 1) * 3600000).toISOString(),
      uploadedBy: createdBy,
      sizeLabel: `${(a + 1) * 180} KB`,
    }));

    return {
      id: `${prefix}-${i + 1}`,
      title,
      description: `Detailed description for: ${title}. Please review and update status accordingly.`,
      createdAt,
      department: dept,
      category: "General",
      status,
      priority: PRI[i % 4],
      assignedTo,
      createdBy,
      dueDate: new Date(Date.now() + (i - 2) * 86400000).toISOString().slice(0, 10),
      tags: [TAGS[i % TAGS.length], TAGS[(i + 2) % TAGS.length]],
      attachments: attachmentItems.length,
      attachmentItems,
      comments: notes.length,
      notes,
      progress: progressForStatus(dept, status),
      amount: amount || undefined,
      productLines: productLines.length > 0 ? productLines : undefined,
    };
  });
};

export const INITIAL_TASKS: Task[] = [
  ...tasksFor("support", "SUP"),
  ...tasksFor("software", "SW"),
  ...tasksFor("hardware", "HW"),
  ...tasksFor("accounts", "AC"),
  ...tasksFor("consumables", "CN"),
];

export const priorityColor = (p: Priority) =>
  p === "Low"
    ? "text-[color:var(--success)] bg-[color:var(--success)]/15"
    : p === "Medium"
      ? "text-[color:var(--warning)] bg-[color:var(--warning)]/15"
      : p === "High"
        ? "text-orange-300 bg-orange-500/15"
        : "text-[color:var(--destructive)] bg-[color:var(--destructive)]/15";

export const findUser = (id?: string) => USERS.find((u) => u.id === id);
