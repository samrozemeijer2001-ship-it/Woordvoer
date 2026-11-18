import { START_DATE, TIME_ZONE } from './config';

const isoFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Kalenderdatum (JJJJ-MM-DD) in Nederland voor een moment. */
export function amsterdamDate(now: Date = new Date()): string {
  return isoFmt.format(now);
}

function isoToUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((isoToUtc(toIso) - isoToUtc(fromIso)) / 86400000);
}

/** Dagnummer in de testmaand. Dag 1 = START_DATE. Kan 0 of negatief zijn vóór de start. */
export function dayNumberFor(iso: string, start = START_DATE): number {
  return daysBetween(start, iso) + 1;
}

export function dateForDay(day: number, start = START_DATE): string {
  const t = isoToUtc(start) + (day - 1) * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

const longFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const shortFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

export function formatLong(iso: string): string {
  return longFmt.format(new Date(isoToUtc(iso)));
}
export function formatShort(iso: string): string {
  return shortFmt.format(new Date(isoToUtc(iso))).replace(/\./g, '');
}

// ---- Testdag: lokaal een andere dag bekijken zonder de gedeelde planning te wijzigen ----
const TEST_KEY = 'woordpost:testdag';

export function readTestDay(): number | null {
  try {
    const params = new URLSearchParams(location.search);
    const p = params.get('testdag');
    if (p === 'uit' || p === 'off') sessionStorage.removeItem(TEST_KEY);
    else if (p && /^-?\d+$/.test(p)) sessionStorage.setItem(TEST_KEY, p);
    const v = sessionStorage.getItem(TEST_KEY);
    return v && /^-?\d+$/.test(v) ? Number(v) : null;
  } catch {
    return null;
  }
}

export function clearTestDay() {
  try { sessionStorage.removeItem(TEST_KEY); } catch { /* niets */ }
  const url = new URL(location.href);
  url.searchParams.delete('testdag');
  location.replace(url.toString());
}
