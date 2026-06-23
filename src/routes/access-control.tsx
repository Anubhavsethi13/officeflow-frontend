import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import {
  getAccessProfiles,
  getPagesForModule,
  MODULE_CATALOG,
  PAGE_CATALOG,
  saveAccessProfile,
  type AccessProfile,
  type ModuleKey,
  type PageKey,
} from "@/lib/access-control";
import { isCompanyAdmin, useHrStore } from "@/lib/hr-store";
import { Button } from "@/components/ui/button";
import { Check, LockKeyhole, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/access-control")({
  head: () => ({ meta: [{ title: "Access Control - officeflow" }] }),
  component: AccessControl,
});

const moduleKeys = Object.keys(MODULE_CATALOG) as ModuleKey[];

function AccessControl() {
  const { user } = useAuth();
  const { state } = useHrStore();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(user?.id);
  const [profiles, setProfiles] = useState<Record<string, AccessProfile>>({});

  useEffect(() => {
    setProfiles(getAccessProfiles(state.employees));
  }, [state.employees]);

  const filteredEmployees = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.employees.filter((employee) =>
      !term || `${employee.name} ${employee.email} ${employee.role} ${employee.designation}`.toLowerCase().includes(term),
    );
  }, [q, state.employees]);

  if (!user) return null;

  if (!isCompanyAdmin(user)) {
    return (
      <AppLayout title="Access Control">
        <div className="glass-strong mx-auto max-w-xl rounded-lg p-8 text-center">
          <LockKeyhole className="mx-auto mb-4 size-12 rounded-lg bg-[color:var(--destructive)]/15 p-3 text-[color:var(--destructive)]" />
          <h1 className="font-display text-2xl font-bold">Restricted page</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only company administrators can assign modules and page permissions.
          </p>
        </div>
      </AppLayout>
    );
  }

  const selected = state.employees.find((employee) => employee.id === selectedId) ?? filteredEmployees[0] ?? state.employees[0];
  const selectedProfile = selected ? profiles[selected.id] : undefined;

  const commitProfile = (employeeId: string, profile: AccessProfile) => {
    saveAccessProfile(employeeId, profile);
    setProfiles((current) => ({ ...current, [employeeId]: profile }));
  };

  const toggleModule = (module: ModuleKey) => {
    if (!selected || !selectedProfile) return;
    const enabled = selectedProfile.modules.includes(module);
    const modulePages = getPagesForModule(module);
    const nextProfile: AccessProfile = enabled
      ? {
          modules: selectedProfile.modules.filter((item) => item !== module),
          pages: selectedProfile.pages.filter((page) => PAGE_CATALOG[page].module !== module),
        }
      : {
          modules: [...selectedProfile.modules, module],
          pages: Array.from(new Set([...selectedProfile.pages, ...modulePages])),
        };
    commitProfile(selected.id, nextProfile);
  };

  const togglePage = (page: PageKey) => {
    if (!selected || !selectedProfile) return;
    const pageModule = PAGE_CATALOG[page].module;
    const enabled = selectedProfile.pages.includes(page);
    const nextPages = enabled
      ? selectedProfile.pages.filter((item) => item !== page)
      : [...selectedProfile.pages, page];
    const nextModules = selectedProfile.modules.includes(pageModule)
      ? selectedProfile.modules
      : [...selectedProfile.modules, pageModule];
    commitProfile(selected.id, { modules: nextModules, pages: nextPages });
  };

  return (
    <AppLayout title="Access Control">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="glass rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-4 text-[color:var(--success)]" />
            Employees
          </div>
          <div className="mb-3 flex h-11 items-center gap-2 rounded-lg border border-border bg-card/70 px-3">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search people..." className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="space-y-2">
            {filteredEmployees.map((employee) => {
              const active = employee.id === selected?.id;
              const access = profiles[employee.id];
              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedId(employee.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${active ? "border-primary/40 bg-primary/10" : "border-border bg-card/50 hover:bg-card/80"}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={employee.avatar} alt={employee.name} className="size-9 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{employee.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{employee.role}</div>
                    </div>
                    <span className="rounded-full bg-card/80 px-2 py-1 text-[10px] text-muted-foreground">
                      {access?.modules.length ?? 0}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {selected && selectedProfile && (
          <section className="space-y-4">
            <div className="glass-strong rounded-lg p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src={selected.avatar} alt={selected.name} className="size-12 rounded-full" />
                  <div>
                    <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.designation} - {selected.role}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-card/70 px-3 py-2 text-sm text-muted-foreground">
                  {selectedProfile.modules.length} modules, {selectedProfile.pages.length} pages
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {moduleKeys.map((module) => {
                const moduleEnabled = selectedProfile.modules.includes(module);
                const pages = getPagesForModule(module);
                return (
                  <div key={module} className="glass rounded-lg p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{MODULE_CATALOG[module].label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{MODULE_CATALOG[module].description}</p>
                      </div>
                      <button
                        onClick={() => toggleModule(module)}
                        className={`grid size-10 place-items-center rounded-lg border transition-colors ${moduleEnabled ? "gradient-primary border-transparent text-white" : "border-border bg-card/70 text-muted-foreground"}`}
                        aria-label={`Toggle ${MODULE_CATALOG[module].label}`}
                      >
                        {moduleEnabled && <Check className="size-5" />}
                      </button>
                    </div>
                    <div className="grid gap-2">
                      {pages.map((page) => {
                        const pageEnabled = selectedProfile.pages.includes(page);
                        return (
                          <label key={page} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${moduleEnabled ? "border-border bg-card/50" : "border-border/60 bg-card/30 text-muted-foreground"}`}>
                            <span>{PAGE_CATALOG[page].label}</span>
                            <input
                              type="checkbox"
                              checked={pageEnabled}
                              onChange={() => togglePage(page)}
                              className="size-4 accent-[color:var(--primary)]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass rounded-lg p-4 text-sm text-muted-foreground">
              These frontend rules hide welcome cards, sidebar links, and guarded routes in the demo. Production security still needs server-side authentication, authorization checks, and protected APIs.
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
