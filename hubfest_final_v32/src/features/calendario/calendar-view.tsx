"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Festa, Tarefa } from "@/shared/supabase/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateBR } from "@/lib/date";
import { FestaPopover } from "@/features/festas/festa-popover";
import { HoverCard } from "./hover-card";

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

type View = "mes" | "semana";

const STATUS_STYLE: Record<string, { bg: string; dot: string; ring: string }> = {
  success: { bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", ring: "hover:ring-emerald-400" },
  warning: { bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300", dot: "bg-amber-500", ring: "hover:ring-amber-400" },
  neutral: { bg: "bg-slate-400/15 text-slate-700 dark:text-slate-300", dot: "bg-slate-400", ring: "hover:ring-slate-400" },
  dark: { bg: "bg-slate-700/15 text-slate-700 dark:text-slate-300", dot: "bg-slate-700", ring: "hover:ring-slate-500" },
};

export function CalendarView({
  festas, monthIso, tarefasByFesta,
}: { festas: Festa[]; monthIso: string; tarefasByFesta: Record<string, Tarefa[]> }) {
  const router = useRouter();
  const [view, setView] = useState<View>("mes");
  const [selected, setSelected] = useState<Festa | null>(null);
  const [hover, setHover] = useState<{ festa: Festa; rect: DOMRect } | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  function openHover(festa: Festa, el: HTMLElement) {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setHover({ festa, rect: el.getBoundingClientRect() });
    }, 120);
  }
  function scheduleClose() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    closeTimer.current = window.setTimeout(() => setHover(null), 180);
  }
  function cancelClose() {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }

  const ref = new Date(monthIso + "-01T12:00:00");
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const monthLabel = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const todayIso = new Date().toISOString().slice(0, 10);

  function go(delta: number) {
    const d = new Date(year, month + delta, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.replace(`/calendario?m=${ym}`);
  }

  const byDay = new Map<string, Festa[]>();
  for (const f of festas) (byDay.get(f.data) ?? byDay.set(f.data, []).get(f.data)!).push(f);

  const inMonth = festas.filter((f) => f.data.startsWith(monthIso));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ocupacao = Math.round((new Set(inMonth.map((f) => f.data)).size / daysInMonth) * 100);
  const livres = daysInMonth - new Set(inMonth.map((f) => f.data)).size;
  const criancasMes = inMonth.reduce((s, f) => s + (Number(f.criancas) || 0), 0);
  const proximaVip = festas
    .filter((f) => f.status === "success" && f.data >= todayIso)
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  const cells = view === "mes" ? monthCells(year, month) : weekCells(new Date());

  return (
    <div className="space-y-4 pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => go(-1)} className="p-1.5 rounded-lg border hover:bg-[var(--color-muted)]" aria-label="Mês anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold capitalize min-w-[160px] text-center">{monthLabel}</h1>
          <button onClick={() => go(1)} className="p-1.5 rounded-lg border hover:bg-[var(--color-muted)]" aria-label="Próximo mês">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.replace("/calendario")}
            className="ml-1 rounded-full border px-3 py-1 text-xs font-semibold hover:bg-[var(--color-muted)]"
          >
            Hoje
          </button>
        </div>
        <div className="inline-flex rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-0.5">
          {(["mes", "semana"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                view === v
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
              }`}
            >
              {v === "mes" ? "Mês" : "Semana"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 px-1 text-[11px]">
        <Legend color="bg-emerald-500" label="Confirmada" />
        <Legend color="bg-amber-500" label="Planejamento" />
        <Legend color="bg-slate-400" label="Pendente" />
        <Legend color="bg-slate-700" label="Realizada" />
      </div>

      <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-2">
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {WEEK_DAYS.map((d) => (
            <p key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] py-1.5">{d}</p>
          ))}
        </div>
        <div
          className="grid grid-cols-7 gap-0.5"
          style={{ gridAutoRows: view === "mes" ? "minmax(64px, auto)" : "minmax(120px, auto)" }}
        >
          {cells.map((c, i) => {
            const dateIso = c ? `${c.y}-${String(c.m + 1).padStart(2, "0")}-${String(c.d).padStart(2, "0")}` : "";
            const evs = c ? (byDay.get(dateIso) ?? []) : [];
            const isToday = dateIso === todayIso;
            const isOtherMonth = !!c && c.m !== month && view === "mes";
            return (
              <div
                key={i}
                className={`group/cell rounded-md p-1 transition relative ${
                  !c ? "" : isToday ? "bg-[var(--color-primary)]/8 ring-1 ring-[var(--color-primary)]/40" : "hover:bg-[var(--color-muted)]/50"
                } ${isOtherMonth ? "opacity-35" : ""}`}
              >
                {c && (
                  <>
                    <p className={`text-[10px] font-semibold leading-none mb-0.5 ${isToday ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`}>{c.d}</p>
                    <ul className="space-y-0.5">
                      {evs.slice(0, 2).map((f) => {
                        const s = STATUS_STYLE[f.status] ?? STATUS_STYLE.neutral;
                        return (
                          <li key={f.id}>
                            <button
                              onMouseEnter={(e) => openHover(f, e.currentTarget)}
                              onMouseLeave={scheduleClose}
                              onClick={() => setSelected(f)}
                              className={`group/ev block w-full text-left text-[10px] truncate rounded px-1.5 py-1 ${s.bg} hover:ring-2 ${s.ring} hover:scale-[1.02] active:scale-100 transition-all duration-150 cursor-pointer font-medium leading-tight`}
                              title={f.nome}
                            >
                              <span className={`inline-block w-1 h-1 rounded-full mr-1 align-middle ${s.dot}`} />
                              {f.nome}
                            </button>
                          </li>
                        );
                      })}
                      {evs.length > 2 && (
                        <li>
                          <button
                            onClick={() => setSelected(evs[2])}
                            className="text-[9px] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] px-1 font-medium"
                          >
                            +{evs.length - 2}
                          </button>
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiBig
          label="Capacidade do Mês"
          value={`${ocupacao}% Ocupado`}
          sub={livres > 0 ? `${livres} datas livres` : "Mês lotado"}
          bar={ocupacao}
          tint="primary"
        />
        <KpiBig
          label="Crianças no Mês"
          value={criancasMes.toLocaleString("pt-BR")}
          sub={`${inMonth.length} festas`}
          tint="secondary"
        />
        <VipCard f={proximaVip} />
      </section>

      <Link
        href="/festas/nova"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-[var(--shadow-card-hover)] flex items-center justify-center hover:scale-105 transition z-30"
        aria-label="Nova Festa"
      >
        <span className="text-2xl leading-none">+</span>
      </Link>

      {hover && (
        <HoverCard
          festa={hover.festa}
          tarefas={tarefasByFesta[hover.festa.id] ?? []}
          anchor={hover.rect}
          onClose={() => setHover(null)}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      )}
      {selected && (
        <FestaPopover
          festa={selected}
          tarefas={tarefasByFesta[selected.id] ?? []}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

type Cell = { d: number; m: number; y: number } | null;

function monthCells(year: number, month: number): Cell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPrev = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = daysPrev - i;
    const prev = month === 0 ? { m: 11, y: year - 1 } : { m: month - 1, y: year };
    cells.push({ d, m: prev.m, y: prev.y });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, m: month, y: year });
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]!;
    let nd = last.d + 1;
    let nm = last.m;
    let ny = last.y;
    const dim = new Date(ny, nm + 1, 0).getDate();
    if (last.m !== month && nd > dim) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    if (last.m === month && nd > daysInMonth) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    cells.push({ d: nd, m: nm, y: ny });
    if (cells.length >= 42) break;
  }
  return cells;
}

function weekCells(ref: Date): Cell[] {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  const cells: Cell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ d: d.getDate(), m: d.getMonth(), y: d.getFullYear() });
  }
  return cells;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
      <span className={`w-2 h-2 rounded-full ${color}`} />{label}
    </span>
  );
}

function KpiBig({
  label, value, sub, bar, tint,
}: { label: string; value: string; sub?: string; bar?: number; tint: "primary" | "secondary" | "tertiary" }) {
  const tints: Record<string, string> = {
    primary: "from-[var(--color-primary)]/10",
    secondary: "from-[var(--color-secondary)]/10",
    tertiary: "from-[var(--color-tertiary)]/10",
  };
  const bars: Record<string, string> = {
    primary: "bg-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)]",
    tertiary: "bg-[var(--color-tertiary)]",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${tints[tint]} to-[var(--color-card)] shadow-[var(--shadow-card)] p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">{label}</p>
      <p className="text-xl font-bold mt-1 text-[var(--color-foreground)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{sub}</p>}
      {typeof bar === "number" && (
        <div className="mt-3 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
          <div className={`h-full transition-all ${bars[tint]}`} style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
    </div>
  );
}

function VipCard({ f }: { f?: Festa }) {
  if (!f) {
    return (
      <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] flex items-center justify-center text-lg">⭐</div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">Próximo Evento VIP</p>
          <p className="text-sm font-medium mt-0.5 text-[var(--color-muted-foreground)]">Nenhum confirmado</p>
        </div>
      </div>
    );
  }
  return (
    <Link href={`/festas/${f.id}`} className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] p-4 flex items-center gap-3 transition">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] flex items-center justify-center text-lg shrink-0">⭐</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">Próximo Evento VIP</p>
        <p className="font-semibold truncate">{f.nome}</p>
        <p className="text-xs text-[var(--color-muted-foreground)] tabular-nums">{formatDateBR(f.data)} · {f.hora || "—"}</p>
      </div>
    </Link>
  );
}
