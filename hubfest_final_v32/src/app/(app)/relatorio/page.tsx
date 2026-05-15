import Link from "next/link";
import { listFestas, listTarefas } from "@/features/festas/queries";
import { PeriodFilter } from "@/features/relatorio/period-filter";
import { BarChart, Donut } from "@/features/relatorio/report-charts";
import { ExportCsvButton } from "@/features/festas/export-csv-button";
import { ShareReportButton } from "@/features/relatorio/share-report-button";
import { PartyPopper, Users, CheckCircle2, AlertCircle, MapPin, Award, TrendingUp } from "lucide-react";

function rangeFor(period: string): { from: string; to: string; label: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === "7d") {
    const d = new Date(); d.setDate(now.getDate() - 7);
    return { from: d.toISOString().slice(0, 10), to: today, label: "Últimos 7 dias" };
  }
  if (period === "30d") {
    const d = new Date(); d.setDate(now.getDate() - 30);
    return { from: d.toISOString().slice(0, 10), to: today, label: "Últimos 30 dias" };
  }
  if (period === "mes") {
    return { from: `${y}-${String(m + 1).padStart(2, "0")}-01`, to: new Date(y, m + 1, 0).toISOString().slice(0, 10), label: "Este mês" };
  }
  if (period === "ano") {
    return { from: `${y}-01-01`, to: `${y}-12-31`, label: "Este ano" };
  }
  return { from: "0000-01-01", to: "9999-12-31", label: "Tudo" };
}

export default async function RelatorioPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const period = sp.p ?? "ano";
  const { from, to, label } = rangeFor(period);

  const [allFestas, tarefas] = await Promise.all([listFestas(), listTarefas()]);
  const festas = allFestas.filter((f) => f.data && f.data >= from && f.data <= to);

  const today = new Date().toISOString().slice(0, 10);
  const total = festas.length;
  const confirmadas = festas.filter((f) => f.status === "success").length;
  const realizadas = festas.filter((f) => f.data < today).length;
  const pendentes = festas.filter((f) => f.status === "neutral" || f.status === "warning").length;
  const pendentesVencidas = festas.filter((f) => f.data < today && (f.status === "neutral" || f.status === "warning")).length;
  const criancas = festas.reduce((s, f) => s + (Number(f.criancas) || 0), 0);
  const taxaConversao = total > 0 ? Math.round((confirmadas / total) * 100) : 0;

  // Festas por mês
  const monthBuckets = new Map<string, number>();
  for (const f of festas) {
    const key = f.data.slice(0, 7);
    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);
  }
  const monthSorted = [...monthBuckets.entries()].sort(([a], [b]) => a.localeCompare(b));
  const monthData = monthSorted.map(([k, v]) => {
    const [, m] = k.split("-");
    return { label: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][Number(m) - 1] || k, value: v };
  });

  // Crianças por mês
  const kidsBuckets = new Map<string, number>();
  for (const f of festas) {
    const key = f.data.slice(0, 7);
    kidsBuckets.set(key, (kidsBuckets.get(key) ?? 0) + (Number(f.criancas) || 0));
  }
  const kidsSorted = [...kidsBuckets.entries()].sort(([a], [b]) => a.localeCompare(b));
  const kidsData = kidsSorted.map(([k, v]) => {
    const [, m] = k.split("-");
    return { label: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][Number(m) - 1] || k, value: v };
  });

  // Status donut
  const statusSegments = [
    { label: "Confirmada", value: festas.filter((f) => f.status === "success").length, color: "#10b981" },
    { label: "Planejamento", value: festas.filter((f) => f.status === "warning").length, color: "#f59e0b" },
    { label: "Pendente", value: festas.filter((f) => f.status === "neutral").length, color: "#94a3b8" },
    { label: "Realizada", value: festas.filter((f) => f.status === "dark").length, color: "#475569" },
  ].filter((s) => s.value > 0);

  // Top clientes (responsavel)
  const clienteCount = new Map<string, number>();
  for (const f of festas) {
    const c = (f.responsavel || "").trim();
    if (c) clienteCount.set(c, (clienteCount.get(c) ?? 0) + 1);
  }
  const topClientes = [...clienteCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Top locais
  const localCount = new Map<string, number>();
  for (const f of festas) {
    const l = (f.local || "").trim();
    if (l) localCount.set(l, (localCount.get(l) ?? 0) + 1);
  }
  const topLocais = [...localCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Tarefas
  const tarefasNoPeriodo = tarefas.filter((t) => festas.some((f) => f.id === t.festaId));
  const tarefasAbertas = tarefasNoPeriodo.filter((t) => !t.feita).length;
  const tarefasConcluidas = tarefasNoPeriodo.filter((t) => t.feita).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Relatório Geral</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Período: {label} · {total} festas</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <PeriodFilter current={period} />
          <ExportCsvButton festas={festas} />
          <ShareReportButton festas={festas} periodLabel={label} />
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<PartyPopper className="w-5 h-5" />} label="Total Festas" value={total} tint="primary" />
        <Kpi icon={<CheckCircle2 className="w-5 h-5" />} label="Confirmadas" value={confirmadas} tint="success" sub={`${taxaConversao}% conversão`} />
        <Kpi icon={<Users className="w-5 h-5" />} label="Crianças Atendidas" value={criancas} tint="tertiary" />
        <Kpi icon={<Award className="w-5 h-5" />} label="Realizadas" value={realizadas} tint="secondary" />
      </section>

      {pendentesVencidas > 0 && (
        <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[var(--color-danger)]">{pendentesVencidas} festa(s) pendente(s) com data passada</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">Atualize status pra Realizada ou Confirmada.</p>
          </div>
          <Link href="/festas?status=neutral" className="text-xs font-semibold text-[var(--color-danger)] hover:underline">Ver →</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold">Festas por Mês</h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">Volume mensal no período</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </div>
          {monthData.length > 0 ? <BarChart data={monthData} /> : <Empty />}
        </div>

        <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="font-bold mb-4">Status</h2>
          {statusSegments.length > 0 ? <Donut segments={statusSegments} /> : <Empty />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="font-bold mb-4">Crianças Atendidas por Mês</h2>
          {kidsData.length > 0 ? <BarChart data={kidsData} color="var(--color-secondary)" /> : <Empty />}
        </div>

        <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="font-bold mb-4">Tarefas</h2>
          <div className="space-y-3">
            <StatRow label="Concluídas" value={tarefasConcluidas} bar={tarefasConcluidas} max={tarefasConcluidas + tarefasAbertas} color="bg-[var(--color-success)]" />
            <StatRow label="Abertas" value={tarefasAbertas} bar={tarefasAbertas} max={tarefasConcluidas + tarefasAbertas} color="bg-[var(--color-warning)]" />
            <p className="text-xs text-[var(--color-muted-foreground)] pt-2 border-t">
              {tarefasConcluidas + tarefasAbertas > 0
                ? `${Math.round((tarefasConcluidas / (tarefasConcluidas + tarefasAbertas)) * 100)}% das tarefas concluídas`
                : "Sem tarefas no período"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <RankCard title="Top Clientes" icon={<Users className="w-4 h-4" />} entries={topClientes} unit="festas" />
        <RankCard title="Top Locais" icon={<MapPin className="w-4 h-4" />} entries={topLocais} unit="vezes" />
      </div>

      <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Pendentes em Aberto</h2>
          <span className="text-xs text-[var(--color-muted-foreground)]">{pendentes} total</span>
        </div>
        {pendentes === 0 ? <Empty /> : (
          <ul className="divide-y">
            {festas.filter((f) => f.status === "neutral" || f.status === "warning").slice(0, 10).map((f) => (
              <li key={f.id}>
                <Link href={`/festas/${f.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-[var(--color-muted)]/40 rounded px-2">
                  <span className="font-medium truncate">{f.nome}</span>
                  <span className="text-xs text-[var(--color-muted-foreground)] tabular-nums shrink-0">{f.data}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, tint, sub }: { icon: React.ReactNode; label: string; value: number; tint: string; sub?: string }) {
  const tints: Record<string, string> = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
    tertiary: "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  };
  return (
    <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tints[tint]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value.toLocaleString("pt-BR")}</p>
        {sub && <p className="text-[10px] text-[var(--color-muted-foreground)]">{sub}</p>}
      </div>
    </div>
  );
}

function StatRow({ label, value, bar, max, color }: { label: string; value: number; bar: number; max: number; color: string }) {
  const pct = max > 0 ? (bar / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-muted)] overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RankCard({ title, icon, entries, unit }: { title: string; icon: React.ReactNode; entries: [string, number][]; unit: string }) {
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
      <h2 className="font-bold mb-3 inline-flex items-center gap-2">{icon}{title}</h2>
      {entries.length === 0 ? <Empty /> : (
        <ul className="space-y-2.5">
          {entries.map(([name, count]) => (
            <li key={name}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="font-medium truncate">{name}</span>
                <span className="text-[var(--color-muted-foreground)] tabular-nums shrink-0">{count} {unit}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Empty() {
  return <p className="text-center text-xs text-[var(--color-muted-foreground)] py-8">Sem dados no período</p>;
}
