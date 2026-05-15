import Link from "next/link";
import { listFestas, listTarefas } from "@/features/festas/queries";
import { isPast } from "@/features/festas/status";
import { festasStats } from "@/features/festas/festas-stats";
import { FestasToolbar } from "@/features/festas/festas-toolbar";
import { FestasTable } from "@/features/festas/festas-table";
import { ExportCsvButton } from "@/features/festas/export-csv-button";
import { Pagination } from "@/features/festas/pagination";
import { Plus, PartyPopper, Clock4, CalendarRange, Award, Search } from "lucide-react";

const PAGE_SIZE = 12;

export default async function FestasPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string; date?: string; q?: string; page?: string; sortKey?: string; sortDir?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.view ?? "todas";
  const status = sp.status ?? "all";
  const date = sp.date ?? "";
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const sortKey = (["data", "nome", "criancas"].includes(sp.sortKey ?? "") ? sp.sortKey : "data") as "data" | "nome" | "criancas";
  const sortDir = (sp.sortDir === "desc" ? "desc" : "asc") as "asc" | "desc";
  const [all, tarefas] = await Promise.all([listFestas(), listTarefas()]);
  const stats = festasStats(all);

  let list = all;
  if (view === "proximas") list = list.filter((f) => !isPast(f));
  else if (view === "realizadas") list = list.filter((f) => isPast(f));

  if (status !== "all") list = list.filter((f) => f.status === status);
  if (date) list = list.filter((f) => f.data === date);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter((f) => [f.nome, f.responsavel, f.local].some((v) => v.toLowerCase().includes(needle)));
  }

  list = [...list].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "data") cmp = a.data.localeCompare(b.data);
    else if (sortKey === "nome") cmp = a.nome.localeCompare(b.nome, "pt-BR");
    else if (sortKey === "criancas") cmp = (Number(a.criancas) || 0) - (Number(b.criancas) || 0);
    return sortDir === "asc" ? cmp : -cmp;
  });
  const totalFiltered = list.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tarefasByFesta: Record<string, typeof tarefas> = {};
  for (const t of tarefas) (tarefasByFesta[t.festaId] ??= []).push(t);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-24">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Festas</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Gerencie e agende todas as próximas celebrações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton festas={list} />
          <Link
            href="/festas/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-secondary-foreground)] hover:opacity-90 transition shadow-[var(--shadow-card)]"
          >
            <Plus className="w-4 h-4" /> Nova Festa
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<PartyPopper className="w-5 h-5" />} label="Total Festas" value={stats.total} tint="primary" />
        <StatCard icon={<Clock4 className="w-5 h-5" />} label="Pendentes" value={stats.pendentes} tint="secondary" />
        <StatCard icon={<CalendarRange className="w-5 h-5" />} label="Esta Semana" value={stats.estaSemana} tint="tertiary" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Realizadas Mês" value={stats.realizadasMes} tint="success" />
      </section>

      <FestasToolbar view={view} status={status} date={date} q={q} />

      {list.length === 0 ? (
        <div className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-12 text-center">
          <Search className="w-10 h-10 mx-auto mb-3 text-[var(--color-muted-foreground)]" />
          <p className="font-medium">Nenhuma festa encontrada</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Ajuste os filtros ou crie uma nova festa.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--color-muted-foreground)] px-1">
            Mostrando <strong>{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalFiltered)}</strong> de {totalFiltered} festas
          </p>
          <FestasTable festas={pageItems} tarefasByFesta={tarefasByFesta} sortKey={sortKey} sortDir={sortDir} />
          <Pagination page={currentPage} totalPages={totalPages} />
        </>
      )}

      <Link
        href="/festas/nova"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-[var(--shadow-card-hover)] flex items-center justify-center hover:scale-105 transition z-30"
        aria-label="Nova Festa"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}

function StatCard({
  icon, label, value, tint,
}: { icon: React.ReactNode; label: string; value: number; tint: "primary" | "secondary" | "tertiary" | "success" }) {
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
      </div>
    </div>
  );
}
