import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { amsterdamDate, dayNumberFor } from './date';
import { indexContent, validateContent } from './content';
import { emptyProgress, validateProgress } from './progress';
import { blastAllowed, blastCandidates, freshPuzzle, guess, hintLetters, nextReserve, pointsFor, resultShareText, totals } from './rules';

const content = indexContent(validateContent(JSON.parse(readFileSync('public/content.json', 'utf8'))));
const P02 = content.puzzle.get('P02')!; // spons, 5 letters
const P01 = content.puzzle.get('P01')!; // gerucht, 7 letters

describe('punten', () => {
  it('volgt de tabel', () => {
    expect([1, 2, 3].map((a) => pointsFor(a, false))).toEqual([100, 75, 50]);
    expect([1, 2, 3].map((a) => pointsFor(a, true))).toEqual([75, 50, 25]);
  });
});

describe('gokken', () => {
  it('leeg of verkeerde lengte kost geen poging', () => {
    expect(guess(freshPuzzle(), P02, '   ').outcome).toBe('leeg');
    const r = guess(freshPuzzle(), P02, 'sop');
    expect(r.outcome).toBe('lengte');
    expect(r.next.attempts).toBe(0);
  });
  it('negeert hoofdletters en spaties aan de randen', () => {
    const r = guess(freshPuzzle(), P02, '  SpOnS ');
    expect(r.outcome).toBe('geraden');
    expect(r.next.points).toBe(100);
  });
  it('drie fouten is nul punten en afgerond', () => {
    let s = freshPuzzle();
    for (const g of ['appel', 'peren', 'lepel']) s = guess(s, P02, g).next;
    expect(s.status).toBe('lost');
    expect(s.points).toBe(0);
    expect(guess(s, P02, 'spons').outcome).toBe('afgerond');
  });
  it('hint en tweede poging levert 50', () => {
    let s = { ...freshPuzzle(), hint: true };
    s = guess(s, P01, 'verhaal').next;
    s = guess(s, P01, 'gerucht').next;
    expect(s.points).toBe(50);
  });
  it('hintletters komen uit de ééngebaseerde posities', () => {
    expect([...hintLetters(P01)]).toEqual([[1, 'G'], [5, 'C']]);
    expect([...hintLetters(P02)]).toEqual([[2, 'P']]);
  });
  it('deeltekst bevat nooit het antwoord', () => {
    const t = resultShareText(P02, { attempts: 2, hint: false, status: 'won', points: 75 });
    expect(t).toBe('Woordpost Wildcard #002\nGeraden in 2 van de 3 pogingen, zonder hint\n75 punten');
    expect(t.toLowerCase()).not.toContain('spons');
  });
});

describe('level', () => {
  it('elke 300 punten een level', () => {
    const p = emptyProgress();
    p.puzzles = { A: { attempts: 1, hint: false, status: 'won', points: 100 }, B: { attempts: 1, hint: false, status: 'won', points: 100 }, C: { attempts: 1, hint: false, status: 'won', points: 100 }, D: { attempts: 1, hint: false, status: 'playing', points: 0 } };
    expect(totals(p)).toMatchObject({ total: 300, level: 2, toNext: 300 });
  });
});

describe('datum', () => {
  it('rekent in Nederlandse tijd', () => {
    // 23:30 UTC op 17 nov is al 18 nov in Amsterdam
    expect(amsterdamDate(new Date('2026-11-17T23:30:00Z'))).toBe('2026-11-18');
    expect(amsterdamDate(new Date('2026-11-17T22:59:00Z'))).toBe('2026-11-17');
    // zomertijd: 22:30 UTC in juli is al de volgende dag
    expect(amsterdamDate(new Date('2026-07-01T22:30:00Z'))).toBe('2026-07-02');
  });
  it('dagnummer vanaf de startdatum', () => {
    expect(dayNumberFor('2026-11-17', '2026-11-17')).toBe(1);
    expect(dayNumberFor('2026-12-16', '2026-11-17')).toBe(30);
    expect(dayNumberFor('2026-11-16', '2026-11-17')).toBe(0);
    expect(dayNumberFor('2027-03-29', '2027-03-27')).toBe(3); // over zomertijdwissel heen
  });
});

describe('reserve en blast', () => {
  it('kiest een ongezien reservewoord', () => {
    const p = emptyProgress();
    expect(nextReserve(content, p)?.id).toBe('W31');
    p.days['1'] = { seen: {}, replacements: ['W31'] };
    expect(nextReserve(content, p)?.id).toBe('W32');
  });
  it('alleen woorden die minstens zeven dagen bewaard zijn', () => {
    const p = emptyProgress();
    p.words.W01 = { saved: true, savedDay: 1 };
    expect(blastCandidates(content, p, 7)).toEqual([]);
    expect(blastCandidates(content, p, 8)).toEqual(['W01']);
    p.words.W01.blastDone = true;
    expect(blastCandidates(content, p, 9)).toEqual([]);
  });
  it('hooguit één gouden kaart per week', () => {
    const p = emptyProgress();
    p.days['8'] = { seen: {}, blast: { wordId: 'W01' } };
    expect(blastAllowed(p, 14)).toBe(false);
    expect(blastAllowed(p, 15)).toBe(true);
  });
});

describe('opslag valideren', () => {
  it('weigert onzin en onbekende versies', () => {
    expect(() => validateProgress('kapot')).toThrow();
    expect(() => validateProgress({ ...emptyProgress(), version: 99 })).toThrow();
  });
  it('houdt onbekende ID\'s vast (voor een latere import)', () => {
    const p = emptyProgress();
    p.words.W999 = { saved: true, opened: 3 };
    expect(validateProgress(JSON.parse(JSON.stringify(p))).words.W999.saved).toBe(true);
  });
});
