import { createDailySeed, createSpeciesSeed } from "../seed/seed";
import { classifyMoodWithRules } from "../mood/fallback";
import { DEFAULT_GARDEN_STATE, normalizeGardenState, type GardenState, type JournalEntry } from "./schema";

export const STORAGE_KEY = "mood-bloom:garden:v1";
export const MAX_GARDEN_IMPORT_BYTES = 1_000_000;
const RECOVERY_PREFIX = `${STORAGE_KEY}:recovery:`;

export type GardenLoadResult = {
  state: GardenState;
  warning: string;
};

export function loadGardenStateWithStatus(storage: Storage = localStorage): GardenLoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: structuredClone(DEFAULT_GARDEN_STATE), warning: "브라우저 저장소에 접근할 수 없어 이번 기록을 보관하지 못할 수 있습니다." };
  }
  if (!raw) return { state: structuredClone(DEFAULT_GARDEN_STATE), warning: "" };

  try {
    const normalized = normalizeGardenState(JSON.parse(raw));
    if (normalized) return { state: normalized, warning: "" };
  } catch {
    // Preserve the original value below when storage allows it.
  }

  try {
    storage.setItem(`${RECOVERY_PREFIX}latest`, raw);
    storage.removeItem(STORAGE_KEY);
    return { state: structuredClone(DEFAULT_GARDEN_STATE), warning: "손상된 정원 데이터를 별도 복구 사본으로 보존하고 빈 정원으로 시작했습니다." };
  } catch {
    return { state: structuredClone(DEFAULT_GARDEN_STATE), warning: "손상된 정원 데이터를 읽지 못했고 저장 공간 제한으로 복구 사본도 만들지 못했습니다." };
  }
}

export function loadGardenState(storage: Storage = localStorage): GardenState {
  return loadGardenStateWithStatus(storage).state;
}

export function saveGardenState(state: GardenState, storage: Storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearGardenStorage(storage: Storage = localStorage) {
  let success = true;
  let keys: string[];
  try {
    keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => typeof key === "string" && (key === STORAGE_KEY || key.startsWith(RECOVERY_PREFIX)));
  } catch {
    return false;
  }
  for (const key of keys) {
    try {
      storage.removeItem(key);
    } catch {
      success = false;
    }
  }
  return success;
}

export function exportGardenState(state: GardenState) {
  return JSON.stringify(state, null, 2);
}

export function importGardenState(raw: string): GardenState {
  if (new TextEncoder().encode(raw).byteLength > MAX_GARDEN_IMPORT_BYTES) {
    throw new Error("백업 파일이 1MB 제한을 초과했습니다.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("백업 파일의 JSON을 읽을 수 없습니다.");
  }
  const normalized = normalizeGardenState(parsed);
  if (!normalized) throw new Error("무드 블룸 백업 파일 형식이 올바르지 않습니다.");
  return normalized;
}

function createEntry(
  text: string,
  localDate: string,
  existing?: JournalEntry,
): JournalEntry {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    localDate,
    text,
    moodDecision: classifyMoodWithRules(text),
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
): GardenState {
  const existing = state.entries.find((entry) => entry.localDate === localDate);
  const entry = createEntry(text, localDate, existing);
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
