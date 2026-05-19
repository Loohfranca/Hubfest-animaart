import "server-only";
import { createClient } from "@/shared/supabase/server";
import type { Festa } from "@/shared/supabase/types";

const TZ = "America/Sao_Paulo";

interface GoogleEvent {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  reminders?: {
    useDefault: boolean;
    overrides?: { method: "popup" | "email"; minutes: number }[];
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

function buildEvent(festa: Partial<Festa>, reminderMinutes: number[]): GoogleEvent | null {
  if (!festa.data) return null;

  const description = [
    festa.responsavel && `Responsável: ${festa.responsavel}`,
    festa.telefone && `Telefone: ${festa.telefone}`,
    festa.idade && `Idade: ${festa.idade}`,
    festa.criancas && `${festa.criancas} crianças`,
    festa.obs,
  ].filter(Boolean).join("\n");

  const event: GoogleEvent = {
    summary: `Festa de ${festa.nome ?? ""}`.trim(),
    description: description || undefined,
    location: festa.local || undefined,
    start: { date: festa.data },
    end: { date: addDays(festa.data, 1) },
  };

  if (festa.hora && /^\d{2}:\d{2}/.test(festa.hora)) {
    const startIso = `${festa.data}T${festa.hora.slice(0, 5)}:00`;
    const [h, m] = festa.hora.slice(0, 5).split(":").map(Number);
    const endMinutes = h * 60 + m + 180;
    const endH = String(Math.floor((endMinutes / 60) % 24)).padStart(2, "0");
    const endM = String(endMinutes % 60).padStart(2, "0");
    const endDate = endMinutes >= 1440 ? addDays(festa.data, 1) : festa.data;
    const endIso = `${endDate}T${endH}:${endM}:00`;
    event.start = { dateTime: startIso, timeZone: TZ };
    event.end = { dateTime: endIso, timeZone: TZ };
  }

  if (reminderMinutes.length > 0) {
    event.reminders = {
      useDefault: false,
      overrides: reminderMinutes.map((minutes) => ({ method: "popup", minutes })),
    };
  }

  return event;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("user_google_tokens")
    .select("refresh_token, access_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (!row?.refresh_token) return null;

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (row.access_token && expiresAt > Date.now() + 60_000) {
    return row.access_token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("[google-calendar] GOOGLE_CLIENT_ID/SECRET ausentes");
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: row.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("[google-calendar] refresh falhou", await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  const newExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString();
  await supabase.from("user_google_tokens").update({
    access_token: data.access_token,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  return data.access_token;
}

async function getUserPrefs(userId: string): Promise<{ calendarId: string; reminderMinutes: number[] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_google_tokens")
    .select("calendar_id, reminder_minutes")
    .eq("user_id", userId)
    .single();
  return {
    calendarId: data?.calendar_id || "primary",
    reminderMinutes: data?.reminder_minutes ?? [1440, 60],
  };
}

export async function syncFestaToCalendar(
  festa: Festa,
  existingEventId?: string | null,
): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const prefs = await getUserPrefs(user.id);
  const event = buildEvent(festa, prefs.reminderMinutes);
  if (!event) return null;

  const token = await getAccessToken(user.id);
  if (!token) return null;

  const calendarId = encodeURIComponent(prefs.calendarId);
  const base = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  const url = existingEventId ? `${base}/${existingEventId}` : base;
  const method = existingEventId ? "PATCH" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    console.error("[google-calendar] sync falhou", res.status, await res.text());
    if (existingEventId && res.status === 404) {
      return syncFestaToCalendar(festa, null);
    }
    return null;
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!eventId) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const prefs = await getUserPrefs(user.id);
  const token = await getAccessToken(user.id);
  if (!token) return;

  const calendarId = encodeURIComponent(prefs.calendarId);
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function listUserCalendars(): Promise<GoogleCalendar[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const token = await getAccessToken(user.id);
  if (!token) return [];

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as { items: GoogleCalendar[] };
  return data.items ?? [];
}

export async function isGoogleConnected(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_google_tokens")
    .select("user_id")
    .eq("user_id", user.id)
    .single();
  return !!data;
}
