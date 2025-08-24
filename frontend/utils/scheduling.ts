import { MailerJob } from '@/types'

function parseHMS(hms: string): [number, number, number] {
    const [h, m, s] = (hms ?? '00:00:00').split(':').map(n => Number(n) || 0);
    return [h, m, s];
}

function lastDayOfMonth(year: number, monthIndex0: number) {
    // monthIndex0: 0=Jan … 11=Dez
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

/**
 * Berechnet die nächste Ausführung (lokale Zeit).
 * - daily: täglich um execution_time
 * - weekly: am Wochentag 'day' (0=So … 6=Sa) um execution_time
 * - monthly: am Monatstag 'day' (1..31) um execution_time; bei zu großem Tag → letzter Tag des Monats
 * Gibt null zurück, wenn der Job inaktiv ist oder die Angaben unvollständig/inkonsistent sind.
 */
export function computeNextExecution(job: MailerJob, now: Date = new Date()): Date | null {
    if (!job?.is_active) return null;

    const [h, m, s] = parseHMS(job.execution_time);
    const base = new Date(now);
    
    if (job.frequency === 'daily') {
        const next = new Date(base);
        next.setHours(h, m, s, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
    }

    if (job.frequency === 'weekly') {
        if (typeof job.day !== 'number') return null; // erwartet 0..6
        const next = new Date(base);
        next.setHours(h, m, s, 0);
        const todayDow = next.getDay(); // 0..6
        let delta = (job.day - todayDow + 7) % 7;
        if (delta === 0 && next <= now) delta = 7; // heute, aber Zeit vorbei → nächste Woche
        next.setDate(next.getDate() + delta);
        return next;
    }

    if (job.frequency === 'monthly') {
        if (typeof job.day !== 'number' || job.day < 1 || job.day > 31) return null; // erwartet 1..31

        const year = base.getFullYear();
        const month = base.getMonth(); // 0..11

        // Kandidat: aktueller Monat, Tag geklemmt
        const thisMonthDay = Math.min(job.day, lastDayOfMonth(year, month));
        const candidate = new Date(year, month, thisMonthDay, h, m, s, 0);

        if (candidate > now) return candidate;

        // sonst nächster Monat
        const nextYear = month === 11 ? year + 1 : year;
        const nextMonth = (month + 1) % 12;
        const nextMonthDay = Math.min(job.day, lastDayOfMonth(nextYear, nextMonth));
        return new Date(nextYear, nextMonth, nextMonthDay, h, m, s, 0);
    }

    return null;
}

/**
 * Kurzes, lesbares Label, z. B.:
 * - "heute, 07:00"
 * - "morgen, 07:00"
 * - "Mo, 07:00"
 */
export function formatNextExecution(
  dt: Date | null,
  now: Date = new Date(),
  locale: string = 'de-DE'
): string {
  if (!dt) return '—';

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const startOfTomorrow = new Date(now);
  startOfTomorrow.setDate(now.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);

  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dt);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dt);
  const dayNum = dt.getDate();

  // „heute“ / „morgen“
  if (sameDay(dt, now)) return `heute, ${time}`;
  if (sameDay(dt, startOfTomorrow)) return `morgen, ${time}`;

  // Prüfen, ob Termin im *nächsten* Monat liegt
  const nextMonthRef = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1. des nächsten Monats
  const isNextMonth =
    dt.getFullYear() === nextMonthRef.getFullYear() &&
    dt.getMonth() === nextMonthRef.getMonth();

  // Für alle anderen Fälle: Wochentag + Tag + Uhrzeit
  const base = `${weekday} ${dayNum}., ${time}`;

  // Hinweis anhängen, wenn es der nächste Monat ist
  if (isNextMonth) return `${base} (nächsten Monat)`;

  // Optional: bei weiter in der Zukunft liegenden Terminen Monat ausgeben
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dt);
  return `${base} (${monthName})`;
}


type Freq = 'daily' | 'weekly' | 'monthly' | 'manual';

type FormatOpts = {
  now?: Date;
  locale?: string; // z.B. 'de-DE', 'en-US'...
  frequency?: Freq;
  texts?: {
    today?: string;       // heute
    tomorrow?: string;    // morgen
    nextMonth?: string;   // nächsten Monat
    inMonth?: (monthName: string) => string; // (November) / (in November)
  };
};

// hilfreiche Defaults (DE)
const defaultTextsDE = {
  today: 'heute',
  tomorrow: 'morgen',
  nextMonth: 'nächsten Monat',
  inMonth: (m: string) => m ? `(${m})` : '',
};
// englische Fallbacks
const defaultTextsEN = {
  today: 'today',
  tomorrow: 'tomorrow',
  nextMonth: 'next month',
  inMonth: (m: string) => m ? `(${m})` : '',
};

export function formatNextExecutionLocalized(
  dt: Date | null,
  { now = new Date(), locale = 'de-DE', frequency = 'daily', texts }: FormatOpts = {}
): string {
  if (!dt) return '—';

  const t = locale.startsWith('de') ? defaultTextsDE : defaultTextsEN;
  const L = { ...t, ...(texts || {}) };

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dt);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dt);
  const dayNum = dt.getDate();
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dt);

  // heute / morgen
  if (sameDay(dt, now)) return `${L.today}, ${time}`;
  if (sameDay(dt, tomorrow)) return `${L.tomorrow}, ${time}`;

  // Nur für monthly wollen wir Monats-Hinweise
  if (frequency === 'monthly') {
    const nextMonthRef = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const isNextMonth =
      dt.getFullYear() === nextMonthRef.getFullYear() &&
      dt.getMonth() === nextMonthRef.getMonth();

    const base = `${weekday} ${dayNum}., ${time}`;
    return isNextMonth ? `${base} (${L.nextMonth})` : `${base} ${L.inMonth(monthName)}`.trim();
  }

  // daily / weekly: Monat weglassen
  // (für weekly lassen wir bewusst den Tag stehen, damit klar ist, welcher Wochentag dran ist)
  return frequency === 'weekly'
    ? `${weekday}, ${time}`
    : `${time}`; // daily: nur Uhrzeit reicht
}
