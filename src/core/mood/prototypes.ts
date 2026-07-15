export type MoodDimension =
  | "valence"
  | "energy"
  | "stability"
  | "direction"
  | "archetype";

export type PrototypeDefinition = {
  dimension: MoodDimension;
  label: string;
  samples: readonly string[];
};

export const MOOD_PROTOTYPES: readonly PrototypeDefinition[] = [
  {
    dimension: "valence",
    label: "negative",
    samples: ["마음이 무겁고 힘든 하루였다", "조금 서글프고 지친 기분이 남았다", "뜻대로 되지 않아 속상했다"],
  },
  {
    dimension: "valence",
    label: "neutral",
    samples: ["특별할 것 없이 차분한 하루였다", "오늘 해야 할 일을 하나씩 했다", "평범한 일상이 조용히 흘렀다"],
  },
  {
    dimension: "valence",
    label: "positive",
    samples: ["기분 좋은 일이 있어 마음이 환했다", "고맙고 따뜻한 순간을 만났다", "작은 성취가 뿌듯하게 느껴졌다"],
  },
  ...[1, 2, 3, 4, 5].map((energy) => ({
    dimension: "energy" as const,
    label: String(energy),
    samples: [
      ["기운이 거의 없어 가만히 쉬었다", "아주 느리고 조용하게 하루를 보냈다"],
      ["조금 느긋하고 낮은 속도로 움직였다", "잔잔하게 필요한 일만 했다"],
      ["평소와 비슷한 속도로 하루를 보냈다", "적당한 활력으로 일상을 이어갔다"],
      ["활기차게 여러 일을 해냈다", "좋은 에너지가 계속 이어졌다"],
      ["온몸에 힘이 넘치고 무척 신이 났다", "빠르게 몰입하며 벅찬 하루를 보냈다"],
    ][energy - 1] ?? [],
  })),
  {
    dimension: "stability",
    label: "stable",
    samples: ["마음이 한결같고 편안했다", "차분함이 오래 이어졌다", "흔들림 없이 내 속도를 지켰다"],
  },
  {
    dimension: "stability",
    label: "mixed",
    samples: ["좋은 일과 아쉬운 일이 함께 있었다", "여러 감정이 자연스럽게 섞인 하루였다", "웃기도 하고 잠시 멈추기도 했다"],
  },
  {
    dimension: "stability",
    label: "unstable",
    samples: ["마음이 이리저리 크게 흔들렸다", "감정의 오르내림이 빠르게 반복됐다", "집중하기 어려울 만큼 변화가 컸다"],
  },
  {
    dimension: "direction",
    label: "recovering",
    samples: ["조금씩 나아지고 있다는 느낌이 들었다", "다시 힘을 내어 앞으로 움직였다", "어려움 뒤에 작은 희망을 발견했다"],
  },
  {
    dimension: "direction",
    label: "static",
    samples: ["크게 달라지지 않은 하루였다", "지금의 자리에 잠시 머물렀다", "변화보다 유지에 가까운 날이었다"],
  },
  {
    dimension: "direction",
    label: "declining",
    samples: ["시간이 갈수록 조금 더 지쳤다", "처음보다 마음이 가라앉았다", "에너지가 점점 줄어드는 하루였다"],
  },
  ...[
    ["bloom", ["마음이 활짝 피어나는 듯했다", "따뜻한 꽃처럼 환한 순간이었다"]],
    ["vine", ["천천히 길을 찾아 이어 나갔다", "관계와 생각이 부드럽게 연결됐다"]],
    ["crystal", ["생각이 맑고 또렷하게 정리됐다", "차갑지만 선명한 집중의 순간이었다"]],
    ["moss", ["조용하고 포근한 쉼이 필요했다", "작은 평온이 천천히 쌓였다"]],
    ["thorn", ["단단히 버티며 나를 지키고 싶었다", "날카로운 긴장 속에서도 견뎠다"]],
    ["spore", ["생각이 가볍게 떠다니고 자유로웠다", "새로운 가능성이 여기저기 번졌다"]],
  ].map(([label, samples]) => ({
    dimension: "archetype" as const,
    label: String(label),
    samples: samples as readonly string[],
  })),
];

export function prototypeKey(definition: Pick<PrototypeDefinition, "dimension" | "label">) {
  return `${definition.dimension}:${definition.label}`;
}
