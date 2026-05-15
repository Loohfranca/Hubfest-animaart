import type { Festa } from "@/shared/supabase/types";
import { isPast } from "./status";

export function festasStats(festas: Festa[]) {
  const hoje = new Date();
  const ymHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return {
    total: festas.length,
    pendentes: festas.filter((f) => !isPast(f) && (f.status === "neutral" || f.status === "warning")).length,
    estaSemana: festas.filter((f) => f.data >= iso(inicioSemana) && f.data <= iso(fimSemana)).length,
    realizadasMes: festas.filter((f) => isPast(f) && f.data.startsWith(ymHoje)).length,
  };
}
