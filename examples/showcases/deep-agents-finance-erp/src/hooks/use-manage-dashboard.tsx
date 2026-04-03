"use client";

import { useRef, useEffect } from "react";
import { useRenderTool, ToolCallStatus } from "@copilotkit/react-core/v2";
import { useDashboard } from "@/context/dashboard-context";

interface ReorderUpdate {
  widgetId: string;
  colSpan?: number;
  order?: number;
}

function DashboardManager({
  action,
  widgetId,
  updates,
  status,
}: {
  action: string;
  widgetId?: string;
  updates?: ReorderUpdate[];
  status: string;
}) {
  const { getWidgets, setWidgets, removeWidget, resetToDefault } =
    useDashboard();
  const applied = useRef(false);

  useEffect(() => {
    if (status === ToolCallStatus.Complete && !applied.current) {
      applied.current = true;

      if (action === "reset") {
        resetToDefault();
      } else if (action === "remove" && widgetId) {
        removeWidget(widgetId);
      } else if (action === "reorder" && updates) {
        const updatedWidgets = getWidgets().map((w) => {
          const update = updates.find((u) => u.widgetId === w.id);
          if (!update) return w;
          return {
            ...w,
            ...(update.colSpan !== undefined && {
              colSpan: update.colSpan as 1 | 2 | 3 | 4,
            }),
            ...(update.order !== undefined && { order: update.order }),
          } as typeof w;
        });
        setWidgets(updatedWidgets);
      }
    }
  }, [status, action, widgetId, updates, resetToDefault, removeWidget, getWidgets, setWidgets]);

  if (status === ToolCallStatus.Complete) return null;
  return (
    <p className="text-sm text-muted-foreground animate-pulse py-1">
      Updating layout...
    </p>
  );
}

export function useManageDashboard() {
  useRenderTool(
    {
      name: "manage_dashboard",
      render: ({ args, status }) => (
        <DashboardManager
          action={args?.action ?? ""}
          widgetId={args?.widgetId}
          updates={args?.updates}
          status={status}
        />
      ),
    },
    [],
  );
}
