"use server";

import { createClient } from "@/shared/supabase/server";
import { tarefaToRow, type TarefaStatus, type TarefaPrioridade } from "@/shared/supabase/types";
import { revalidatePath } from "next/cache";

export async function createTarefa(fd: FormData) {
  const titulo = String(fd.get("titulo") ?? "").trim();
  const festaId = String(fd.get("festaId") ?? "");
  const descricao = String(fd.get("descricao") ?? "");
  const prioridade = (String(fd.get("prioridade") ?? "media") as TarefaPrioridade);
  const prazo = String(fd.get("prazo") ?? "");
  if (!titulo) return { error: "Título obrigatório" };

  const supabase = await createClient();
  const id = Date.now().toString();
  const row = tarefaToRow({
    id, titulo, festaId, feita: false, prazo, descricao, prioridade, status: "todo",
  });
  const { error } = await supabase.from("tarefas").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  if (festaId) revalidatePath(`/festas/${festaId}`);
  return { ok: true };
}

export async function toggleTarefa(id: string, feita: boolean) {
  const supabase = await createClient();
  await supabase.from("tarefas").update({ feita, status: feita ? "done" : "todo" }).eq("id", id);
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  revalidatePath("/festas", "layout");
}

export async function moveTarefa(id: string, status: TarefaStatus) {
  const supabase = await createClient();
  await supabase.from("tarefas").update({ status, feita: status === "done" }).eq("id", id);
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function updateTarefaPrioridade(id: string, prioridade: TarefaPrioridade) {
  const supabase = await createClient();
  await supabase.from("tarefas").update({ prioridade }).eq("id", id);
  revalidatePath("/tarefas");
}

export async function deleteTarefa(id: string) {
  const supabase = await createClient();
  await supabase.from("tarefas").delete().eq("id", id);
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  revalidatePath("/festas", "layout");
}
