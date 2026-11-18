import type { Expr } from './Face';
import type { PairName } from './palette';

export interface Character { id: string; naam: string; pair: PairName; expr: Expr; face?: string }

// Profielfoto's: een tegel in een kleurpaar met een eigen gezicht.
export const CHARACTERS: Character[] = [
  { id: 'knoopje', naam: 'Knoopje', pair: 'yellow', expr: 'smirk' },
  { id: 'munt', naam: 'Munt', pair: 'mint', expr: 'relieved' },
  { id: 'wolk', naam: 'Wolk', pair: 'sky', expr: 'meh' },
  { id: 'soes', naam: 'Soes', pair: 'lilac', expr: 'sleepy' },
  { id: 'ster', naam: 'Ster', pair: 'purple', expr: 'stars' },
  { id: 'mandarijn', naam: 'Mandarijn', pair: 'orange', expr: 'happy' },
  { id: 'schrik', naam: 'Schrik', pair: 'red', expr: 'shock', face: '#fff3c4' },
  { id: 'paniek', naam: 'Paniek', pair: 'cobalt', expr: 'panic' },
];

export const DEFAULT_CHARACTER = CHARACTERS[0];
export const characterById = (id?: string) => CHARACTERS.find((c) => c.id === id) ?? DEFAULT_CHARACTER;
