"use client";

import { useTransition, useState } from "react";
import type { Festa } from "@/shared/supabase/types";
import { createFesta, updateFesta } from "./actions";
import { useRouter } from "next/navigation";

export function FestaForm({ festa }: { festa?: Festa }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = festa ? await updateFesta(festa.id, fd) : await createFesta(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome da festa *" name="nome" defaultValue={festa?.nome} required />
        <Field label="Responsável" name="responsavel" defaultValue={festa?.responsavel} />
        <Field label="Data *" name="data" type="date" defaultValue={festa?.data} required />
        <Field label="Hora" name="hora" type="time" defaultValue={festa?.hora} />
        <Field label="Telefone" name="telefone" defaultValue={festa?.telefone} />
        <Field label="Crianças" name="criancas" defaultValue={festa?.criancas} />
        <Field label="Local" name="local" defaultValue={festa?.local} className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1.5">Status</label>
          <select
            name="status"
            defaultValue={festa?.status ?? "neutral"}
            className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          >
            <option value="neutral">Pendente</option>
            <option value="warning">Planejamento</option>
            <option value="success">Confirmada</option>
            <option value="dark">Realizada</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1.5">Observações</label>
          <textarea
            name="obs"
            rows={3}
            defaultValue={festa?.obs}
            className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 font-semibold text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : festa ? "Atualizar" : "Criar Festa"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-5 py-2.5 font-medium hover:bg-[var(--color-muted)]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, type = "text", defaultValue, required, className,
}: {
  label: string; name: string; type?: string; defaultValue?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
      />
    </div>
  );
}
