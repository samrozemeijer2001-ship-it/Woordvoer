import { useEffect, useState } from 'react';
import { type ContentResult, loadContent } from './content';
import { clearTestDay } from './date';
import { type LoadResult, loadProgress } from './progress';
import { go, type Route, useRoute } from './router';
import { StoreProvider, useStore } from './store';
import { ArchiveScreen } from './screens/Archive';
import { CardScreen, Missing } from './screens/Cards';
import { ProgressScreen } from './screens/Progress';
import { ReviewProverb, SavedProverb, SavedScreen, SavedWord } from './screens/Saved';
import { DayScreen, TodayScreen } from './screens/Today';
import { SharedPuzzle } from './screens/Wildcard';
import { Face } from './ui/Face';
import { IconBookmark, IconCalendar, IconPost } from './ui/Icons';
import { Btn, haptic } from './ui/kit';

export function App() {
  const [content, setContent] = useState<ContentResult | null>(null);
  const [prog] = useState<LoadResult>(() => loadProgress());
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { setContent(null); loadContent().then(setContent); }, [attempt]);

  if (!content) return <main className="screen paper center-block" aria-busy="true"><Face expr="sleepy" color="#141210" size={80} /><p className="lead">Post ophalen</p></main>;
  if (!content.ok) {
    return (
      <main className="screen paper">
        <section className="center-block enter">
          <Face expr="panic" color="#141210" size={110} />
          <h1 className="display h-xl">DE POST IS<br />NIET AANGEKOMEN</h1>
          <p className="lead">De dagpost laden lukte niet. Je opgeslagen voortgang blijft gewoon staan; er is niets gewist of overschreven.</p>
          <p className="toggle-sub">Foutmelding: {content.error}</p>
          <Btn pair="cobalt" onClick={() => {
            const u = new URL(location.href);
            if (u.searchParams.get('simuleer')) { u.searchParams.delete('simuleer'); location.replace(u.toString()); } else setAttempt((a) => a + 1);
          }}>Probeer opnieuw</Btn>
        </section>
      </main>
    );
  }
  return (
    <StoreProvider content={content.content} initial={prog.progress} loadStatus={prog.status}>
      <Shell fromCache={content.fromCache} />
    </StoreProvider>
  );
}

function Shell({ fromCache }: { fromCache: boolean }) {
  const route = useRoute();
  const { toasts, testDay, loadStatus, resetUnreadable } = useStore();
  const tab = tabFor(route);
  return (
    <div className={`app ${tab ? 'has-tabs' : ''}`}>
      {testDay != null && (
        <div className="testbar" role="status">
          <span>Testdag {testDay}. Alleen in deze browser, de gedeelde planning verandert niet.</span>
          <button onClick={clearTestDay}>Stop</button>
        </div>
      )}
      {loadStatus === 'hersteld' && <div className="notice" role="status">Je voortgang was beschadigd. De laatst geldige kopie is geladen.</div>}
      {loadStatus === 'geen-opslag' && <div className="notice" role="alert">Opslaan werkt niet in deze browser, bijvoorbeeld in privé-modus. Je voortgang blijft niet bewaard.</div>}
      {loadStatus === 'onleesbaar' && (
        <div className="notice" role="alert">
          Je opgeslagen voortgang is onleesbaar. Er wordt niets overschreven tot je kiest.
          <button className="link-btn" onClick={resetUnreadable}>Opnieuw beginnen</button>
        </div>
      )}
      {fromCache && <div className="notice" role="status">Nieuwe post laden lukte niet. Je ziet de laatst opgehaalde versie.</div>}
      <Screen route={route} />
      {tab && <Tabs active={tab} />}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
      </div>
    </div>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'vandaag': return <TodayScreen />;
    case 'dag': return <DayScreen day={route.day} />;
    case 'kaart': return <CardScreen day={route.day} kind={route.kind} />;
    case 'puzzel': return <SharedPuzzle id={route.id} />;
    case 'bewaard': return <SavedScreen />;
    case 'bewaard-woord': return <SavedWord id={route.id} />;
    case 'bewaard-spreekwoord': return <SavedProverb id={route.id} />;
    case 'herhaal': return <ReviewProverb id={route.id} />;
    case 'archief': return <ArchiveScreen />;
    case 'voortgang': return <ProgressScreen />;
    default: return <Missing back={{ path: '/', label: 'Naar Vandaag' }} title="PAGINA NIET GEVONDEN" text="Deze link klopt niet." />;
  }
}

type Tab = 'vandaag' | 'bewaard' | 'archief';
function tabFor(r: Route): Tab | null {
  if (r.name === 'vandaag' || r.name === 'voortgang') return 'vandaag';
  if (r.name === 'bewaard') return 'bewaard';
  if (r.name === 'archief' || r.name === 'dag') return 'archief';
  return null;
}

function Tabs({ active }: { active: Tab }) {
  const items: [Tab, string, string, JSX.Element][] = [
    ['vandaag', 'Vandaag', '/', <IconPost key="p" />],
    ['bewaard', 'Bewaard', '/bewaard', <IconBookmark key="b" />],
    ['archief', 'Archief', '/archief', <IconCalendar key="c" />],
  ];
  return (
    <nav className="tabs" aria-label="Hoofdmenu">
      {items.map(([id, label, path, icon]) => (
        <a key={id} href={`#${path}`} className={`tab ${active === id ? 'on' : ''}`} aria-current={active === id ? 'page' : undefined}
          onClick={(e) => { e.preventDefault(); haptic(); go(path); }}>
          {icon}<span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
