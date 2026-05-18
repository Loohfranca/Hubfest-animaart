"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signUp } from "@/features/auth/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(fd: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await signUp(fd);
      if (res?.error) setError(res.error);
      else if (res?.needsConfirmation)
        setInfo("Conta criada. Confirme seu email para entrar.");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-background)]">
      <div className="w-full max-w-md rounded-2xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image src="/logo.png" alt="HubFest" width={72} height={72} className="rounded-xl" />
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">HubFest — Gestão de Eventos</p>
        </div>

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nome</label>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border bg-[var(--color-input)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
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
            {pending ? "Criando..." : "Criar conta"}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm text-[var(--color-accent)] hover:underline"
          >
            Já tenho conta
          </Link>
        </form>
      </div>
    </div>
  );
}
