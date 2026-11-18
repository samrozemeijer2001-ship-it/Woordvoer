import { useEffect, useState } from 'react';
import { MAX_ATTEMPTS, TOTAL_DAYS } from '../config';
import { dateForDay, formatLong } from '../date';
import { go } from '../router';
import { useStore } from '../store';
import { totals, wordIdForDay } from '../rules';
import { Face, type Expr } from '../ui/Face';
import { IconBack, IconCheck } from '../ui/Icons';
import { Avatar, Btn, IconBtn, Meta, Tile, haptic, pairStyle } from '../ui/kit';
import { PAIRS, type PairName } from '../ui/palette';

export function TopBar() {
  const { progress } = useStore();
  const t = totals(progress);
  const name = progress.profile?.name;
  return (
    <button className="topbar enter" onClick={() => { haptic(); go('/voortgang'); }} aria-label={`Level ${t.level}, ${t.total} punten. Bekijk je voortgang`}>
      <Avatar id={progress.profile?.character} size={46} />
      <span className="topbar-text">
        <span className="display topbar-level">LEVEL {t.level}</span>
        <span className="topbar-sub">{name ? `${name}, ${t.total} punten` : 'Geef jezelf een naam'}</span>
      </span>
      <span className="topbar-pts display" aria-hidden>{t.toNext}<small>TOT LEVEL {t.level + 1}</small></span>
    </button>
  );
}

export function TodayScreen() {
  const { today } = useStore();
  if (today < 1) {
    return (
      <main className="screen paper">
        <TopBar />
        <section className="center-block enter">
          <Tile pair="lilac" expr="sleepy" size={120} />
          <h1 className="display h-xl">NOG EVEN<br />GEDULD</h1>
          <p className="lead">De eerste Woordpost komt op {formatLong(dateForDay(1))}. Kom dan terug voor je eerste pakketje.</p>
        </section>
      </main>
    );
  }
  if (today > TOTAL_DAYS) {
    return (
      <main className="screen paper">
        <TopBar />
        <section className="panel-black enter" style={pairStyle('black')}>
          <Face expr="relieved" color="#ffd84a" size={96} />
          <h1 className="display h-xl">DE TESTMAAND<br />IS AFGELOPEN</h1>
          <p className="lead">Dertig dagen post, klaar. Alles wat je hebt geopend en gespeeld staat nog in het archief.</p>
          <Btn pair="yellow" onClick={() => go('/archief')}>Naar het archief</Btn>
        </section>
      </main>
    );
  }
  return <DayView day={today} isToday />;
}

export function DayScreen({ day }: { day: number }) {
  const { today } = useStore();
  if (day === today) return <DayView day={day} isToday />;
  if (day < 1 || day > TOTAL_DAYS || day > today) {
    return (
      <main className="screen paper">
        <div className="bar"><IconBtn label="Terug naar het archief" onClick={() => go('/archief')}><IconBack /></IconBtn></div>
        <section className="center-block enter">
          <Tile pair="sky" expr="meh" size={110} />
          <h1 className="display h-l">{day > today && day <= TOTAL_DAYS ? 'NOG DICHT' : 'DEZE DAG BESTAAT NIET'}</h1>
          {day > today && day <= TOTAL_DAYS && <p className="lead">Dag {day} komt op {formatLong(dateForDay(day))}.</p>}
          <Btn pair="cobalt" onClick={() => go('/archief')}>Terug naar het archief</Btn>
        </section>
      </main>
    );
  }
  return <DayView day={day} />;
}

function DayView({ day, isToday = false }: { day: number; isToday?: boolean }) {
  const { progress, actions } = useStore();
  const opened = !!progress.days[day]?.openedAt;
  const [justOpened, setJustOpened] = useState(false);

  useEffect(() => { if (opened) actions.ensureBlast(day); }, [opened, day, actions]);

  return (
    <main className="screen paper">
      {isToday ? <TopBar /> : (
        <div className="bar"><IconBtn label="Terug naar het archief" onClick={() => go('/archief')}><IconBack /></IconBtn></div>
      )}
      <Meta className="dateline">{formatLong(dateForDay(day))}, dag {day} van {TOTAL_DAYS}</Meta>
      {opened ? <Package day={day} animate={justOpened} /> : (
        <Envelope day={day} isToday={isToday} onOpened={() => setJustOpened(true)} />
      )}
    </main>
  );
}

function Envelope({ day, isToday, onOpened }: { day: number; isToday: boolean; onOpened: () => void }) {
  const { actions, toast } = useStore();
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    haptic(true);
    setOpening(true);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      onOpened();
      if (!actions.openPackage(day)) toast('Openen is niet opgeslagen. Je ziet het nu wel.');
    }, reduced ? 0 : 720);
  };
  return (
    <section className="envelope-block">
      <h1 className="display h-xl enter">{isToday ? <>JE POST<br />LIGT KLAAR</> : <>NOG NIET<br />GEOPEND</>}</h1>
      <div className={`envelope ${opening ? 'is-opening' : ''}`} aria-hidden>
        <div className="env-body">
          <div className="env-card" />
          <svg className="env-flap" viewBox="0 0 300 150" preserveAspectRatio="none">
            <path d="M16 8 L150 118 L284 8" fill="rgba(163,48,15,.16)" stroke="rgba(163,48,15,.16)" strokeWidth="16" strokeLinejoin="round" />
          </svg>
          <svg className="env-front" viewBox="0 0 300 200" preserveAspectRatio="none">
            <path d="M14 192 L150 96 L286 192" fill="none" stroke="rgba(163,48,15,.12)" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <span className="env-seal"><Tile pair="yellow" expr="smirk" size={74} /></span>
        </div>
      </div>
      <Btn pair="cobalt" strong onClick={open} disabled={opening} className="enter">Open je pakketje</Btn>
    </section>
  );
}

interface TileDef { kind: 'woord' | 'spreekwoord' | 'wildcard' | 'blast'; label: string; pair: PairName; expr: Expr; status: string; done: boolean }

function Package({ day, animate }: { day: number; animate: boolean }) {
  const { content, progress } = useStore();
  const plan = content.day.get(day)!;
  const ds = progress.days[day] ?? { seen: {} };
  const puz = progress.puzzles[plan.wildcardId];
  const wordId = wordIdForDay(content, progress, day)!;
  const wildStatus = !puz || (puz.status === 'playing' && puz.attempts === 0 && !puz.hint)
    ? `${MAX_ATTEMPTS} kansen, nog niet gespeeld`
    : puz.status === 'playing' ? `Bezig, nog ${MAX_ATTEMPTS - puz.attempts} ${MAX_ATTEMPTS - puz.attempts === 1 ? 'kans' : 'kansen'}`
      : puz.status === 'won' ? `Geraden, ${puz.points} punten` : 'Niet geraden, 0 punten';

  const tiles: TileDef[] = [
    { kind: 'woord', label: 'DUUR WOORD', pair: 'mint', expr: 'relieved', status: ds.seen.woord || progress.words[wordId]?.opened ? 'Bekeken' : 'Nieuw', done: !!(ds.seen.woord) },
    { kind: 'spreekwoord', label: 'SPREEKWOORD', pair: 'sky', expr: 'meh', status: ds.seen.spreekwoord ? 'Bekeken' : 'Nieuw', done: !!ds.seen.spreekwoord },
    { kind: 'wildcard', label: 'WILDCARD', pair: 'cobalt', expr: puz?.status === 'won' ? 'stars' : puz?.status === 'lost' ? 'panic' : 'smirk', status: wildStatus, done: !!puz && puz.status !== 'playing' },
  ];
  if (ds.blast) tiles.push({ kind: 'blast', label: 'BLAST FROM THE PAST', pair: 'yellow', expr: 'stars', status: ds.blast.result ? 'Herhaald' : 'Gouden bonuskaart', done: !!ds.blast.result });

  return (
    <section className="package" aria-label="Je pakketje">
      <h1 className="display h-l enter">{tiles.length === 4 ? 'VIER KAARTEN' : 'DRIE KAARTEN'}</h1>
      <ul className="pkg-list">
        {tiles.map((t, i) => (
          <li key={t.kind} className={animate ? 'deal' : 'enter'} style={{ animationDelay: `${(animate ? 90 : 30) * i}ms` }}>
            <button className={`pkg-tile ${t.kind === 'blast' ? 'gold' : ''}`} style={pairStyle(t.pair)} onClick={() => { haptic(); go(`/dag/${day}/${t.kind}`); }}>
              <span className="pkg-text">
                <span className="display pkg-label">{t.label}</span>
                <span className="pkg-status">{t.done && <IconCheck size={18} />}{t.status}</span>
              </span>
              <Face expr={t.expr} color={PAIRS[t.pair].ink} size={70} alive={i === 0 || t.kind === 'blast'} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
