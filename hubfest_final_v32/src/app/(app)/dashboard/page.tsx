import Link from "next/link";
import { listFestas, listTarefas } from "@/features/festas/queries";
import { isPast, statusBarColor } from "@/features/festas/status";
import { formatDateLong, shortMonth, today } from "@/lib/date";
import { CalendarPlus, FileText, ListChecks, Plus, ArrowRight, CalendarDays, Settings, CheckCircle2, Award, Clock, MapPin, Users } from "lucide-react";

export default async function Dashboard() {
  const [festas, tarefas] = await Promise.all([listFestas(), listTarefas()]);
  const hoje = today();
  const proximas = festas.filter((f) => f.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
  const realizadas = festas.filter((f) => isPast(f)).sort((a, b) => b.data.localeCompare(a.data));
  const confirmadas = proximas.filter((f) => f.status === "success").length;
  const tarefasAbertas = tarefas.filter((t) => !t.feita).length;

  const proxima = proximas[0];
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard 🌙</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{dataHoje}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/relatorio" className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-muted)]">
            <FileText className="w-4 h-4" /> Relatório Geral
          </Link>
          <Link href="/festas?filter=proximas" className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-muted)]">
            <CalendarDays className="w-4 h-4" /> Próximas
          </Link>
          <Link href="/festas/nova" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90">
            <Plus className="w-4 h-4" /> Nova Festa
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Próximas" value={proximas.length} color="primary" icon={<CalendarDays className="w-5 h-5" />} />
        <Kpi label="Confirmadas" value={confirmadas} color="success" icon={<CheckCircle2 className="w-5 h-5" />} />
        <Kpi label="Total Festas" value={festas.length} color="warning" icon={<ListChecks className="w-5 h-5" />} />
        <Kpi label="Tarefas Abertas" value={tarefasAbertas} color="accent" icon={<CheckCircle2 className="w-5 h-5" />} />
        <Kpi label="Realizadas" value={realizadas.length} color="muted" icon={<Award className="w-5 h-5" />} />
      </section>

      {proxima && (
        <section className="rounded-2xl border bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-1">Próxima Festa</p>
          <h2 className="text-2xl font-bold mb-2">{proxima.nome}</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--color-muted-foreground)]">
            {proxima.responsavel && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{proxima.responsavel}</span>}
            {proxima.local && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{proxima.local}</span>}
            {proxima.hora && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{proxima.hora}</span>}
            {proxima.criancas && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{proxima.criancas} crianças</span>}
          </div>
          <p className="text-xs mt-2 text-[var(--color-muted-foreground)]">{formatDateLong(proxima.data)}</p>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold inline-flex items-center gap-2">📅 Próximas Festas</h3>
            <Link href="/festas" className="text-sm text-[var(--color-primary)] inline-flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {proximas.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-muted-foreground)] py-10">Nenhuma festa próxima</p>
          ) : (
            <ul className="space-y-2">
              {proximas.slice(0, 7).map((f) => (
                <li key={f.id}>
                  <Link href={`/festas/${f.id}`} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-[var(--color-muted)] transition">
                    <div className={`w-1 self-stretch rounded-full ${statusBarColor(f.status)}`} />
                    <div className="text-center min-w-[44px]">
                      <p className="text-[10px] font-bold tracking-wider text-[var(--color-muted-foreground)]">{shortMonth(f.data)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{f.nome}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {[f.responsavel, f.hora, f.criancas && `${f.criancas} crianças`].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                      {f.statusLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
            <h3 className="font-semibold mb-3 inline-flex items-center gap-2">⚡ Ações Rápidas</h3>
            <div className="space-y-1.5">
              <QuickAction href="/festas/nova" icon={<CalendarPlus className="w-4 h-4" />} label="Nova Festa" />
              <QuickAction href="/tarefas?new=1" icon={<Plus className="w-4 h-4" />} label="Nova Tarefa" />
              <QuickAction href="/calendario" icon={<CalendarDays className="w-4 h-4" />} label="Calendário" />
              <QuickAction href="/configuracoes" icon={<Settings className="w-4 h-4" />} label="Configurações" />
            </div>
          </section>

          <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
            <h3 className="font-semibold mb-3 inline-flex items-center gap-2">✅ Últimas Realizadas</h3>
            {realizadas.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">Sem festas realizadas</p>
            ) : (
              <ul className="space-y-2">
                {realizadas.slice(0, 4).map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm">
                    <span className="text-[10px] font-bold tracking-wider text-[var(--color-muted-foreground)] w-12">{shortMonth(f.data)}</span>
                    <span className="truncate">{f.nome}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Kpi({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = {
    primary: "border-t-[var(--color-primary)] text-[var(--color-primary)]",
    success: "border-t-[var(--color-success)] text-[var(--color-success)]",
    warning: "border-t-[var(--color-warning)] text-[var(--color-warning)]",
    accent: "border-t-[var(--color-accent)] text-[var(--color-accent)]",
    muted: "border-t-[var(--color-muted-foreground)] text-[var(--color-muted-foreground)]",
  };
  return (
    <div className={`rounded-xl border border-t-4 bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[var(--color-muted-foreground)]">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-[var(--color-foreground)]">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-muted)] transition">
      {icon}
      {label}
    </Link>
  );
}
