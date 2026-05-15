"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { createTarefa } from "@/features/tarefas/actions";

export function QuickTask({ festaId, count }: { festaId: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!titulo.trim()) return;
    const fd = new FormData();
    fd.set("titulo", titulo);
    fd.set("festaId", festaId);
    startTransition(async () => {
      await createTarefa(fd);
      setTitulo("");
      setOpen(false);
    });
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
        title="Tarefa rápida"
      >
        <CheckSquare className="w-3.5 h-3.5" />
        <span className="tabular-nums">{count}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)] p-2">
          <form onSubmit={submit} className="flex gap-1.5">
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nova tarefa..."
              className="flex-1 rounded-md border bg-[var(--color-input)] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[var(--color-primary)] px-2 text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
