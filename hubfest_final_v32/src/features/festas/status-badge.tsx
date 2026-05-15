"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { FestaStatus, FestaStatusLabel } from "@/shared/supabase/types";
import { statusColor } from "./status";
import { updateStatus } from "./actions";

const OPTIONS: { value: FestaStatus; label: FestaStatusLabel }[] = [
  { value: "neutral", label: "Pendente" },
  { value: "warning", label: "Planejamento" },
  { value: "success", label: "Confirmada" },
  { value: "dark", label: "Realizada" },
];

export function StatusBadge({ id, status, label }: { id: string; status: FestaStatus; label: FestaStatusLabel }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function change(next: FestaStatus) {
    setOpen(false);
    if (next === status) return;
    startTransition(async () => { await updateStatus(id, next); });
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        disabled={pending}
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition ${statusColor(status)} ${pending ? "opacity-60" : "hover:scale-105 cursor-pointer"}`}
        title="Mudar status"
      >
        {label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)] py-1">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); change(o.value); }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-[var(--color-muted)]"
            >
              <span className="inline-flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColor(o.value).split(" ")[1]}`} />
                {o.label}
              </span>
              {o.value === status && <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
