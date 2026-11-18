// Gezamenlijke instellingen voor alle spelers.
// START_DATE is de Nederlandse kalenderdag waarop dag 1 verschijnt (JJJJ-MM-DD).
// Iedereen die op dezelfde dag in Nederland speelt, krijgt dezelfde dagpost en Wildcard.
export const START_DATE = '2026-11-17';
export const TIME_ZONE = 'Europe/Amsterdam';
export const TOTAL_DAYS = 30;

export const POINTS_PER_LEVEL = 300;
export const MAX_ATTEMPTS = 3;
export const HINT_PENALTY = 25;
export const BASE_POINTS = [100, 75, 50] as const;

// Blast from the Past: woorden die minstens zoveel dagen geleden zijn bewaard,
// en hooguit één gouden kaart per zoveel dagen.
export const BLAST_MIN_AGE_DAYS = 7;
export const BLAST_EVERY_DAYS = 7;
