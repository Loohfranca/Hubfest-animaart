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

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function googleCalendarUrl(args: {
  title: string;
  date: string;
  time?: string;
  durationHours?: number;
  details?: string;
  location?: string;
}): string {
  const { title, date, time, durationHours = 3, details, location } = args;
  if (!date) return "";
  const ymd = date.replace(/-/g, "");
  let dates: string;
  if (time && /^\d{2}:\d{2}/.test(time)) {
    const [h, m] = time.split(":").map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + durationHours * 60;
    const endH = Math.floor(endMin / 60) % 24;
    const endM = endMin % 60;
    const dayShift = Math.floor(endMin / 1440);
    let endDate = date;
    if (dayShift > 0) {
      const d = new Date(date + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + dayShift);
      endDate = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    }
    const endYmd = endDate.replace(/-/g, "");
    dates = `${ymd}T${pad(h)}${pad(m)}00/${endYmd}T${pad(endH)}${pad(endM)}00`;
  } else {
    const next = new Date(date + "T00:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    const nextYmd = `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
    dates = `${ymd}/${nextYmd}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
  });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  params.set("ctz", "America/Sao_Paulo");
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
