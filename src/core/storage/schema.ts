import { isMoodDecision, type MoodDecision } from "../mood/types";

export type JournalEntry = {
  id: string;
  localDate: string;
  text: string;
  moodDecision: MoodDecision;
  speciesSeed: string;
  dailySeed: string;
  createdAt: string;
  updatedAt: string;
};

export type GardenState = {
  schemaVersion: 1;
  heartSeedEntryId: string | null;
  entries: JournalEntry[];
  unlockedCosmetics: string[];
  settings: {
    renderQuality: "low" | "medium" | "high";
    reducedMotion: boolean;
  };
};

export const DEFAULT_GARDEN_STATE: GardenState = {
  schemaVersion: 1,
  heartSeedEntryId: null,
  entries: [],
  unlockedCosmetics: [],
  settings: { renderQuality: "medium", reducedMotion: false },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.localDate === "string" &&
    typeof value.text === "string" &&
    isMoodDecision(value.moodDecision) &&
    typeof value.speciesSeed === "string" &&
    typeof value.dailySeed === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function isGardenState(value: unknown): value is GardenState {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.entries)) return false;
  if (!isRecord(value.settings) || !Array.isArray(value.unlockedCosmetics)) return false;
  const quality = value.settings.renderQuality;
  return (
    (value.heartSeedEntryId === null || typeof value.heartSeedEntryId === "string") &&
    value.entries.every(isJournalEntry) &&
    value.unlockedCosmetics.every((item) => typeof item === "string") &&
    ["low", "medium", "high"].includes(String(quality)) &&
    typeof value.settings.reducedMotion === "boolean"
  );
}
