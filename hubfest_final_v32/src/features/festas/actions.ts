"use server";

import { createClient } from "@/shared/supabase/server";
import { festaToRow, rowToFesta, type FestaStatus, type FestaStatusLabel } from "@/shared/supabase/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncFestaToCalendar, deleteCalendarEvent } from "./google-calendar";

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
  const parsed = parseForm(fd);
  const row = festaToRow({ id, ...parsed });
  const { data, error } = await supabase.from("festas").insert(row).select().single();
  if (error) return { error: error.message };

  if (data) {
    const festa = rowToFesta(data);
    const eventId = await syncFestaToCalendar(festa, null);
    if (eventId) {
      await supabase.from("festas").update({ google_event_id: eventId }).eq("id", id);
    }
  }

  revalidatePath("/festas");
  revalidatePath("/dashboard");
  redirect("/festas");
}

export async function updateFesta(id: string, fd: FormData) {
  const supabase = await createClient();
  const parsed = parseForm(fd);
  const row = festaToRow({ id, ...parsed });
  const { error } = await supabase.from("festas").update(row).eq("id", id);
  if (error) return { error: error.message };

  const { data: current } = await supabase.from("festas").select("*").eq("id", id).single();
  if (current) {
    const festa = rowToFesta(current);
    const eventId = await syncFestaToCalendar(festa, current.google_event_id);
    if (eventId && eventId !== current.google_event_id) {
      await supabase.from("festas").update({ google_event_id: eventId }).eq("id", id);
    }
  }

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
  const { data: current } = await supabase.from("festas").select("google_event_id").eq("id", id).single();
  if (current?.google_event_id) {
    await deleteCalendarEvent(current.google_event_id);
  }
  await supabase.from("festas").delete().eq("id", id);
  revalidatePath("/festas");
  revalidatePath("/dashboard");
  redirect("/festas");
}
