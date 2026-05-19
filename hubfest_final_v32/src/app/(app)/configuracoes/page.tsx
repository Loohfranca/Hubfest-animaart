import { createClient } from "@/shared/supabase/server";
import { signOut } from "@/features/auth/actions";
import { LogOut, Mail, User, Calendar } from "lucide-react";
import { isGoogleConnected, listUserCalendars } from "@/features/festas/google-calendar";
import { GoogleCalendarSettings } from "@/features/festas/google-calendar-settings";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const connected = await isGoogleConnected();
  const calendars = connected ? await listUserCalendars() : [];
  const { data: prefs } = connected
    ? await supabase
        .from("user_google_tokens")
        .select("calendar_id, reminder_minutes")
        .eq("user_id", user!.id)
        .single()
    : { data: null };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5 space-y-3">
        <h2 className="font-semibold mb-3">Perfil</h2>
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          <span className="text-sm">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          <span className="text-sm font-mono text-[var(--color-muted-foreground)]">{user?.id?.slice(0, 12)}...</span>
        </div>
      </section>

      <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Google Calendar
        </h2>
        <GoogleCalendarSettings
          connected={connected}
          calendars={calendars}
          currentCalendarId={prefs?.calendar_id ?? "primary"}
          currentReminders={prefs?.reminder_minutes ?? [1440, 60]}
        />
      </section>

      <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
        <h2 className="font-semibold mb-3">Sessão</h2>
        <form action={signOut}>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-danger)]/10">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-5">
        <h2 className="font-semibold mb-2">Sobre</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">HubFest v2.0 · Next.js 16 · Supabase</p>
      </section>
    </div>
  );
}
