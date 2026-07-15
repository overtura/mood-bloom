import type { ReactNode } from "react";
import { AppLink, usePathname } from "./routes";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  ["/", "오늘"],
  ["/garden", "정원"],
  ["/evolution", "진화"],
  ["/settings", "설정"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <AppLink href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true"><i /><i /></span>
          <span>Mood Bloom</span>
        </AppLink>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_ITEMS.map(([href, label]) => (
            <AppLink key={href} href={href} className={pathname === href ? styles.active : undefined}>
              {label}
            </AppLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className={styles.footer}>
        <p>당신의 문장은 이 기기 안에서만 머뭅니다.</p>
        <span>문장의 인상을 표현하며 심리 상태를 진단하지 않습니다.</span>
      </footer>
    </div>
  );
}
