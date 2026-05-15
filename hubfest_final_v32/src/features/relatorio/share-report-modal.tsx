"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";
import { formatDateBR } from "@/lib/date";

type Scope = "todas" | "naoRealizadas" | "confirmadas";
type Modo = "resumido" | "detalhado";

const SCOPE_LABEL: Record<Scope, string> = {
  todas: "Todas as festas",
  naoRealizadas: "Apenas não realizadas",
  confirmadas: "Apenas confirmadas",
};

export function ShareReportModal({ festas, periodLabel, onClose }: { festas: Festa[]; periodLabel: string; onClose: () => void }) {
  const [scope, setScope] = useState<Scope>("naoRealizadas");
  const [modo, setModo] = useState<Modo>("resumido");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => {
    const list = festas.filter((f) => {
      if (scope === "naoRealizadas") return f.data >= today && f.status !== "dark";
      if (scope === "confirmadas") return f.status === "success";
      return true;
    });
    return [...list].sort((a, b) => a.data.localeCompare(b.data));
  }, [festas, scope, today]);

  const text = useMemo(() => buildShareText(filtered, periodLabel, scope, modo), [filtered, periodLabel, scope, modo]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert("Falha ao copiar"); }
  }

  function share() {
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)]"
      >
        <header className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-bold">Compartilhar Relatório</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">{filtered.length} festa(s) · {periodLabel}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-muted)]"><X className="w-4 h-4" /></button>
        </header>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">Quais festas</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["todas", "naoRealizadas", "confirmadas"] as Scope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`text-xs font-semibold py-2 px-2 rounded-lg border transition ${
                    scope === s ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "hover:bg-[var(--color-muted)]"
                  }`}
                >
                  {SCOPE_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">Formato</p>
            <div className="inline-flex rounded-lg border p-0.5">
              {(["resumido", "detalhado"] as Modo[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    modo === m ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                  }`}
                >
                  {m === "resumido" ? "Resumido" : "Detalhado"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">Prévia</p>
            <pre className="text-[11px] whitespace-pre-wrap font-mono bg-[var(--color-muted)] p-3 rounded-lg max-h-48 overflow-y-auto leading-relaxed">
              {text || "Nenhuma festa selecionada."}
            </pre>
            <p className="text-[10px] text-[var(--color-muted-foreground)] mt-1 tabular-nums">{text.length} caracteres</p>
          </div>
        </div>

        <footer className="p-4 border-t bg-[var(--color-muted)]/30 flex gap-2">
          <button
            onClick={copy}
            disabled={!text}
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-muted)] disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
          <button
            onClick={share}
            disabled={!text}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-success)] text-white px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
          >
            <Share2 className="w-4 h-4" /> Compartilhar no WhatsApp
          </button>
        </footer>
      </div>
    </div>
  );
}

function buildShareText(festas: Festa[], periodLabel: string, scope: Scope, modo: Modo): string {
  if (festas.length === 0) return "";
  const header = [
    `📋 *AGENDA DE FESTAS - HubFest*`,
    `_${SCOPE_LABEL[scope]} · ${periodLabel}_`,
    `Total: ${festas.length} festa(s)`,
    ``,
  ];

  if (modo === "resumido") {
    const rows = festas.map((f, i) => {
      const parts = [
        `${i + 1}. *${f.nome}*`,
        `   📅 ${formatDateBR(f.data)}${f.hora ? ` às ${f.hora}` : ""}`,
        f.criancas && `   🧒 ${f.criancas} crianças`,
        f.local && `   📍 ${f.local}`,
      ].filter(Boolean);
      return parts.join("\n");
    });
    return [...header, ...rows, ``, `—`, `_Gerado pelo HubFest_`].join("\n");
  }

  // detalhado
  const blocks = festas.map((f, i) => {
    const lines = [
      `*${i + 1}/${festas.length} - ${f.nome.toUpperCase()}*`,
      f.responsavel && `👤 Responsável: ${f.responsavel}`,
      `📅 Data: ${formatDateBR(f.data)}${f.hora ? ` às ${f.hora}` : ""}`,
      f.criancas && `🧒 Crianças: ${f.criancas}`,
      f.local && `📍 Local: ${f.local}`,
      f.telefone && `📞 Contato: ${f.telefone}`,
      f.obs && `📝 Obs: ${f.obs}`,
    ].filter(Boolean);
    return lines.join("\n");
  });
  return [...header, blocks.join("\n\n―――\n\n"), ``, `—`, `_Gerado pelo HubFest_`].join("\n");
}
