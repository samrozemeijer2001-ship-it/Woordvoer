import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { Face, type Expr } from './Face';
import { PAIRS, type PairName } from './palette';
import { characterById } from './characters';

export const haptic = (strong = false) => { try { navigator.vibrate?.(strong ? 22 : 8); } catch { /* geen trilfunctie */ } };

export function pairStyle(pair: PairName): CSSProperties {
  const p = PAIRS[pair];
  return { '--bg': p.bg, '--ink': p.ink, '--depth': p.depth } as CSSProperties;
}

/** Een effen tegel met diepte (zijvlak) en een gezicht. */
export function Tile({ pair, expr, size = 64, face, alive = true, pop = false, className = '', label }: {
  pair: PairName; expr: Expr; size?: number; face?: string; alive?: boolean; pop?: boolean; className?: string; label?: string;
}) {
  const p = PAIRS[pair];
  return (
    <span
      className={`tile ${pop ? 'pop' : ''} ${className}`}
      style={{ ...pairStyle(pair), width: size, height: size, '--side': `${Math.max(3, Math.round(size * 0.09))}px` } as CSSProperties}
      role={label ? 'img' : undefined} aria-label={label}
    >
      <Face expr={expr} color={face ?? p.ink} size={size * 0.74} alive={alive} />
    </span>
  );
}

export function Avatar({ id, size = 48, alive = true }: { id?: string; size?: number; alive?: boolean }) {
  const c = characterById(id);
  return <Tile pair={c.pair} expr={c.expr} face={c.face} size={size} alive={alive} />;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { pair?: PairName; variant?: 'solid' | 'soft'; children: ReactNode; strong?: boolean };

/** Grote knop: volle breedte, Barlow in hoofdletters, donker zijvlak. */
export function Btn({ pair = 'cobalt', variant = 'solid', children, className = '', onClick, strong, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`btn btn-${variant} ${className}`}
      style={variant === 'solid' ? pairStyle(pair) : undefined}
      onClick={(e) => { haptic(strong); onClick?.(e); }}
    >
      {children}
    </button>
  );
}

export function IconBtn({ label, children, onClick, pressed, className = '' }: {
  label: string; children: ReactNode; onClick?: () => void; pressed?: boolean; className?: string;
}) {
  return (
    <button type="button" className={`iconbtn ${className}`} aria-label={label} aria-pressed={pressed} title={label}
      onClick={() => { haptic(); onClick?.(); }}>
      {children}
    </button>
  );
}

export function Meta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`meta ${className}`}>{children}</p>;
}

/** Getal dat een kleine 'bump' maakt als het verandert. */
export function Bump({ value, className = '' }: { value: number | string; className?: string }) {
  const [k, setK] = useState(0);
  useEffect(() => setK((x) => x + 1), [value]);
  return <span key={k} className={`bump ${className}`}>{value}</span>;
}

export function LevelBar({ inLevel, max, label }: { inLevel: number; max: number; label: string }) {
  return (
    <div className="levelbar" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={inLevel} aria-label={label}>
      <span style={{ width: `${(inLevel / max) * 100}%` }} />
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button className="sheet-scrim" aria-label="Sluiten" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-head">
          <h2 className="display sheet-title">{title}</h2>
          <IconBtn label="Sluiten" onClick={onClose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></IconBtn>
        </div>
        {children}
      </div>
    </div>
  );
}
