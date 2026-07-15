import type { PlantPlan } from "../core/growth/types";
import styles from "./StaticPlant.module.css";

export function StaticPlant({ plan, label = "디지털 식물 정적 미리보기" }: { plan: PlantPlan; label?: string }) {
  const accentStyle = { "--accent": plan.identity.palette[0], "--leaf": plan.identity.palette[2] } as React.CSSProperties;
  return (
    <div className={styles.frame} role="img" aria-label={label} style={accentStyle}>
      <div className={styles.halo} />
      <div className={styles.plant} data-archetype={plan.identity.archetype}>
        {plan.branchAngles.slice(0, 7).map((angle, index) => (
          <span key={`${angle}-${index}`} className={styles.branch} style={{ transform: `rotate(${angle * 42}deg)`, height: `${38 + index * 6}px` }} />
        ))}
        <div className={styles.bloom}>{Array.from({ length: plan.identity.symmetry }, (_, index) => <i key={index} style={{ transform: `rotate(${index * (360 / plan.identity.symmetry)}deg) translateY(-19px)` }} />)}</div>
        <div className={styles.stem} />
      </div>
      <div className={styles.pot} />
    </div>
  );
}
