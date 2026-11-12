import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => Object.assign((key: string) => key, { has: () => true }),
  useLocale: () => "en",
}));
vi.mock("@/i18n", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/circulars/CircularPriorityBadge", () => ({
  CircularPriorityBadge: ({ priority }: { priority: string }) => (
    <span>{`priority:${priority}`}</span>
  ),
}));
vi.mock("@/components/circulars/CircularStatusBadge", () => ({
  CircularStatusBadge: ({ status }: { status: string }) => <span>{`status:${status}`}</span>,
}));
vi.mock("@/components/maintenance/MaintenancePriorityBadge", () => ({
  MaintenancePriorityBadge: ({ priority }: { priority: string }) => (
    <span>{`priority:${priority}`}</span>
  ),
}));
vi.mock("@/components/maintenance/MaintenanceStatusBadge", () => ({
  MaintenanceStatusBadge: ({ status }: { status: string }) => <span>{`status:${status}`}</span>,
}));
vi.mock("./CircularReportExpandedDepts", () => ({
  CircularReportExpandedDepts: ({
    responded,
    pending,
  }: {
    responded: unknown[];
    pending: unknown[];
  }) => (
    <div data-testid="expanded">{`responded:${responded.length} pending:${pending.length}`}</div>
  ),
}));

import { CircularReportCard } from "./CircularReportCard";
import { CircularsReportTable } from "./CircularsReportTable";
import { CompliancePercentBadge } from "./CompliancePercentBadge";
import { DepartmentComplianceCard } from "./DepartmentComplianceCard";
import { DepartmentComplianceTable } from "./DepartmentComplianceTable";
import { MaintenanceReportCard } from "./MaintenanceReportCard";
import { MaintenanceReportTable } from "./MaintenanceReportTable";
import type {
  CircularReportRow,
  DepartmentComplianceItem,
  MaintenanceReportRow,
} from "@/lib/reports/types";

const circularRow = {
  id: "c-1",
  refNumber: "C-2026-014",
  title: "Exam schedule",
  priority: "urgent",
  status: "published",
  targeted: 8,
  compliant: 6,
  percent: 75,
  respondedDepartments: [{ id: "d1" }, { id: "d2" }],
  pendingDepartments: [{ id: "d3" }],
} as unknown as CircularReportRow;

const ticketRow = {
  id: "t-1",
  ticketNumber: "SR-0042",
  title: "Leak in washroom",
  priority: "urgent",
  status: "in_progress",
  locationName: "Block A",
  departmentName: null,
  operatorName: null,
  resolutionTimeHours: null,
} as unknown as MaintenanceReportRow;

const department = {
  departmentId: "d-1",
  departmentName: "Science",
  targeted: 10,
  compliant: 6,
  overdue: 3,
  notYetDue: 1,
  percent: 60,
} as unknown as DepartmentComplianceItem;

describe("report cards", () => {
  afterEach(cleanup);

  it("CompliancePercentBadge colors by threshold and shows a dash when unknown", () => {
    const tone = (p: number | null) => {
      const { container, unmount } = render(<CompliancePercentBadge percent={p} />);
      const el = container.firstElementChild as HTMLElement;
      const out = { text: el.textContent, cls: el.className };
      unmount();
      return out;
    };
    expect(tone(80)).toMatchObject({ text: "80%", cls: expect.stringContaining("text-success") });
    expect(tone(50)).toMatchObject({ text: "50%", cls: expect.stringContaining("text-warning") });
    expect(tone(49)).toMatchObject({
      text: "49%",
      cls: expect.stringContaining("text-destructive"),
    });
    expect(tone(null)).toMatchObject({
      text: "—",
      cls: expect.stringContaining("text-muted-foreground"),
    });
  });

  it("CircularReportCard links to the circular, labels its numbers and expands on demand", () => {
    render(<CircularReportCard row={circularRow} />);

    expect(screen.getByRole("link", { name: "C-2026-014" }).getAttribute("href")).toBe(
      "/circulars/c-1",
    );
    expect(screen.getByText("table.targeted")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getByText("75%")).toBeDefined();
    expect(screen.queryByTestId("expanded")).toBeNull();

    const toggle = screen.getByRole("button", { name: "whoResponded" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("expanded").textContent).toBe("responded:2 pending:1");
    fireEvent.click(toggle);
    expect(screen.queryByTestId("expanded")).toBeNull();
  });

  it("MaintenanceReportCard links to the ticket and shows a dash for missing values", () => {
    render(<MaintenanceReportCard row={ticketRow} />);

    expect(screen.getByRole("link", { name: "SR-0042" }).getAttribute("href")).toBe(
      "/maintenance/t-1",
    );
    expect(screen.getByText("Block A")).toBeDefined();
    expect(screen.getAllByText("—")).toHaveLength(3);
    render(
      <MaintenanceReportCard
        row={{ ...ticketRow, resolutionTimeHours: 5 } as MaintenanceReportRow}
      />,
    );
    expect(screen.getByText("5h")).toBeDefined();
  });

  it("DepartmentComplianceCard sums overdue and not-yet-due as pending", () => {
    render(<DepartmentComplianceCard item={department} />);

    expect(screen.getByText("Science")).toBeDefined();
    expect(screen.getByText("60%")).toBeDefined();
    expect(screen.getByText("table.pending").previousElementSibling?.textContent).toBe("4");
  });
});

describe("report tables render cards on phones and the table from md", () => {
  afterEach(cleanup);

  it("CircularsReportTable", () => {
    const { container } = render(<CircularsReportTable rows={[circularRow]} />);
    expect(container.querySelector(".md\\:hidden")).not.toBeNull();
    expect(container.querySelector(".max-md\\:hidden table")).not.toBeNull();
  });

  it("MaintenanceReportTable", () => {
    const { container } = render(<MaintenanceReportTable rows={[ticketRow]} />);
    expect(container.querySelector(".md\\:hidden")).not.toBeNull();
    expect(container.querySelector(".max-md\\:hidden table")).not.toBeNull();
  });

  it("DepartmentComplianceTable", () => {
    const { container } = render(<DepartmentComplianceTable items={[department]} />);
    expect(container.querySelector(".md\\:hidden")).not.toBeNull();
    expect(container.querySelector(".max-md\\:hidden table")).not.toBeNull();
  });

  it("keeps the empty state for an empty list", () => {
    render(<CircularsReportTable rows={[]} />);
    expect(screen.getByText("noData")).toBeDefined();
  });
});
