"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, PartyPopper, CheckSquare, CalendarDays, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/festas", label: "Festas", icon: PartyPopper },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/relatorio", label: "Relatório", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 rounded-lg border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-2"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 border-r bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="HubFest" width={40} height={40} className="rounded-lg" />
            <span className="font-bold text-lg">HubFest</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2 px-3">Navegação</p>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t pt-3 mt-3 space-y-1">
          {userEmail && (
            <p className="text-xs text-[var(--color-muted-foreground)] px-3 mb-2 truncate">{userEmail}</p>
          )}
          <ThemeToggle />
          <form action={signOut}>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition">
              <LogOut className="w-4.5 h-4.5" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
