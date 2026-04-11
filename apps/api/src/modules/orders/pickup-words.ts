/**
 * Short, memorable Argentine words used as pickup keywords.
 * The customer tells the courier one of these; the courier taps it in a 6-option grid.
 * All words are 4-6 chars, easy to pronounce, culturally familiar.
 */
export const PICKUP_WORDS = [
  'MATE', 'ASADO', 'TANGO', 'DULCE', 'FERIA', 'LUNA',
  'SOL', 'RIO', 'NUBE', 'TIGRE', 'PAMPA', 'PLAYA',
  'CIELO', 'ARENA', 'FLOR', 'RAYO', 'LAGO', 'CERRO',
  'CAMPO', 'BOSQUE', 'RUTA', 'VIENTO', 'FUEGO', 'BARRIO',
  'PIANO', 'RADIO', 'MAGIA', 'SABOR', 'BRISA', 'OLA',
  'NIEVE', 'ROCA', 'PERLA', 'ORO', 'PLATA', 'TRIGO',
];

export function pickRandomPickupWord(): string {
  return PICKUP_WORDS[Math.floor(Math.random() * PICKUP_WORDS.length)];
}

/**
 * Returns 6 unique options including the correct word, shuffled deterministically
 * from the orderId so the grid layout doesn't change on refresh.
 */
export function getPickupWordOptions(correct: string, seed: string, count = 6): string[] {
  const distractors = PICKUP_WORDS.filter((w) => w !== correct);
  // Deterministic shuffle based on seed
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rng = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const picked: string[] = [];
  const pool = [...distractors];
  while (picked.length < count - 1 && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  const withCorrect = [...picked, correct];
  // Shuffle final layout
  for (let i = withCorrect.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [withCorrect[i], withCorrect[j]] = [withCorrect[j], withCorrect[i]];
  }
  return withCorrect;
}
