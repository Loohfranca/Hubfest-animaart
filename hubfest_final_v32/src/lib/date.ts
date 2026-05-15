export function formatDateBR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateLong(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

export function shortMonth(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase().replace(".", "");
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
