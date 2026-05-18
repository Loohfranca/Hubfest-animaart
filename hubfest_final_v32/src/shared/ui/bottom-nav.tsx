"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PartyPopper, Plus, CheckSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/festas", label: "Festas", icon: PartyPopper },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/calendario", label: "Agenda", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-[var(--color-card)] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação rápida"
    >
      <div className="relative grid grid-cols-5 items-end h-16">
        {ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full text-[11px] font-medium transition",
                active ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]",
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}

        <Link
          href="/festas/nova"
          className="flex items-center justify-center"
          aria-label="Nova festa"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-lg -translate-y-4 ring-4 ring-[var(--color-background)]">
            <Plus className="w-6 h-6" />
          </span>
        </Link>

        {ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full text-[11px] font-medium transition",
                active ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]",
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
