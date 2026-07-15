import { createSeededRandom } from "../seed/seed";

export type GardenPosition = { x: number; z: number; rotation: number };

export function createGardenLayout(seeds: readonly string[]): GardenPosition[] {
  return seeds.map((seed, index) => {
    const random = createSeededRandom(seed);
    const ring = 1.6 + Math.floor(index / 6) * 1.2;
    const angle = (index / Math.max(1, seeds.length)) * Math.PI * 2 + random() * 0.45;
    return {
      x: Math.cos(angle) * ring,
      z: Math.sin(angle) * ring,
      rotation: random() * Math.PI * 2,
    };
  });
}
