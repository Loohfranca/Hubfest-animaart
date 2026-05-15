"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";
import { ShareReportModal } from "./share-report-modal";

export function ShareReportButton({ festas, periodLabel }: { festas: Festa[]; periodLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-success)] px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 shadow-[var(--shadow-card)]"
      >
        <Share2 className="w-4 h-4" /> Compartilhar
      </button>
      {open && <ShareReportModal festas={festas} periodLabel={periodLabel} onClose={() => setOpen(false)} />}
    </>
  );
}
