export type FestaStatus = "neutral" | "warning" | "success" | "dark";
export type FestaStatusLabel = "Pendente" | "Planejamento" | "Confirmada" | "Realizada";

export interface FestaRow {
  id: string;
  nome: string;
  responsavel: string;
  data: string | null;
  hora: string;
  telefone: string;
  criancas: string;
  idade: string;
  local: string;
  obs: string;
  status: FestaStatus;
  status_label: FestaStatusLabel;
  google_event_id?: string | null;
  created_at?: string;
}

export type TarefaStatus = "todo" | "doing" | "done";
export type TarefaPrioridade = "alta" | "media" | "baixa";

export interface TarefaRow {
  id: string;
  titulo: string;
  festa_id: string;
  feita: boolean;
  prazo: string | null;
  status?: TarefaStatus;
  prioridade?: TarefaPrioridade;
  descricao?: string;
  ordem?: number;
  created_at?: string;
}

export interface Festa {
  id: string;
  nome: string;
  responsavel: string;
  data: string;
  hora: string;
  telefone: string;
  criancas: string;
  idade: string;
  local: string;
  obs: string;
  status: FestaStatus;
  statusLabel: FestaStatusLabel;
  googleEventId?: string | null;
}

export interface Tarefa {
  id: string;
  titulo: string;
  festaId: string;
  feita: boolean;
  prazo: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  descricao: string;
  ordem: number;
}

export function rowToFesta(r: FestaRow): Festa {
  return {
    id: r.id,
    nome: r.nome ?? "",
    responsavel: r.responsavel ?? "",
    data: r.data ?? "",
    hora: r.hora ?? "",
    telefone: r.telefone ?? "",
    criancas: r.criancas ?? "",
    idade: r.idade ?? "",
    local: r.local ?? "",
    obs: r.obs ?? "",
    status: r.status ?? "neutral",
    statusLabel: r.status_label ?? "Pendente",
    googleEventId: r.google_event_id ?? null,
  };
}

export function festaToRow(f: Partial<Festa> & { id: string }): Partial<FestaRow> & { id: string } {
  return {
    id: f.id,
    nome: f.nome ?? "",
    responsavel: f.responsavel ?? "",
    data: f.data || null,
    hora: f.hora ?? "",
    telefone: f.telefone ?? "",
    criancas: f.criancas ?? "",
    idade: f.idade ?? "",
    local: f.local ?? "",
    obs: f.obs ?? "",
    status: f.status ?? "neutral",
    status_label: f.statusLabel ?? "Pendente",
  };
}

export function rowToTarefa(r: TarefaRow): Tarefa {
  const status: TarefaStatus = r.status ?? (r.feita ? "done" : "todo");
  return {
    id: r.id,
    titulo: r.titulo ?? "",
    festaId: r.festa_id ?? "",
    feita: !!r.feita || status === "done",
    prazo: r.prazo ?? "",
    status,
    prioridade: r.prioridade ?? "media",
    descricao: r.descricao ?? "",
    ordem: r.ordem ?? 0,
  };
}

export function tarefaToRow(t: Partial<Tarefa> & { id: string }): Partial<TarefaRow> & { id: string } {
  const row: Partial<TarefaRow> & { id: string } = {
    id: t.id,
    titulo: t.titulo ?? "",
    festa_id: t.festaId ?? "",
    feita: t.status ? t.status === "done" : !!t.feita,
    prazo: t.prazo || null,
  };
  if (t.status !== undefined) row.status = t.status;
  if (t.prioridade !== undefined) row.prioridade = t.prioridade;
  if (t.descricao !== undefined) row.descricao = t.descricao;
  if (t.ordem !== undefined) row.ordem = t.ordem;
  return row;
}
