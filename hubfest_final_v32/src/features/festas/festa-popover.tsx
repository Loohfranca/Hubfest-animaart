"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, Clock, MapPin, Users, ExternalLink, Phone, Calendar as CalIcon, Pencil, FileText, Send } from "lucide-react";
import { BriefingModal } from "./briefing-modal";
import type { Festa, Tarefa } from "@/shared/supabase/types";
import { formatDateLong } from "@/lib/date";
import { mapsUrl } from "./festa-card";
import { whatsappUrl } from "@/lib/whatsapp";
import { statusColor } from "./status";
import { StatusBadge } from "./status-badge";

export function FestaPopover({
  festa, tarefas = [], onClose,
}: { festa: Festa; tarefas?: Tarefa[]; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const done = tarefas.filter((t) => t.feita).length;
  const pct = tarefas.length ? Math.round((done / tarefas.length) * 100) : 0;
  const [briefing, setBriefing] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)] p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <StatusBadge id={festa.id} status={festa.status} label={festa.statusLabel} />
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-muted)]" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-2xl font-bold leading-tight">{festa.nome}</h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1 capitalize tabular-nums">
            <CalIcon className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            {formatDateLong(festa.data)}
            {festa.hora && <> · <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />{festa.hora}</>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoCell icon={<Users className="w-3.5 h-3.5" />} label="Cliente" value={festa.responsavel} />
          <InfoCell icon={<Users className="w-3.5 h-3.5" />} label="Crianças" value={festa.criancas} />
        </div>

        {festa.local && (
          <a
            href={mapsUrl(festa.local)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-[var(--color-muted)] transition"
          >
            <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Local</p>
              <p className="text-sm font-medium truncate text-[var(--color-primary)]">{festa.local}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          </a>
        )}

        {festa.telefone && (
          <a
            href={whatsappUrl(festa.telefone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-[var(--color-muted)] transition"
          >
            <Phone className="w-4 h-4 text-[var(--color-success)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">WhatsApp</p>
              <p className="text-sm font-medium text-[var(--color-success)]">{festa.telefone}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          </a>
        )}

        {festa.obs && (
          <div className="rounded-lg border p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] inline-flex items-center gap-1.5">
              <FileText className="w-3 h-3" />Observações
            </p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{festa.obs}</p>
          </div>
        )}

        {tarefas.length > 0 && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Tarefas</p>
              <p className="text-xs font-semibold tabular-nums">{done}/{tarefas.length}</p>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden mb-2">
              <div className="h-full bg-[var(--color-success)] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {tarefas.slice(0, 6).map((t) => (
                <li key={t.id} className={`text-xs flex items-center gap-2 ${t.feita ? "line-through text-[var(--color-muted-foreground)]" : ""}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${t.feita ? "bg-[var(--color-success)]" : "bg-[var(--color-muted-foreground)]"}`} />
                  {t.titulo}
                </li>
              ))}
              {tarefas.length > 6 && (
                <li className="text-xs text-[var(--color-muted-foreground)] pl-3.5">+{tarefas.length - 6} mais</li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={() => setBriefing(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-secondary-foreground)] hover:opacity-90"
        >
          <Send className="w-4 h-4" /> Gerar Briefing pro Recreador
        </button>

        <div className="flex gap-2 pt-1">
          <Link
            href={`/festas/${festa.id}/editar`}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-[var(--color-muted)]"
          >
            <Pencil className="w-4 h-4" /> Editar
          </Link>
          <Link
            href={`/festas/${festa.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90"
          >
            Ver tudo
          </Link>
        </div>
      </div>
      {briefing && <BriefingModal festa={festa} onClose={() => setBriefing(false)} />}
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] inline-flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-medium mt-0.5 truncate">{value || "—"}</p>
    </div>
  );
}
