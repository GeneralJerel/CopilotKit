"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { riskColor } from "@/lib/colors";

interface GaugeArcProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function GaugeArc({
  score,
  size = 200,
  strokeWidth = 14,
  label,
}: GaugeArcProps) {
  const animated = useCountUp(score, 1200, 0);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircle: from 180deg to 0deg (left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const arcLength = Math.PI;

  // Background arc path
  const bgPath = describeArc(cx, cy, radius, startAngle, endAngle);

  // Filled arc proportional to score
  const fillAngle = startAngle - (animated / 100) * arcLength;
  const fillPath = describeArc(cx, cy, radius, startAngle, fillAngle);

  // Needle
  const needleAngle = startAngle - (animated / 100) * arcLength;
  const needleX = cx + radius * 0.85 * Math.cos(needleAngle);
  const needleY = cy - radius * 0.85 * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#E8E4DD" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Color zones */}
        <path
          d={describeArc(cx, cy, radius, Math.PI, Math.PI * 2 / 3)}
          fill="none" stroke="#2D5A3D" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2}
        />
        <path
          d={describeArc(cx, cy, radius, Math.PI * 2 / 3, Math.PI / 3)}
          fill="none" stroke="#C4A961" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2}
        />
        <path
          d={describeArc(cx, cy, radius, Math.PI / 3, 0)}
          fill="none" stroke="#8B3A3A" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2}
        />

        {/* Filled arc */}
        <path d={fillPath} fill="none" stroke={riskColor(animated)} strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={riskColor(animated)} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill={riskColor(animated)} />

        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" className="font-serif text-3xl font-semibold" fill="#3D3D3A">
          {Math.round(animated)}
        </text>
        {label && (
          <text x={cx} y={cy + 8} textAnchor="middle" className="text-xs" fill="#64645F">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  // Clockwise sweep for top-half semicircle
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}
