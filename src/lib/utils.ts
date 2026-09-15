export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatYearMonth(iso: string, locale: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    year: "numeric",
    month: "short",
  }).format(d);
}

export function localTime(timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date());
}
