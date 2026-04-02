"use client";

import { useDashboard } from "@/context/dashboard-context";
import { WidgetRenderer, colSpanClass } from "@/components/dashboard/widget-renderer";

export function DashboardGrid() {
  const { widgets } = useDashboard();
  const sorted = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-4 gap-6">
        {sorted.map((widget) => (
          <div key={widget.id} className={colSpanClass(widget.colSpan)}>
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </div>
    </div>
  );
}
