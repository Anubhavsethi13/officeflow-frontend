import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officeflowApi } from "./api/officeflow";
import { toast } from "sonner";
import api from "./api/api";
import {
  DEFAULT_EMPLOYEE_PASSWORD,
  DEPARTMENTS,
  USERS,
  type DeptKey,
  type Role,
  type User,
} from "./mock-data";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Half Day"
  | "Absent"
  | "Earned Leave"
  | "Medical Leave"
  | "Weekly Off";

export type LeaveType = "Earned Leave" | "Medical Leave" | "Unpaid Leave";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface EmployeeRecord extends User {
  employeeCode: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  workLocation: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  lateMinutes?: number;
  remarks?: string;
}

export type HalfDayPeriod = "First Half" | "Second Half";

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  managerId?: string;
  decidedBy?: string;
  decidedAt?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
}

export interface SalaryProfile {
  userId: string;
  monthlyCtc: number;
  basic: number;
  hra: number;
  allowances: number;
  incentives: number;
  deductions: number;
  tax: number;
}

export interface AdvancePayment {
  id: string;
  userId: string;
  amount: number;
  recoveredAmount: number;
  date: string;
  reason: string;
  status: "Pending" | "Approved" | "Recovered";
}

export interface SalarySlip {
  id: string;
  userId: string;
  month: string;
  gross: number;
  basic: number;
  hra: number;
  allowances: number;
  incentives: number;
  deductions: number;
  tax: number;
  advanceRecovered: number;
  netPay: number;
  generatedAt: string;
}



export interface HrState {
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  salaryProfiles: SalaryProfile[];
  advances: AdvancePayment[];
  salarySlips: SalarySlip[];
  salarySettings: SalaryStructureSettings;
}

export interface LeaveBalance {
  earnedAccrued: number;
  earnedUsed: number;
  earnedAvailable: number;
  medicalTotal: number;
  medicalUsed: number;
  medicalAvailable: number;
  pendingDays: number;
}

export const HR_STORAGE_KEY = "officeflow.hr.state.v3";

const ADMIN_ROLES: Role[] = ["Super Admin", "MD", "MD2", "MD3"];
const PEOPLE_MANAGER_ROLES: Role[] = [...ADMIN_ROLES, "Department Head", "Team Lead"];
export const PAYROLL_GENERATOR_ROLES: Role[] = [
  "Super Admin",
  "MD",
  "MD2",
  "MD3",
  "Payroll Manager",
];
export const SALARY_STRUCTURE_VIEWER_ROLES: Role[] = [...PAYROLL_GENERATOR_ROLES];

export interface SalaryStructureSettings {
  generatorRoles: Role[];
  generatorUserIds: string[];
  structureViewerRoles: Role[];
  structureViewerUserIds: string[];
}

export const DEFAULT_SALARY_SETTINGS: SalaryStructureSettings = {
  generatorRoles: PAYROLL_GENERATOR_ROLES,
  generatorUserIds: ["u-payroll"],
  structureViewerRoles: SALARY_STRUCTURE_VIEWER_ROLES,
  structureViewerUserIds: ["u-payroll"],
};

const medicalLeaveTotal = 10;

const avatarInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatarFor = (name: string, hue = 260) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},70%25,60%25)'/><stop offset='1' stop-color='hsl(${(hue + 52) % 360},70%25,50%25)'/></linearGradient></defs><rect width='64' height='64' rx='32' fill='url(%23g)'/><text x='50%25' y='50%25' dy='.35em' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='700' fill='white'>${avatarInitials(name)}</text></svg>`;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const daysAgo = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return isoDate(date);
};

const monthKey = (offset = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const departmentName = (key?: DeptKey) =>
  DEPARTMENTS.find((department) => department.key === key)?.name ?? "Leadership";

const salaryForRole = (role: Role, index: number) => {
  if (role === "Super Admin") return 185000;
  if (role === "MD" || role === "MD2" || role === "MD3") return 165000;
  if (role === "Payroll Manager") return 115000 + index * 900;
  if (role === "Department Head") return 95000 + index * 1200;
  if (role === "Team Lead") return 72000 + index * 900;
  return 42000 + index * 1800;
};

const allRoles: Role[] = [
  "Super Admin",
  "MD",
  "MD2",
  "MD3",
  "Payroll Manager",
  "Department Head",
  "Team Lead",
  "Employee",
];

const clampPercent = (value: number | undefined, fallback: number) => {
  const next = Number.isFinite(value) ? Number(value) : fallback;
  return Math.min(100, Math.max(0, next));
};

const cleanRoleList = (roles: Role[] | undefined, fallback: Role[]) => {
  const valid = new Set(allRoles);
  const next = (roles ?? fallback).filter((role): role is Role => valid.has(role));
  return next.length ? Array.from(new Set(next)) : fallback;
};

const cleanIdList = (ids: string[] | undefined, fallback: string[] = []) =>
  Array.from(new Set((ids ?? fallback).filter(Boolean)));

const normaliseSalarySettings = (
  settings?: Partial<SalaryStructureSettings>,
): SalaryStructureSettings => ({
  generatorRoles: cleanRoleList(settings?.generatorRoles, DEFAULT_SALARY_SETTINGS.generatorRoles),
  generatorUserIds: cleanIdList(
    settings?.generatorUserIds,
    DEFAULT_SALARY_SETTINGS.generatorUserIds,
  ),
  structureViewerRoles: cleanRoleList(
    settings?.structureViewerRoles,
    DEFAULT_SALARY_SETTINGS.structureViewerRoles,
  ),
  structureViewerUserIds: cleanIdList(
    settings?.structureViewerUserIds,
    DEFAULT_SALARY_SETTINGS.structureViewerUserIds,
  ),
});

const amountFromPercent = (monthlyCtc: number, percent: number) =>
  Math.round((monthlyCtc * percent) / 100);

const buildSalaryProfile = (
  userId: string,
  monthlyCtc: number,
  settings: SalaryStructureSettings,
): SalaryProfile => ({
  userId,
  monthlyCtc,
  basic: monthlyCtc,
  hra: 0,
  allowances: 0,
  incentives: 0,
  deductions: 0,
  tax: 200,
});

const toEmployeeRecord = (user: User, index: number): EmployeeRecord => {
  const joiningDate = user.joiningDate;
  const initialCtc = salaryForRole(user.role, index);
  return {
    ...user,
    employeeCode: `OF-${String(index + 1).padStart(4, "0")}`,
    dateOfBirth: `199${index % 9}-0${(index % 8) + 1}-1${index % 9}`,
    address: `${departmentName(user.departments?.[0])} block, officeflow campus`,
    emergencyContact: "+91 91234 56780",
    workLocation: user.departments?.length ? `${departmentName(user.departments[0])} floor` : "Head office",
    increments: user.increments ?? [{ date: joiningDate, amount: initialCtc }],
    documents: user.documents ?? [],
  };
};

const makeSalaryProfile = (
  employee: EmployeeRecord,
  index: number,
  settings = DEFAULT_SALARY_SETTINGS,
): SalaryProfile => {
  const monthlyCtc = employee.increments?.length 
    ? employee.increments[employee.increments.length - 1].amount
    : salaryForRole(employee.role, index);
  return buildSalaryProfile(employee.id, monthlyCtc, settings);
};

const workedStatuses: AttendanceStatus[] = ["Present", "Late", "Half Day"];

const isWorkedStatus = (status: AttendanceStatus) => workedStatuses.includes(status);

const createAttendanceForEmployee = (employee: EmployeeRecord, employeeIndex: number) => {
  const longStreak = employeeIndex % 4 === 0;
  const mediumStreak = employeeIndex % 3 === 0;

  return Array.from({ length: 60 }, (_, index): AttendanceRecord => {
    const daysBack = 59 - index;
    const date = daysAgo(daysBack);
    const withinLongStreak = longStreak && daysBack < 52;
    const withinMediumStreak = mediumStreak && daysBack < 29;
    const shouldBreak =
      !withinLongStreak && !withinMediumStreak && (index + employeeIndex) % 17 === 0;
    const status: AttendanceStatus = shouldBreak
      ? "Absent"
      : (index + employeeIndex) % 19 === 0
        ? "Half Day"
        : (index + employeeIndex) % 11 === 0
          ? "Late"
          : "Present";

    return {
      id: `att-${employee.id}-${date}`,
      userId: employee.id,
      date,
      status,
      clockIn: status === "Absent" ? undefined : status === "Late" ? "10:12" : "09:28",
      clockOut: status === "Absent" ? undefined : status === "Half Day" ? "14:05" : "18:35",
      lateMinutes: status === "Late" ? 42 : 0,
      remarks: status === "Absent" ? "Unmarked absence" : undefined,
    };
  });
};

const createInitialHrState = (): HrState => {
  const employees = USERS.map(toEmployeeRecord);
  const salarySettings = DEFAULT_SALARY_SETTINGS;
  const salaryProfiles = employees.map((employee, index) =>
    makeSalaryProfile(employee, index, salarySettings),
  );

  return {
    employees,
    attendance: employees.flatMap(createAttendanceForEmployee),
    leaveRequests: [
      {
        id: "leave-u-sw-1-1",
        userId: "u-sw-1",
        type: "Earned Leave",
        from: daysAgo(2),
        to: daysAgo(1),
        days: 2,
        reason: "Family function",
        status: "Pending",
        requestedAt: daysAgo(4),
        managerId: "u-sw-h",
      },
      {
        id: "leave-u-hw-1-1",
        userId: "u-hw-1",
        type: "Medical Leave",
        from: daysAgo(10),
        to: daysAgo(10),
        days: 1,
        reason: "Clinic visit",
        status: "Approved",
        requestedAt: daysAgo(12),
        managerId: "u-hw-h",
        decidedBy: "u-hw-h",
        decidedAt: daysAgo(11),
      },
    ],
    salaryProfiles,
    salarySettings,
    advances: [
      {
        id: "adv-u-ac-1-1",
        userId: "u-ac-1",
        amount: 15000,
        recoveredAmount: 0,
        date: daysAgo(21),
        reason: "Festival advance",
        status: "Approved",
      },
    ],
    salarySlips: employees.slice(0, 8).map((employee, index) => {
      const salary = salaryProfiles.find((profile) => profile.userId === employee.id)!;
      const advanceRecovered = index % 3 === 0 ? 2500 : 0;
      const gross = salary.monthlyCtc + salary.incentives;
      const netPay = gross - salary.deductions - salary.tax - advanceRecovered;
      return {
        id: `slip-${employee.id}-${monthKey(-1)}`,
        userId: employee.id,
        month: monthKey(-1),
        gross,
        basic: salary.basic,
        hra: salary.hra,
        allowances: salary.allowances,
        incentives: salary.incentives,
        deductions: salary.deductions,
        tax: salary.tax,
        advanceRecovered,
        netPay,
        generatedAt: daysAgo(5),
      };
    }),
  };
};

const numberOr = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const coerceSalaryProfile = (
  profile: Partial<SalaryProfile>,
  fallback: SalaryProfile,
  settings: SalaryStructureSettings,
): SalaryProfile => {
  const userId = profile.userId ?? fallback.userId;
  const monthlyCtc = numberOr(profile.monthlyCtc, fallback.monthlyCtc);
  const generated = buildSalaryProfile(userId, monthlyCtc, settings);

  return {
    ...generated,
    basic: numberOr(profile.basic, generated.basic),
    hra: numberOr(profile.hra, generated.hra),
    allowances: numberOr(profile.allowances, generated.allowances),
    incentives: numberOr(profile.incentives, generated.incentives),
    deductions: numberOr(profile.deductions, generated.deductions),
    tax: numberOr(profile.tax, generated.tax),
  };
};

const coerceSalaryProfiles = (
  profiles: Partial<SalaryProfile>[] | undefined,
  fallback: SalaryProfile[],
  settings: SalaryStructureSettings,
) => {
  const source = profiles?.length ? profiles : fallback;
  return source.map((profile, index) => {
    const matchingFallback =
      fallback.find((item) => item.userId === profile.userId) ??
      fallback[index] ??
      buildSalaryProfile(
        profile.userId ?? `salary-${index}`,
        numberOr(profile.monthlyCtc),
        settings,
      );
    return coerceSalaryProfile(profile, matchingFallback, settings);
  });
};

const coerceAdvances = (
  advances: Partial<AdvancePayment>[] | undefined,
  fallback: AdvancePayment[],
) => {
  const source = advances ?? fallback;
  return source.map((advance, index): AdvancePayment => {
    const amount = Math.max(0, numberOr(advance.amount));
    const recoveredAmount = Math.min(amount, Math.max(0, numberOr(advance.recoveredAmount)));
    const status =
      advance.status === "Approved" || advance.status === "Recovered" ? advance.status : "Pending";

    return {
      id: advance.id ?? `adv-${advance.userId ?? "user"}-${index}`,
      userId: advance.userId ?? "",
      amount,
      recoveredAmount: status === "Recovered" ? amount : recoveredAmount,
      date: advance.date ?? isoDate(new Date()),
      reason: advance.reason ?? "Salary advance",
      status,
    };
  });
};

const coerceSalarySlips = (
  slips: Partial<SalarySlip>[] | undefined,
  fallback: SalarySlip[],
  salaryProfiles: SalaryProfile[],
) => {
  const source = slips ?? fallback;

  return source.map((slip, index): SalarySlip => {
    const salary = salaryProfiles.find((profile) => profile.userId === slip.userId);
    const hasComponentSnapshot =
      typeof slip.basic === "number" ||
      typeof slip.hra === "number" ||
      typeof slip.allowances === "number" ||
      typeof slip.tax === "number";
    const advanceRecovered = Math.max(0, numberOr(slip.advanceRecovered));
    const deductions = hasComponentSnapshot
      ? Math.max(0, numberOr(slip.deductions, salary?.deductions ?? 0))
      : Math.max(0, numberOr(slip.deductions, salary?.deductions ?? 0) - advanceRecovered);
    const tax = Math.max(0, numberOr(slip.tax, salary?.tax ?? 0));
    const gross = Math.max(
      0,
      numberOr(slip.gross, (salary?.monthlyCtc ?? 0) + (salary?.incentives ?? 0)),
    );

    return {
      id: slip.id ?? `slip-${slip.userId ?? "user"}-${slip.month ?? monthKey()}-${index}`,
      userId: slip.userId ?? "",
      month: slip.month ?? monthKey(),
      gross,
      basic: Math.max(0, numberOr(slip.basic, salary?.basic ?? 0)),
      hra: Math.max(0, numberOr(slip.hra, salary?.hra ?? 0)),
      allowances: Math.max(0, numberOr(slip.allowances, salary?.allowances ?? 0)),
      incentives: Math.max(0, numberOr(slip.incentives, salary?.incentives ?? 0)),
      deductions,
      tax,
      advanceRecovered,
      netPay: gross - deductions - tax - advanceRecovered,
      generatedAt: slip.generatedAt ?? isoDate(new Date()),
    };
  });
};

const coerceState = (value: Partial<HrState> | null): HrState => {
  const fallback = createInitialHrState();
  if (!value) return fallback;
  const salarySettings = normaliseSalarySettings(value.salarySettings);
  const salaryProfiles = coerceSalaryProfiles(
    value.salaryProfiles,
    fallback.salaryProfiles,
    salarySettings,
  );

  return {
    employees: value.employees?.length ? value.employees : fallback.employees,
    attendance: value.attendance?.length ? value.attendance : fallback.attendance,
    leaveRequests: value.leaveRequests ?? fallback.leaveRequests,
    salaryProfiles,
    advances: coerceAdvances(value.advances, fallback.advances),
    salarySlips: coerceSalarySlips(value.salarySlips, fallback.salarySlips, salaryProfiles),
    salarySettings,
  };
};

export function readHrState(): HrState {
  if (typeof window === "undefined") return createInitialHrState();

  try {
    const raw = window.localStorage.getItem(HR_STORAGE_KEY);
    return coerceState(raw ? JSON.parse(raw) : null);
  } catch {
    return createInitialHrState();
  }
}

function writeHrState(state: HrState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HR_STORAGE_KEY, JSON.stringify(state));
}

export function getStoredEmployees() {
  return readHrState().employees;
}

export function isCompanyAdmin(user?: User | null) {
  return Boolean(user && ADMIN_ROLES.includes(user.role));
}

const getSalarySettings = (settings?: SalaryStructureSettings) =>
  settings ?? readHrState().salarySettings;

export function canGenerateSalaries(user?: User | null, settings?: SalaryStructureSettings) {
  if (!user) return false;
  const access = getSalarySettings(settings);
  return access.generatorRoles.includes(user.role) || access.generatorUserIds.includes(user.id);
}

export function canViewSalaryStructure(
  viewer?: User | null,
  employee?: Pick<User, "id"> | null,
  settings?: SalaryStructureSettings,
) {
  if (!viewer) return false;
  if (employee?.id === viewer.id) return true;
  const access = getSalarySettings(settings);
  return (
    canGenerateSalaries(viewer, access) ||
    access.structureViewerRoles.includes(viewer.role) ||
    access.structureViewerUserIds.includes(viewer.id)
  );
}

export function getOutstandingAdvanceAmount(advance: AdvancePayment) {
  return Math.max(0, advance.amount - advance.recoveredAmount);
}

export function getApprovedAdvanceBalance(advances: AdvancePayment[], userId: string) {
  return advances
    .filter((advance) => advance.userId === userId && advance.status === "Approved")
    .reduce((total, advance) => total + getOutstandingAdvanceAmount(advance), 0);
}

export function canManagePeople(user?: User | null) {
  return Boolean(user && PEOPLE_MANAGER_ROLES.includes(user.role));
}

export function getDirectReports(managerId: string | undefined, employees: EmployeeRecord[]) {
  if (!managerId) return [];
  return employees.filter((employee) => employee.reportingManagerId === managerId);
}

export function getSubordinateIds(managerId: string, employees: EmployeeRecord[]) {
  const ids = new Set<string>();
  const visit = (id: string) => {
    getDirectReports(id, employees).forEach((employee) => {
      if (!ids.has(employee.id)) {
        ids.add(employee.id);
        visit(employee.id);
      }
    });
  };
  visit(managerId);
  return ids;
}

export function getScopedEmployees(viewer: User, employees: EmployeeRecord[]) {
  if (isCompanyAdmin(viewer)) return employees;

  if (canManagePeople(viewer)) {
    const subordinateIds = getSubordinateIds(viewer.id, employees);
    return employees.filter(
      (employee) => employee.id === viewer.id || subordinateIds.has(employee.id),
    );
  }

  return employees.filter((employee) => employee.id === viewer.id);
}

export function canEditEmployee(viewer: User, employee: EmployeeRecord) {
  if (isCompanyAdmin(viewer)) return true;
  if (viewer.role === "Department Head" || viewer.role === "Team Lead") {
    return (
      employee.id === viewer.id ||
      getSubordinateIds(viewer.id, readHrState().employees).has(employee.id)
    );
  }
  return employee.id === viewer.id;
}

export function findEmployee(employees: EmployeeRecord[], id?: string) {
  return id ? employees.find((employee) => employee.id === id) : undefined;
}

export function getReportingChain(userId: string, employees: EmployeeRecord[]) {
  const chain: EmployeeRecord[] = [];
  let current = findEmployee(employees, userId);
  const seen = new Set<string>();

  while (current?.reportingManagerId && !seen.has(current.reportingManagerId)) {
    seen.add(current.reportingManagerId);
    const manager = findEmployee(employees, current.reportingManagerId);
    if (!manager) break;
    chain.unshift(manager);
    current = manager;
  }

  return chain;
}

export function getDepartmentStats(employees: EmployeeRecord[]) {
  return DEPARTMENTS.map((department) => {
    const members = employees.filter((employee) => employee.departments?.includes(department.key));
    const head =
      members.find((employee) => employee.role === "Department Head") ??
      members.find((employee) => !employee.reportingManagerId);

    return {
      ...department,
      count: members.length,
      active: members.filter((employee) => employee.status === "Active").length,
      head,
    };
  });
}

export function getAttendanceForUser(attendance: AttendanceRecord[], userId: string) {
  return attendance
    .filter((record) => record.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateAttendanceSummary(records: AttendanceRecord[]) {
  const presentDays = records.filter((record) => record.status === "Present").length;
  const lateDays = records.filter((record) => record.status === "Late").length;
  const halfDays = records.filter((record) => record.status === "Half Day").length;
  const absences = records.filter((record) => record.status === "Absent").length;
  let currentStreak = 0;

  for (const record of [...records].sort((a, b) => b.date.localeCompare(a.date))) {
    if (!isWorkedStatus(record.status)) break;
    currentStreak += 1;
  }

  const earnedLeaveDays = currentStreak >= 50 ? 2.5 : currentStreak >= 24 ? 1.5 : 0;

  return {
    presentDays,
    lateDays,
    halfDays,
    absences,
    currentStreak,
    earnedLeaveDays,
  };
}

export function calculateLeaveBalance(userId: string, state: HrState): LeaveBalance {
  const attendanceSummary = calculateAttendanceSummary(
    getAttendanceForUser(state.attendance, userId),
  );
  const userRequests = state.leaveRequests.filter((request) => request.userId === userId);
  const earnedUsed = userRequests
    .filter((request) => request.type === "Earned Leave" && request.status === "Approved")
    .reduce((total, request) => total + request.days, 0);
  const medicalUsed = userRequests
    .filter((request) => request.type === "Medical Leave" && request.status === "Approved")
    .reduce((total, request) => total + request.days, 0);
  const pendingDays = userRequests
    .filter((request) => request.status === "Pending")
    .reduce((total, request) => total + request.days, 0);

  return {
    earnedAccrued: attendanceSummary.earnedLeaveDays,
    earnedUsed,
    earnedAvailable: Math.max(0, attendanceSummary.earnedLeaveDays - earnedUsed),
    medicalTotal: medicalLeaveTotal,
    medicalUsed,
    medicalAvailable: Math.max(0, medicalLeaveTotal - medicalUsed),
    pendingDays,
  };
}

function dataURLtoFile(dataurl: string, filename: string) {
  try {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return new File([], filename, { type: "application/octet-stream" });
  }
}

function toDeptKeys(name?: string | null): DeptKey[] {
  if (!name) return [];
  const map: Record<string, DeptKey> = {
    support: "support",
    software: "software",
    hardware: "hardware",
    accounts: "accounts",
    consumables: "consumables",
  };
  const key = map[name.trim().toLowerCase()];
  return key ? [key] : [];
}

const initials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatar = (name: string, index: number) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${(index * 40) % 360},70%25,60%25)'/><stop offset='1' stop-color='hsl(${((index * 40) + 52) % 360},70%25,50%25)'/></linearGradient></defs><rect width='64' height='64' rx='32' fill='url(%23g)'/><text x='50%25' y='50%25' dy='.35em' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='700' fill='white'>${initials(name)}</text></svg>`;

export function mapBackendEmployeeToFrontend(emp: any, index: number, managerId?: string): EmployeeRecord {
  const roleNameMap: Record<string, Role> = {
    SUPER_ADMIN: "Super Admin",
    MD: "MD",
    DEPARTMENT_HEAD: "Department Head",
    PAYROLL_MANAGER: "Payroll Manager",
    EMPLOYEE: "Employee",
  };

  const role = roleNameMap[emp.user?.role?.name || ""] || "Employee";
  const joiningDate = emp.joiningDate ? emp.joiningDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const employeeCode = `OF-${String(index + 1).padStart(4, "0")}`;
  const dateOfBirth = `199${index % 9}-0${(index % 8) + 1}-1${index % 9}`;
  const address = emp.department?.name ? `${emp.department.name} block, officeflow campus` : "Head office, officeflow campus";
  const emergencyContact = "+91 91234 56780";
  const workLocation = emp.department?.name ? `${emp.department.name} floor` : "Head office";

  const currentSalaryNum = Number(emp.currentSalary) || 42000;

  const increments = emp.salaryHistory && emp.salaryHistory.length > 0
    ? emp.salaryHistory.map((h: any) => ({
        date: h.incrementDate.slice(0, 10),
        amount: Number(h.newSalary),
      }))
    : [{ date: joiningDate, amount: currentSalaryNum }];

  const documents = emp.documents?.map((doc: any) => ({
    id: doc.id,
    name: doc.fileName,
    type: "Other",
    fileUrl: `${api.defaults.baseURL || "/api"}${doc.filePath}`,
    uploadedAt: doc.createdAt.slice(0, 10),
  })) || [];

  return {
    id: emp.id,
    name: emp.name,
    email: emp.user?.email || "",
    phone: emp.phone || "+91 98765 43210",
    role,
    departments: toDeptKeys(emp.department?.name),
    designation: emp.designation,
    reportingManagerId: managerId || "",
    status: emp.status === "ACTIVE" ? "Active" : "Inactive",
    joiningDate,
    avatar: emp.avatar || avatar(emp.name, index),
    increments,
    employeeCode,
    dateOfBirth,
    address,
    emergencyContact,
    workLocation,
    documents,
  };
}

export function useHrStore() {
  const queryClient = useQueryClient();

  // Queries
  const { data: dbEmployees = [] } = useQuery<any[]>({
    queryKey: ["employees"],
    queryFn: () => officeflowApi.employees.list().catch(() => []),
  });

  const { data: dbHierarchy = [] } = useQuery<any[]>({
    queryKey: ["hierarchy"],
    queryFn: () => officeflowApi.hierarchy.list().catch(() => []),
  });

  const { data: dbAttendance = [] } = useQuery<any[]>({
    queryKey: ["attendance"],
    queryFn: () => officeflowApi.attendance.list().catch(() => []),
  });

  const { data: dbLeaves = [] } = useQuery<any[]>({
    queryKey: ["leaves"],
    queryFn: () => officeflowApi.leaves.list().catch(() => []),
  });

  const { data: dbDepartments = [] } = useQuery<any[]>({
    queryKey: ["departments"],
    queryFn: () => officeflowApi.departments.list().catch(() => []),
  });

  // Local storage properties
  const [localStateObj, setLocalStateObj] = useState<Pick<HrState, "advances" | "salarySlips" | "salarySettings">>((() => {
    const full = readHrState();
    return {
      advances: full.advances,
      salarySlips: full.salarySlips,
      salarySettings: full.salarySettings,
    };
  }));

  const commitLocal = (updater: (curr: typeof localStateObj) => typeof localStateObj) => {
    setLocalStateObj(current => {
      const next = updater(current);
      const full = readHrState();
      writeHrState({
        ...full,
        ...next,
      });
      return next;
    });
  };

  // Map backend employees
  const employees = useMemo<EmployeeRecord[]>(() => {
    return dbEmployees.map((emp: any, index: number) => {
      const mgr = dbHierarchy.find((h: any) => h.employeeId === emp.id);
      return mapBackendEmployeeToFrontend(emp, index, mgr?.managerId);
    });
  }, [dbEmployees, dbHierarchy]);

  // Map backend attendance
  const attendance = useMemo<AttendanceRecord[]>(() => {
    return dbAttendance.map((att: any) => {
      let status: AttendanceStatus = "Present";
      if (att.status === "ABSENT") status = "Absent";
      else if (att.status === "HALF_DAY") status = "Half Day";
      return {
        id: att.id,
        userId: att.employeeId,
        date: att.date.slice(0, 10),
        status,
        clockIn: att.checkIn ? new Date(att.checkIn).toTimeString().slice(0, 5) : undefined,
        clockOut: att.checkOut ? new Date(att.checkOut).toTimeString().slice(0, 5) : undefined,
        lateMinutes: 0,
        remarks: "",
      };
    });
  }, [dbAttendance]);

  // Map backend leave requests
  const leaveRequests = useMemo<LeaveRequest[]>(() => {
    return dbLeaves.map((leave: any) => {
      let status: LeaveStatus = "Pending";
      if (leave.status === "APPROVED") status = "Approved";
      else if (leave.status === "REJECTED") status = "Rejected";

      let type: LeaveType = "Earned Leave";
      if (leave.type === "Medical Leave") type = "Medical Leave";
      else if (leave.type === "Unpaid Leave") type = "Unpaid Leave";

      const diffTime = Math.abs(new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: leave.id,
        userId: leave.employeeId,
        type,
        from: leave.fromDate.slice(0, 10),
        to: leave.toDate.slice(0, 10),
        days,
        reason: "Leave request",
        status,
        requestedAt: leave.fromDate.slice(0, 10),
      };
    });
  }, [dbLeaves]);

  // Map salary profiles from currentSalary
  const salaryProfiles = useMemo<SalaryProfile[]>(() => {
    return employees.map((emp) => {
      const currentSalaryNum = emp.increments?.[emp.increments.length - 1]?.amount || 42000;
      return {
        userId: emp.id,
        monthlyCtc: currentSalaryNum,
        basic: currentSalaryNum,
        hra: 0,
        allowances: 0,
        incentives: 0,
        deductions: 0,
        tax: 200,
      };
    });
  }, [employees]);

  const state: HrState = useMemo(() => {
    return {
      employees,
      attendance,
      leaveRequests,
      salaryProfiles,
      advances: localStateObj.advances,
      salarySlips: localStateObj.salarySlips,
      salarySettings: localStateObj.salarySettings,
    };
  }, [employees, attendance, leaveRequests, salaryProfiles, localStateObj]);

  return useMemo(
    () => ({
      state,
      addEmployee: async (input: {
        name: string;
        email: string;
        phone: string;
        role: Role;
        departments: DeptKey[];
        designation: string;
        reportingManagerId?: string;
        monthlyCtc: number;
        password?: string;
      }) => {
        try {
          const roleMapFrontToBack: Record<string, string> = {
            "Super Admin": "SUPER_ADMIN",
            "MD": "MD",
            "MD2": "MD",
            "MD3": "MD",
            "Payroll Manager": "PAYROLL_MANAGER",
            "Department Head": "DEPARTMENT_HEAD",
            "Team Lead": "EMPLOYEE",
            "Employee": "EMPLOYEE",
          };
          const deptKey = input.departments?.[0];
          const deptId = dbDepartments.find((d: any) => d.name.toLowerCase() === deptKey?.toLowerCase())?.id || null;

          const res = await officeflowApi.employees.create({
            name: input.name,
            email: input.email,
            phone: input.phone,
            role: roleMapFrontToBack[input.role] || "EMPLOYEE",
            departmentId: deptId,
            designation: input.designation,
            joiningDate: new Date().toISOString(),
            currentSalary: Number(input.monthlyCtc),
            password: input.password || "Employee@123",
          });

          if (input.reportingManagerId) {
            await officeflowApi.hierarchy.assignManager({
              employeeId: res.id,
              managerId: input.reportingManagerId,
              level: 1,
            });
          }

          queryClient.invalidateQueries({ queryKey: ["employees"] });
          queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
          toast.success("Employee added successfully");
          return res;
        } catch (err: any) {
          toast.error(err.message || "Failed to add employee");
          throw err;
        }
      },
      updateEmployee: async (id: string, patch: Partial<EmployeeRecord>) => {
        try {
          const updatePayload: any = {};
          if (patch.name !== undefined) updatePayload.name = patch.name;
          if (patch.phone !== undefined) updatePayload.phone = patch.phone;
          if (patch.designation !== undefined) updatePayload.designation = patch.designation;
          if (patch.status !== undefined) updatePayload.status = patch.status === "Active" ? "ACTIVE" : "DISABLED";
          if (patch.password !== undefined) updatePayload.password = patch.password;
          if (patch.email !== undefined) updatePayload.email = patch.email;

          if (patch.role !== undefined) {
            const roleMapFrontToBack: Record<string, string> = {
              "Super Admin": "SUPER_ADMIN",
              "MD": "MD",
              "MD2": "MD",
              "MD3": "MD",
              "Payroll Manager": "PAYROLL_MANAGER",
              "Department Head": "DEPARTMENT_HEAD",
              "Team Lead": "EMPLOYEE",
              "Employee": "EMPLOYEE",
            };
            updatePayload.role = roleMapFrontToBack[patch.role] || "EMPLOYEE";
          }

          if (patch.departments !== undefined) {
            const deptKey = patch.departments?.[0];
            updatePayload.departmentId = dbDepartments.find((d: any) => d.name.toLowerCase() === deptKey?.toLowerCase())?.id || null;
          }

          const res = await officeflowApi.employees.update(id, updatePayload);

          if (patch.reportingManagerId !== undefined) {
            if (patch.reportingManagerId) {
              await officeflowApi.hierarchy.assignManager({
                employeeId: id,
                managerId: patch.reportingManagerId,
                level: 1,
              });
            }
          }

          queryClient.invalidateQueries({ queryKey: ["employees"] });
          queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
          toast.success("Employee updated successfully");
          return res;
        } catch (err: any) {
          toast.error(err.message || "Failed to update employee");
          throw err;
        }
      },
      updateSalary: async (userId: string, monthlyCtc: number) => {
        try {
          await officeflowApi.employees.update(userId, { currentSalary: monthlyCtc });
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          toast.success("Salary updated successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to update salary");
          throw err;
        }
      },
      recordIncrement: async (employeeId: string, date: string, amount: number) => {
        try {
          await officeflowApi.employees.update(employeeId, { currentSalary: amount, joiningDate: date });
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          toast.success("Increment recorded successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to record increment");
          throw err;
        }
      },
      uploadDocument: async (employeeId: string, doc: { name: string; type: string; fileUrl: string }) => {
        try {
          const file = dataURLtoFile(doc.fileUrl, doc.name);
          const formData = new FormData();
          formData.append("document", file);
          await officeflowApi.employees.uploadDocument(employeeId, formData);
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          toast.success("Document uploaded successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to upload document");
          throw err;
        }
      },
      deleteDocument: async (employeeId: string, docId: string) => {
        try {
          await officeflowApi.employees.deleteDocument(docId);
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          toast.success("Document deleted successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to delete document");
          throw err;
        }
      },
      updateSalaryStructureSettings: (patch: Partial<SalaryStructureSettings>) => {
        commitLocal((current) => {
          const salarySettings = normaliseSalarySettings({ ...current.salarySettings, ...patch });
          return {
            ...current,
            salarySettings,
          };
        });
      },
      markAttendance: async (record: Omit<AttendanceRecord, "id">) => {
        try {
          const dbStatus = record.status === "Absent" ? "ABSENT" : record.status === "Half Day" ? "HALF_DAY" : "PRESENT";
          await officeflowApi.attendance.upsert({
            employeeId: record.userId,
            date: record.date,
            status: dbStatus,
            checkIn: record.clockIn,
            checkOut: record.clockOut,
          });
          queryClient.invalidateQueries({ queryKey: ["attendance"] });
          toast.success("Attendance marked successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to mark attendance");
          throw err;
        }
      },
      addLeaveRequest: async (request: Omit<LeaveRequest, "id" | "status" | "requestedAt">) => {
        try {
          await officeflowApi.leaves.request({
            type: request.type,
            fromDate: request.from,
            toDate: request.to,
            employeeId: request.userId,
          });
          queryClient.invalidateQueries({ queryKey: ["leaves"] });
          toast.success("Leave requested successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to request leave");
          throw err;
        }
      },
      decideLeaveRequest: async (id: string, status: LeaveStatus, decidedBy: string) => {
        try {
          if (status === "Approved") {
            await officeflowApi.leaves.approve(id);
          } else {
            await officeflowApi.leaves.reject(id);
          }
          queryClient.invalidateQueries({ queryKey: ["leaves"] });
          toast.success(`Leave request ${status.toLowerCase()}`);
        } catch (err: any) {
          toast.error(err.message || "Failed to decide leave request");
          throw err;
        }
      },
      addAdvance: (input: {
        userId: string;
        amount: number;
        reason: string;
        status?: AdvancePayment["status"];
      }) => {
        commitLocal((current) => ({
          ...current,
          advances: [
            {
              id: `adv-${input.userId}-${Date.now()}`,
              userId: input.userId,
              amount: input.amount,
              recoveredAmount: input.status === "Recovered" ? input.amount : 0,
              date: new Date().toISOString().slice(0, 10),
              reason: input.reason,
              status: input.status ?? "Pending",
            },
            ...current.advances,
          ],
        }));
      },
      updateAdvance: (
        id: string,
        patch: Partial<Pick<AdvancePayment, "amount" | "status" | "recoveredAmount">>,
      ) => {
        commitLocal((current) => ({
          ...current,
          advances: current.advances.map((advance) => {
            if (advance.id !== id) return advance;
            const amount = Math.max(0, patch.amount !== undefined ? patch.amount : advance.amount);
            const status = patch.status ?? advance.status;
            const recoveredAmount = Math.min(
              amount,
              Math.max(0, patch.recoveredAmount !== undefined ? patch.recoveredAmount : advance.recoveredAmount),
            );
            return {
              ...advance,
              amount,
              recoveredAmount: status === "Recovered" ? amount : recoveredAmount,
              status,
            };
          }),
        }));
      },
      generateSalarySlip: (input: {
        userId: string;
        month?: string;
        advanceRecovered?: number;
      }) => {
        commitLocal((current) => {
          const salary = salaryProfiles.find((profile) => profile.userId === input.userId);
          if (!salary) return current;

          const approvedBalance = getApprovedAdvanceBalance(current.advances, input.userId);
          const advanceRecovered = Math.min(
            approvedBalance,
            Math.max(0, input.advanceRecovered !== undefined ? input.advanceRecovered : 0),
          );
          const gross = salary.monthlyCtc + salary.incentives;
          const slip: SalarySlip = {
            id: `slip-${input.userId}-${input.month ?? new Date().toISOString().slice(0, 7)}-${Date.now()}`,
            userId: input.userId,
            month: input.month ?? new Date().toISOString().slice(0, 7),
            gross,
            basic: salary.basic,
            hra: salary.hra,
            allowances: salary.allowances,
            incentives: salary.incentives,
            deductions: salary.deductions,
            tax: salary.tax,
            advanceRecovered,
            netPay: gross - salary.deductions - salary.tax - advanceRecovered,
            generatedAt: new Date().toISOString().slice(0, 10),
          };

          let remainingRecovery = advanceRecovered;
          const advances = current.advances.map((advance) => {
            if (
              advance.userId !== input.userId ||
              advance.status !== "Approved" ||
              remainingRecovery <= 0
            ) {
              return advance;
            }

            const outstanding = getOutstandingAdvanceAmount(advance);
            const recoveredNow = Math.min(outstanding, remainingRecovery);
            remainingRecovery -= recoveredNow;
            const recoveredAmount = advance.recoveredAmount + recoveredNow;

            return {
              ...advance,
              recoveredAmount,
              status:
                recoveredAmount >= advance.amount ? ("Recovered" as const) : ("Approved" as const),
            };
          });

          return {
            ...current,
            advances,
            salarySlips: [slip, ...current.salarySlips],
          };
        });
      },
    }),
    [state, dbDepartments, dbEmployees, dbHierarchy, queryClient, salaryProfiles],
  );
}
