import type { MoodDecision } from "../core/mood/types";
import styles from "./MoodTraits.module.css";

const LABELS = {
  valence: { negative: "차분한 저채도", neutral: "균형 잡힌 온기", positive: "따뜻한 빛" },
  stability: { stable: "잔잔한 움직임", mixed: "겹쳐지는 리듬", unstable: "자유로운 흔들림" },
  direction: { recovering: "위로 자라는 형태", static: "머무르는 형태", declining: "아래로 쉬어가는 형태" },
  archetype: { bloom: "꽃형", vine: "덩굴형", crystal: "결정형", moss: "이끼형", thorn: "가시형", spore: "포자형" },
} as const;

export function getArchetypeLabel(archetype: MoodDecision["archetype"]) {
  return LABELS.archetype[archetype];
}

export function MoodTraits({ decision }: { decision: MoodDecision }) {
  return (
    <dl className={styles.traits}>
      <div><dt>빛</dt><dd>{LABELS.valence[decision.valence]}</dd></div>
      <div><dt>움직임</dt><dd>{LABELS.stability[decision.stability]}</dd></div>
      <div><dt>방향</dt><dd>{LABELS.direction[decision.direction]}</dd></div>
      <div><dt>형태</dt><dd>{LABELS.archetype[decision.archetype]}</dd></div>
    </dl>
  );
}
