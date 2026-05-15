"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Festa } from "@/shared/supabase/types";
import { BriefingModal } from "./briefing-modal";

export function BriefingButton({ festa }: { festa: Festa }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-secondary)] px-3.5 py-2 text-sm font-semibold text-[var(--color-secondary-foreground)] hover:opacity-90 shadow-[var(--shadow-card)]"
      >
        <Send className="w-4 h-4" /> Briefing
      </button>
      {open && <BriefingModal festa={festa} onClose={() => setOpen(false)} />}
    </>
  );
}
