import { createFileRoute } from "@tanstack/react-router";
import { WMSLayout } from "@/components/wms/WMSLayout";
import { useWmsStore } from "@/lib/wms-store";
import { type Category } from "@/lib/wms-data";
import { ChevronRight, Folder, FolderOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const Route = createFileRoute("/wms/categories")({
  head: () => ({ meta: [{ title: "Categories - WMS" }] }),
  component: CategoriesPage,
});

const blankForm = (parentId: string | null = null): Omit<Category, "id"> => ({
  name: "",
  code: "",
  parentId,
  type: parentId ? "hardware" : "root",
  defaultUnit: "pcs",
  lowStockThreshold: 5,
  description: "",
  status: "Active",
});

function CategoriesPage() {
  const categories = useWmsStore((state) => state.categories);
  const products = useWmsStore((state) => state.products);
  const addCategory = useWmsStore((state) => state.addCategory);
  const updateCategory = useWmsStore((state) => state.updateCategory);
  const deleteCategory = useWmsStore((state) => state.deleteCategory);
  const [openTree, setOpenTree] = useState<Record<string, boolean>>({ "c-hw": true, "c-cn": true });
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Omit<Category, "id">>(blankForm());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const roots = categories.filter((category) => category.parentId === null);
  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return categories.filter((category) => {
      const parent = categories.find((item) => item.id === category.parentId);
      return `${category.name} ${category.code} ${parent?.name ?? ""} ${category.defaultUnit}`
        .toLowerCase()
        .includes(needle);
    });
  }, [categories, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedCategories = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openAdd = (parentId: string | null = null) => {
    setEditing(null);
    setForm(blankForm(parentId));
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      code: category.code,
      parentId: category.parentId,
      type: category.type,
      defaultUnit: category.defaultUnit,
      lowStockThreshold: category.lowStockThreshold,
      description: category.description,
      status: category.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Category name and code are required.");
      return;
    }
    if (editing) {
      const result = updateCategory(editing.id, form);
      toast[result.ok ? "success" : "error"](result.message);
    } else {
      addCategory({ ...form, code: form.code.toUpperCase() });
      toast.success("Category added.");
    }
    setDialogOpen(false);
  };

  const remove = (category: Category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    const result = deleteCategory(category.id);
    toast[result.ok ? "success" : "error"](result.message);
  };

  return (
    <WMSLayout title="Master Categories" subtitle="Manage hardware and consumable product groups">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="wms-search-field flex h-11 min-w-[240px] flex-1 items-center gap-2 rounded-xl border px-3 lg:max-w-md">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            placeholder="Search category, code, parent or unit"
          />
        </div>
        <Button onClick={() => openAdd()} className="rounded-xl border-0 text-white gradient-primary">
          <Plus className="size-4" /> Add Category
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Category Tree</h3>
            <button onClick={() => openAdd(null)} className="rounded-lg p-1.5 hover:bg-white/10" title="Add root category">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-1">
            {roots.map((root) => {
              const children = categories.filter((category) => category.parentId === root.id);
              const isOpen = openTree[root.id];
              return (
                <div key={root.id}>
                  <div className="flex items-center gap-2 rounded-xl hover:bg-white/5">
                    <button
                      onClick={() => setOpenTree((state) => ({ ...state, [root.id]: !state[root.id] }))}
                      className="flex flex-1 items-center gap-2 p-2 text-left"
                    >
                      <ChevronRight className={`size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      {isOpen ? <FolderOpen className="size-4 text-[color:var(--secondary)]" /> : <Folder className="size-4" />}
                      <span className="text-sm font-medium">{root.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{children.length}</span>
                    </button>
                    <button onClick={() => openAdd(root.id)} className="mr-2 rounded-lg p-1.5 hover:bg-white/10" title={`Add under ${root.name}`}>
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {children.map((child) => {
                        const count = products.filter((product) => product.subCategoryId === child.id).length;
                        return (
                          <div key={child.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/5">
                            <Folder className="size-3.5 text-muted-foreground" />
                            <span className="text-sm">{child.name}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">{count} SKUs</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045] lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Parent</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-right">SKUs</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => {
                const parent = categories.find((item) => item.id === category.parentId);
                const count = products.filter((product) => product.subCategoryId === category.id || product.categoryId === category.id).length;
                return (
                  <tr key={category.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">{category.name}</td>
                    <td className="p-3 text-muted-foreground">{category.code}</td>
                    <td className="p-3 text-muted-foreground">{parent?.name ?? "Root"}</td>
                    <td className="p-3">{category.defaultUnit}</td>
                    <td className="p-3 text-right">{count}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${category.status === "Active" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-white/10 text-muted-foreground"}`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(category)} className="rounded-lg p-1.5 hover:bg-white/10" title={`Edit ${category.name}`}>
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => remove(category)} className="rounded-lg p-1.5 text-[color:var(--destructive)] hover:bg-white/10" title={`Delete ${category.name}`}>
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-white/5 p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
            </Field>
            <Field label="Code">
              <Input value={form.code} onChange={(event) => setForm((state) => ({ ...state, code: event.target.value.toUpperCase() }))} />
            </Field>
            <Field label="Parent">
              <select value={form.parentId ?? "root"} onChange={(event) => setForm((state) => ({ ...state, parentId: event.target.value === "root" ? null : event.target.value }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="root">Root category</option>
                {roots.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(event) => setForm((state) => ({ ...state, type: event.target.value as Category["type"] }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="root">Root</option>
                <option value="hardware">Hardware</option>
                <option value="consumable">Consumable</option>
              </select>
            </Field>
            <Field label="Default Unit">
              <Input value={form.defaultUnit} onChange={(event) => setForm((state) => ({ ...state, defaultUnit: event.target.value }))} />
            </Field>
            <Field label="Low Stock Threshold">
              <Input type="number" value={form.lowStockThreshold} onChange={(event) => setForm((state) => ({ ...state, lowStockThreshold: Number(event.target.value) }))} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value as Category["status"] }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Input value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="text-white gradient-primary">Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WMSLayout>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
