import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}

function getPathname() {
  return window.location.pathname;
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => "/");
}

export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function AppLink({ href, children, className, ariaCurrent }: { href: string; children: ReactNode; className?: string; ariaCurrent?: "page" }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  }
  return <a href={href} className={className} aria-current={ariaCurrent} onClick={handleClick}>{children}</a>;
}
