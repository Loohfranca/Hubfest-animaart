"use client";

import { Download } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";

function toCsv(festas: Festa[]): string {
  const header = ["Nome", "Responsável", "Data", "Hora", "Telefone", "Crianças", "Local", "Status", "Obs"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = festas.map((f) => [f.nome, f.responsavel, f.data, f.hora, f.telefone, f.criancas, f.local, f.statusLabel, f.obs].map(escape).join(","));
  return [header.join(","), ...rows].join("\n");
}

export function ExportCsvButton({ festas }: { festas: Festa[] }) {
  function download() {
    const csv = toCsv(festas);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `festas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-muted)] transition"
    >
      <Download className="w-4 h-4" /> Exportar CSV
    </button>
  );
}
