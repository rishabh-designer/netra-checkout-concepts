/** A score band: scores at or above `min` read as `label`. */
export interface ScoreBand {
  min: number;
  label: string;
}

/**
 * The word for a score ("82.4" → "Excellent"), from bands checked highest
 * first. A provisional score keeps its trailing "*" ("80*" → "Excellent*");
 * anything that isn't a number ("N/A") is shown as is.
 */
export function scoreWord(score: string, bands: ScoreBand[]): string {
  const provisional = score.endsWith("*");
  const value = parseFloat(provisional ? score.slice(0, -1) : score);
  if (Number.isNaN(value)) return score;
  const band = [...bands].sort((a, b) => b.min - a.min).find((b) => value >= b.min);
  const word = band?.label ?? score;
  return provisional ? `${word}*` : word;
}
