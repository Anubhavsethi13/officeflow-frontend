import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DeptKey, Role, User } from "./mock-data";
import { officeflowApi, type AuthResponse, type BackendRole } from "./api/officeflow";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  loginWithCredentials: async () => false,
  logout: async () => undefined,
});

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "officeflow.user";

const roleMap: Record<BackendRole, Role> = {
  SUPER_ADMIN: "Super Admin",
  MD: "MD",
  MD2: "MD2",
  MD3: "MD3",
  DEPARTMENT_HEAD: "Department Head",
  PAYROLL_MANAGER: "Payroll Manager",
  TEAM_LEAD: "Team Lead",
  EMPLOYEE: "Employee",
};

const departmentMap: Record<string, DeptKey> = {
  support: "support",
  software: "software",
  hardware: "hardware",
  accounts: "accounts",
  consumables: "consumables",
};

const initials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatar = (name: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(195,70%25,58%25)'/><stop offset='1' stop-color='hsl(225,70%25,48%25)'/></linearGradient></defs><rect width='64' height='64' rx='32' fill='url(%23g)'/><text x='50%25' y='50%25' dy='.35em' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='700' fill='white'>${initials(name)}</text></svg>`;

function toDeptKeys(name?: string | null): DeptKey[] {
  if (!name) return [];
  const key = departmentMap[name.trim().toLowerCase()];
  return key ? [key] : [];
}

function persistTokens(payload: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
}

function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function toUser(payload: AuthResponse): User | null {
  if (!payload.user.employee) return null;
  const employee = payload.user.employee;
  return {
    id: employee.id,
    name: employee.name,
    email: payload.user.email,
    phone: employee.phone || "",
    role: roleMap[payload.user.role] || "Employee",
    departments: toDeptKeys(employee.department?.name),
    designation: employee.designation,
    status: employee.status === "ACTIVE" ? "Active" : "Inactive",
    joiningDate: employee.joiningDate.slice(0, 10),
    avatar: avatar(employee.name),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!hasToken) {
      setLoading(false);
      return;
    }

    officeflowApi
      .me()
      .then(() => {
        setUser(readStoredUser());
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const payload = await officeflowApi.login(email, password);
      persistTokens(payload);
      const nextUser = toUser(payload);
      if (!nextUser) {
        clearTokens();
        setUser(null);
        return false;
      }
      persistUser(nextUser);
      setUser(nextUser);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await officeflowApi.logout();
    } catch {
      // Ignore logout errors and clear the local session anyway.
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return <Ctx.Provider value={{ user, loading, loginWithCredentials, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export const canViewAllDepartments = (role?: Role) =>
  role === "Super Admin" || role === "MD";
