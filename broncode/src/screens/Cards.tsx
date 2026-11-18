import { useEffect, useState } from 'react';
import { TOTAL_DAYS } from '../config';
import { go } from '../router';
import { useStore } from '../store';
import { wordIdForDay } from '../rules';
import { shareText, shareToast } from '../share';
import { Face } from '../ui/Face';
import { IconBack, IconBookmark, IconCheck, IconShare } from '../ui/Icons';
import { Btn, IconBtn, Meta, haptic, pairStyle } from '../ui/kit';
import { PAIRS } from '../ui/palette';

export const quoted = (s: string) => (/^[‘'“"]/.test(s) ? s : `‘${s}’`);
import { DayScreen } from './Today';
import { WildcardScreen } from './Wildcard';

export function backFor(day: number, today: number) {
  return day === today ? { path: '/', label: 'Terug naar je pakketje' } : { path: `/dag/${day}`, label: `Terug naar dag ${day}` };
}

export function CardScreen({ day, kind }: { day: number; kind: 'woord' | 'spreekwoord' | 'wildcard' | 'blast' }) {
  const { content, progress, today } = useStore();
  const plan = content.day.get(day);
  if (!plan || day > today || day < 1 || day > TOTAL_DAYS || !progress.days[day]?.openedAt) return <DayScreen day={day} />;
  const back = backFor(day, today);
  if (kind === 'woord') return <WordCard id={wordIdForDay(content, progress, day)!} day={day} back={back} />;
  if (kind === 'spreekwoord') return <ProverbCard id={plan.spreekwoordId} day={day} back={back} />;
  if (kind === 'wildcard') return <WildcardScreen id={plan.wildcardId} day={day} back={back} />;
  if (kind === 'blast' && progress.days[day]?.blast) return <BlastCard day={day} back={back} />;
  return <DayScreen day={day} />;
}

type Back = { path: string; label: string };

function CardBar({ back, children }: { back: Back; children?: React.ReactNode }) {
  return (
    <div className="bar">
      <IconBtn label={back.label} onClick={() => go(back.path)}><IconBack /></IconBtn>
      <span className="bar-actions">{children}</span>
    </div>
  );
}

function useShare() {
  const { toast } = useStore();
  return async (text: string, url?: string) => {
    const r = await shareText(text, url);
    const m = shareToast[r];
    if (m) toast(m);
  };
}

export function WordCard({ id, day, back }: { id: string; day: number | null; back: Back }) {
  const { content, progress, actions, toast } = useStore();
  const w = content.word.get(id);
  const st = progress.words[id] ?? {};
  const share = useShare();

  useEffect(() => { if (w) actions.seeWord(day, id); }, [id, day, w, actions]);

  if (!w) return <Missing back={back} />;

  const save = () => {
    const r = actions.toggleSaveWord(id);
    if (r.ok) toast(r.saved ? 'Bewaard.' : 'Uit Bewaard gehaald.');
  };
  const used = () => {
    const r = actions.toggleUsed(id);
    if (r.ok && r.used) toast('Genoteerd. Mooi gebruikt.');
  };
  const know = () => {
    if (day == null) return;
    haptic(true);
    const r = actions.knowWord(day);
    if (!r.ok) return;
    if (r.replacement) toast(`Nieuw woord: ${content.word.get(r.replacement)!.woord}.`);
    else toast('De reservewoorden zijn op. Dit woord blijft staan.');
  };

  return (
    <main className="screen color" style={pairStyle('mint')}>
      <CardBar back={back}>
        <IconBtn label={st.saved ? 'Haal uit Bewaard' : 'Bewaar dit woord'} pressed={!!st.saved} onClick={save}><IconBookmark filled={st.saved} /></IconBtn>
        <IconBtn label="Deel dit woord" onClick={() => share(`${w.woord}\n${w.betekenis}\n${quoted(w.voorbeeldzin)}\n\nUit Woordpost`)}><IconShare /></IconBtn>
      </CardBar>
      <article className="card-body" key={id}>
        <Meta className="enter">DUUR WOORD{st.known != null ? ', JE KENDE HEM AL' : ''}</Meta>
        <h1 className="display h-word enter" lang="nl" style={{ '--n': w.woord.length } as React.CSSProperties}>{w.woord.toUpperCase()}</h1>
        <p className="meaning enter d1">{w.betekenis}</p>
        <blockquote className="example enter d2">{quoted(w.voorbeeldzin)}</blockquote>
        <div className="card-actions enter d3">
          {day != null && st.known == null && (
            <Btn variant="soft" onClick={know}>Ken ik al</Btn>
          )}
          <button className={`toggle ${st.used != null ? 'on' : ''}`} aria-pressed={st.used != null} onClick={() => { haptic(); used(); }}>
            <span className="toggle-box">{st.used != null && <IconCheck size={20} />}</span>
            <span><span className="display toggle-title">ZELF GEBRUIKT</span><span className="toggle-sub">Je hebt dit woord zelf in een gesprek of tekst gebruikt</span></span>
          </button>
        </div>
        <Face expr={st.used != null ? 'stars' : 'relieved'} color={PAIRS.mint.ink} size={92} className="card-face" />
      </article>
    </main>
  );
}

export function ProverbCard({ id, day, back, extra }: { id: string; day: number | null; back: Back; extra?: React.ReactNode }) {
  const { content, progress, actions, toast } = useStore();
  const p = content.proverb.get(id);
  const st = progress.proverbs[id] ?? {};
  const share = useShare();
  useEffect(() => { if (p) actions.seeProverb(day, id); }, [id, day, p, actions]);
  if (!p) return <Missing back={back} />;
  const save = () => {
    const r = actions.toggleSaveProverb(id);
    if (r.ok) toast(r.saved ? 'Bewaard.' : 'Uit Bewaard gehaald.');
  };
  return (
    <main className="screen color" style={pairStyle('sky')}>
      <CardBar back={back}>
        <IconBtn label={st.saved ? 'Haal uit Bewaard' : 'Bewaar dit spreekwoord'} pressed={!!st.saved} onClick={save}><IconBookmark filled={st.saved} /></IconBtn>
        <IconBtn label="Deel dit spreekwoord" onClick={() => share(`${p.spreekwoord}\n${p.betekenis}\n\nUit Woordpost`)}><IconShare /></IconBtn>
      </CardBar>
      <article className="card-body">
        <Meta className="enter">SPREEKWOORD</Meta>
        <h1 className="display h-proverb enter">{p.spreekwoord.toUpperCase()}</h1>
        <Meta className="enter d1 sub-meta">WAT HET BETEKENT</Meta>
        <p className="meaning enter d1">{p.betekenis}</p>
        <div className="example enter d2">
          <Meta className="sub-meta">ZO GEBRUIK JE HEM</Meta>
          <p>{p.situatie}</p>
        </div>
        {extra}
        <Face expr="meh" color={PAIRS.sky.ink} size={92} className="card-face" />
      </article>
    </main>
  );
}

function BlastCard({ day, back }: { day: number; back: Back }) {
  const { content, progress, actions, toast } = useStore();
  const b = progress.days[day]!.blast!;
  const w = content.word.get(b.wordId);
  const [flipped, setFlipped] = useState(!!b.result);
  useEffect(() => { actions.seeKind(day, 'blast'); }, [day, actions]);
  if (!w) return <Missing back={back} />;
  const ink = PAIRS.yellow.ink;
  const choose = (r: 'knew' | 'again') => {
    haptic(true);
    if (actions.blastResult(day, r)) toast(r === 'knew' ? 'Telt mee bij je onthouden woorden.' : 'Komt later nog eens langs.');
  };
  const known = progress.words[b.wordId]?.known != null;
  return (
    <main className="screen color" style={pairStyle('yellow')}>
      <CardBar back={back} />
      <article className="card-body">
        <Meta className="enter">BLAST FROM THE PAST</Meta>
        <div className={`flip ${flipped ? 'is-flipped' : ''}`}>
          <div className="flip-inner">
            <section className="flip-face flip-front" aria-hidden={flipped}>
              <p className="meaning">Dit woord heb je eerder bewaard. Weet je nog wat het betekent?</p>
              <h1 className="display h-word" style={{ '--n': w.woord.length } as React.CSSProperties}>{w.woord.toUpperCase()}</h1>
              <Face expr="stars" color={ink} size={96} />
              <Btn pair="cobalt" onClick={() => { haptic(); setFlipped(true); }} tabIndex={flipped ? -1 : 0}>Draai om</Btn>
            </section>
            <section className="flip-face flip-back" aria-hidden={!flipped}>
              <h1 className="display h-word" style={{ '--n': w.woord.length } as React.CSSProperties}>{w.woord.toUpperCase()}</h1>
              <p className="meaning">{w.betekenis}</p>
              <blockquote className="example">{quoted(w.voorbeeldzin)}</blockquote>
              {b.result ? (
                <p className="result-note"><IconCheck size={20} /> {b.result === 'knew'
                  ? known ? 'Je wist hem nog. Omdat je hem al kende, telt hij niet als nieuw onthouden woord.' : 'Je wist hem nog. Telt mee bij je onthouden woorden.'
                  : 'Hij komt later nog eens terug.'}</p>
              ) : (
                <div className="two-btns">
                  <Btn pair="mint" onClick={() => choose('knew')} tabIndex={flipped ? 0 : -1}>Wist ik nog</Btn>
                  <Btn variant="soft" onClick={() => choose('again')} tabIndex={flipped ? 0 : -1}>Nog eens laten terugkomen</Btn>
                </div>
              )}
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

export function Missing({ back, title = 'KAART NIET GEVONDEN', text = 'Deze kaart zit niet (meer) in de dagpost.' }: { back: Back; title?: string; text?: string }) {
  return (
    <main className="screen paper">
      <CardBar back={back} />
      <section className="center-block enter">
        <Face expr="shock" color="#141210" size={100} />
        <h1 className="display h-l">{title}</h1>
        <p className="lead">{text}</p>
        <Btn pair="cobalt" onClick={() => go(back.path)}>{back.label}</Btn>
      </section>
    </main>
  );
}
