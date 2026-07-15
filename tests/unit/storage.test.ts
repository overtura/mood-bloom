import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_GARDEN_STATE } from "../../src/core/storage/schema";
import { clearGardenStorage, exportGardenState, importGardenState, loadGardenState, saveGardenState, STORAGE_KEY, upsertJournalEntry } from "../../src/core/storage/storage";
describe("versioned LocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("하루 한 기록을 유지하고 수정 시 seed를 다시 계산한다", () => {
    const first = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "첫 문장", "2026-07-15");
    const edited = upsertJournalEntry(first, "수정한 문장", "2026-07-15");
    expect(edited.entries).toHaveLength(1);
    expect(edited.entries[0]?.id).toBe(first.entries[0]?.id);
    expect(edited.entries[0]?.speciesSeed).not.toBe(first.entries[0]?.speciesSeed);
  });

  it("JSON export/import 왕복을 검증한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "백업할 문장", "2026-07-15");
    expect(importGardenState(exportGardenState(state))).toEqual(state);
  });

  it("손상 데이터는 보존하고 빈 상태로 안전하게 복구한다", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadGardenState()).toEqual(DEFAULT_GARDEN_STATE);
    expect(Object.keys(localStorage).some((key) => key.startsWith(`${STORAGE_KEY}:recovery:`))).toBe(true);
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadGardenState()).toEqual(DEFAULT_GARDEN_STATE);
    expect(Object.keys(localStorage).filter((key) => key.startsWith(`${STORAGE_KEY}:recovery:`))).toHaveLength(1);
  });

  it("전체 삭제 시 기본 데이터와 복구 사본을 함께 제거한다", () => {
    localStorage.setItem(STORAGE_KEY, "{}");
    localStorage.setItem(`${STORAGE_KEY}:recovery:1`, "private sentence");
    expect(clearGardenStorage()).toBe(true);
    expect(Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY))).toEqual([]);
  });

  it("가져오기에서 중복 날짜와 잘못된 마음씨앗 참조를 거부한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "첫 문장", "2026-07-15");
    const duplicated = { ...state, entries: [...state.entries, { ...state.entries[0], id: crypto.randomUUID() }] };
    expect(() => importGardenState(JSON.stringify(duplicated))).toThrow("형식이 올바르지");
    expect(() => importGardenState(JSON.stringify({ ...state, heartSeedEntryId: crypto.randomUUID() }))).toThrow("형식이 올바르지");
  });

  it("가져온 씨앗 값과 해금은 신뢰하지 않고 다시 계산한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "정규 씨앗", "2026-07-15");
    const tampered = {
      ...state,
      unlockedCosmetics: ["milestone-30"],
      entries: state.entries.map((entry) => ({ ...entry, speciesSeed: "bad", dailySeed: "bad" })),
    };
    expect(importGardenState(JSON.stringify(tampered))).toEqual(state);
  });

  it("가져온 분류값도 문장의 정규 결정으로 다시 계산한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "따뜻하고 좋은 하루", "2026-07-15");
    const tampered = {
      ...state,
      entries: state.entries.map((entry) => ({
        ...entry,
        moodDecision: { valence: "negative", energy: 5, stability: "unstable", direction: "declining", archetype: "thorn" },
      })),
    };
    expect(importGardenState(JSON.stringify(tampered)).entries[0]?.moodDecision).not.toEqual(tampered.entries[0]?.moodDecision);
  });

  it("느슨한 숫자 타입과 과도한 크기의 백업을 거부한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "검증 문장", "2026-07-15");
    const looseEnergy = {
      ...state,
      entries: state.entries.map((entry) => ({ ...entry, moodDecision: { ...entry.moodDecision, energy: "3" } })),
    };
    expect(() => importGardenState(JSON.stringify(looseEnergy))).toThrow("형식이 올바르지");
    expect(() => importGardenState(" ".repeat(1_000_001))).toThrow("1MB");
  });

  it("저장된 설정의 false 값을 그대로 복원한다", () => {
    const state = structuredClone(DEFAULT_GARDEN_STATE);
    state.settings.reducedMotion = false;
    saveGardenState(state);
    expect(loadGardenState().settings.reducedMotion).toBe(false);
  });
});
