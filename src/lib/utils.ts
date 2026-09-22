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
