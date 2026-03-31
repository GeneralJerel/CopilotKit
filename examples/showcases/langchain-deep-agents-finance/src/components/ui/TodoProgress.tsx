"use client";

import { TodoItem } from "@/lib/types";

export function TodoProgress({ todos }: { todos: TodoItem[] }) {
  if (!todos.length) return null;

  const done = todos.filter((t) => t.status === "done").length;

  return (
    <div className="rounded-lg border border-border bg-cream-warm p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-text">
          Analysis Plan
        </span>
        <span className="font-mono text-xs text-slate-text">
          {done}/{todos.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {todos.map((todo, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border text-[10px]">
              {todo.status === "done" ? (
                <span className="text-forest">&#10003;</span>
              ) : todo.status === "in_progress" ? (
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
              ) : null}
            </span>
            <span
              className={
                todo.status === "done"
                  ? "text-slate-text/60 line-through"
                  : todo.status === "in_progress"
                    ? "text-slate-dark font-medium"
                    : "text-slate-text"
              }
            >
              {todo.task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
