"use client";

import { useState, useRef, useEffect } from "react";
import { Bookmark, FolderOpen, Trash2, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard-context";

export function DashboardToolbar() {
  const {
    savedDashboards,
    currentDashboardName,
    saveCurrent,
    loadSaved,
    deleteSaved,
  } = useDashboard();

  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const loadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSaveInput) saveInputRef.current?.focus();
  }, [showSaveInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loadMenuRef.current && !loadMenuRef.current.contains(e.target as Node)) {
        setShowLoadMenu(false);
      }
    }
    if (showLoadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLoadMenu]);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    saveCurrent(name);
    setSaveName("");
    setShowSaveInput(false);
  };

  return (
    <div className="flex items-center gap-2 px-8 pt-6">
      {currentDashboardName && (
        <span className="text-xs text-muted-foreground">
          Current: <span className="font-medium text-foreground">{currentDashboardName}</span>
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Save button / input */}
        {showSaveInput ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={saveInputRef}
              type="text"
              placeholder="Dashboard name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setShowSaveInput(false);
              }}
              className="h-8 w-48 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring/30"
            />
            <Button size="icon-sm" variant="ghost" onClick={handleSave} disabled={!saveName.trim()}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setShowSaveInput(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveInput(true)}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save
          </Button>
        )}

        {/* Load dropdown */}
        <div className="relative" ref={loadMenuRef}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLoadMenu(!showLoadMenu)}
            disabled={savedDashboards.length === 0}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Saved
            {savedDashboards.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                {savedDashboards.length}
              </span>
            )}
            <ChevronDown className="ml-0.5 h-3 w-3" />
          </Button>

          {showLoadMenu && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border bg-card shadow-lg">
              <div className="max-h-64 overflow-y-auto p-1.5">
                {savedDashboards.map((d) => (
                  <div
                    key={d.id}
                    className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <button
                      className="flex flex-1 flex-col items-start text-left"
                      onClick={() => {
                        loadSaved(d.id);
                        setShowLoadMenu(false);
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {d.name}
                        {currentDashboardName === d.name && (
                          <span className="ml-2 text-[10px] text-primary">(active)</span>
                        )}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {d.widgets.length} widgets &middot;{" "}
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSaved(d.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
