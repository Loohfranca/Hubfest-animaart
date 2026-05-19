"use server";

import { createClient } from "@/shared/supabase/server";
import { revalidatePath } from "next/cache";

export async function disconnectGoogle() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: row } = await supabase
    .from("user_google_tokens")
    .select("refresh_token")
    .eq("user_id", user.id)
    .single();

  if (row?.refresh_token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${row.refresh_token}`, {
        method: "POST",
      });
    } catch {}
  }

  await supabase.from("user_google_tokens").delete().eq("user_id", user.id);
  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function updateCalendarSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const calendarId = String(formData.get("calendar_id") ?? "primary");
  const reminders = formData.getAll("reminders").map((v) => Number(v)).filter((n) => !Number.isNaN(n));

  const { error } = await supabase
    .from("user_google_tokens")
    .update({ calendar_id: calendarId, reminder_minutes: reminders })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  return { ok: true };
}
