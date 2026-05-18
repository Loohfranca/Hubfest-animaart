"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, resetPassword } from "@/features/auth/actions";
import { createClient } from "@/shared/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(fd: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await signIn(fd);
      if (res?.error) setError(res.error);
    });
  }

  async function signInWithGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) setError(error.message);
  }

  async function onForgot(fd: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await resetPassword(fd);
      if (res?.error) setError(res.error);
      else setInfo("Email de recuperação enviado.");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-background)]">
      <div className="w-full max-w-md rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image src="/logo.png" alt="HubFest" width={72} height={72} className="rounded-xl" />
          <h1 className="text-2xl font-bold">HubFest</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Gestão de Eventos</p>
        </div>

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Senha</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          {info && <p className="text-sm text-[var(--color-success)]">{info}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 font-semibold text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 transition"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted-foreground)]">ou</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full rounded-lg border bg-[var(--color-card)] py-2.5 font-medium hover:bg-[var(--color-muted)] transition inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <button
            type="button"
            formAction={onForgot}
            className="w-full text-sm text-[var(--color-accent)] hover:underline"
          >
            Esqueci a senha
          </button>

          <Link
            href="/signup"
            className="block text-center text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] hover:underline"
          >
            Criar conta
          </Link>
        </form>
      </div>
    </div>
  );
}
