"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Clock, MapPin, Users, ExternalLink, Phone, X } from "lucide-react";
import type { Festa, Tarefa } from "@/shared/supabase/types";
import { formatDateBR } from "@/lib/date";
import { mapsUrl } from "@/features/festas/festa-card";
import { whatsappUrl } from "@/lib/whatsapp";
import { statusColor } from "@/features/festas/status";

const CARD_W = 280;
const GAP = 8;

export function HoverCard({
  festa, tarefas, anchor, onClose, onMouseEnter, onMouseLeave,
}: {
  festa: Festa;
  tarefas: Tarefa[];
  anchor: DOMRect;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; arrow: "left" | "right" }>({
    left: anchor.right + GAP, top: anchor.top, arrow: "left",
  });
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = ref.current?.offsetHeight ?? 320;
    let left = anchor.right + GAP;
    let arrow: "left" | "right" = "left";
    if (left + CARD_W > vw - 12) {
      left = anchor.left - CARD_W - GAP;
      arrow = "right";
    }
    if (left < 12) left = 12;
    let top = anchor.top;
    if (top + h > vh - 12) top = Math.max(12, vh - h - 12);
    setPos({ left, top, arrow });
    requestAnimationFrame(() => setVisible(true));
  }, [anchor]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);

  const done = tarefas.filter((t) => t.feita).length;
  const pct = tarefas.length ? Math.round((done / tarefas.length) * 100) : 0;

  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        left: pos.left,
        top: pos.top,
        width: CARD_W,
        transform: visible ? "scale(1)" : "scale(0.95)",
        opacity: visible ? 1 : 0,
        transformOrigin: pos.arrow === "left" ? "top left" : "top right",
      }}
      className="fixed z-50 rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)] p-4 transition-[opacity,transform] duration-150 ease-out"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(festa.status)}`}>
          {festa.statusLabel}
        </span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-[var(--color-muted)]" aria-label="Fechar">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="font-bold text-base leading-tight">{festa.nome}</h3>
      <p className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums mt-0.5">
        <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
        {festa.hora ? `${festa.hora}` : "—"} · {formatDateBR(festa.data)}
      </p>

      {(festa.responsavel || festa.criancas) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Avatar nome={festa.responsavel || festa.nome} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Cliente</p>
            <p className="font-medium truncate">{festa.responsavel || "—"}{festa.criancas && ` · ${festa.criancas} crianças`}</p>
          </div>
        </div>
      )}

      {festa.local && (
        <a
          href={mapsUrl(festa.local)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline"
        >
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{festa.local}</span>
          <ExternalLink className="w-2.5 h-2.5 ml-auto shrink-0 opacity-70" />
        </a>
      )}

      {festa.telefone && (
        <a
          href={whatsappUrl(festa.telefone)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-success)] hover:underline"
        >
          <Phone className="w-3 h-3 shrink-0" />
          <span>{festa.telefone}</span>
          <ExternalLink className="w-2.5 h-2.5 ml-auto shrink-0 opacity-70" />
        </a>
      )}

      {tarefas.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">Tarefas</p>
            <p className="text-[10px] font-semibold tabular-nums">{done}/{tarefas.length}</p>
          </div>
          <div className="h-1 rounded-full bg-[var(--color-muted)] overflow-hidden">
            <div className="h-full bg-[var(--color-success)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <Link
        href={`/festas/${festa.id}`}
        className="mt-3 block text-center rounded-lg bg-[var(--color-primary)] py-2 text-xs font-semibold text-[var(--color-primary-foreground)] hover:opacity-90 transition"
      >
        Ver detalhes
      </Link>
    </div>
  );
}

function Avatar({ nome }: { nome: string }) {
  const initials = nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const hue = Array.from(nome).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
      style={{ background: `hsl(${hue} 65% 92%)`, color: `hsl(${hue} 60% 35%)` }}
    >
      {initials || "?"}
    </div>
  );
}
