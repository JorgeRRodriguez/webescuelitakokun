// Toda fecha/hora de la app (incluida la "hora de reloj": checkInTime, time,
// sentAt, readAt) se guarda y se formatea usando los componentes UTC del
// Date, nunca la zona horaria local del servidor/navegador. Así el demo se
// ve igual sin importar en qué máquina/zona horaria corra.

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS_ABR = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function formatDateUTC(d: Date): string {
  return `${d.getUTCDate()} ${MESES_ABR[d.getUTCMonth()]}`;
}

export function formatDateLongUTC(d: Date): string {
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function formatWeekdayShortUTC(d: Date): string {
  return DIAS_ABR[d.getUTCDay()];
}

export function formatTimeLocal(d: Date): string {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDateTimeLocal(d: Date): string {
  return `${formatDateUTC(d)} · ${formatTimeLocal(d)}`;
}

export function isSameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function ageFromBirthDateUTC(birthDate: Date, atDate: Date): string {
  let years = atDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = atDate.getUTCMonth() - birthDate.getUTCMonth();
  if (atDate.getUTCDate() < birthDate.getUTCDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${months} meses`;
  return `${years} año${years === 1 ? "" : "s"} y ${months} mes${months === 1 ? "" : "es"}`;
}

// "Hoy" del demo: coincide con la fecha real de desarrollo (6 oct 2026),
// pero se centraliza aquí por si se necesita anclar a otra fecha.
export function demoToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
