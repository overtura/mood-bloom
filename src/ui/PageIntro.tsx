import type { ReactNode } from "react";
import styles from "./layout.module.css";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.description}>{children}</div>
    </header>
  );
}
