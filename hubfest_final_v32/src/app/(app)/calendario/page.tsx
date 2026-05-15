import { listFestas, listTarefas } from "@/features/festas/queries";
import { CalendarView } from "@/features/calendario/calendar-view";

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const now = new Date();
  const monthIso = m ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [festas, tarefas] = await Promise.all([listFestas(), listTarefas()]);

  const tarefasByFesta: Record<string, typeof tarefas> = {};
  for (const t of tarefas) (tarefasByFesta[t.festaId] ??= []).push(t);

  return (
    <div className="max-w-7xl mx-auto">
      <CalendarView festas={festas} monthIso={monthIso} tarefasByFesta={tarefasByFesta} />
    </div>
  );
}
