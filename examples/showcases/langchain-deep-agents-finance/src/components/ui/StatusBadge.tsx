"use client";

const BADGE_STYLES: Record<string, string> = {
  Low: "border-forest/30 bg-forest/5 text-forest",
  Moderate: "border-gold/30 bg-gold/5 text-gold",
  Elevated: "border-gold/50 bg-gold/10 text-slate-dark",
  High: "border-burgundy/30 bg-burgundy/5 text-burgundy",
  running: "border-gold/30 bg-gold/5 text-gold",
  completed: "border-forest/30 bg-forest/5 text-forest",
  failed: "border-burgundy/30 bg-burgundy/5 text-burgundy",
  draft: "border-border bg-cream-warm text-slate-text",
  approved: "border-forest/30 bg-forest/5 text-forest",
};

export function StatusBadge({ status }: { status: string }) {
  const style = BADGE_STYLES[status] ?? "border-border bg-cream-warm text-slate-text";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
