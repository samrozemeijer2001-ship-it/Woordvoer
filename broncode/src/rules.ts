// Spelregels als pure functies: makkelijk te testen en los van de interface.
import { BASE_POINTS, BLAST_EVERY_DAYS, BLAST_MIN_AGE_DAYS, HINT_PENALTY, MAX_ATTEMPTS, POINTS_PER_LEVEL } from './config';
import type { ContentIndex, Puzzle, Word } from './content';
import type { Progress, PuzzleStatus } from './progress';

export const normalize = (s: string) => s.trim().toLowerCase();
export const letterCount = (s: string) => [...normalize(s)].length;

export function pointsFor(attempt: number, hint: boolean): number {
  const base = BASE_POINTS[attempt - 1] ?? 0;
  return Math.max(0, base - (hint ? HINT_PENALTY : 0));
}

export function freshPuzzle(): PuzzleStatus {
  return { attempts: 0, hint: false, status: 'playing', points: 0 };
}

export type GuessOutcome = 'leeg' | 'lengte' | 'fout' | 'geraden' | 'verloren' | 'afgerond';

/** Verwerkt een gok. Leeg of verkeerde lengte kost geen poging. */
export function guess(state: PuzzleStatus, puzzle: Puzzle, input: string): { outcome: GuessOutcome; next: PuzzleStatus } {
  if (state.status !== 'playing') return { outcome: 'afgerond', next: state };
  const g = normalize(input);
  if (!g) return { outcome: 'leeg', next: state };
  if ([...g].length !== puzzle.letters) return { outcome: 'lengte', next: state };
  const attempts = state.attempts + 1;
  if (g === normalize(puzzle.antwoord)) {
    return { outcome: 'geraden', next: { ...state, attempts, status: 'won', points: pointsFor(attempts, state.hint), finishedAt: Date.now() } };
  }
  if (attempts >= MAX_ATTEMPTS) {
    return { outcome: 'verloren', next: { ...state, attempts, status: 'lost', points: 0, finishedAt: Date.now() } };
  }
  return { outcome: 'fout', next: { ...state, attempts } };
}

export function hintLetters(puzzle: Puzzle): Map<number, string> {
  const chars = [...puzzle.antwoord];
  return new Map(puzzle.hintposities.map((p) => [p, chars[p - 1].toUpperCase()]));
}

export function totals(p: Progress) {
  const total = Object.values(p.puzzles).reduce((s, x) => s + (x.status === 'playing' ? 0 : x.points), 0);
  const level = Math.floor(total / POINTS_PER_LEVEL) + 1;
  const inLevel = total % POINTS_PER_LEVEL;
  return { total, level, inLevel, toNext: POINTS_PER_LEVEL - inLevel, played: Object.values(p.puzzles).filter((x) => x.status !== 'playing').length };
}

export function stats(p: Progress) {
  const w = Object.values(p.words);
  const s = Object.values(p.proverbs);
  return {
    wordsDiscovered: w.filter((x) => x.opened != null).length,
    wordsRemembered: w.filter((x) => x.remembered != null && x.known == null).length,
    wordsUsed: w.filter((x) => x.used != null).length,
    proverbsDiscovered: s.filter((x) => x.opened != null).length,
    proverbsRemembered: s.filter((x) => x.remembered != null).length,
  };
}

/** Het woord dat op een dag zichtbaar is: het geplande woord of het laatst gekozen reservewoord. */
export function wordIdForDay(c: ContentIndex, p: Progress, day: number): string | undefined {
  const plan = c.day.get(day);
  if (!plan) return undefined;
  const r = p.days[day]?.replacements;
  return r && r.length ? r[r.length - 1] : plan.woordId;
}

/** Eerste reservewoord dat de speler nog niet heeft gezien en nergens als vervanger is gebruikt. */
export function nextReserve(c: ContentIndex, p: Progress): Word | undefined {
  const used = new Set(Object.values(p.days).flatMap((d) => d.replacements ?? []));
  return c.reserve.find((w) => !used.has(w.id) && p.words[w.id]?.opened == null && p.words[w.id]?.known == null);
}

/** Geschikte woorden voor de gouden kaart op een dag. */
export function blastCandidates(c: ContentIndex, p: Progress, day: number): string[] {
  const shownToday = new Set([wordIdForDay(c, p, day)]);
  return Object.entries(p.words)
    .filter(([id, w]) => c.word.has(id) && w.saved && w.savedDay != null && w.savedDay <= day - BLAST_MIN_AGE_DAYS && !w.blastDone && !shownToday.has(id))
    .sort((a, b) => (a[1].savedDay! - b[1].savedDay!) || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}

/** Mag er op deze dag een nieuwe gouden kaart komen? Hooguit één per BLAST_EVERY_DAYS dagen. */
export function blastAllowed(p: Progress, day: number): boolean {
  for (let d = day - BLAST_EVERY_DAYS + 1; d < day; d++) if (p.days[d]?.blast) return false;
  return true;
}

export function shareNumber(puzzle: Puzzle) {
  return '#' + String(puzzle.dag).padStart(3, '0');
}

export function resultShareText(puzzle: Puzzle, st: PuzzleStatus): string {
  const hint = st.hint ? 'met hint' : 'zonder hint';
  const line = st.status === 'won'
    ? `Geraden in ${st.attempts} van de ${MAX_ATTEMPTS} pogingen, ${hint}`
    : `Niet geraden in ${MAX_ATTEMPTS} pogingen, ${hint}`;
  return `Woordpost Wildcard ${shareNumber(puzzle)}\n${line}\n${st.points} punten`;
}
