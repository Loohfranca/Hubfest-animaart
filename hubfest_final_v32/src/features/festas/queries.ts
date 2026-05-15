import { createClient } from "@/shared/supabase/server";
import { rowToFesta, rowToTarefa, type Festa, type Tarefa } from "@/shared/supabase/types";

export async function listFestas(): Promise<Festa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("festas").select("*").order("data", { ascending: true });
  if (error || !data) return [];
  return data.map(rowToFesta);
}

export async function listTarefas(): Promise<Tarefa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tarefas").select("*");
  if (error || !data) return [];
  return data.map(rowToTarefa);
}

export async function getFesta(id: string): Promise<Festa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("festas").select("*").eq("id", id).single();
  if (error || !data) return null;
  return rowToFesta(data);
}
