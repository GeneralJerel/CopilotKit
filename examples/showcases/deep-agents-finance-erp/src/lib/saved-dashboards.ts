import type { DashboardWidget, SavedDashboard } from "@/types/dashboard";

const STORAGE_KEY = "finance-erp-dashboards";

export function getSavedDashboards(): SavedDashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(dashboards: SavedDashboard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export function saveDashboard(name: string, widgets: DashboardWidget[]): SavedDashboard {
  const dashboards = getSavedDashboards();
  const now = new Date().toISOString();
  const entry: SavedDashboard = {
    id: crypto.randomUUID(),
    name,
    widgets,
    createdAt: now,
    updatedAt: now,
  };
  dashboards.push(entry);
  persist(dashboards);
  return entry;
}

export function updateSavedDashboard(id: string, widgets: DashboardWidget[]): SavedDashboard | null {
  const dashboards = getSavedDashboards();
  const idx = dashboards.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  dashboards[idx] = {
    ...dashboards[idx],
    widgets,
    updatedAt: new Date().toISOString(),
  };
  persist(dashboards);
  return dashboards[idx];
}

export function deleteSavedDashboard(id: string): void {
  const dashboards = getSavedDashboards().filter((d) => d.id !== id);
  persist(dashboards);
}

export function loadSavedDashboard(id: string): DashboardWidget[] | null {
  const dashboard = getSavedDashboards().find((d) => d.id === id);
  return dashboard?.widgets ?? null;
}

export function findSavedDashboardByName(name: string): SavedDashboard | null {
  const dashboards = getSavedDashboards();
  const lower = name.toLowerCase();
  return dashboards.find((d) => d.name.toLowerCase().includes(lower)) ?? null;
}
