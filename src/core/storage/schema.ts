import { classifyMoodWithRules } from "../mood/fallback";
import { isMoodDecision, type MoodDecision } from "../mood/types";
import { createDailySeed, createSpeciesSeed } from "../seed/seed";

export const MAX_GARDEN_ENTRIES = 3_660;

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

function isLocalDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" && /^[0-9a-f-]{36}$/i.test(value.id) &&
    isLocalDate(value.localDate) &&
    typeof value.text === "string" && value.text === value.text.trim() && value.text.length > 0 && value.text.length <= 280 &&
    isMoodDecision(value.moodDecision) &&
    typeof value.speciesSeed === "string" && value.speciesSeed.length <= 64 &&
    typeof value.dailySeed === "string" && value.dailySeed.length <= 64 &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt)
  );
}

function unlockedCosmeticsFor(entryCount: number) {
  return [1, 3, 7, 14, 30].filter((day) => entryCount >= day).map((day) => `milestone-${day}`);
}

export function normalizeGardenState(value: unknown): GardenState | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.entries)) return null;
  if (value.entries.length > MAX_GARDEN_ENTRIES || !value.entries.every(isJournalEntry)) return null;
  if (!isRecord(value.settings) || !Array.isArray(value.unlockedCosmetics)) return null;
  if (value.unlockedCosmetics.length > 32 || !value.unlockedCosmetics.every((item) => typeof item === "string" && item.length <= 64)) return null;
  const quality = value.settings.renderQuality;
  if (!["low", "medium", "high"].includes(String(quality)) || typeof value.settings.reducedMotion !== "boolean") return null;

  const entries = value.entries as JournalEntry[];
  const ids = new Set(entries.map((entry) => entry.id));
  const dates = new Set(entries.map((entry) => entry.localDate));
  if (ids.size !== entries.length || dates.size !== entries.length) return null;
  if (entries.length === 0 && value.heartSeedEntryId !== null) return null;
  if (entries.length > 0 && (typeof value.heartSeedEntryId !== "string" || !ids.has(value.heartSeedEntryId))) return null;

  const normalizedEntries = entries
    .map((entry) => ({
      ...entry,
      moodDecision: classifyMoodWithRules(entry.text),
      speciesSeed: createSpeciesSeed(entry.text),
      dailySeed: createDailySeed(entry.text, entry.localDate),
    }))
    .sort((left, right) => left.localDate.localeCompare(right.localDate));

  return {
    schemaVersion: 1,
    heartSeedEntryId: value.heartSeedEntryId as string | null,
    entries: normalizedEntries,
    unlockedCosmetics: unlockedCosmeticsFor(normalizedEntries.length),
    settings: {
      renderQuality: quality as GardenState["settings"]["renderQuality"],
      reducedMotion: value.settings.reducedMotion,
    },
  };
}

export function isGardenState(value: unknown): value is GardenState {
  return normalizeGardenState(value) !== null;
}
