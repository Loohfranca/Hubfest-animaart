import Link from "next/link";
import { notFound } from "next/navigation";
import { getFesta } from "@/features/festas/queries";
import { listTarefas } from "@/features/festas/queries";
import { statusColor } from "@/features/festas/status";
import { formatDateLong, googleCalendarUrl } from "@/lib/date";
import { deleteFesta } from "@/features/festas/actions";
import { Pencil, Trash2, Phone, MapPin, Users, Clock, Calendar, ExternalLink, CalendarPlus } from "lucide-react";
import { TarefasList } from "@/features/tarefas/tarefas-list";
import { mapsUrl } from "@/features/festas/festa-card";
import { BriefingButton } from "@/features/festas/briefing-button";

export default async function FestaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const festa = await getFesta(id);
  if (!festa) notFound();

  const allTarefas = await listTarefas();
  const tarefas = allTarefas.filter((t) => t.festaId === festa.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(festa.status)}`}>
            {festa.statusLabel}
          </span>
          <h1 className="text-3xl font-bold mt-2">{festa.nome}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{formatDateLong(festa.data)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <BriefingButton festa={festa} />
          {festa.data && (
            <a
              href={googleCalendarUrl({
                title: `Festa de ${festa.nome}`,
                date: festa.data,
                time: festa.hora,
                location: festa.local,
                details: [
                  festa.responsavel && `Responsável: ${festa.responsavel}`,
                  festa.telefone && `Tel: ${festa.telefone}`,
                  festa.criancas && `${festa.criancas} crianças`,
                  festa.obs,
                ].filter(Boolean).join("\n"),
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
            >
              <CalendarPlus className="w-4 h-4" /> Google Calendar
            </a>
          )}
          <Link
            href={`/festas/${festa.id}/editar`}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
          >
            <Pencil className="w-4 h-4" /> Editar
          </Link>
          <form action={deleteFesta.bind(null, festa.id)}>
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-danger)]/10">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </form>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 gap-3">
        <Info icon={<Users className="w-4 h-4" />} label="Responsável" value={festa.responsavel} />
        <Info icon={<Phone className="w-4 h-4" />} label="Telefone" value={festa.telefone} />
        <Info icon={<Clock className="w-4 h-4" />} label="Hora" value={festa.hora} />
        <Info icon={<Users className="w-4 h-4" />} label="Crianças" value={festa.criancas} />
        <div className="sm:col-span-2 rounded-xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />Local
          </p>
          {festa.local ? (
            <a
              href={mapsUrl(festa.local)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 font-medium text-[var(--color-primary)] hover:underline"
            >
              {festa.local}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <p className="mt-1 font-medium">—</p>
          )}
        </div>
        <Info icon={<Calendar className="w-4 h-4" />} label="Observações" value={festa.obs} className="sm:col-span-2" />
      </section>

      <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
        <h2 className="font-semibold mb-4">Tarefas</h2>
        <TarefasList tarefas={tarefas} festaId={festa.id} />
      </section>
    </div>
  );
}

function Info({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 ${className ?? ""}`}>
      <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] inline-flex items-center gap-1.5">{icon}{label}</p>
      <p className="mt-1 font-medium">{value || "—"}</p>
    </div>
  );
}
