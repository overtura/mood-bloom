import { useEffect, useState } from "react";
import { subscribeMoodStatus } from "../../core/mood/mood-client";
import type { MoodModelStatus } from "../../core/mood/types";
import styles from "./ModelStatus.module.css";

const INITIAL: MoodModelStatus = { phase: "idle", progress: 0, message: "입력을 시작하면 로컬 모델을 준비해요" };

export function ModelStatus() {
  const [status, setStatus] = useState(INITIAL);
  useEffect(() => subscribeMoodStatus(setStatus), []);
  return (
    <div className={styles.status} data-phase={status.phase}>
      <div className={styles.row}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{status.message}</span>
        {status.phase === "loading" && <strong>{status.progress}%</strong>}
      </div>
      {status.phase === "loading" && <div className={styles.track} role="progressbar" aria-label="로컬 모델 다운로드" aria-valuemin={0} aria-valuemax={100} aria-valuenow={status.progress}><i style={{ width: `${status.progress}%` }} /></div>}
      <p>문장은 외부 AI 서비스로 전송되지 않습니다.</p>
    </div>
  );
}
