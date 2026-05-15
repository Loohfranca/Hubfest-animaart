import type { Festa } from "@/shared/supabase/types";
import { formatDateLong } from "@/lib/date";

export function buildBriefingText(f: Festa): string {
  const lines = [
    `🎉 *BRIEFING - ${f.nome}*`,
    ``,
    `👤 *Aniversariante/Cliente:* ${f.nome}`,
    f.responsavel && `👨‍👩‍👧 *Responsável:* ${f.responsavel}`,
    `📅 *Data:* ${formatDateLong(f.data)}`,
    f.hora && `🕐 *Horário:* ${f.hora}`,
    f.criancas && `🧒 *Quantidade de crianças:* ${f.criancas}`,
    f.local && `📍 *Local:* ${f.local}`,
    f.telefone && `📞 *Contato:* ${f.telefone}`,
    f.obs && ``,
    f.obs && `📝 *Observações:*`,
    f.obs && f.obs,
    ``,
    `—`,
    `_Enviado pelo HubFest_`,
  ];
  return lines.filter(Boolean).join("\n");
}
