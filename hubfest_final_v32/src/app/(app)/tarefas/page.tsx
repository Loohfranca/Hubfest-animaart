import { listFestas, listTarefas } from "@/features/festas/queries";
import { KanbanBoard } from "@/features/tarefas/kanban-board";

export default async function TarefasPage() {
  const [festas, tarefas] = await Promise.all([listFestas(), listTarefas()]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl font-bold">Quadro de Tarefas</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Arraste cards entre colunas para mudar status.</p>
      </header>
      <KanbanBoard tarefas={tarefas} festas={festas} />
    </div>
  );
}
