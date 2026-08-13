/** Límites diarios del plan gratuito. */
export const LIMITE_PDF_FREE = 3;
export const LIMITE_CHAT_FREE = 10;

/** Inicio del día actual (zona horaria de Ciudad de México) en ISO. */
export function inicioDelDiaISO(): string {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(ahora);
  const v = (t: string) => Number(partes.find((p) => p.type === t)?.value ?? "0");
  const transcurrido =
    (v("hour") % 24) * 3600_000 + v("minute") * 60_000 + v("second") * 1000;
  return new Date(ahora.getTime() - transcurrido).toISOString();
}
