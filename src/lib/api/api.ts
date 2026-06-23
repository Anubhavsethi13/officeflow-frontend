import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const browserWindow = typeof globalThis !== "undefined" ? (globalThis as any).window : undefined;

// REQUEST INTERCEPTOR

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (browserWindow) {
      const token = browserWindow.localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const roleMap: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MD: "MD",
  DEPARTMENT_HEAD: "Department Head",
  PAYROLL_MANAGER: "Payroll Manager",
  EMPLOYEE: "Employee",
};

const toDeptKeys = (name?: string | null): string[] => {
  if (!name) return [];
  const map: Record<string, string> = {
    support: "support",
    software: "software",
    hardware: "hardware",
    accounts: "accounts",
    consumables: "consumables",
  };
  const key = map[name.trim().toLowerCase()];
  return key ? [key] : [];
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

// RESPONSE INTERCEPTOR

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },

  async (error: AxiosError) => {
    const serverMsg = (error.response?.data as any)?.message;
    if (serverMsg) {
      error.message = serverMsg;
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (browserWindow && error.response?.status === 401 && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      const refreshToken = browserWindow.localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshRes = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const { accessToken, refreshToken: newRefreshToken, user } = refreshRes.data.data;

          browserWindow.localStorage.setItem("accessToken", accessToken);
          browserWindow.localStorage.setItem("refreshToken", newRefreshToken);

          const employee = user.employee;
          if (employee) {
            browserWindow.localStorage.setItem(
              "officeflow.user",
              JSON.stringify({
                id: employee.id,
                name: employee.name,
                email: user.email,
                phone: employee.phone || "",
                role: roleMap[user.role] || "Employee",
                departments: toDeptKeys(employee.department?.name),
                designation: employee.designation,
                status: employee.status === "ACTIVE" ? "Active" : "Inactive",
                joiningDate: employee.joiningDate.slice(0, 10),
                avatar: avatar(employee.name),
              })
            );
          }

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          browserWindow.localStorage.removeItem("accessToken");
          browserWindow.localStorage.removeItem("refreshToken");
          browserWindow.localStorage.removeItem("officeflow.user");
          browserWindow.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        browserWindow.localStorage.removeItem("accessToken");
        browserWindow.localStorage.removeItem("refreshToken");
        browserWindow.localStorage.removeItem("officeflow.user");
        browserWindow.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
