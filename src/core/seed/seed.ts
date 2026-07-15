export const RENDERER_VERSION = "1";

export function normalizeEntryText(text: string) {
  return text.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function hashText(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createSpeciesSeed(text: string) {
  return hashText(normalizeEntryText(text));
}

export function createDailySeed(text: string, localDate: string) {
  return hashText(`${normalizeEntryText(text)}\u241f${localDate}\u241f${RENDERER_VERSION}`);
}

export function seedToUnit(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) / 0xffffffff;
}

export function createSeededRandom(seed: string) {
  let state = Number.parseInt(seed.slice(0, 8), 16) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
