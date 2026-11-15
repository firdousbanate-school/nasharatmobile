import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showBrowserNotification } from "./showBrowserNotification";

describe("showBrowserNotification", () => {
  const originalNotification = globalThis.Notification;
  const originalSw = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
  const ctor = vi.fn();

  function setNotification(permission: NotificationPermission) {
    const fake = Object.assign(ctor, { permission });
    Object.defineProperty(globalThis, "Notification", {
      value: fake,
      configurable: true,
      writable: true,
    });
  }

  function setVisibility(state: DocumentVisibilityState) {
    Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  }

  function setRegistration(registration: unknown) {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration: vi.fn().mockResolvedValue(registration) },
      configurable: true,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setNotification("granted");
    setVisibility("hidden");
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
    if (originalSw) Object.defineProperty(navigator, "serviceWorker", originalSw);
    setVisibility("visible");
  });

  it("uses the service worker registration (required on Android) with the target url", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    setRegistration({ showNotification });

    await showBrowserNotification({ title: "T", body: "B", url: "/circulars/c-1", tag: "n-1" });

    expect(showNotification).toHaveBeenCalledWith(
      "T",
      expect.objectContaining({ body: "B", tag: "n-1", data: { url: "/circulars/c-1" } }),
    );
    expect(ctor).not.toHaveBeenCalled();
  });

  it("falls back to the page constructor when no service worker is registered", async () => {
    setRegistration(undefined);

    await showBrowserNotification({ title: "T" });

    expect(ctor).toHaveBeenCalledWith(
      "T",
      expect.objectContaining({ data: { url: "/notifications" } }),
    );
  });

  it("does nothing while the page is visible or permission is not granted", async () => {
    const showNotification = vi.fn();
    setRegistration({ showNotification });

    setVisibility("visible");
    await showBrowserNotification({ title: "T" });
    setVisibility("hidden");
    setNotification("denied");
    await showBrowserNotification({ title: "T" });

    expect(showNotification).not.toHaveBeenCalled();
    expect(ctor).not.toHaveBeenCalled();
  });
});
