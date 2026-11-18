import { TOTAL_DAYS } from '../config';
import { dateForDay, formatLong, formatShort } from '../date';
import { go } from '../router';
import { useStore } from '../store';
import { IconLock } from '../ui/Icons';
import { Tile, haptic } from '../ui/kit';

export function ArchiveScreen() {
  const { content, progress, today } = useStore();
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => content.day.has(d));
  const opened = days.filter((d) => progress.days[d]?.openedAt).length;
  return (
    <main className="screen paper">
      <h1 className="display h-xl page-title enter">ARCHIEF</h1>
      <p className="lead enter">
        {today < 1 ? `De testmaand begint op ${formatLong(dateForDay(1))}.` : `${opened} van de ${Math.min(today, TOTAL_DAYS)} pakketjes geopend. Een gemist pakketje kun je hier alsnog openen.`}
      </p>
      <ul className="menu">
        {days.map((d, n) => {
          const future = d > today;
          const ds = progress.days[d];
          const puz = progress.puzzles[content.day.get(d)!.wildcardId];
          const status = future ? `Komt op ${formatShort(dateForDay(d))}`
            : ds?.openedAt ? (puz && puz.status !== 'playing' ? `Geopend, Wildcard ${puz.status === 'won' ? `geraden, ${puz.points} punten` : 'niet geraden'}` : 'Geopend')
              : d === today ? 'Vandaag, nog dicht' : 'Gemist, nog dicht';
          return (
            <li key={d} className="enter" style={{ animationDelay: `${Math.min(n, 10) * 25}ms` }}>
              <button className={`menu-item ${future ? 'locked' : ''}`} disabled={future} onClick={() => { haptic(); go(d === today ? '/' : `/dag/${d}`); }}
                aria-label={`Dag ${d}, ${formatLong(dateForDay(d))}. ${status}`}>
                {future ? <span className="lock-tile"><IconLock /></span>
                  : <Tile pair={ds?.openedAt ? 'mint' : 'yellow'} expr={ds?.openedAt ? (puz?.status === 'won' ? 'happy' : 'relieved') : 'smirk'} size={48} alive={false} />}
                <span className="menu-text">
                  <span className="display menu-title">DAG {d}<span className="menu-date">{formatShort(dateForDay(d))}</span></span>
                  <span className="menu-sub">{status}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
