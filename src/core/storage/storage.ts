import { createDailySeed, createSpeciesSeed } from "../seed/seed";
import type { MoodDecision } from "../mood/types";
import { DEFAULT_GARDEN_STATE, isGardenState, type GardenState, type JournalEntry } from "./schema";

export const STORAGE_KEY = "mood-bloom:garden:v1";

export function loadGardenState(storage: Storage = localStorage): GardenState {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_GARDEN_STATE);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isGardenState(parsed)) return parsed;
  } catch {
    // The original value is preserved below for manual recovery.
  }
  storage.setItem(`${STORAGE_KEY}:recovery:${Date.now()}`, raw);
  return structuredClone(DEFAULT_GARDEN_STATE);
}

export function saveGardenState(state: GardenState, storage: Storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportGardenState(state: GardenState) {
  return JSON.stringify(state, null, 2);
}

export function importGardenState(raw: string): GardenState {
  const parsed: unknown = JSON.parse(raw);
  if (!isGardenState(parsed)) throw new Error("Mood Bloom 백업 파일 형식이 올바르지 않습니다.");
  return parsed;
}

function createEntry(
  text: string,
  localDate: string,
  moodDecision: MoodDecision,
  existing?: JournalEntry,
): JournalEntry {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    localDate,
    text,
    moodDecision,
    speciesSeed: createSpeciesSeed(text),
    dailySeed: createDailySeed(text, localDate),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function upsertJournalEntry(
  state: GardenState,
  text: string,
  localDate: string,
  moodDecision: MoodDecision,
): GardenState {
  const existing = state.entries.find((entry) => entry.localDate === localDate);
  const entry = createEntry(text, localDate, moodDecision, existing);
  const entries = existing
    ? state.entries.map((item) => (item.id === existing.id ? entry : item))
    : [...state.entries, entry];
  const uniqueDays = new Set(entries.map((item) => item.localDate)).size;
  const unlockedCosmetics = [1, 3, 7, 14, 30]
    .filter((day) => uniqueDays >= day)
    .map((day) => `milestone-${day}`);
  return {
    ...state,
    heartSeedEntryId: state.heartSeedEntryId ?? entry.id,
    entries: entries.sort((left, right) => left.localDate.localeCompare(right.localDate)),
    unlockedCosmetics,
  };
}
