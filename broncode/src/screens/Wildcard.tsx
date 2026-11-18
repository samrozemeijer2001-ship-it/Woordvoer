import { type FormEvent, useEffect, useRef, useState } from 'react';
import { HINT_PENALTY, MAX_ATTEMPTS, POINTS_PER_LEVEL } from '../config';
import { go } from '../router';
import { useStore } from '../store';
import { freshPuzzle, hintLetters, letterCount, resultShareText, shareNumber, totals } from '../rules';
import { puzzleUrl, shareText, shareToast } from '../share';
import { Face } from '../ui/Face';
import { IconBack, IconBulb, IconChat, IconShare } from '../ui/Icons';
import { Btn, Bump, IconBtn, LevelBar, Meta, Sheet, haptic, pairStyle } from '../ui/kit';
import { PAIRS } from '../ui/palette';
import { Missing } from './Cards';

type Back = { path: string; label: string };

/** Puzzel via een gedeelde link. Gebruikt dezelfde voortgang als via Vandaag of Archief. */
export function SharedPuzzle({ id }: { id: string }) {
  const { content, today } = useStore();
  const p = content.puzzle.get(id);
  const back = { path: '/', label: 'Naar Vandaag' };
  if (!p) return <Missing back={back} title="ONBEKENDE WILDCARD" text="Deze link verwijst naar een puzzel die niet bestaat." />;
  if (p.dag > today) return <Missing back={back} title="NOG NIET BESCHIKBAAR" text={`Wildcard ${shareNumber(p)} is nog niet vrijgegeven. Probeer het later nog eens.`} />;
  return <WildcardScreen id={id} day={null} back={back} />;
}

export function WildcardScreen({ id, day, back }: { id: string; day: number | null; back: Back }) {
  const { content, progress, actions, toast } = useStore();
  const puzzle = content.puzzle.get(id)!;
  const st = progress.puzzles[id] ?? freshPuzzle();
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState('');
  const [shake, setShake] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const hints = st.hint ? hintLetters(puzzle) : new Map<number, string>();
  const left = MAX_ATTEMPTS - st.attempts;

  useEffect(() => { if (day != null) actions.seeKind(day, 'wildcard'); }, [day, actions]);

  if (st.status !== 'playing') return <ResultView id={id} back={back} />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = letterCount(value);
    const r = actions.guess(id, value);
    switch (r.outcome) {
      case 'leeg': setMsg('Typ eerst een woord. Dat kost geen poging.'); setShake((x) => x + 1); break;
      case 'lengte': setMsg(`Je typte ${n} ${n === 1 ? 'letter' : 'letters'}, het woord heeft er ${puzzle.letters}. Dat kost geen poging.`); setShake((x) => x + 1); break;
      case 'fout': {
        haptic(true);
        const l = MAX_ATTEMPTS - (st.attempts + 1);
        setMsg(`Niet goed. Nog ${l} ${l === 1 ? 'kans' : 'kansen'}.`);
        setValue('');
        setShake((x) => x + 1);
        input.current?.focus();
        break;
      }
      case 'geraden': haptic(true); setMsg(''); break;
      case 'verloren': haptic(true); setMsg(''); break;
      default: break;
    }
    if (!r.ok) toast('Let op: deze poging is niet opgeslagen.');
  };

  const useHint = () => {
    setHintOpen(false);
    haptic(true);
    actions.hint(id);
    setMsg('');
    setTimeout(() => input.current?.focus(), 50);
  };

  const typed = [...value.trim().toUpperCase()];
  const ink = PAIRS.cobalt.ink;

  return (
    <main className="screen color" style={pairStyle('cobalt')}>
      <div className="bar">
        <IconBtn label={back.label} onClick={() => go(back.path)}><IconBack /></IconBtn>
      </div>
      <article className="card-body">
        <Meta className="enter">WILDCARD {shareNumber(puzzle)}</Meta>
        <p className="riddle enter d1">{puzzle.raadsel}</p>

        <div className={`boxes enter d2 ${shake ? 'shake' : ''}`} key={shake} aria-label={`${puzzle.letters} letters${st.hint ? ', met hintletters' : ''}`} role="group">
          {Array.from({ length: puzzle.letters }, (_, i) => {
            const h = hints.get(i + 1);
            const t = typed[i];
            return (
              <span key={i} className={`box ${h ? 'hint' : ''} ${t && !h ? 'typed' : ''}`} aria-hidden>
                {t ?? h ?? ''}
              </span>
            );
          })}
        </div>
        <p className="wc-meta enter d2"><span className="display">{puzzle.letters} LETTERS</span>
          <span className="chances" aria-label={`Nog ${left} van de ${MAX_ATTEMPTS} kansen`}>
            {Array.from({ length: MAX_ATTEMPTS }, (_, i) => <span key={i} className={`chance ${i < left ? 'on' : ''}`} />)}
            <span className="display"><Bump value={left} /> {left === 1 ? 'KANS' : 'KANSEN'}</span>
          </span>
        </p>

        <form className="guess enter d3" onSubmit={submit} noValidate>
          <label htmlFor="gok" className="label">Jouw antwoord</label>
          <input
            id="gok" ref={input} className="field display" value={value} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            maxLength={puzzle.letters + 6} placeholder={`${puzzle.letters} letters`} enterKeyHint="go"
            onChange={(e) => { setValue(e.target.value); if (msg) setMsg(''); }}
            aria-describedby="wc-msg"
          />
          <p id="wc-msg" className="wc-msg" role="status" aria-live="polite">{msg}</p>
          <Btn pair="yellow" type="submit" strong>Doe een gok</Btn>
        </form>

        {!st.hint ? (
          <button className="hint-btn enter d3" onClick={() => { haptic(); setHintOpen(true); }}>
            <IconBulb /> <span><span className="display">VRAAG EEN HINT</span><span className="toggle-sub">Kost geen poging. Goed geraden met hint levert {HINT_PENALTY} punten minder op.</span></span>
          </button>
        ) : (
          <p className="hint-used" role="status"><IconBulb size={20} /> Hint gebruikt: {[...hints.entries()].map(([p, l]) => `${l} op plek ${p}`).join(' en ')}.</p>
        )}
        <Face expr={left === 1 ? 'shock' : left === 2 ? 'meh' : 'smirk'} color={ink} size={84} className="card-face" />
      </article>

      <Sheet open={hintOpen} onClose={() => setHintOpen(false)} title="HINT GEBRUIKEN?">
        <p className="sheet-text">Je krijgt {puzzle.letters <= 5 ? 'één letter' : 'twee letters'} te zien. Het kost geen poging, maar een goed antwoord levert {HINT_PENALTY} punten minder op. Je kunt de hint maar één keer gebruiken.</p>
        <div className="two-btns">
          <Btn pair="yellow" onClick={useHint}>Toon de hint</Btn>
          <Btn variant="soft" onClick={() => setHintOpen(false)}>Laat maar</Btn>
        </div>
      </Sheet>
    </main>
  );
}

function ResultView({ id, back }: { id: string; back: Back }) {
  const { content, progress, toast } = useStore();
  const puzzle = content.puzzle.get(id)!;
  const st = progress.puzzles[id]!;
  const won = st.status === 'won';
  const t = totals(progress);
  const pair = won ? 'mint' : 'orange';
  const name = progress.profile?.name;

  const doShare = async (text: string, url?: string) => {
    const r = await shareText(text, url);
    const m = shareToast[r];
    if (m) toast(m);
  };

  return (
    <main className="screen color" style={pairStyle(pair)}>
      <div className="bar">
        <IconBtn label={back.label} onClick={() => go(back.path)}><IconBack /></IconBtn>
      </div>
      <article className="card-body result">
        <Meta className="enter">WILDCARD {shareNumber(puzzle)}</Meta>
        <Face expr={won ? (st.attempts === 1 && !st.hint ? 'stars' : 'happy') : 'panic'} color={PAIRS[pair].ink} size={120} pop />
        <h1 className={`display h-xl ${won ? 'enter' : 'jitter'}`}>{won ? 'GERADEN' : 'NIET GERADEN'}</h1>

        <div className="answer enter d1">
          <Meta className="sub-meta">HET WOORD WAS</Meta>
          <p className="display h-answer" style={{ '--n': puzzle.letters } as React.CSSProperties}>{puzzle.antwoord.toUpperCase()}</p>
          <p className="meaning">{puzzle.uitleg}</p>
        </div>

        <div className="points-row enter d2">
          <div className="points-tile" style={pairStyle('yellow')}>
            <span className="display points-num">+<Bump value={st.points} /></span>
            <span className="display points-lbl">PUNTEN</span>
          </div>
          <p className="points-detail">
            {won ? `Poging ${st.attempts} van ${MAX_ATTEMPTS}` : `${MAX_ATTEMPTS} pogingen gebruikt`}
            <br />{st.hint ? 'Met hint' : 'Zonder hint'}
          </p>
        </div>

        <div className="level-block enter d3">
          <p className="level-line"><span className="display">LEVEL {t.level}</span><span>{t.total} punten totaal</span></p>
          <LevelBar inLevel={t.inLevel} max={POINTS_PER_LEVEL} label={`Voortgang naar level ${t.level + 1}`} />
          <p className="toggle-sub">Nog {t.toNext} punten tot level {t.level + 1}.</p>
        </div>

        <div className="stack enter d3">
          <Btn pair="yellow" onClick={() => doShare(resultShareText(puzzle, st))}><IconShare /> Deel je resultaat</Btn>
          <Btn pair="cobalt" onClick={() => doShare(`${name ? `${name} daagt je uit` : 'Ik daag je uit'} voor Wildcard ${shareNumber(puzzle)} van Woordpost. Drie kansen. Succes.`, puzzleUrl(id))}>
            <IconChat /> Daag een vriend uit
          </Btn>
        </div>
      </article>
    </main>
  );
}
