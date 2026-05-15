"use client";

import { useTransition, useState } from "react";
import type { Tarefa } from "@/shared/supabase/types";
import { createTarefa, toggleTarefa, deleteTarefa } from "./actions";
import { Trash2, Plus } from "lucide-react";

export function TarefasList({ tarefas, festaId }: { tarefas: Tarefa[]; festaId?: string }) {
  const [, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!titulo.trim()) return;
    const fd = new FormData();
    fd.set("titulo", titulo);
    if (festaId) fd.set("festaId", festaId);
    startTransition(async () => {
      await createTarefa(fd);
      setTitulo("");
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nova tarefa..."
          className="flex-1 rounded-lg border bg-[var(--color-input)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90 inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {tarefas.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)] py-4 text-center">Sem tarefas</p>
      ) : (
        <ul className="space-y-1.5">
          {tarefas.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-2.5">
              <input
                type="checkbox"
                checked={t.feita}
                onChange={() => startTransition(() => toggleTarefa(t.id, !t.feita))}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <span className={`flex-1 text-sm ${t.feita ? "line-through text-[var(--color-muted-foreground)]" : ""}`}>
                {t.titulo}
              </span>
              <button
                onClick={() => startTransition(() => deleteTarefa(t.id))}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]"
                aria-label="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
