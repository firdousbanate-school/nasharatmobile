interface BadgingNavigator {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

export function syncAppBadge(unreadCount: number): void {
  if (typeof navigator === "undefined") return;

  const nav = navigator as unknown as BadgingNavigator;
  if (unreadCount > 0 && typeof nav.setAppBadge === "function") {
    void nav.setAppBadge(unreadCount).catch(() => undefined);
  } else if (unreadCount <= 0 && typeof nav.clearAppBadge === "function") {
    void nav.clearAppBadge().catch(() => undefined);
  }
}
