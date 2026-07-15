import { useEffect, useRef, type ReactNode } from "react";
import { AppLink, usePathname } from "./routes";
import { useApp } from "./AppProvider";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  ["/", "오늘", "오늘의 기록"],
  ["/garden", "정원", "나의 정원"],
  ["/evolution", "진화", "진화 온실"],
  ["/settings", "설정", "내 기기 설정"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { storageMessage } = useApp();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const routeTitle = NAV_ITEMS.find(([href]) => href === pathname)?.[2] ?? "페이지를 찾을 수 없음";
    document.title = `${routeTitle} | 무드 블룸`;
    if (previousPathname.current !== pathname) mainRef.current?.focus({ preventScroll: true });
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#main-content">본문 바로가기</a>
      <header className={styles.header}>
        <AppLink href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true"><i /><i /></span>
          <span>무드 블룸</span>
        </AppLink>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_ITEMS.map(([href, label]) => (
            <AppLink key={href} href={href} ariaCurrent={pathname === href ? "page" : undefined} className={pathname === href ? styles.active : undefined}>
              {label}
            </AppLink>
          ))}
        </nav>
      </header>
      {storageMessage && <p className={styles.storageAlert} role="alert">{storageMessage}</p>}
      <main id="main-content" ref={mainRef} tabIndex={-1}>{children}</main>
      <footer className={styles.footer}>
        <p>당신의 문장은 이 기기 안에서만 머뭅니다.</p>
        <span>문장의 인상을 표현하며 심리 상태를 진단하지 않습니다.</span>
      </footer>
    </div>
  );
}
