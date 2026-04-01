"use client";

import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { employees } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Plus, Mail } from "lucide-react";

export default function HRPage() {
  const activeCount = employees.filter((e) => e.status === "active").length;
  const totalPayroll = employees
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + e.salary, 0);

  const departments = [...new Set(employees.map((e) => e.department))];

  return (
    <Shell>
      <Header title="Human Resources" subtitle="Team management and payroll" />

      <div className="space-y-6 p-8">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Active Employees
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Departments
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {departments.length}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Annual Payroll
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {formatCurrency(totalPayroll)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{emp.name}</p>
                    <p className="text-xs text-zinc-500">{emp.role}</p>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Department</span>
                  <span className="text-zinc-300">{emp.department}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Start Date</span>
                  <span className="text-zinc-400">{emp.startDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Salary</span>
                  <span className="font-medium text-zinc-200">
                    {formatCurrency(emp.salary)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800 pt-3">
                <a
                  href={`mailto:${emp.email}`}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <Mail className="h-3 w-3" />
                  {emp.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
