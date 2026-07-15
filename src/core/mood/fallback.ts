import { createSpeciesSeed, seedToUnit } from "../seed/seed";
import type { MoodDecision } from "./types";

const POSITIVE = ["좋", "행복", "고마", "따뜻", "기쁘", "뿌듯", "웃", "사랑", "설레"];
const NEGATIVE = ["힘들", "지치", "슬프", "속상", "불안", "외롭", "무겁", "아프", "화나"];
const RECOVERING = ["나아", "회복", "다시", "괜찮아", "희망", "해냈", "버텼"];
const DECLINING = ["점점", "더 지", "무너", "포기", "악화", "가라앉"];
const UNSTABLE = ["오락가락", "뒤죽박죽", "혼란", "급격", "요동", "갈팡질팡"];
const ARCHETYPE_HINTS: Array<[MoodDecision["archetype"], string[]]> = [
  ["bloom", ["꽃", "환", "기쁘", "따뜻"]],
  ["vine", ["이어", "연결", "함께", "길"]],
  ["crystal", ["맑", "선명", "집중", "정리"]],
  ["moss", ["쉼", "조용", "편안", "포근"]],
  ["thorn", ["버티", "지키", "긴장", "단단"]],
  ["spore", ["자유", "새로", "가능", "떠오"]],
];

function countMatches(text: string, words: readonly string[]) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

export function classifyMoodWithRules(text: string): MoodDecision {
  const positive = countMatches(text, POSITIVE);
  const negative = countMatches(text, NEGATIVE);
  const punctuationEnergy = Math.min(2, (text.match(/[!?！？]/g) ?? []).length);
  const energy = Math.max(1, Math.min(5, 2 + punctuationEnergy + (text.length > 45 ? 1 : 0)));
  const hinted = ARCHETYPE_HINTS.find(([, words]) => countMatches(text, words) > 0)?.[0];
  const archetypes = ARCHETYPE_HINTS.map(([archetype]) => archetype);
  const deterministicIndex = Math.floor(seedToUnit(createSpeciesSeed(text)) * archetypes.length);
  return {
    valence: positive === negative ? "neutral" : positive > negative ? "positive" : "negative",
    energy: energy as MoodDecision["energy"],
    stability: countMatches(text, UNSTABLE) > 0 ? "unstable" : /하지만|그러나|그런데/.test(text) ? "mixed" : "stable",
    direction: countMatches(text, RECOVERING) > 0 ? "recovering" : countMatches(text, DECLINING) > 0 ? "declining" : "static",
    archetype: hinted ?? archetypes[deterministicIndex] ?? "moss",
  };
}
