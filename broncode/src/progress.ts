// Persoonlijke voortgang. Staat los van kaartinhoud en planning en is gekoppeld via vaste ID's.
export const PROGRESS_VERSION = 1;

export interface WordStatus {
  opened?: number;      // dagnummer waarop de inhoud voor het eerst is geopend
  known?: number;       // 'Ken ik al'
  saved?: boolean;
  savedDay?: number;    // dagnummer van bewaren (voor Blast from the Past)
  savedAt?: number;     // tijdstip, voor sortering
  used?: number;        // 'Zelf gebruikt'
  remembered?: number;  // 'Wist ik nog' bij een latere herhaling
  blastDone?: boolean;  // niet meer als gouden kaart tonen
}

export interface ProverbStatus {
  opened?: number;
  saved?: boolean;
  savedAt?: number;
  remembered?: number;
  reviews?: { day: number; knew: boolean }[];
}

export interface PuzzleStatus {
  attempts: number;     // geldige gokken
  hint: boolean;
  status: 'playing' | 'won' | 'lost';
  points: number;
  finishedAt?: number;
}

export interface DayStatus {
  openedAt?: number;
  seen: { woord?: boolean; spreekwoord?: boolean; wildcard?: boolean; blast?: boolean };
  replacements?: string[];               // gekozen reservewoorden, laatste is zichtbaar
  blast?: { wordId: string; result?: 'knew' | 'again' };
}

export interface Profile { name: string; character: string }

export interface Progress {
  version: number;
  createdAt: number;
  profile?: Profile;
  days: Record<string, DayStatus>;
  words: Record<string, WordStatus>;
  proverbs: Record<string, ProverbStatus>;
  puzzles: Record<string, PuzzleStatus>;
}

export function emptyProgress(): Progress {
  return { version: PROGRESS_VERSION, createdAt: Date.now(), days: {}, words: {}, proverbs: {}, puzzles: {} };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Controleert en schoont ingelezen voortgang op. Gooit bij een onbruikbare structuur. */
export function validateProgress(input: unknown): Progress {
  if (!isObj(input)) throw new Error('geen object');
  if (input.version !== PROGRESS_VERSION) throw new Error(`versie ${String(input.version)} wordt niet ondersteund`);
  for (const k of ['days', 'words', 'proverbs', 'puzzles']) if (!isObj(input[k])) throw new Error(`${k} ontbreekt`);
  const out = emptyProgress();
  out.createdAt = num(input.createdAt) ?? Date.now();
  if (isObj(input.profile) && typeof input.profile.name === 'string' && typeof input.profile.character === 'string') {
    out.profile = { name: input.profile.name.slice(0, 24), character: input.profile.character };
  }
  for (const [id, v] of Object.entries(input.days as object)) {
    if (!isObj(v) || !/^-?\d+$/.test(id)) continue;
    const seen = isObj(v.seen) ? v.seen : {};
    const d: DayStatus = { openedAt: num(v.openedAt), seen: {} };
    for (const k of ['woord', 'spreekwoord', 'wildcard', 'blast'] as const) if (seen[k] === true) d.seen[k] = true;
    if (Array.isArray(v.replacements)) d.replacements = v.replacements.filter((x): x is string => typeof x === 'string');
    if (isObj(v.blast) && typeof v.blast.wordId === 'string') {
      d.blast = { wordId: v.blast.wordId };
      if (v.blast.result === 'knew' || v.blast.result === 'again') d.blast.result = v.blast.result;
    }
    out.days[id] = d;
  }
  for (const [id, v] of Object.entries(input.words as object)) {
    if (!isObj(v)) continue;
    out.words[id] = {
      opened: num(v.opened), known: num(v.known), saved: v.saved === true, savedDay: num(v.savedDay), savedAt: num(v.savedAt),
      used: num(v.used), remembered: num(v.remembered), blastDone: v.blastDone === true,
    };
  }
  for (const [id, v] of Object.entries(input.proverbs as object)) {
    if (!isObj(v)) continue;
    out.proverbs[id] = {
      opened: num(v.opened), saved: v.saved === true, savedAt: num(v.savedAt), remembered: num(v.remembered),
      reviews: Array.isArray(v.reviews) ? v.reviews.filter((r): r is { day: number; knew: boolean } => isObj(r) && typeof r.day === 'number' && typeof r.knew === 'boolean') : [],
    };
  }
  for (const [id, v] of Object.entries(input.puzzles as object)) {
    if (!isObj(v)) continue;
    const status = v.status === 'won' || v.status === 'lost' ? v.status : 'playing';
    const attempts = Math.max(0, Math.min(3, num(v.attempts) ?? 0));
    out.puzzles[id] = { attempts, hint: v.hint === true, status, points: Math.max(0, num(v.points) ?? 0), finishedAt: num(v.finishedAt) };
  }
  return out;
}

// ---- Opslag in deze browser ----
export const STORE_KEY = 'woordpost:voortgang';
export const BACKUP_KEY = 'woordpost:voortgang:backup';
const QUARANTINE_KEY = 'woordpost:voortgang:onleesbaar';

export type LoadStatus =
  | 'nieuw'          // nog niets opgeslagen
  | 'ok'
  | 'hersteld'       // hoofdkopie kapot, laatst geldige kopie geladen
  | 'onleesbaar'     // beide kapot: niets overschrijven tot de speler kiest
  | 'geen-opslag';   // localStorage niet beschikbaar

export interface LoadResult { progress: Progress; status: LoadStatus; detail?: string }

function parse(raw: string | null): Progress | null {
  if (raw == null) return null;
  try { return validateProgress(JSON.parse(raw)); } catch { return null; }
}

export function loadProgress(): LoadResult {
  let main: string | null, backup: string | null;
  try {
    main = localStorage.getItem(STORE_KEY);
    backup = localStorage.getItem(BACKUP_KEY);
  } catch (e) {
    return { progress: emptyProgress(), status: 'geen-opslag', detail: String(e) };
  }
  const p = parse(main);
  if (p) return { progress: p, status: 'ok' };
  const b = parse(backup);
  if (b) return { progress: b, status: main == null ? 'ok' : 'hersteld' };
  if (main == null && backup == null) return { progress: emptyProgress(), status: 'nieuw' };
  return { progress: emptyProgress(), status: 'onleesbaar' };
}

/** Schrijft de voortgang en daarna de reservekopie. Geeft alleen true als het echt gelukt is. */
export function saveProgress(p: Progress): boolean {
  try {
    const json = JSON.stringify(p);
    validateProgress(JSON.parse(json));
    localStorage.setItem(STORE_KEY, json);
    if (localStorage.getItem(STORE_KEY) !== json) return false;
    localStorage.setItem(BACKUP_KEY, json);
    return true;
  } catch {
    return false;
  }
}

/** Bij onleesbare gegevens: bewaar de ruwe tekst apart en begin opnieuw. Alleen op verzoek van de speler. */
export function quarantineAndReset(): boolean {
  try {
    const raw = localStorage.getItem(STORE_KEY) ?? localStorage.getItem(BACKUP_KEY);
    if (raw != null) localStorage.setItem(`${QUARANTINE_KEY}:${Date.now()}`, raw);
    return saveProgress(emptyProgress());
  } catch {
    return false;
  }
}
