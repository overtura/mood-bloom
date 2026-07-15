import type { PlantPlan } from "../core/growth/types";
import styles from "./StaticPlant.module.css";

export function StaticPlant({ plan, label = "디지털 식물 정적 미리보기" }: { plan: PlantPlan; label?: string }) {
  const stageIndex = [1, 3, 7, 14, 30].indexOf(plan.stage.day);
  const sparkleCount = [0, 1, 4, 7, 10][stageIndex] ?? 0;
  const petalCount = plan.identity.symmetry + stageIndex * 2;
  const accentStyle = {
    "--accent": plan.identity.palette[0],
    "--accent-secondary": plan.identity.palette[1],
    "--leaf": plan.identity.palette[2],
    "--stage-scale": 0.72 + stageIndex * 0.075,
  } as React.CSSProperties;
  return (
    <div className={styles.frame} role="img" aria-label={label} style={accentStyle}>
      <div className={styles.halos} aria-hidden="true">
        {Array.from({ length: Math.max(1, Math.min(3, stageIndex)) }, (_, index) => <span key={index} />)}
      </div>
      <div className={styles.sparkles} aria-hidden="true">
        {Array.from({ length: sparkleCount }, (_, index) => (
          <i key={index} style={{ left: `${18 + (index * 37) % 68}%`, top: `${12 + (index * 29) % 52}%` }} />
        ))}
      </div>
      <div className={styles.plant} data-archetype={plan.identity.archetype} data-stage={plan.stage.day}>
        {plan.branchAngles.slice(0, 7).map((angle, index) => (
          <span key={`${angle}-${index}`} className={styles.branch} style={{ transform: `rotate(${angle * 42}deg)`, height: `${38 + index * 6}px` }} />
        ))}
        <div className={styles.bloom}>{Array.from({ length: petalCount }, (_, index) => <i key={index} style={{ transform: `rotate(${index * (360 / petalCount)}deg) translateY(${-17 - stageIndex * 2}px)` }} />)}</div>
        <div className={styles.stem} />
      </div>
      <div className={styles.pot} />
    </div>
  );
}
