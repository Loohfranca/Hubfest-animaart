import Link from "next/link";
import { Pencil, MapPin, CalendarPlus } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";
import { statusColor, statusBarColor } from "./status";
import { shortMonth, googleCalendarUrl } from "@/lib/date";

export function mapsUrl(local: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`;
}

export function FestaCard({ f }: { f: Festa }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border bg-[var(--color-card)] shadow-[var(--shadow-card)] p-3.5 hover:border-[var(--color-primary)] transition">
      <div className={`w-1 self-stretch rounded-full ${statusBarColor(f.status)}`} />
      <div className="text-center min-w-[48px]">
        <p className="text-[10px] font-bold tracking-wider text-[var(--color-muted-foreground)]">{shortMonth(f.data)}</p>
      </div>
      <Link href={`/festas/${f.id}`} className="flex-1 min-w-0 py-1">
        <p className="font-medium truncate">{f.nome}</p>
        <p className="text-xs text-[var(--color-muted-foreground)] truncate">
          {[f.responsavel, f.hora, f.criancas && `${f.criancas} crianças`, f.local].filter(Boolean).join(" • ")}
        </p>
      </Link>
      <span className={`hidden sm:inline-flex text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(f.status)}`}>
        {f.statusLabel}
      </span>
      <div className="flex items-center gap-1">
        {f.data && (
          <a
            href={googleCalendarUrl({
              title: `Festa de ${f.nome}`,
              date: f.data,
              time: f.hora,
              location: f.local,
              details: [
                f.responsavel && `Responsável: ${f.responsavel}`,
                f.telefone && `Tel: ${f.telefone}`,
                f.criancas && `${f.criancas} crianças`,
                f.obs,
              ].filter(Boolean).join("\n"),
            })}
            target="_blank"
            rel="noopener noreferrer"
            title="Adicionar ao Google Calendar"
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition"
            aria-label="Adicionar ao Google Calendar"
          >
            <CalendarPlus className="w-4 h-4" />
          </a>
        )}
        {f.local && (
          <a
            href={mapsUrl(f.local)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir no Maps: ${f.local}`}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition"
            aria-label="Abrir no Google Maps"
          >
            <MapPin className="w-4 h-4" />
          </a>
        )}
        <Link
          href={`/festas/${f.id}/editar`}
          title="Editar"
          className="p-2 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition"
          aria-label="Editar festa"
        >
          <Pencil className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
