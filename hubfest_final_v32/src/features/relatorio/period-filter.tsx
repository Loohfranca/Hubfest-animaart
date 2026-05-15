"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "ano", label: "Este ano" },
  { value: "all", label: "Tudo" },
];

export function PeriodFilter({ current }: { current: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  function set(value: string) {
    const next = new URLSearchParams(sp.toString());
    next.set("p", value);
    router.replace(`/relatorio?${next.toString()}`);
  }

  return (
    <div className="inline-flex rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => set(p.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            current === p.value
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
