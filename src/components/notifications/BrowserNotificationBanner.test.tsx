import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserNotificationBanner } from "./BrowserNotificationBanner";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("BrowserNotificationBanner", () => {
  const originalNotification = globalThis.Notification;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
  });

  it("renders prompt and Enable button when Notification.permission is default", () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "default", requestPermission },
      configurable: true,
      writable: true,
    });

    render(<BrowserNotificationBanner />);

    expect(screen.getByText("promptTitle")).toBeInTheDocument();
    expect(screen.getByText("promptDesc")).toBeInTheDocument();

    const enableBtn = screen.getByRole("button", { name: "enableBtn" });
    fireEvent.click(enableBtn);
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it("renders browser settings instructions when Notification.permission is denied", () => {
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "denied", requestPermission: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<BrowserNotificationBanner />);

    expect(screen.getByText("blockedTitle")).toBeInTheDocument();
    expect(screen.getByText("blockedDesc")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "enableBtn" })).toBeNull();
  });

  it("renders nothing when Notification.permission is already granted", () => {
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "granted", requestPermission: vi.fn() },
      configurable: true,
      writable: true,
    });

    const { container } = render(<BrowserNotificationBanner />);
    expect(container.firstChild).toBeNull();
  });
});
