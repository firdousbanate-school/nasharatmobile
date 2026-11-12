import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SegmentedTabs } from "./SegmentedTabs";

const tabs = [
  { id: "a", label: "Details", content: <p>panel-a</p> },
  { id: "b", label: "Activity", content: <p>panel-b</p> },
];

describe("SegmentedTabs", () => {
  afterEach(cleanup);

  it("selects the first tab by default and marks the others hidden on phones", () => {
    render(<SegmentedTabs tabs={tabs} />);
    expect(screen.getByRole("tab", { name: "Details" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("panel-a").parentElement?.className).toContain("block");
    expect(screen.getByText("panel-b").parentElement?.className).toContain("hidden md:block");
  });

  it("switches the visible panel when a tab is clicked", () => {
    render(<SegmentedTabs tabs={tabs} />);
    fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tab", { name: "Activity" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByText("panel-b").parentElement?.className).not.toContain("hidden");
    expect(screen.getByText("panel-a").parentElement?.className).toContain("hidden md:block");
  });

  it("honours defaultTabId", () => {
    render(<SegmentedTabs tabs={tabs} defaultTabId="b" />);
    expect(screen.getByRole("tab", { name: "Activity" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});
