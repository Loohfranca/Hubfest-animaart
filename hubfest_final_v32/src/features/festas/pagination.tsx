"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const sp = useSearchParams();

  if (totalPages <= 1) return null;

  function go(p: number) {
    const next = new URLSearchParams(sp.toString());
    if (p === 1) next.delete("page"); else next.set("page", String(p));
    router.replace(`/festas?${next.toString()}`);
  }

  const pages: (number | "…")[] = [];
  const push = (v: number | "…") => pages.push(v);
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) push(i);
    else if (pages[pages.length - 1] !== "…") push("…");
  }

  return (
    <nav className="flex items-center justify-between gap-2 pt-2">
      <p className="text-xs text-[var(--color-muted-foreground)]">Página {page} de {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border hover:bg-[var(--color-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-xs text-[var(--color-muted-foreground)]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              className={`min-w-[34px] h-[34px] rounded-lg text-xs font-medium transition ${
                p === page
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "border hover:bg-[var(--color-muted)]"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border hover:bg-[var(--color-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
