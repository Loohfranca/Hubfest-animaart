import type { Festa, FestaStatus } from "@/shared/supabase/types";

export function isPast(f: Festa): boolean {
  if (!f.data) return false;
  return f.data < new Date().toISOString().slice(0, 10);
}

export function statusColor(s: FestaStatus): string {
  switch (s) {
    case "success": return "text-[var(--color-success)] bg-[var(--color-success)]/10";
    case "warning": return "text-[var(--color-warning)] bg-[var(--color-warning)]/10";
    case "dark": return "text-[var(--color-muted-foreground)] bg-[var(--color-muted)]";
    default: return "text-[var(--color-muted-foreground)] bg-[var(--color-muted)]";
  }
}

export function statusBarColor(s: FestaStatus): string {
  switch (s) {
    case "success": return "bg-[var(--color-success)]";
    case "warning": return "bg-[var(--color-warning)]";
    case "dark": return "bg-[var(--color-muted-foreground)]";
    default: return "bg-[var(--color-primary)]";
  }
}
