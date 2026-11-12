import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./BottomSheet";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("BottomSheet", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("renders nothing while closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Filters">
        content
      </BottomSheet>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders an accessible dialog and locks body scroll while open", () => {
    render(
      <BottomSheet open onClose={() => {}} title="Filters">
        content
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape, close button and backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Filters">
        content
      </BottomSheet>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "close" }));
    fireEvent.click(document.body.querySelector('[aria-hidden="true"]') as Element);
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(container).toBeDefined();
  });

  it("restores body scroll when it closes", () => {
    const { rerender } = render(
      <BottomSheet open onClose={() => {}} title="Filters">
        content
      </BottomSheet>,
    );
    rerender(
      <BottomSheet open={false} onClose={() => {}} title="Filters">
        content
      </BottomSheet>,
    );
    expect(document.body.style.overflow).toBe("");
  });
});
