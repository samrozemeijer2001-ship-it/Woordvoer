import { useMemo, useState } from 'react';
import { go } from '../router';
import { useStore } from '../store';
import { Face } from '../ui/Face';
import { IconBack, IconRepeat, IconSearch } from '../ui/Icons';
import { Btn, IconBtn, Meta, Tile, haptic, pairStyle } from '../ui/kit';
import { PAIRS } from '../ui/palette';
import { Missing, ProverbCard, WordCard } from './Cards';

type Filter = 'alles' | 'woorden' | 'spreekwoorden';

export function SavedScreen() {
  const { content, progress } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('alles');

  const items = useMemo(() => {
    const words = Object.entries(progress.words).filter(([id, s]) => s.saved && content.word.has(id))
      .map(([id, s]) => ({ kind: 'woord' as const, id, title: content.word.get(id)!.woord, text: content.word.get(id)!.betekenis, at: s.savedAt ?? 0 }));
    const provs = Object.entries(progress.proverbs).filter(([id, s]) => s.saved && content.proverb.has(id))
      .map(([id, s]) => ({ kind: 'spreekwoord' as const, id, title: content.proverb.get(id)!.spreekwoord, text: content.proverb.get(id)!.betekenis, at: s.savedAt ?? 0 }));
    return [...words, ...provs].sort((a, b) => b.at - a.at);
  }, [content, progress]);

  const needle = q.trim().toLowerCase();
  const shown = items.filter((i) =>
    (filter === 'alles' || (filter === 'woorden' ? i.kind === 'woord' : i.kind === 'spreekwoord')) &&
    (!needle || i.title.toLowerCase().includes(needle) || i.text.toLowerCase().includes(needle)));

  return (
    <main className="screen paper">
      <h1 className="display h-xl page-title enter">BEWAARD</h1>
      {items.length === 0 ? (
        <section className="empty enter">
          <Tile pair="lilac" expr="sleepy" size={96} />
          <p className="lead">Nog niks bewaard. Tik op het bladwijzertje op een woord of spreekwoord, dan komt hij hier te staan.</p>
          <Btn pair="cobalt" onClick={() => go('/')}>Naar je post van vandaag</Btn>
        </section>
      ) : (
        <>
          <div className="search enter">
            <label htmlFor="zoek" className="sr-only">Zoek op woord, spreekwoord of betekenis</label>
            <IconSearch />
            <input id="zoek" className="field" type="search" placeholder="Zoek op woord of betekenis" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="segment enter" role="radiogroup" aria-label="Soort kaart">
            {(['alles', 'woorden', 'spreekwoorden'] as Filter[]).map((f) => (
              <button key={f} role="radio" aria-checked={filter === f} className={filter === f ? 'on' : ''} onClick={() => { haptic(); setFilter(f); }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">{shown.length} kaarten gevonden</p>
          {shown.length === 0 ? (
            <p className="lead enter">Niks gevonden voor ‘{q}’.</p>
          ) : (
            <ul className="menu">
              {shown.map((i, n) => (
                <li key={i.kind + i.id} className="enter" style={{ animationDelay: `${Math.min(n, 8) * 30}ms` }}>
                  <button className="menu-item" onClick={() => { haptic(); go(`/bewaard/${i.kind}/${i.id}`); }}>
                    <Tile pair={i.kind === 'woord' ? 'mint' : 'sky'} expr={i.kind === 'woord' ? 'relieved' : 'meh'} size={48} alive={false} />
                    <span className="menu-text">
                      <span className="display menu-title">{i.title.toUpperCase()}</span>
                      <span className="menu-sub">{i.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}

const savedBack = { path: '/bewaard', label: 'Terug naar Bewaard' };

export function SavedWord({ id }: { id: string }) {
  return <WordCard id={id} day={null} back={savedBack} />;
}

export function SavedProverb({ id }: { id: string }) {
  return (
    <ProverbCard id={id} day={null} back={savedBack} extra={
      <div className="enter d3 review-cta">
        <Btn pair="cobalt" onClick={() => go(`/bewaard/herhaal/${id}`)}><IconRepeat /> Herhaal dit spreekwoord</Btn>
      </div>
    } />
  );
}

export function ReviewProverb({ id }: { id: string }) {
  const { content, progress, actions, toast } = useStore();
  const p = content.proverb.get(id);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);
  if (!p) return <Missing back={savedBack} />;
  const ink = PAIRS.lilac.ink;
  const answer = (knew: boolean) => {
    haptic(true);
    if (actions.proverbReview(id, knew)) { setDone(knew); toast(knew ? 'Telt mee bij je onthouden spreekwoorden.' : 'Geen probleem. Herhaal hem later nog eens.'); }
  };
  const reviews = progress.proverbs[id]?.reviews?.length ?? 0;
  return (
    <main className="screen color" style={pairStyle('lilac')}>
      <div className="bar"><IconBtn label="Terug naar het spreekwoord" onClick={() => go(`/bewaard/spreekwoord/${id}`)}><IconBack /></IconBtn></div>
      <article className="card-body">
        <Meta className="enter">HERHALING{reviews ? `, KEER ${reviews + (done == null ? 1 : 0)}` : ''}</Meta>
        <h1 className="display h-proverb enter">{p.spreekwoord.toUpperCase()}</h1>
        {!shown ? (
          <>
            <p className="meaning enter d1">Wat betekent dit ook alweer? Bedenk het eerst zelf.</p>
            <Face expr="sleepy" color={ink} size={96} className="enter d2" />
            <Btn pair="cobalt" onClick={() => { haptic(); setShown(true); }}>Toon de betekenis</Btn>
          </>
        ) : (
          <>
            <div className="example reveal">
              <Meta className="sub-meta">BETEKENIS</Meta>
              <p className="meaning">{p.betekenis}</p>
            </div>
            {done == null ? (
              <>
                <p className="meaning enter">Wist je het nog?</p>
                <div className="two-btns">
                  <Btn pair="mint" onClick={() => answer(true)}>Wist ik nog</Btn>
                  <Btn variant="soft" onClick={() => answer(false)}>Wist ik niet meer</Btn>
                </div>
              </>
            ) : (
              <>
                <Face expr={done ? 'happy' : 'relieved'} color={ink} size={96} pop />
                <Btn pair="cobalt" onClick={() => go('/bewaard')}>Terug naar Bewaard</Btn>
              </>
            )}
          </>
        )}
      </article>
    </main>
  );
}
