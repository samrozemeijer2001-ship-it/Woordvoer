import { useEffect, useRef } from 'react';

export type Expr = 'relieved' | 'sleepy' | 'meh' | 'happy' | 'smirk' | 'stars' | 'shock' | 'panic';

function star(cx: number, cy: number, r1 = 8.5, r2 = 4) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? r2 : r1;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

const LINE = { fill: 'none', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const FILL = { strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function parts(expr: Expr, c: string) {
  const line = { ...LINE, stroke: c };
  const fill = { ...FILL, stroke: c, fill: c };
  switch (expr) {
    case 'relieved':
      return { eyes: <path d="M26 40 q8 -8 16 0 M58 40 q8 -8 16 0" {...line} />, mouth: <path d="M30 62 q20 16 40 0" {...line} /> };
    case 'sleepy':
      return { eyes: <path d="M27 40 q7 6 14 0 M59 40 q7 6 14 0" {...line} />, mouth: <path d="M44 66 q6 4 12 0" {...line} /> };
    case 'meh':
      return {
        eyes: <><path d="M29 37.5 h10" {...line} /><circle cx="66" cy="38" r="5" {...fill} /></>,
        mouth: <path d="M34 66 h32" {...line} />,
      };
    case 'happy':
      return {
        eyes: <><circle cx="34" cy="38" r="4" {...fill} /><circle cx="66" cy="38" r="4" {...fill} /></>,
        mouth: <path d="M24 54 q26 36 52 0 z" {...fill} />,
      };
    case 'smirk':
      return {
        eyes: <><circle cx="34" cy="38" r="4" {...fill} /><circle cx="66" cy="38" r="4" {...fill} /></>,
        mouth: <path d="M32 62 q18 12 38 -6" {...line} />,
      };
    case 'stars':
      return {
        eyes: <><path d={star(34, 38)} {...fill} strokeWidth={4} /><path d={star(66, 38)} {...fill} strokeWidth={4} /></>,
        mouth: <path d="M26 62 q24 32 48 0 z" {...fill} />,
      };
    case 'shock':
      return {
        eyes: <><circle cx="34" cy="38" r="6" {...fill} /><circle cx="66" cy="38" r="6" {...fill} /></>,
        mouth: <ellipse cx="50" cy="70" rx="7" ry="10" {...fill} />,
      };
    case 'panic':
      return {
        eyes: <path d="M25 31 q15 7 15 9 q0 2 -15 9 M75 31 q-15 7 -15 9 q0 2 15 9" {...line} />,
        mouth: <path d="M26 76 q6 -12 12 0 q6 12 12 0 q6 -12 12 0 q6 12 12 0" {...line} />,
      };
  }
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Props { expr: Expr; color: string; size?: number | string; alive?: boolean; pop?: boolean; className?: string; title?: string }

/** Minimalistisch gezicht: alleen ogen en mond, in de inktkleur van het vlak. Knippert en kijkt rond. */
export function Face({ expr, color, size = 64, alive = true, pop = false, className = '', title }: Props) {
  const eyes = useRef<SVGGElement>(null);
  const blink = useRef<SVGGElement>(null);
  const mouth = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!alive || reduced() || !eyes.current?.animate) return;
    let stopped = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => !stopped && fn(), ms));
    let pos = { x: 0, y: 0 };

    const doBlink = () => {
      const dur = rand(170, 230);
      blink.current?.animate(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)' }, { transform: 'scaleY(1)' }],
        { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' },
      );
      if (Math.random() < 0.18) later(() => blink.current?.animate(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)' }, { transform: 'scaleY(1)' }],
        { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' }), 280);
    };
    const blinkLoop = () => { doBlink(); later(blinkLoop, rand(2400, 6500)); };
    const spots = [{ x: -7, y: 0 }, { x: 6, y: 0 }, { x: 0, y: -4 }, { x: -5, y: -3 }, { x: 5, y: 2 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    const lookLoop = () => {
      const to = spots[Math.floor(Math.random() * spots.length)];
      const dist = Math.hypot(to.x - pos.x, to.y - pos.y);
      const dur = 380 + dist * 18;
      const opts = { duration: dur, easing: 'cubic-bezier(.33,0,.15,1)', fill: 'forwards' as const };
      eyes.current?.animate([{ transform: `translate(${pos.x}px,${pos.y}px)` }, { transform: `translate(${to.x}px,${to.y}px)` }], opts);
      mouth.current?.animate([{ transform: `translate(${pos.x * 0.3}px,${pos.y * 0.3}px)` }, { transform: `translate(${to.x * 0.3}px,${to.y * 0.3}px)` }], { ...opts, delay: 60 });
      if (dist > 9 && Math.random() < 0.5) later(doBlink, dur * 0.4);
      pos = to;
      later(lookLoop, rand(1300, 3800));
    };
    later(blinkLoop, rand(800, 3000));
    later(lookLoop, rand(600, 2000));
    return () => { stopped = true; timers.forEach(clearTimeout); };
  }, [alive, expr]);

  const p = parts(expr, color);
  return (
    <svg
      viewBox="8 10 84 84" width={size} height={size} className={`face ${pop ? 'pop' : ''} ${className}`}
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} overflow="visible"
    >
      <g ref={eyes} className="eyes"><g ref={blink} className="blink">{p.eyes}</g></g>
      <g ref={mouth} className="mouth">{p.mouth}</g>
    </svg>
  );
}
