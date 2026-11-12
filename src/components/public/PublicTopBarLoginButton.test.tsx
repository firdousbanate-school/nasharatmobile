import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicTopBarLoginButton } from "./PublicTopBarLoginButton";

vi.mock("next-intl", () => ({
  useLocale: () => "ar",
  useTranslations: () => (key: string) => key === "portalSignIn" ? "دخول منصة المدرسة" : key,
}));

describe("PublicTopBarLoginButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a link to the login page with localized text", () => {
    render(<PublicTopBarLoginButton />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/ar/login");
    expect(screen.getByText("دخول منصة المدرسة")).toBeInTheDocument();
  });
});
