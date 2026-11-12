import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePublicCircularFilters } from "./usePublicCircularFilters";
import type { CircularRow } from "@/lib/circulars/types";

const mockCirculars: Partial<CircularRow>[] = [
  {
    id: "1",
    ref_number: "CIR-2026-0001",
    title: "Exam schedule",
    body: "Final exams",
    publish_at: "2026-11-01T10:00:00Z",
  },
  {
    id: "2",
    ref_number: "CIR-2026-0002",
    title: "Meeting invitation",
    body: "Parent meeting",
    publish_at: "2026-10-15T10:00:00Z",
  },
];

describe("usePublicCircularFilters", () => {
  it("initializes with initialMonth if provided", () => {
    const { result } = renderHook(() =>
      usePublicCircularFilters(mockCirculars as CircularRow[], "2026-11"),
    );

    expect(result.current.selectedMonth).toBe("2026-11");
    expect(result.current.filteredCirculars).toHaveLength(1);
    expect(result.current.filteredCirculars[0].id).toBe("1");
  });

  it("filters by month key", () => {
    const { result } = renderHook(() =>
      usePublicCircularFilters(mockCirculars as CircularRow[]),
    );

    expect(result.current.filteredCirculars).toHaveLength(2);

    act(() => {
      result.current.setSelectedMonth("2026-11");
    });

    expect(result.current.filteredCirculars).toHaveLength(1);
    expect(result.current.filteredCirculars[0].id).toBe("1");
  });

  it("filters by search query", () => {
    const { result } = renderHook(() =>
      usePublicCircularFilters(mockCirculars as CircularRow[]),
    );

    act(() => {
      result.current.setSearchQuery("parent");
    });

    expect(result.current.filteredCirculars).toHaveLength(1);
    expect(result.current.filteredCirculars[0].id).toBe("2");
  });

  it("resets filters back to initial value", () => {
    const { result } = renderHook(() =>
      usePublicCircularFilters(mockCirculars as CircularRow[], "2026-11"),
    );

    act(() => {
      result.current.setSelectedMonth("all");
      result.current.setSearchQuery("exam");
      result.current.resetFilters();
    });

    expect(result.current.selectedMonth).toBe("2026-11");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.filteredCirculars).toHaveLength(1);
  });
});
