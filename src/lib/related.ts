export interface RelatedCandidate {
  key: string;
  region?: string;
  interests: string[];
  tags: string[];
}

export function relatedScore(current: RelatedCandidate, other: RelatedCandidate): number {
  let score = current.region && current.region === other.region ? 3 : 0;
  score += 2 * other.interests.filter((i) => current.interests.includes(i)).length;
  score += other.tags.filter((t) => current.tags.includes(t)).length;
  return score;
}

/**
 * Manual picks first (only those present in `candidates`, i.e. visible), then the
 * highest-scoring candidates. `candidates` must contain only visible entries.
 */
export function pickRelated(
  current: RelatedCandidate,
  manual: string[],
  candidates: RelatedCandidate[],
  limit = 4,
): string[] {
  const visible = new Set(candidates.map((c) => c.key));
  const picked = [...new Set(manual)].filter((k) => k !== current.key && visible.has(k));
  const scored = candidates
    .filter((c) => c.key !== current.key && !picked.includes(c.key))
    .map((c) => ({ key: c.key, score: relatedScore(current, c) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  return [...picked, ...scored.map((c) => c.key)].slice(0, limit);
}
