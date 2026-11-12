import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  hasPermission: vi.fn(),
  parse: vi.fn(),
  fetchTicket: vi.fn(),
  isLegal: vi.fn(),
  assertTransition: vi.fn(),
  apply: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ marker: "supabase" }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/rbac/hasPermission", () => ({ hasPermission: m.hasPermission }));
vi.mock("@/lib/validation/parseMaintenanceTransitionData", () => ({
  parseMaintenanceTransitionData: m.parse,
}));
vi.mock("./fetchTicketForTransition", () => ({ fetchTicketForTransition: m.fetchTicket }));
vi.mock("@/lib/maintenance/isLegalTransition", () => ({ isLegalTransition: m.isLegal }));
vi.mock("@/lib/maintenance/assertCanTransitionStatus", () => ({
  assertCanTransitionStatus: m.assertTransition,
}));
vi.mock("@/lib/maintenance/applyMaintenanceStatusChange", () => ({
  applyMaintenanceStatusChange: m.apply,
}));

import { updateMaintenanceStatusAction } from "./updateMaintenanceStatusAction";

const form = new FormData();
const ticket = { status: "open", reporter_id: "rep-1", assigned_operator_id: "op-1" };

describe("updateMaintenanceStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "op-1", school_id: "s-1" });
    m.parse.mockReturnValue({
      requestId: "t-1",
      targetStatus: "in_progress",
      reason: null,
      evidencePhoto: null,
    });
    m.fetchTicket.mockResolvedValue(ticket);
    m.isLegal.mockReturnValue(true);
    m.hasPermission.mockResolvedValue(false);
    m.assertTransition.mockReturnValue({ ok: true });
    m.apply.mockResolvedValue(undefined);
  });

  it("requires a profile with a school", async () => {
    m.profile.mockResolvedValue({ id: "op-1", school_id: null });
    const res = await updateMaintenanceStatusAction(form);

    expect(res.success).toBe(false);
    expect(m.fetchTicket).not.toHaveBeenCalled();
  });

  it("requires a request and a target status", async () => {
    m.parse.mockReturnValue({ requestId: "", targetStatus: "" });
    const res = await updateMaintenanceStatusAction(form);

    expect(res.error).toBe("Invalid status transition request");
    expect(m.fetchTicket).not.toHaveBeenCalled();
  });

  it("rejects an illegal status jump before any permission check or write", async () => {
    m.isLegal.mockReturnValue(false);
    const res = await updateMaintenanceStatusAction(form);

    expect(m.isLegal).toHaveBeenCalledWith("open", "in_progress");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Illegal transition");
    expect(m.assertTransition).not.toHaveBeenCalled();
    expect(m.apply).not.toHaveBeenCalled();
  });

  it("passes the caller's role in this ticket and school permissions to the rules", async () => {
    m.hasPermission.mockImplementation(async (key: string) => key === "maintenance.close");
    await updateMaintenanceStatusAction(form);

    expect(m.hasPermission).toHaveBeenCalledWith("maintenance.assign", "s-1");
    expect(m.hasPermission).toHaveBeenCalledWith("maintenance.close", "s-1");
    expect(m.assertTransition.mock.calls[0][0]).toMatchObject({
      targetStatus: "in_progress",
      isReporter: false,
      isAssigned: true,
      canAssign: false,
      canClose: true,
    });
  });

  it("does not write when the transition rules deny the caller", async () => {
    m.assertTransition.mockReturnValue({ ok: false, error: "Only the reporter can reopen" });
    const res = await updateMaintenanceStatusAction(form);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Only the reporter can reopen");
    expect(m.apply).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("applies the change with the caller's school and user, then refreshes both pages", async () => {
    const res = await updateMaintenanceStatusAction(form);

    expect(res).toEqual({ success: true });
    expect(m.apply.mock.calls[0][1]).toMatchObject({
      requestId: "t-1",
      schoolId: "s-1",
      userId: "op-1",
      targetStatus: "in_progress",
      oldStatus: "open",
    });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/maintenance/t-1", "page");
  });

  it("returns a failure (not a false success) when applying the change throws", async () => {
    m.apply.mockRejectedValue(new Error("Maintenance request not found or unauthorized"));
    const res = await updateMaintenanceStatusAction(form);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
