import { useEffect, useState } from 'react';

export type Route =
  | { name: 'vandaag' }
  | { name: 'dag'; day: number }
  | { name: 'kaart'; day: number; kind: 'woord' | 'spreekwoord' | 'wildcard' | 'blast' }
  | { name: 'puzzel'; id: string }
  | { name: 'bewaard' }
  | { name: 'bewaard-woord'; id: string }
  | { name: 'bewaard-spreekwoord'; id: string }
  | { name: 'herhaal'; id: string }
  | { name: 'archief' }
  | { name: 'voortgang' }
  | { name: 'onbekend' };

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = parts;
  if (!a || a === 'vandaag') return { name: 'vandaag' };
  if (a === 'dag' && /^\d+$/.test(b ?? '')) {
    const day = Number(b);
    if (!c) return { name: 'dag', day };
    if (c === 'woord' || c === 'spreekwoord' || c === 'wildcard' || c === 'blast') return { name: 'kaart', day, kind: c };
  }
  if (a === 'puzzel' && b) return { name: 'puzzel', id: b };
  if (a === 'bewaard') {
    if (!b) return { name: 'bewaard' };
    if (b === 'woord' && c) return { name: 'bewaard-woord', id: c };
    if (b === 'spreekwoord' && c) return { name: 'bewaard-spreekwoord', id: c };
    if (b === 'herhaal' && c) return { name: 'herhaal', id: c };
  }
  if (a === 'archief') return { name: 'archief' };
  if (a === 'voortgang') return { name: 'voortgang' };
  return { name: 'onbekend' };
}

export function useRoute(): Route {
  const [r, setR] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => { setR(parse(location.hash)); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = (path: string) => { location.hash = path; };
