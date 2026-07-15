import { useMemo } from "react";
import { useApp } from "../../app/AppProvider";
import { AppLink } from "../../app/routes";
import { createGrowthPlan, createPlantIdentity, getGrowthStage, nextGrowthStage } from "../../core/growth/growth";
import { LazyGardenScene } from "../../scene/LazyGardenScene";
import { StaticPlant } from "../../scene/StaticPlant";
import { PageIntro } from "../../ui/PageIntro";
import layout from "../../ui/layout.module.css";
import styles from "./GardenPage.module.css";

export function GardenPage() {
  const { state } = useApp();
  const uniqueDays = new Set(state.entries.map((entry) => entry.localDate)).size;
  const heartEntry = state.entries.find((entry) => entry.id === state.heartSeedEntryId) ?? state.entries[0];
  const heartPlan = useMemo(() => {
    if (!heartEntry) return null;
    return createGrowthPlan(createPlantIdentity(heartEntry.moodDecision, heartEntry.speciesSeed), heartEntry.dailySeed, uniqueDays);
  }, [heartEntry, uniqueDays]);

  if (!heartEntry || !heartPlan) {
    return <div className={layout.page}><PageIntro eyebrow="My Garden" title="아직 조용한 정원이에요."><p>첫 문장을 남기면 Heart Seed가 이곳에 뿌리내립니다.</p></PageIntro><section className={`${layout.panel} ${layout.empty} ${styles.empty}`}><div className={styles.emptySeed} /><h2>첫 씨앗을 심어볼까요?</h2><AppLink href="/" className={layout.button}>오늘의 문장 남기기</AppLink></section></div>;
  }

  const currentStage = getGrowthStage(uniqueDays);
  const nextStage = nextGrowthStage(uniqueDays);
  const remaining = Math.max(0, nextStage.day - uniqueDays);
  return (
    <div className={layout.page}>
      <PageIntro eyebrow="My Garden" title="문장들이 자라는 개인 정원"><p>하루를 놓쳐도 식물은 사라지지 않습니다. 누적된 고유 기록일만큼 정원이 천천히 깊어집니다.</p></PageIntro>
      <section className={styles.heart}>
        <div className={styles.scene}><LazyGardenScene plan={heartPlan} quality={state.settings.renderQuality} reducedMotion={state.settings.reducedMotion} interactive label="회전할 수 있는 Heart Seed" /></div>
        <div className={styles.heartCopy}>
          <span className={layout.badge}>Heart Seed · {uniqueDays}번의 기록</span>
          <h2>{currentStage.name}</h2>
          <blockquote>“{heartEntry.text}”</blockquote>
          <div className={styles.stageMap}>
            <div><span>현재</span><strong>{currentStage.name}</strong></div><i aria-hidden="true" /><div><span>다음 변화</span><strong>{nextStage.name}</strong></div>
          </div>
          <p className={styles.remaining}>{remaining === 0 ? "현재 초기 성장 단계를 모두 만났습니다." : `다음 변화까지 ${remaining}번의 기록`}</p>
          <div className={styles.nextPreview}><StaticPlant plan={createGrowthPlan(heartPlan.identity, heartPlan.dailySeed, nextStage.day)} label={`${nextStage.name} 작은 미리보기`} /><span>다음 단계의 가능성</span></div>
        </div>
      </section>

      <section className={styles.specimens} aria-labelledby="specimen-title">
        <div className={styles.sectionHeading}><div><p className={layout.eyebrow}>Daily Specimens</p><h2 id="specimen-title" className={layout.sectionTitle}>날짜별 표본</h2></div><span>{state.entries.length}개의 식물</span></div>
        <div className={styles.grid}>
          {[...state.entries].reverse().map((entry, index) => {
            const plan = createGrowthPlan(createPlantIdentity(entry.moodDecision, entry.speciesSeed), entry.dailySeed, Math.min(uniqueDays, index + 1));
            return <article key={entry.id} className={layout.panel}><div className={styles.cardPlant}><StaticPlant plan={plan} label={`${entry.localDate} 식물`} /></div><div className={styles.cardCopy}><time>{entry.localDate.replaceAll("-", ".")}</time><p>{entry.text}</p><span>{plan.identity.archetype} · seed {entry.dailySeed.slice(0, 4)}</span></div></article>;
          })}
        </div>
      </section>
    </div>
  );
}
