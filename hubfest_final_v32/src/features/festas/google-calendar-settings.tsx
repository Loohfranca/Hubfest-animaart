"use client";

import { useTransition, useState } from "react";
import { Calendar, Unlink, Check, Bell } from "lucide-react";
import { createClient } from "@/shared/supabase/client";
import { disconnectGoogle, updateCalendarSettings } from "./calendar-actions";
import type { GoogleCalendar } from "./google-calendar";

const REMINDER_OPTIONS = [
  { value: 15, label: "15 min antes" },
  { value: 60, label: "1 hora antes" },
  { value: 180, label: "3 horas antes" },
  { value: 1440, label: "1 dia antes" },
  { value: 2880, label: "2 dias antes" },
  { value: 10080, label: "1 semana antes" },
];

export function GoogleCalendarSettings({
  connected,
  calendars,
  currentCalendarId,
  currentReminders,
}: {
  connected: boolean;
  calendars: GoogleCalendar[];
  currentCalendarId: string;
  currentReminders: number[];
}) {
  const [pending, startTransition] = useTransition();
  const [info, setInfo] = useState<string | null>(null);

  async function connect() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/configuracoes`,
        scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  function onDisconnect() {
    if (!confirm("Desconectar Google Calendar? As festas existentes ficarão no calendário, mas novas não serão sincronizadas.")) return;
    startTransition(async () => {
      await disconnectGoogle();
      setInfo("Desconectado.");
    });
  }

  function onSave(fd: FormData) {
    startTransition(async () => {
      const res = await updateCalendarSettings(fd);
      setInfo(res?.error ? `Erro: ${res.error}` : "Configurações salvas.");
    });
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Conecte sua conta Google para sincronizar festas automaticamente com o Google Calendar.
        </p>
        <button
          onClick={connect}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          <Calendar className="w-4 h-4" /> Conectar Google Calendar
        </button>
      </div>
    );
  }

  return (
    <form key={`${currentCalendarId}-${currentReminders.join(",")}`} action={onSave} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
        <Check className="w-4 h-4" /> Conectado ao Google Calendar
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" /> Calendário de destino
        </label>
        <select
          name="calendar_id"
          defaultValue={currentCalendarId}
          className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        >
          {calendars.length === 0 && <option value="primary">Calendário principal</option>}
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.summary}{c.primary ? " (principal)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
          <Bell className="w-4 h-4" /> Lembretes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {REMINDER_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-[var(--color-muted)] cursor-pointer text-sm">
              <input
                type="checkbox"
                name="reminders"
                value={opt.value}
                defaultChecked={currentReminders.includes(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {info && <p className="text-sm text-[var(--color-success)]">{info}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-danger)]/10"
        >
          <Unlink className="w-4 h-4" /> Desconectar
        </button>
      </div>
    </form>
  );
}
