"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const VIEWS = [
  { value: "todas", label: "Todas" },
  { value: "proximas", label: "Próximas" },
  { value: "realizadas", label: "Realizadas" },
];

const STATUS = [
  { value: "all", label: "Todos status" },
  { value: "neutral", label: "Pendente" },
  { value: "warning", label: "Planejamento" },
  { value: "success", label: "Confirmada" },
  { value: "dark", label: "Realizada" },
];

export function FestasToolbar({
  view, status, date, q,
}: { view: string; status: string; date: string; q: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (query) next.set("q", query); else next.delete("q");
      next.delete("page");
      router.replace(`/festas?${next.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.replace(`/festas?${next.toString()}`);
  }

  return (
    <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-3 space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, responsável ou local..."
          className="w-full rounded-lg border bg-[var(--color-input)] pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--color-muted-foreground)] mr-1">View:</span>
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => setParam("view", v.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                view === v.value
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-[var(--color-border)] hidden sm:block" />
        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className="rounded-lg border bg-[var(--color-input)] px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        >
          {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
          className="rounded-lg border bg-[var(--color-input)] px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        />
        {(status !== "all" || date || query) && (
          <button
            onClick={() => router.replace(`/festas?view=${view}`)}
            className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] underline"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
