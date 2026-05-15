"use client";

import { useMemo } from "react";

export function BarChart({ data, color = "var(--color-primary)" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const BAR_AREA = 160;
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1.5" style={{ height: BAR_AREA }}>
        {data.map((d, i) => {
          const h = Math.max(d.value > 0 ? 4 : 0, Math.round((d.value / max) * BAR_AREA));
          return (
            <div key={i} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[9px] font-semibold text-[var(--color-muted-foreground)] tabular-nums">{d.value}</span>
              <div
                className="w-full rounded-t-md transition-all hover:opacity-80"
                style={{ height: h, background: color }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1.5 mt-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-[9px] uppercase text-[var(--color-muted-foreground)] truncate text-center min-w-0">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const r = 36;
  const c = 2 * Math.PI * r;

  const arcs = useMemo(() => segments.map((s) => {
    const frac = s.value / total;
    const len = c * frac;
    const arc = { color: s.color, len, offset: -acc, label: s.label, value: s.value, frac };
    acc += len;
    return arc;
  }), [segments, total, c, acc]);

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="14" />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="50" cy="50" r={r}
            fill="none" stroke={a.color} strokeWidth="14"
            strokeDasharray={`${a.len} ${c - a.len}`}
            strokeDashoffset={a.offset}
          />
        ))}
        <text x="50" y="55" textAnchor="middle" className="rotate-90" style={{ fontSize: 14, fontWeight: 700, fill: "var(--color-foreground)" }}>
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 flex-1 min-w-0">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="font-semibold tabular-nums">{s.value}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)] tabular-nums w-9 text-right">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
