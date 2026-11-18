export type PairName = 'mint' | 'sky' | 'lilac' | 'cobalt' | 'yellow' | 'orange' | 'red' | 'purple' | 'pink' | 'black' | 'paper';

// Achtergrond, inkt en de donkere zijkant (diepte) per kleurpaar, uit brand/tokens.json.
export const PAIRS: Record<PairName, { bg: string; ink: string; depth: string }> = {
  mint: { bg: '#7fe0a8', ink: '#0f5a3a', depth: '#0f5a3a' },
  sky: { bg: '#7fb7ff', ink: '#14306b', depth: '#14306b' },
  lilac: { bg: '#b98cff', ink: '#2b1360', depth: '#2b1360' },
  cobalt: { bg: '#2747c9', ink: '#d8e4ff', depth: '#14306b' },
  yellow: { bg: '#ffcc2e', ink: '#a3300f', depth: '#a3300f' },
  orange: { bg: '#ff8a3d', ink: '#4a1a05', depth: '#4a1a05' },
  // Tekst op rood gebruikt de LEF-inkt #3b0d06 voor contrast; gezichten mogen #fff3c4 houden.
  red: { bg: '#ff5a3c', ink: '#3b0d06', depth: '#a3300f' },
  purple: { bg: '#3a1a6b', ink: '#ff8fc8', depth: '#141210' },
  pink: { bg: '#ff8fc8', ink: '#6b0f3a', depth: '#6b0f3a' },
  black: { bg: '#141210', ink: '#ffd84a', depth: '#000000' },
  paper: { bg: '#fff6ea', ink: '#141210', depth: '#a3300f' },
};
