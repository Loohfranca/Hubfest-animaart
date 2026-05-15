"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, MessageCircle, Printer, Download, Send, Trash2 } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";
import { buildBriefingText } from "./briefing";
import { formatDateLong } from "@/lib/date";
import { whatsappUrl } from "@/lib/whatsapp";

type Recreador = { nome: string; phone: string };
const STORAGE_KEY = "hubfest_recreadores";

function loadRecreadores(): Recreador[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveRecreadores(list: Recreador[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export function BriefingModal({ festa, onClose }: { festa: Festa; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [recreadores, setRecreadores] = useState<Recreador[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoPhone, setNovoPhone] = useState("");
  const [phoneCustom, setPhoneCustom] = useState("");
  const text = buildBriefingText(festa);

  useEffect(() => { setRecreadores(loadRecreadores()); }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Falha ao copiar");
    }
  }

  function sendTo(phone: string) {
    if (!phone) return;
    const url = `${whatsappUrl(phone)}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function addRecreador() {
    const phone = novoPhone.trim();
    const nome = novoNome.trim();
    if (!phone || !nome) return;
    const next = [...recreadores.filter((r) => r.phone !== phone), { nome, phone }];
    setRecreadores(next);
    saveRecreadores(next);
    setNovoNome(""); setNovoPhone("");
    sendTo(phone);
  }

  function removeRecreador(phone: string) {
    const next = recreadores.filter((r) => r.phone !== phone);
    setRecreadores(next);
    saveRecreadores(next);
  }

  function print() {
    window.print();
  }

  function downloadTxt() {
    const blob = new Blob([text.replace(/\*/g, "")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `briefing-${festa.nome.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm print:bg-transparent print:p-0 print:items-start"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card-hover)] print:max-w-none print:shadow-none print:border-0 print:max-h-none"
      >
        <header className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="font-bold">Briefing pro Recreador</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-muted)]"><X className="w-4 h-4" /></button>
        </header>

        <div id="briefing-print" className="p-5 space-y-4">
          <div className="print:hidden">
            <h3 className="text-2xl font-bold">{festa.nome}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{formatDateLong(festa.data)}</p>
          </div>

          <div className="hidden print:block mb-4">
            <h1 className="text-3xl font-bold">Briefing - {festa.nome}</h1>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
            <Row label="Aniversariante/Cliente" value={festa.nome} />
            <Row label="Responsável" value={festa.responsavel} />
            <Row label="Data" value={formatDateLong(festa.data)} />
            <Row label="Horário" value={festa.hora} />
            <Row label="Quantidade de crianças" value={festa.criancas} />
            <Row label="Contato" value={festa.telefone} />
            <Row label="Local" value={festa.local} className="sm:col-span-2 print:col-span-2" />
          </dl>

          {festa.obs && (
            <div className="rounded-lg border p-3 print:border-slate-300">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">Observações</p>
              <p className="text-sm whitespace-pre-wrap">{festa.obs}</p>
            </div>
          )}

          <details className="rounded-lg border p-3 print:hidden">
            <summary className="text-xs font-semibold cursor-pointer text-[var(--color-muted-foreground)]">Pré-visualizar mensagem (WhatsApp)</summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap font-mono bg-[var(--color-muted)] p-3 rounded">{text}</pre>
          </details>
        </div>

        <footer className="p-4 border-t bg-[var(--color-muted)]/30 print:hidden space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">Enviar pra recreador</p>

            {recreadores.length > 0 && (
              <ul className="space-y-1.5 mb-2">
                {recreadores.map((r) => (
                  <li key={r.phone} className="flex items-center gap-2 rounded-lg border bg-[var(--color-card)] p-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center text-xs font-bold shrink-0">
                      {r.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.nome}</p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">{r.phone}</p>
                    </div>
                    <button
                      onClick={() => sendTo(r.phone)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-success)] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                    >
                      <Send className="w-3 h-3" /> Enviar
                    </button>
                    <button
                      onClick={() => removeRecreador(r.phone)}
                      className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome recreador"
                className="flex-1 min-w-[140px] rounded-md border bg-[var(--color-card)] px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              />
              <input
                value={novoPhone}
                onChange={(e) => setNovoPhone(e.target.value)}
                placeholder="Telefone (DDD + número)"
                className="flex-1 min-w-[140px] rounded-md border bg-[var(--color-card)] px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              />
              <button
                onClick={addRecreador}
                disabled={!novoNome.trim() || !novoPhone.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-success)] text-white px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" /> Salvar e Enviar
              </button>
            </div>

            <details className="mt-2">
              <summary className="text-xs text-[var(--color-muted-foreground)] cursor-pointer hover:text-[var(--color-foreground)]">Enviar sem salvar (número único)</summary>
              <div className="flex gap-2 mt-2">
                <input
                  value={phoneCustom}
                  onChange={(e) => setPhoneCustom(e.target.value)}
                  placeholder="Telefone"
                  className="flex-1 rounded-md border bg-[var(--color-card)] px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                />
                <button
                  onClick={() => sendTo(phoneCustom)}
                  disabled={!phoneCustom.trim()}
                  className="rounded-md bg-[var(--color-success)] text-white px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </details>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <button
              onClick={copy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
            >
              {copied ? <Check className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")}
              className="inline-flex items-center gap-2 rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
              title="WhatsApp - escolher contato"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={print}
              className="inline-flex items-center gap-2 rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
              title="Imprimir / PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={downloadTxt}
              className="inline-flex items-center gap-2 rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
              title="Baixar .txt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-lg border p-3 print:border-slate-300 ${className ?? ""}`}>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}
