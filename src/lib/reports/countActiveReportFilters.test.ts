import { describe, expect, it } from "vitest";
import { countActiveReportFilters } from "./countActiveReportFilters";
import type { ReportFilterState } from "./types";

const defaults: ReportFilterState = {
  dateMode: "all",
  month: "",
  fromDate: "",
  toDate: "",
  dateSort: "desc",
  departmentId: "all",
  departmentSort: "none",
};

describe("countActiveReportFilters", () => {
  it("is 0 for default filters", () => {
    expect(countActiveReportFilters(defaults)).toBe(0);
  });

  it("counts each non-default filter or sort", () => {
    expect(countActiveReportFilters({ ...defaults, departmentId: "d1" })).toBe(1);
    expect(
      countActiveReportFilters({
        ...defaults,
        dateMode: "month",
        dateSort: "asc",
        departmentSort: "asc",
      }),
    ).toBe(3);
  });
});
