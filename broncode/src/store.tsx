import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ContentIndex } from './content';
import { amsterdamDate, dayNumberFor, readTestDay } from './date';
import { emptyProgress, type LoadStatus, type Progress, quarantineAndReset, saveProgress } from './progress';
import { blastAllowed, blastCandidates, freshPuzzle, guess as applyGuess, type GuessOutcome, nextReserve, wordIdForDay } from './rules';

interface Toast { id: number; text: string }

interface Store {
  content: ContentIndex;
  progress: Progress;
  loadStatus: LoadStatus;
  today: number;            // effectief dagnummer (testdag of echte dag)
  realToday: number;
  testDay: number | null;
  writable: boolean;
  toast: (text: string) => void;
  toasts: Toast[];
  update: (fn: (d: Progress) => void) => boolean;
  actions: ReturnType<typeof makeActions>;
  resetUnreadable: () => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('Store ontbreekt');
  return s;
};

function useToday() {
  const [iso, setIso] = useState(() => amsterdamDate());
  useEffect(() => {
    const tick = () => setIso(amsterdamDate());
    const t = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, []);
  return dayNumberFor(iso);
}

export function StoreProvider({ content, initial, loadStatus, children }: {
  content: ContentIndex; initial: Progress; loadStatus: LoadStatus; children: ReactNode;
}) {
  const [progress, setProgress] = useState(initial);
  const [status, setStatus] = useState(loadStatus);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef(progress);
  ref.current = progress;
  const realToday = useToday();
  const testDay = useMemo(() => readTestDay(), []);
  const today = testDay ?? realToday;
  const writable = status !== 'onleesbaar';

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const update = useCallback((fn: (d: Progress) => void) => {
    const next = structuredClone(ref.current);
    fn(next);
    ref.current = next;
    setProgress(next);
    if (status === 'onleesbaar') return false;
    const ok = saveProgress(next);
    if (!ok) toast('Opslaan lukte niet. Deze stap is alleen tijdelijk.');
    return ok;
  }, [status, toast]);

  const resetUnreadable = useCallback(() => {
    if (quarantineAndReset()) {
      const fresh = emptyProgress();
      ref.current = fresh;
      setProgress(fresh);
      setStatus('nieuw');
      toast('Opnieuw begonnen. De oude gegevens staan apart.');
    } else toast('Opnieuw beginnen lukte niet. Opslag werkt niet in deze browser.');
  }, [toast]);

  const actions = useMemo(() => makeActions(content, () => ref.current, update, today), [content, update, today]);

  const value: Store = { content, progress, loadStatus: status, today, realToday, testDay, writable, toast, toasts, update, actions, resetUnreadable };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function makeActions(c: ContentIndex, get: () => Progress, update: (fn: (d: Progress) => void) => boolean, today: number) {
  const day = (d: Progress, n: number) => (d.days[n] ??= { seen: {} });
  const word = (d: Progress, id: string) => (d.words[id] ??= {});
  const prov = (d: Progress, id: string) => (d.proverbs[id] ??= {});

  return {
    openPackage(n: number) {
      return update((d) => { day(d, n).openedAt ??= Date.now(); });
    },
    /** Kiest de gouden kaart voor vandaag, alleen als er nog geen keuze is. Daarna blijft hij staan. */
    ensureBlast(n: number) {
      const p = get();
      if (n !== today || p.days[n]?.blast || !p.days[n]?.openedAt) return;
      if (!blastAllowed(p, n)) return;
      const [pick] = blastCandidates(c, p, n);
      if (pick) update((d) => { day(d, n).blast = { wordId: pick }; });
    },
    seeWord(n: number | null, id: string) {
      const p = get();
      if (p.words[id]?.opened != null && (n == null || p.days[n]?.seen.woord)) return;
      update((d) => { word(d, id).opened ??= today; if (n != null) day(d, n).seen.woord = true; });
    },
    seeProverb(n: number | null, id: string) {
      const p = get();
      if (p.proverbs[id]?.opened != null && (n == null || p.days[n]?.seen.spreekwoord)) return;
      update((d) => { prov(d, id).opened ??= today; if (n != null) day(d, n).seen.spreekwoord = true; });
    },
    seeKind(n: number, kind: 'wildcard' | 'blast') {
      if (get().days[n]?.seen[kind]) return;
      update((d) => { day(d, n).seen[kind] = true; });
    },
    toggleSaveWord(id: string): { saved: boolean; ok: boolean } {
      const saved = !get().words[id]?.saved;
      const ok = update((d) => {
        const w = word(d, id);
        w.saved = saved;
        if (saved) { w.savedDay = today; w.savedAt = Date.now(); w.opened ??= today; }
      });
      return { saved, ok };
    },
    toggleSaveProverb(id: string): { saved: boolean; ok: boolean } {
      const saved = !get().proverbs[id]?.saved;
      const ok = update((d) => {
        const s = prov(d, id);
        s.saved = saved;
        if (saved) { s.savedAt = Date.now(); s.opened ??= today; }
      });
      return { saved, ok };
    },
    toggleUsed(id: string): { used: boolean; ok: boolean } {
      const used = get().words[id]?.used == null;
      const ok = update((d) => { const w = word(d, id); if (used) w.used = today; else delete w.used; });
      return { used, ok };
    },
    /** 'Ken ik al': markeert het woord en kiest een ongezien reservewoord voor deze dag. */
    knowWord(n: number): { replacement?: string; ok: boolean } {
      const p = get();
      const current = wordIdForDay(c, p, n);
      if (!current) return { ok: false };
      const next = nextReserve(c, p);
      const ok = update((d) => {
        const w = word(d, current);
        w.known ??= today;
        w.opened ??= today;
        if (next) (day(d, n).replacements ??= []).push(next.id);
      });
      return { replacement: next?.id, ok };
    },
    guess(puzzleId: string, input: string): { outcome: GuessOutcome; ok: boolean } {
      const puzzle = c.puzzle.get(puzzleId)!;
      const cur = get().puzzles[puzzleId] ?? freshPuzzle();
      const { outcome, next } = applyGuess(cur, puzzle, input);
      if (outcome === 'leeg' || outcome === 'lengte' || outcome === 'afgerond') return { outcome, ok: true };
      const ok = update((d) => { d.puzzles[puzzleId] = next; });
      return { outcome, ok };
    },
    hint(puzzleId: string) {
      const cur = get().puzzles[puzzleId] ?? freshPuzzle();
      if (cur.hint || cur.status !== 'playing') return true;
      return update((d) => { d.puzzles[puzzleId] = { ...cur, hint: true }; });
    },
    blastResult(n: number, result: 'knew' | 'again') {
      return update((d) => {
        const b = day(d, n).blast;
        if (!b || b.result) return;
        b.result = result;
        const w = word(d, b.wordId);
        if (result === 'knew') { w.remembered ??= today; w.blastDone = true; }
      });
    },
    proverbReview(id: string, knew: boolean) {
      return update((d) => {
        const s = prov(d, id);
        (s.reviews ??= []).push({ day: today, knew });
        if (knew) s.remembered ??= today;
      });
    },
    setProfile(name: string, character: string) {
      return update((d) => { d.profile = { name: name.trim().slice(0, 24), character }; });
    },
  };
}
