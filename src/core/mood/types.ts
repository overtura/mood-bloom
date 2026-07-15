export type MoodDecision = {
  valence: "negative" | "neutral" | "positive";
  energy: 1 | 2 | 3 | 4 | 5;
  stability: "stable" | "mixed" | "unstable";
  direction: "recovering" | "static" | "declining";
  archetype: "bloom" | "vine" | "crystal" | "moss" | "thorn" | "spore";
};

export type MoodModelStatus = {
  phase: "idle" | "loading" | "ready" | "fallback";
  progress: number;
  message: string;
};

export type MoodResult = {
  decision: MoodDecision;
  source: "model" | "fallback";
};

const VALENCES = ["negative", "neutral", "positive"];
const STABILITIES = ["stable", "mixed", "unstable"];
const DIRECTIONS = ["recovering", "static", "declining"];
const ARCHETYPES = ["bloom", "vine", "crystal", "moss", "thorn", "spore"];

export function isMoodDecision(value: unknown): value is MoodDecision {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    VALENCES.includes(String(candidate.valence)) &&
    [1, 2, 3, 4, 5].includes(Number(candidate.energy)) &&
    STABILITIES.includes(String(candidate.stability)) &&
    DIRECTIONS.includes(String(candidate.direction)) &&
    ARCHETYPES.includes(String(candidate.archetype))
  );
}
