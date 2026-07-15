import { useMemo, useState, type FormEvent } from "react";
import { getLocalDate, useApp } from "../../app/AppProvider";
import { createGrowthPlan, createPlantIdentity } from "../../core/growth/growth";
import { classifyMoodLocally, preloadMoodModel } from "../../core/mood/mood-client";
import type { MoodDecision } from "../../core/mood/types";
import { createDailySeed, createSpeciesSeed } from "../../core/seed/seed";
import { LazyGardenScene } from "../../scene/LazyGardenScene";
import { MoodTraits } from "../../ui/MoodTraits";
import layout from "../../ui/layout.module.css";
import { FutureBloom } from "./FutureBloom";
import { ModelStatus } from "./ModelStatus";
import styles from "./CheckInPage.module.css";

export function CheckInPage() {
  const { state, saveEntry } = useApp();
  const localDate = getLocalDate();
  const existing = state.entries.find((entry) => entry.localDate === localDate);
  const [text, setText] = useState(existing?.text ?? "");
  const [decision, setDecision] = useState<MoodDecision | null>(existing?.moodDecision ?? null);
  const [source, setSource] = useState<"model" | "fallback" | null>(existing ? "model" : null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const uniqueDays = new Set(state.entries.map((entry) => entry.localDate)).size;
  const recordCount = existing ? uniqueDays : uniqueDays + (decision ? 1 : 0);

  const plan = useMemo(() => {
    if (!decision || !text.trim()) return null;
    const speciesSeed = createSpeciesSeed(text);
    const identity = createPlantIdentity(decision, speciesSeed);
    return createGrowthPlan(identity, createDailySeed(text, localDate), Math.max(1, recordCount));
  }, [decision, localDate, recordCount, text]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = text.trim();
    if (!normalized || isClassifying) return;
    setIsClassifying(true);
    setShowPreview(false);
    const result = await classifyMoodLocally(normalized);
    saveEntry(normalized, localDate, result.decision);
    setDecision(result.decision);
    setSource(result.source);
    setIsClassifying(false);
  }

  return (
    <div className={layout.page}>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <p className={layout.eyebrow}>오늘의 기록 · {localDate}</p>
          <h1>오늘의 한 문장이<br /><em>식물로 피어납니다.</em></h1>
          <p>평가나 진단 대신, 문장에서 받은 인상을 빛과 움직임, 형태로 표현해 작은 개인 정원에 남깁니다.</p>
          <div className={styles.privacy}><span aria-hidden="true">●</span> 브라우저 안에서만 처리하고 저장합니다.</div>
        </div>
        <form className={`${layout.panel} ${styles.form}`} onSubmit={handleSubmit}>
          <label htmlFor="daily-entry">오늘을 한 문장으로 남겨보세요</label>
          <textarea
            id="daily-entry"
            value={text}
            maxLength={280}
            rows={6}
            placeholder="예: 바쁜 하루 끝에 따뜻한 차 한 잔이 오래 기억에 남았다."
            onFocus={preloadMoodModel}
            onChange={(event) => {
              setText(event.target.value);
              if (event.target.value.trim().length > 1) preloadMoodModel();
            }}
          />
          <div className={styles.formMeta}><span>{text.length} / 280</span><span>하루 한 기록 · 오늘 기록은 수정 가능</span></div>
          <ModelStatus />
          <button className={layout.button} type="submit" disabled={!text.trim() || isClassifying}>
            {isClassifying ? <><i className={styles.seedPulse} /> 씨앗이 문장을 듣는 중</> : existing ? "오늘의 식물 다시 피우기" : "오늘의 식물 피우기"}
          </button>
        </form>
      </section>

      {plan && decision && (
        <section className={styles.reveal} aria-labelledby="reveal-title">
          <div className={styles.revealVisual}>
            <LazyGardenScene plan={plan} quality={state.settings.renderQuality} reducedMotion={state.settings.reducedMotion} label="오늘 문장에서 피어난 디지털 식물" />
            <span className={styles.specimenLabel}>SPECIMEN · {localDate.replaceAll("-", ".")}</span>
          </div>
          <div className={styles.revealCopy}>
            <span className={layout.badge}>오늘의 식물</span>
            <h2 id="reveal-title">{plan.stage.name}에서<br />첫 빛을 만났어요.</h2>
            <p className={styles.explanation}>따뜻함과 움직임, 자라는 방향을 조합해 이 문장만의 형태를 만들었습니다.</p>
            <MoodTraits decision={decision} />
            {source === "fallback" && <p className={styles.sourceNote}>로컬 모델 준비가 길어 가벼운 기기 내 규칙으로 먼저 표현했습니다. 기록과 식물은 그대로 안전하게 저장되었습니다.</p>}
            <button className={`${layout.button} ${styles.futureButton}`} type="button" onClick={() => setShowPreview(true)}>미래 정원 미리보기 <span aria-hidden="true">→</span></button>
            <p className={styles.tomorrow}>다음 기록에서 새로운 새싹이 정원에 자리잡습니다.</p>
          </div>
        </section>
      )}

      {showPreview && plan && <FutureBloom identity={plan.identity} dailySeed={plan.dailySeed} quality={state.settings.renderQuality} reducedMotion={state.settings.reducedMotion} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
