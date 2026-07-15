export const MOOD_MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
export const MODEL_TIMEOUT_MS = 4_000;
export const PROTOTYPE_MARGIN = 0.035;

export const CONSERVATIVE_MOOD = {
  valence: "neutral",
  energy: 3,
  stability: "mixed",
  direction: "static",
  archetype: "moss",
} as const;
