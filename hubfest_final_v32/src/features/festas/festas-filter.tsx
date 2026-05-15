"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

const FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "proximas", label: "Próximas" },
  { value: "confirmadas", label: "Confirmadas" },
  { value: "pendentes", label: "Pendentes" },
  { value: "realizadas", label: "Realizadas" },
];

export function FestasFilter({ currentFilter, currentQuery }: { currentFilter: string; currentQuery: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(currentQuery);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q) next.set("q", q); else next.delete("q");
      router.replace(`/festas?${next.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setFilter(value: string) {
    const next = new URLSearchParams(sp.toString());
    next.set("filter", value);
    router.replace(`/festas?${next.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, responsável ou local..."
          className="w-full rounded-lg border bg-[var(--color-input)] pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              currentFilter === f.value
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]"
                : "hover:bg-[var(--color-muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
