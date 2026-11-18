// Kaartinhoud en dagplanning, geïmporteerd uit Excel (public/content.json).
export interface Word { id: string; woord: string; betekenis: string; voorbeeldzin: string; rol: 'dagkaart' | 'reserve' }
export interface Proverb { id: string; spreekwoord: string; betekenis: string; situatie: string }
export interface Puzzle { id: string; dag: number; raadsel: string; antwoord: string; letters: number; hintposities: number[]; uitleg: string }
export interface DayPlan { dag: number; woordId: string; spreekwoordId: string; wildcardId: string }

export interface Content {
  version: number;
  importedAt: string;
  days: DayPlan[];
  words: Word[];
  proverbs: Proverb[];
  puzzles: Puzzle[];
}

export interface ContentIndex extends Content {
  word: Map<string, Word>;
  proverb: Map<string, Proverb>;
  puzzle: Map<string, Puzzle>;
  day: Map<number, DayPlan>;
  reserve: Word[];
}

const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

export function validateContent(c: unknown): Content {
  const fail = (m: string): never => { throw new Error(m); };
  if (!c || typeof c !== 'object') fail('geen object');
  const x = c as Content;
  if (x.version !== 1) fail('onbekende versie');
  for (const k of ['days', 'words', 'proverbs', 'puzzles'] as const) if (!Array.isArray(x[k]) || x[k].length === 0) fail(`${k} ontbreekt`);
  for (const w of x.words) if (!isStr(w.id) || !isStr(w.woord) || !isStr(w.betekenis) || !isStr(w.voorbeeldzin)) fail(`woord ${w.id} onvolledig`);
  for (const p of x.proverbs) if (!isStr(p.id) || !isStr(p.spreekwoord) || !isStr(p.betekenis) || !isStr(p.situatie)) fail(`spreekwoord ${p.id} onvolledig`);
  for (const p of x.puzzles) {
    if (!isStr(p.id) || !isStr(p.raadsel) || !isStr(p.antwoord) || !isStr(p.uitleg)) fail(`wildcard ${p.id} onvolledig`);
    if ([...p.antwoord].length !== p.letters) fail(`wildcard ${p.id}: letters kloppen niet`);
    if (!Array.isArray(p.hintposities) || p.hintposities.some((n) => n < 1 || n > p.letters)) fail(`wildcard ${p.id}: hint ongeldig`);
  }
  const ids = new Set([...x.words.map((w) => w.id), ...x.proverbs.map((p) => p.id), ...x.puzzles.map((p) => p.id)]);
  for (const d of x.days) if (!ids.has(d.woordId) || !ids.has(d.spreekwoordId) || !ids.has(d.wildcardId)) fail(`dag ${d.dag} verwijst naar onbekende kaart`);
  return x;
}

export function indexContent(c: Content): ContentIndex {
  return {
    ...c,
    word: new Map(c.words.map((w) => [w.id, w])),
    proverb: new Map(c.proverbs.map((p) => [p.id, p])),
    puzzle: new Map(c.puzzles.map((p) => [p.id, p])),
    day: new Map(c.days.map((d) => [d.dag, d])),
    reserve: c.words.filter((w) => w.rol === 'reserve'),
  };
}

const CACHE_KEY = 'woordpost:content-cache';

export type ContentResult =
  | { ok: true; content: ContentIndex; fromCache: boolean }
  | { ok: false; error: string };

/** Laadt de dagpost. Mislukt dat, dan de laatst geldige kopie uit deze browser. Raakt de voortgang nooit aan. */
export async function loadContent(): Promise<ContentResult> {
  const simulate = new URLSearchParams(location.search).get('simuleer') === 'laadfout';
  try {
    if (simulate) throw new Error('gesimuleerde laadfout');
    const res = await fetch('./content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`server gaf ${res.status}`);
    const json = validateContent(await res.json());
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch { /* cache is optioneel */ }
    return { ok: true, content: indexContent(json), fromCache: false };
  } catch (e) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw && !simulate) return { ok: true, content: indexContent(validateContent(JSON.parse(raw))), fromCache: true };
    } catch { /* cache ook kapot */ }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
