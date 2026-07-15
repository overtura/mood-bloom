import { useMemo, useState } from "react";
import { createEvolutionPlan } from "../../core/growth/growth";
import type { PlantIdentity } from "../../core/growth/types";
import { LazyGardenScene } from "../../scene/LazyGardenScene";
import styles from "./FutureBloom.module.css";

export function FutureBloom({ identity, dailySeed, quality, reducedMotion, onClose }: { identity: PlantIdentity; dailySeed: string; quality: "low" | "medium" | "high"; reducedMotion: boolean; onClose: () => void }) {
  const plans = useMemo(() => createEvolutionPlan(identity, dailySeed), [identity, dailySeed]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const plan = plans[selectedIndex] ?? plans[0]!;
  return (
    <section className={styles.preview} aria-labelledby="future-bloom-title">
      <div className={styles.heading}>
        <div><span>Future Bloom</span><h2 id="future-bloom-title">이 씨앗은 어디까지 자랄까요?</h2></div>
        <button type="button" onClick={onClose} aria-label="미래 정원 미리보기 닫기">닫기</button>
      </div>
      <div className={styles.content}>
        <div className={styles.visual}><LazyGardenScene plan={plan} quality={quality} reducedMotion={reducedMotion} label={`Day ${plan.stage.day} 성장 가능성`} /></div>
        <div className={styles.details}>
          <div className={styles.scrubber} role="group" aria-label="성장 단계">
            {plans.map((item, index) => <button key={item.stage.day} type="button" aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)}>Day {item.stage.day}</button>)}
          </div>
          <p className={styles.stage}>{plan.stage.name}</p>
          <h3>{plan.stage.description}</h3>
          <p className={styles.unlock}>이 단계에서 보이는 요소 · {plan.stage.unlock}</p>
          <p className={styles.note}>가능한 성장 예시입니다. 실제 모습은 매일 남긴 문장에 따라 달라집니다.</p>
        </div>
      </div>
    </section>
  );
}
