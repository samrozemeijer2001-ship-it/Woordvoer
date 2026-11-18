import { useState } from 'react';
import { POINTS_PER_LEVEL } from '../config';
import { go } from '../router';
import { useStore } from '../store';
import { stats, totals } from '../rules';
import { CHARACTERS, characterById } from '../ui/characters';
import { IconBack } from '../ui/Icons';
import { Avatar, Btn, IconBtn, LevelBar, Meta, Sheet, Tile, haptic, pairStyle } from '../ui/kit';

export function ProgressScreen() {
  const { progress, loadStatus, testDay } = useStore();
  const [edit, setEdit] = useState(false);
  const t = totals(progress);
  const s = stats(progress);
  const char = characterById(progress.profile?.character);
  const rows: [string, number, string][] = [
    ['WOORDEN ONTDEKT', s.wordsDiscovered, 'Unieke woorden die je hebt geopend.'],
    ['NIEUWE WOORDEN ONTHOUDEN', s.wordsRemembered, 'Bij een latere herhaling wist je ze nog, en je kende ze niet al.'],
    ['WOORDEN ZELF GEBRUIKT', s.wordsUsed, 'Gebruikt in een gesprek of tekst.'],
    ['SPREEKWOORDEN ONTDEKT', s.proverbsDiscovered, 'Unieke spreekwoorden die je hebt geopend.'],
    ['SPREEKWOORDEN ONTHOUDEN', s.proverbsRemembered, 'Bij een herhaling wist je de betekenis nog.'],
  ];
  return (
    <main className="screen paper">
      <div className="bar"><IconBtn label="Terug naar Vandaag" onClick={() => go('/')}><IconBack /></IconBtn></div>

      <section className="profile-card enter">
        <Avatar id={char.id} size={96} />
        <div className="profile-text">
          <Meta>JOUW PROFIEL</Meta>
          <h1 className="display profile-name">{(progress.profile?.name || 'NAAMLOOS').toUpperCase()}</h1>
          <button className="link-btn" onClick={() => { haptic(); setEdit(true); }}>{progress.profile ? 'Pas aan' : 'Kies een naam en character'}</button>
        </div>
      </section>

      <section className="level-card enter d1" style={pairStyle('black')}>
        <Meta>VOORTGANG</Meta>
        <p className="display h-num">LEVEL {t.level}</p>
        <LevelBar inLevel={t.inLevel} max={POINTS_PER_LEVEL} label={`Voortgang naar level ${t.level + 1}`} />
        <p className="level-line"><span>{t.total} punten totaal</span><span>Nog {t.toNext} tot level {t.level + 1}</span></p>
        <p className="toggle-sub">{t.played} {t.played === 1 ? 'Wildcard' : 'Wildcards'} afgerond. Elke 300 punten een level hoger.</p>
      </section>

      <ul className="stats enter d2">
        {rows.map(([label, n, help]) => (
          <li key={label} className="stat">
            <span className="display stat-num">{n}</span>
            <span><span className="display stat-label">{label}</span><span className="menu-sub">{help}</span></span>
          </li>
        ))}
      </ul>
      <p className="note enter d3">‘Onthouden’ is wat je zelf aangeeft bij een herhaling. Een kaart alleen openen of bewaren telt als ontdekken.</p>

      <section className="storage enter d3">
        <Meta>OPSLAG</Meta>
        <p>Je voortgang staat alleen in deze browser op dit toestel. Wis je je browsergegevens of pak je een ander toestel, dan zie je je voortgang daar niet.</p>
        <p className="toggle-sub">Status: {({ nieuw: 'nog niets opgeslagen', ok: 'opgeslagen', hersteld: 'hersteld uit de reservekopie', onleesbaar: 'gegevens onleesbaar, er wordt niets overschreven', 'geen-opslag': 'opslaan werkt niet in deze browser' } as const)[loadStatus]}{testDay != null ? `, testdag ${testDay} staat aan` : ''}.</p>
      </section>

      <ProfileSheet open={edit} onClose={() => setEdit(false)} />
    </main>
  );
}

function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { progress, actions, toast } = useStore();
  const [name, setName] = useState(progress.profile?.name ?? '');
  const [char, setChar] = useState(progress.profile?.character ?? CHARACTERS[0].id);
  const save = () => {
    if (!name.trim()) { toast('Vul eerst een naam in.'); return; }
    if (actions.setProfile(name, char)) { toast('Profiel bewaard.'); onClose(); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="JOUW PROFIEL">
      <label htmlFor="naam" className="label">Naam</label>
      <input id="naam" className="field" value={name} maxLength={24} autoComplete="nickname" placeholder="Hoe heet je?" onChange={(e) => setName(e.target.value)} />
      <p className="label" id="char-label">Kies je character</p>
      <div className="char-grid" role="radiogroup" aria-labelledby="char-label">
        {CHARACTERS.map((c) => (
          <button key={c.id} role="radio" aria-checked={char === c.id} className={`char ${char === c.id ? 'on' : ''}`} onClick={() => { haptic(); setChar(c.id); }}>
            <Tile pair={c.pair} expr={c.expr} face={c.face} size={58} alive={char === c.id} />
            <span className="char-name">{c.naam}</span>
          </button>
        ))}
      </div>
      <Btn pair="cobalt" onClick={save}>Bewaar profiel</Btn>
    </Sheet>
  );
}
