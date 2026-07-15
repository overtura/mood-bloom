import { useMemo, useState } from "react";
import { useApp } from "../../app/AppProvider";
import { createEvolutionPlan, createPlantIdentity } from "../../core/growth/growth";
import type { MoodDecision } from "../../core/mood/types";
import { createDailySeed, createSpeciesSeed } from "../../core/seed/seed";
import { LazyGardenScene } from "../../scene/LazyGardenScene";
import { StaticPlant } from "../../scene/StaticPlant";
import { PageIntro } from "../../ui/PageIntro";
import layout from "../../ui/layout.module.css";
import styles from "./EvolutionPage.module.css";

const DEMO_TEXT = "조용한 오후, 창가의 작은 빛을 오래 바라보았다.";
const DEMO_DECISION: MoodDecision = {
  valence: "neutral",
  energy: 2,
  stability: "stable",
  direction: "recovering",
  archetype: "vine",
};

export function EvolutionPage() {
  const { state } = useApp();
  const heartEntry = state.entries.find((entry) => entry.id === state.heartSeedEntryId) ?? state.entries[0];
  const [selectedIndex, setSelectedIndex] = useState(2);
  const { plans, isDemo } = useMemo(() => {
    const text = heartEntry?.text ?? DEMO_TEXT;
    const decision = heartEntry?.moodDecision ?? DEMO_DECISION;
    const speciesSeed = heartEntry?.speciesSeed ?? createSpeciesSeed(text);
    const dailySeed = heartEntry?.dailySeed ?? createDailySeed(text, "2026-01-01");
    return { plans: createEvolutionPlan(createPlantIdentity(decision, speciesSeed), dailySeed), isDemo: !heartEntry };
  }, [heartEntry]);
  const selected = plans[selectedIndex] ?? plans[0]!;

  return (
    <div className={layout.page}>
      <PageIntro eyebrow="Evolution Conservatory" title="한 씨앗이 만날 다섯 계절"><p>문서처럼 읽는 대신, 같은 Heart Seed가 단계마다 어떻게 가지와 빛을 더하는지 직접 살펴보세요.</p></PageIntro>
      <section className={styles.conservatory}>
        <div className={styles.glassLines} aria-hidden="true" />
        <div className={styles.stageVisual}>
          <LazyGardenScene plan={selected} quality={state.settings.renderQuality} reducedMotion={state.settings.reducedMotion} interactive label={`Day ${selected.stage.day} ${selected.stage.name} 회전 미리보기`} />
          <span className={styles.mode}>{isDemo ? "고정 데모 씨앗" : "내 Heart Seed의 무상태 미리보기"}</span>
        </div>
        <div className={styles.stageCopy}>
          <p>DAY {selected.stage.day}</p>
          <h2>{selected.stage.name}</h2>
          <strong>{selected.stage.description}</strong>
          <span>{selected.stage.unlock}</span>
          <p className={styles.notice}>{isDemo ? "아직 실제 기록이 없어 데모 씨앗을 보여줍니다. 오늘의 문장을 남기면 내 Heart Seed로 바뀝니다." : "이 화면은 가능성을 살펴보는 미리보기이며, 실제 기록 수와 해금 상태를 변경하지 않습니다."}</p>
        </div>
        <div className={styles.shelf} role="group" aria-label="진화 단계 선택">
          {plans.map((plan, index) => (
            <button key={plan.stage.day} type="button" aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)}>
              <div><StaticPlant plan={plan} label={`Day ${plan.stage.day} 단계`} /></div>
              <span>Day {plan.stage.day}</span><strong>{plan.stage.name}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.legend}>
        <article><span>01</span><h3>Heart Seed</h3><p>첫 문장에서 태어나 누적 고유 기록일과 함께 자라는 정원의 중심 식물입니다.</p></article>
        <article><span>02</span><h3>Daily Specimen</h3><p>그날의 문장과 인상을 반영해 매일 하나씩 정원 주변에 놓이는 표본입니다.</p></article>
        <article><span>03</span><h3>누적 정원</h3><p>연속 기록이 아닌 고유 기록일을 기준으로 깊어지므로, 하루를 쉬어도 잃는 것은 없습니다.</p></article>
      </section>
    </div>
  );
}
