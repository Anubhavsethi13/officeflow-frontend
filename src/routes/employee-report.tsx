import { createFileRoute } from "@tanstack/react-router";
import { TaskLayout } from "@/components/task/TaskLayout";
import { useAuth } from "@/lib/auth";
import { useTasks } from "@/lib/tasks-store";
import { USERS, DEPARTMENTS } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { Download, FileText, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

export const Route = createFileRoute("/employee-report")({
  head: () => ({ meta: [{ title: "Employee Month Report - officeflow" }] }),
  component: EmployeeReport,
});

function EmployeeReport() {
  const { user } = useAuth();
  const allTasks = useTasks();

  // Role based logic
  const isAdmin = user?.role === "Super Admin" || user?.role === "MD" || user?.role === "MD2" || user?.role === "MD3";
  
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || "");
  const selectedUser = USERS.find(u => u.id === selectedUserId) || user;

  // Month selection
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const monthOptions = useMemo(() => {
    const options = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
      options.push({ value: `${year}-${month}`, label });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, []);

  const currentMonthName = monthOptions.find(o => o.value === selectedMonth)?.label || "";

  // Filter tasks for the user and month
  const userTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (t.assignedTo !== selectedUserId) return false;
      const taskDate = new Date(t.createdAt);
      if (Number.isNaN(taskDate.getTime())) return true;
      const taskMonth = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, "0")}`;
      return taskMonth === selectedMonth;
    });
  }, [allTasks, selectedUserId, selectedMonth]);

  const completedTasks = userTasks.filter(t => /completed|done|closed|resolved|payment done/i.test(t.status));
  const pendingTasks = userTasks.filter(t => !/completed|done|closed|resolved|payment done/i.test(t.status));
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(userTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = userTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    if (!selectedUser) return;
    const headers = ["Task ID", "Title", "Department", "Status", "Priority", "Created At", "Due Date"];
    const rows = userTasks.map(t => [
      t.id, 
      `"${t.title.replace(/"/g, '""')}"`, 
      t.department, 
      t.status, 
      t.priority, 
      t.createdAt.slice(0,10), 
      t.dueDate
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employee_Report_${selectedUser.name.replace(/\s+/g, '_')}_${currentMonthName.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (!user || !selectedUser) return null;

  return (
    <TaskLayout title="Employee Month Report" subtitle={currentMonthName}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-report-area, #print-report-area * { visibility: visible; }
          #print-report-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
          .glass { background: #fff !important; color: #000 !important; border: 1px solid #ccc; box-shadow: none !important; }
          .glass-strong { background: #f9f9f9 !important; border: 1px solid #ddd; }
          .text-muted-foreground { color: #555 !important; }
          * { color: black !important; }
          .print-header { display: block !important; margin-bottom: 20px; font-size: 24px; font-weight: bold; }
        }
        .print-header { display: none; }
      `}} />

      {/* Control Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 no-print">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="w-full sm:w-72">
            {isAdmin ? (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {USERS.filter(u => !u.role.startsWith("MD") && u.designation !== "HR Director").map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} - {u.designation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium h-12 flex items-center">
                Report locked to: {user.name}
              </div>
            )}
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="flex-1 sm:flex-none border-white/10 bg-white/5 hover:bg-white/10 gap-2">
            <Download className="size-4" />
            Excel (CSV)
          </Button>
          <Button onClick={handleExportPDF} className="flex-1 sm:flex-none gradient-primary text-white border-0 gap-2">
            <FileText className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div id="print-report-area">
        <div className="print-header">Employee Performance Report - {currentMonthName}</div>
        
        {/* Profile Header */}
        <div className="glass rounded-3xl p-6 md:p-8 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--secondary)]" />
          
          <img src={selectedUser.avatar} alt={selectedUser.name} className="size-24 rounded-full ring-4 ring-white/10" />
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display text-3xl font-bold">{selectedUser.name}</h2>
            <p className="text-[color:var(--secondary)] font-medium mt-1">{selectedUser.designation}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4" /> Role: {selectedUser.role}</span>
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> Joined: {selectedUser.joiningDate}</span>
              <span className="flex items-center gap-1.5"><ListTodo className="size-4" /> Depts: {selectedUser.departments.map(d => DEPARTMENTS.find(dep => dep.key === d)?.name).join(', ')}</span>
            </div>
          </div>

          <div className="w-full md:w-64 glass-strong rounded-2xl p-5 text-center shrink-0">
            <div className="text-sm font-medium mb-2">Monthly Completion Rate</div>
            <div className="text-4xl font-display font-bold gradient-text">{completionRate}%</div>
            <div className="h-2 mt-3 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full gradient-primary rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Assigned", value: userTasks.length, color: "var(--primary)" },
            { label: "Tasks Completed", value: completedTasks.length, color: "var(--success)" },
            { label: "Pending Tasks", value: pendingTasks.length, color: "var(--warning)" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</div>
              <div className="font-display text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="font-display font-semibold text-lg">Task Breakdown</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Task ID</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created Date</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No tasks assigned for this month.
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((t) => {
                    const isDone = /completed|done|closed|resolved|payment done/i.test(t.status);
                    const deptMeta = DEPARTMENTS.find(d => d.key === t.department);
                    return (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                        <td className="px-6 py-4 font-medium max-w-[200px] sm:max-w-md truncate" title={t.title}>
                          {t.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-xs" style={{ color: deptMeta?.color }}>
                            {deptMeta?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${isDone ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]' : 'bg-white/10 text-muted-foreground'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {t.createdAt.slice(0, 10)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {t.dueDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-black/5 dark:border-white/5">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-4">Page {currentPage} of {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </TaskLayout>
  );
}
