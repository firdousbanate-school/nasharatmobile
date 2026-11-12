import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { mockGetCurrentProfile, mockGetCurrentSchool, mockRedirect } = vi.hoisted(() => ({
  mockGetCurrentProfile: vi.fn(),
  mockGetCurrentSchool: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockImplementation((ns: string) => {
    return (key: string) => `${ns}.${key}`;
  }),
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/lib/auth/getCurrentProfile", () => ({
  getCurrentProfile: mockGetCurrentProfile,
}));

vi.mock("@/lib/school/getCurrentSchool", () => ({
  getCurrentSchool: mockGetCurrentSchool,
}));

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

vi.mock("@/components/auth/AuthShell", () => ({
  AuthShell: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentSchool.mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects to /dashboard when an active profile exists", async () => {
    mockGetCurrentProfile.mockResolvedValue({
      id: "user-1",
      full_name: "Owner",
      email: "elnewahy@gmail.com",
      job_title: null,
      school_id: "sch-1",
      department_id: null,
      is_active: true,
    });

    await LoginPage({ params: Promise.resolve({ locale: "ar" }) });

    expect(mockRedirect).toHaveBeenCalledWith({ href: "/dashboard", locale: "ar" });
  });

  it("does not redirect when auth session exists without a profile row (prevents redirect loop)", async () => {
    mockGetCurrentProfile.mockResolvedValue(null);

    const element = await LoginPage({ params: Promise.resolve({ locale: "ar" }) });
    render(element);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("does not redirect when profile is inactive (prevents redirect loop)", async () => {
    mockGetCurrentProfile.mockResolvedValue({
      id: "user-1",
      full_name: "Inactive User",
      email: "inactive@school.edu.kw",
      job_title: null,
      school_id: "sch-1",
      department_id: null,
      is_active: false,
    });

    const element = await LoginPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
