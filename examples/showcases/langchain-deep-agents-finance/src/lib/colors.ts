/** Map a risk score (0–100) to a hex color on the forest → gold → burgundy scale. */
export function riskColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped <= 50) {
    // forest → gold
    const t = clamped / 50;
    return lerpColor("#2D5A3D", "#C4A961", t);
  }
  // gold → burgundy
  const t = (clamped - 50) / 50;
  return lerpColor("#C4A961", "#8B3A3A", t);
}

/** Map a correlation coefficient (-1 to 1) to a color. */
export function correlationColor(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));

  if (clamped <= 0) {
    // forest (negative) → cream (zero)
    const t = (clamped + 1); // 0 → 1
    return lerpColor("#2D5A3D", "#FAF8F5", t);
  }
  // cream (zero) → burgundy (positive)
  return lerpColor("#FAF8F5", "#8B3A3A", clamped);
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}
