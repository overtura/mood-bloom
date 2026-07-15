import { CONSERVATIVE_MOOD, PROTOTYPE_MARGIN } from "./model-config";
import { MOOD_PROTOTYPES, prototypeKey, type MoodDimension } from "./prototypes";
import type { MoodDecision } from "./types";

export type PrototypeVectors = Record<string, readonly number[][]>;

function cosineSimilarity(left: readonly number[], right: readonly number[]) {
  let dot = 0;
  let leftLength = 0;
  let rightLength = 0;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    dot += a * b;
    leftLength += a * a;
    rightLength += b * b;
  }
  const denominator = Math.sqrt(leftLength) * Math.sqrt(rightLength);
  return denominator === 0 ? 0 : dot / denominator;
}

function chooseLabel(
  dimension: MoodDimension,
  input: readonly number[],
  vectors: PrototypeVectors,
  fallback: string,
) {
  const scores = MOOD_PROTOTYPES.filter((item) => item.dimension === dimension)
    .map((item) => {
      const samples = vectors[prototypeKey(item)] ?? [];
      const score = samples.reduce((sum, vector) => sum + cosineSimilarity(input, vector), 0);
      return { label: item.label, score: samples.length === 0 ? 0 : score / samples.length };
    })
    .sort((left, right) => right.score - left.score);
  const first = scores[0];
  const second = scores[1];
  if (!first || !second || first.score - second.score < PROTOTYPE_MARGIN) return fallback;
  return first.label;
}

export function classifyMoodFromPrototypeVectors(
  input: readonly number[],
  vectors: PrototypeVectors,
): MoodDecision {
  const energy = Number(chooseLabel("energy", input, vectors, String(CONSERVATIVE_MOOD.energy)));
  return {
    valence: chooseLabel("valence", input, vectors, CONSERVATIVE_MOOD.valence) as MoodDecision["valence"],
    energy: Math.max(1, Math.min(5, energy)) as MoodDecision["energy"],
    stability: chooseLabel("stability", input, vectors, CONSERVATIVE_MOOD.stability) as MoodDecision["stability"],
    direction: chooseLabel("direction", input, vectors, CONSERVATIVE_MOOD.direction) as MoodDecision["direction"],
    archetype: chooseLabel("archetype", input, vectors, CONSERVATIVE_MOOD.archetype) as MoodDecision["archetype"],
  };
}
