import { MailerJob } from '@/types'

function parseHMS(hms: string): [number, number, number] {
    const [h, m, s] = (hms ?? '00:00:00').split(':').map(n => Number(n) || 0);
    return [h, m, s];
}

function lastDayOfMonth(year: number, monthIndex0: number) {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

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
        if (typeof job.day !== 'number') return null;
        const next = new Date(base);
        next.setHours(h, m, s, 0);
        const todayDow = next.getDay();
        let delta = (job.day - todayDow + 7) % 7;
        if (delta === 0 && next <= now) delta = 7; 
        next.setDate(next.getDate() + delta);
        return next;
    }

    if (job.frequency === 'monthly') {
        if (typeof job.day !== 'number' || job.day < 1 || job.day > 31) return null;

        const year = base.getFullYear();
        const month = base.getMonth();

        const thisMonthDay = Math.min(job.day, lastDayOfMonth(year, month));
        const candidate = new Date(year, month, thisMonthDay, h, m, s, 0);

        if (candidate > now) return candidate;

        const nextYear = month === 11 ? year + 1 : year;
        const nextMonth = (month + 1) % 12;
        const nextMonthDay = Math.min(job.day, lastDayOfMonth(nextYear, nextMonth));
        return new Date(nextYear, nextMonth, nextMonthDay, h, m, s, 0);
    }

    return null;
}

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

  if (sameDay(dt, now)) return `today, ${time}`;
  if (sameDay(dt, startOfTomorrow)) return `tomorrow, ${time}`;

  const nextMonthRef = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const isNextMonth =
    dt.getFullYear() === nextMonthRef.getFullYear() &&
    dt.getMonth() === nextMonthRef.getMonth();

  const base = `${weekday} ${dayNum}., ${time}`;

  if (isNextMonth) return `${base} (next month)`;

  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dt);
  return `${base} (${monthName})`;
}


type Freq = 'daily' | 'weekly' | 'monthly' | 'manual';

type FormatOpts = {
  now?: Date;
  locale?: string;
  frequency?: Freq;
  texts?: {
    today?: string; 
    tomorrow?: string;
    nextMonth?: string;
    inMonth?: (monthName: string) => string; 
  };
};

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

  if (sameDay(dt, now)) return `${L.today}, ${time}`;
  if (sameDay(dt, tomorrow)) return `${L.tomorrow}, ${time}`;

  if (frequency === 'monthly') {
    const nextMonthRef = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const isNextMonth =
      dt.getFullYear() === nextMonthRef.getFullYear() &&
      dt.getMonth() === nextMonthRef.getMonth();

    const base = `${weekday} ${dayNum}., ${time}`;
    return isNextMonth ? `${base} (${L.nextMonth})` : `${base} ${L.inMonth(monthName)}`.trim();
  }

  return frequency === 'weekly'
    ? `${weekday}, ${time}`
    : `${time}`;
}
