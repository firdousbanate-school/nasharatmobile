import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileTabBar } from "./MobileTabBar";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "ar",
}));

vi.mock("@/i18n", () => ({
  usePathname: () => "/circulars/123",
  Link: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/layout/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <button type="button">lang</button>,
}));
vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">theme</button>,
}));

function openMore(props: Partial<React.ComponentProps<typeof MobileTabBar>> = {}) {
  render(<MobileTabBar canManageSettings={false} canViewReports={false} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "more" }));
  return within(screen.getByRole("dialog"));
}

describe("MobileTabBar", () => {
  afterEach(cleanup);

  it("shows the four primary destinations and marks the current section active", () => {
    render(<MobileTabBar canManageSettings={false} canViewReports={false} />);
    const nav = within(screen.getByRole("navigation", { name: "primary" }));
    expect(nav.getByRole("link", { name: "dashboard" }).getAttribute("href")).toBe("/dashboard");
    expect(nav.getByRole("link", { name: "circularsShort" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(nav.getByRole("link", { name: "calendar" }).getAttribute("href")).toBe("/calendar");
    expect(nav.getByRole("link", { name: "maintenance" }).getAttribute("href")).toBe(
      "/maintenance",
    );
  });

  it("hides every gated destination from a regular user", () => {
    const sheet = openMore();
    expect(sheet.getByRole("link", { name: "notifications" })).toBeDefined();
    expect(sheet.queryByRole("link", { name: "achievements" })).toBeNull();
    expect(sheet.queryByRole("link", { name: "reports" })).toBeNull();
    expect(sheet.queryByRole("link", { name: "settings" })).toBeNull();
    expect(sheet.queryByRole("link", { name: "backup" })).toBeNull();
  });

  it("shows each destination only when its permission is granted", () => {
    expect(openMore({ isOwner: true }).getByRole("link", { name: "achievements" })).toBeDefined();
    cleanup();
    expect(openMore({ canViewReports: true }).getByRole("link", { name: "reports" })).toBeDefined();
    cleanup();
    expect(
      openMore({ canManageSettings: true }).getByRole("link", { name: "settings" }),
    ).toBeDefined();
    cleanup();
    expect(
      openMore({ canBackupRestore: true }).getByRole("link", { name: "backup" }),
    ).toBeDefined();
  });

  it("shows language and theme controls to non-owners as well (matching the header)", () => {
    const sheet = openMore();
    expect(sheet.getByText("lang")).toBeDefined();
    expect(sheet.getByText("theme")).toBeDefined();
  });

  it("offers language and theme controls to the owner", () => {
    const sheet = openMore({ isOwner: true });
    expect(sheet.getByText("lang")).toBeDefined();
    expect(sheet.getByText("theme")).toBeDefined();
  });

  it("shows the school documents only with the documents permission", () => {
    expect(openMore().queryByRole("link", { name: "operationalPlan" })).toBeNull();
    cleanup();
    const sheet = openMore({ canViewDocuments: true });
    expect(sheet.getByRole("link", { name: "operationalPlan" }).getAttribute("href")).toBe(
      "/documents/operational-plan",
    );
    expect(sheet.getByRole("link", { name: "committeesGuide" })).toBeDefined();
    expect(sheet.getByRole("link", { name: "counselingGuide" })).toBeDefined();
  });

  it("closes the sheet when a destination is selected", () => {
    const sheet = openMore({ canViewReports: true });
    fireEvent.click(sheet.getByRole("link", { name: "reports" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
