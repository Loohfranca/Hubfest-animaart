"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { Festa, Tarefa } from "@/shared/supabase/types";
import { Pencil, MapPin, Trash2, Phone, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDateBR } from "@/lib/date";
import { mapsUrl } from "./festa-card";
import { whatsappUrl } from "@/lib/whatsapp";
import { deleteFesta } from "./actions";
import { StatusBadge } from "./status-badge";
import { QuickTask } from "./quick-task";
import { FestaPopover } from "./festa-popover";

type SortKey = "data" | "nome" | "criancas";

export function FestasTable({
  festas, tarefasByFesta, sortKey, sortDir,
}: {
  festas: Festa[];
  tarefasByFesta: Record<string, Tarefa[]>;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Festa | null>(null);

  function setSort(key: SortKey) {
    const next = new URLSearchParams(sp.toString());
    if (sortKey === key) {
      next.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      next.set("sortKey", key);
      next.set("sortDir", "asc");
    }
    next.delete("page");
    router.replace(`/festas?${next.toString()}`);
  }

  function confirmDelete(id: string, nome: string) {
    if (!confirm(`Excluir festa "${nome}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(() => deleteFesta(id));
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  }

  return (
    <>
      <div className="hidden md:block rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] overflow-visible">
        <table className="w-full">
          <thead className="bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
            <tr className="text-[10px] font-bold uppercase tracking-wider">
              <th className="text-left px-4 py-3">
                <button onClick={() => setSort("nome")} className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]">
                  Cliente <SortIcon k="nome" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => setSort("data")} className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]">
                  Data / Hora <SortIcon k="data" />
                </button>
              </th>
              <th className="text-left px-4 py-3">Local</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">
                <button onClick={() => setSort("criancas")} className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]">
                  Crianças <SortIcon k="criancas" />
                </button>
              </th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {festas.map((f) => {
              const ts = tarefasByFesta[f.id] ?? [];
              return (
                <tr
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className="group border-t hover:bg-[var(--color-muted)]/40 transition cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar nome={f.nome} />
                      <div className="min-w-0">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(f); }} className="font-medium hover:text-[var(--color-primary)] truncate block text-left">{f.nome}</button>
                        <p className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-1.5">
                          {f.responsavel || "—"}
                          {f.telefone && (
                            <a
                              href={whatsappUrl(f.telefone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[var(--color-success)] hover:underline"
                              title={`WhatsApp: ${f.telefone}`}
                            >
                              <Phone className="w-3 h-3" />{f.telefone}
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm tabular-nums">{formatDateBR(f.data)}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] tabular-nums">{f.hora || "—"}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    {f.local ? (
                      <a
                        href={mapsUrl(f.local)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 max-w-full"
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{f.local}</span>
                      </a>
                    ) : <span className="text-sm text-[var(--color-muted-foreground)]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge id={f.id} status={f.status} label={f.statusLabel} />
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums">
                    <div className="flex items-center gap-2">
                      <span>{f.criancas || "—"}</span>
                      <QuickTask festaId={f.id} count={ts.filter((t) => !t.feita).length} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                      <Link
                        href={`/festas/${f.id}/editar`}
                        className="p-1.5 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {f.local && (
                        <a
                          href={mapsUrl(f.local)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                          title="Maps"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => confirmDelete(f.id, f.nome)}
                        className="p-1.5 rounded-md hover:bg-[var(--color-danger)]/10 text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-2">
        {festas.map((f) => {
          const ts = tarefasByFesta[f.id] ?? [];
          return (
            <li key={f.id} className="rounded-xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-3.5">
              <div className="flex items-start gap-3" onClick={() => setSelected(f)}>
                <Avatar nome={f.nome} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelected(f); }} className="font-medium truncate text-left">{f.nome}</button>
                    <StatusBadge id={f.id} status={f.status} label={f.statusLabel} />
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 tabular-nums">
                    {formatDateBR(f.data)} · {f.hora || "—"} {f.criancas && `· ${f.criancas} crianças`}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    {f.telefone && (
                      <a href={whatsappUrl(f.telefone)} target="_blank" rel="noopener noreferrer" className="text-[var(--color-success)] inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />WhatsApp
                      </a>
                    )}
                    {f.local && (
                      <a href={mapsUrl(f.local)} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />Maps
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuickTask festaId={f.id} count={ts.filter((t) => !t.feita).length} />
                    <div className="flex items-center gap-1">
                      <Link href={`/festas/${f.id}/editar`} className="p-1.5 rounded hover:bg-[var(--color-muted)]" aria-label="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => confirmDelete(f.id, f.nome)} className="p-1.5 rounded hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)]" aria-label="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && (
        <FestaPopover
          festa={selected}
          tarefas={tarefasByFesta[selected.id] ?? []}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function Avatar({ nome }: { nome: string }) {
  const initials = nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const hue = Array.from(nome).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: `hsl(${hue} 65% 92%)`, color: `hsl(${hue} 60% 35%)` }}
    >
      {initials || "?"}
    </div>
  );
}
