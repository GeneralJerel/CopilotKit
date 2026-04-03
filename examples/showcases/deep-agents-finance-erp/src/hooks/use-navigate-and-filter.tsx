"use client";

import { useRef, useEffect } from "react";
import { useRenderTool, ToolCallStatus } from "@copilotkit/react-core/v2";
import { useRouter } from "next/navigation";

const routes: Record<string, string> = {
  dashboard: "/",
  invoices: "/invoices",
  accounts: "/accounts",
  inventory: "/inventory",
  hr: "/hr",
};

function Navigator({
  page,
  filter,
  status,
}: {
  page: string;
  filter?: string;
  status: string;
}) {
  const router = useRouter();
  const applied = useRef(false);

  useEffect(() => {
    if (status === ToolCallStatus.Complete && page && !applied.current) {
      applied.current = true;
      const base = routes[page] ?? "/";
      const url = filter
        ? `${base}?filter=${encodeURIComponent(filter)}`
        : base;
      router.push(url);
    }
  }, [status, page, filter, router]);

  if (status === ToolCallStatus.Complete) return null;
  return (
    <p className="text-sm text-muted-foreground animate-pulse py-1">
      Navigating to {page}...
    </p>
  );
}

export function useNavigateAndFilter() {
  useRenderTool(
    {
      name: "navigate_and_filter",
      render: ({ args, status }) => (
        <Navigator
          page={args?.page ?? ""}
          filter={args?.filter}
          status={status}
        />
      ),
    },
    [],
  );
}
