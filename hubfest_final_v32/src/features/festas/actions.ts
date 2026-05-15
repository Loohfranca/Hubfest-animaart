"use server";

import { createClient } from "@/shared/supabase/server";
import { festaToRow, type FestaStatus, type FestaStatusLabel } from "@/shared/supabase/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function labelFor(status: FestaStatus): FestaStatusLabel {
  if (status === "success") return "Confirmada";
  if (status === "warning") return "Planejamento";
  if (status === "dark") return "Realizada";
  return "Pendente";
}

function parseForm(fd: FormData) {
  const status = (fd.get("status") as FestaStatus) || "neutral";
  return {
    nome: String(fd.get("nome") ?? ""),
    responsavel: String(fd.get("responsavel") ?? ""),
    data: String(fd.get("data") ?? ""),
    hora: String(fd.get("hora") ?? ""),
    telefone: String(fd.get("telefone") ?? ""),
    criancas: String(fd.get("criancas") ?? ""),
    local: String(fd.get("local") ?? ""),
    obs: String(fd.get("obs") ?? ""),
    status,
    statusLabel: labelFor(status),
  };
}

export async function createFesta(fd: FormData) {
  const supabase = await createClient();
  const id = Date.now().toString();
  const row = festaToRow({ id, ...parseForm(fd) });
  const { error } = await supabase.from("festas").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/festas");
  revalidatePath("/dashboard");
  redirect("/festas");
}

export async function updateFesta(id: string, fd: FormData) {
  const supabase = await createClient();
  const row = festaToRow({ id, ...parseForm(fd) });
  const { error } = await supabase.from("festas").update(row).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/festas");
  revalidatePath(`/festas/${id}`);
  revalidatePath("/dashboard");
  redirect(`/festas/${id}`);
}

export async function updateStatus(id: string, status: FestaStatus) {
  const supabase = await createClient();
  const status_label = labelFor(status);
  const { error } = await supabase.from("festas").update({ status, status_label }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/festas");
  revalidatePath(`/festas/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteFesta(id: string) {
  const supabase = await createClient();
  await supabase.from("festas").delete().eq("id", id);
  revalidatePath("/festas");
  revalidatePath("/dashboard");
  redirect("/festas");
}
