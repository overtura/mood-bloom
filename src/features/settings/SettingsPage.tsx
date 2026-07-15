import { useRef, useState, type ChangeEvent } from "react";
import { useApp } from "../../app/AppProvider";
import { exportGardenState, importGardenState } from "../../core/storage/storage";
import { PageIntro } from "../../ui/PageIntro";
import layout from "../../ui/layout.module.css";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { state, replaceState, clearState, setQuality, setReducedMotion } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const blob = new Blob([exportGardenState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mood-bloom-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("정원 백업 파일을 저장했습니다.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      replaceState(importGardenState(await file.text()));
      setMessage("백업에서 정원을 복원했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "백업을 불러오지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  }

  function handleClear() {
    if (!window.confirm("이 기기의 Mood Bloom 기록을 모두 지울까요? 내보낸 백업이 없으면 되돌릴 수 없습니다.")) return;
    clearState();
    setMessage("이 기기의 정원 기록을 모두 지웠습니다.");
  }

  return (
    <div className={layout.page}>
      <PageIntro eyebrow="Settings" title="내 기기, 내 정원"><p>기록은 계정 없이 이 브라우저에 저장됩니다. 직접 백업하고 복원하며, 표시 방식도 편안하게 조절할 수 있습니다.</p></PageIntro>
      {message && <div className={styles.message} role="status">{message}</div>}
      <div className={styles.settingsGrid}>
        <section className={`${layout.panel} ${styles.section}`} aria-labelledby="display-title">
          <div className={styles.sectionHeading}><span>01</span><div><h2 id="display-title">표시와 움직임</h2><p>기기 성능과 선호에 맞게 정원의 표현을 조절합니다.</p></div></div>
          <label className={styles.field}><span><strong>렌더링 품질</strong><small>입자 수와 조명 품질만 바뀌며 식물의 정체성은 유지됩니다.</small></span><select value={state.settings.renderQuality} onChange={(event) => setQuality(event.target.value as typeof state.settings.renderQuality)}><option value="low">낮음</option><option value="medium">보통</option><option value="high">높음</option></select></label>
          <label className={styles.field}><span><strong>움직임 줄이기</strong><small>성장 전환과 식물의 흔들림을 최소화합니다.</small></span><input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label>
        </section>

        <section className={`${layout.panel} ${styles.section}`} aria-labelledby="data-title">
          <div className={styles.sectionHeading}><span>02</span><div><h2 id="data-title">백업과 복원</h2><p>JSON 파일 하나로 {state.entries.length}개의 기록과 설정을 옮길 수 있습니다.</p></div></div>
          <div className={styles.actions}><button type="button" className={layout.button} onClick={handleExport}>정원 내보내기</button><button type="button" className={`${layout.button} ${layout.secondary}`} onClick={() => fileInput.current?.click()}>백업 불러오기</button><input ref={fileInput} className={styles.hidden} type="file" accept="application/json,.json" onChange={handleImport} /></div>
          <p className={layout.quiet}>가져오기 전에 파일 구조와 schemaVersion을 확인합니다. 손상된 데이터는 현재 정원을 덮어쓰지 않습니다.</p>
        </section>

        <section className={`${layout.panel} ${styles.section} ${styles.privacy}`} aria-labelledby="privacy-title">
          <div className={styles.sectionHeading}><span>03</span><div><h2 id="privacy-title">개인정보 안내</h2><p>문장, 분류 결과, 씨앗 값은 브라우저의 LocalStorage에만 보관됩니다.</p></div></div>
          <ul><li>외부 AI 추론 API를 호출하지 않습니다.</li><li>문장을 서버, 데이터베이스, 분석 도구로 보내지 않습니다.</li><li>공개 모델 가중치는 필요할 때 모델 저장소에서 브라우저로 직접 내려받습니다.</li><li>감정 진단이나 의료적 해석을 제공하지 않습니다.</li></ul>
        </section>

        <section className={`${layout.panel} ${styles.section} ${styles.dangerZone}`} aria-labelledby="delete-title">
          <div><h2 id="delete-title">이 기기의 정원 지우기</h2><p>내보낸 백업이 없다면 기록과 해금 상태를 되돌릴 수 없습니다.</p></div><button type="button" className={`${layout.button} ${layout.danger}`} onClick={handleClear}>전체 데이터 삭제</button>
        </section>
      </div>
    </div>
  );
}
