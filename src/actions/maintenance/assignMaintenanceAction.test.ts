import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  parse: vi.fn(),
  fetchTicket: vi.fn(),
  isMember: vi.fn(),
  save: vi.fn(),
  dispatch: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ marker: "supabase" }),
}));
vi.mock("@/lib/maintenance/assertCanAssignMaintenance", () => ({
  assertCanAssignMaintenance: m.assertCan,
}));
vi.mock("@/lib/validation/parseMaintenanceAssignData", () => ({
  parseMaintenanceAssignData: m.parse,
}));
vi.mock("./fetchAssignableTicket", () => ({ fetchAssignableTicket: m.fetchTicket }));
vi.mock("@/lib/school/isActiveSchoolMember", () => ({ isActiveSchoolMember: m.isMember }));
vi.mock("@/lib/maintenance/saveMaintenanceAssignment", () => ({
  saveMaintenanceAssignment: m.save,
}));
vi.mock("@/lib/notifications/dispatchModuleNotification", () => ({
  dispatchModuleNotification: m.dispatch,
}));

import { assignMaintenanceAction } from "./assignMaintenanceAction";

const form = new FormData();
const ticket = { status: "open", assigned_operator_id: null, priority: "normal" };

describe("assignMaintenanceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ schoolId: "s-1", profileId: "mgr-1" });
    m.parse.mockReturnValue({
      requestId: "t-1",
      operatorId: "op-1",
      priority: "high",
      notes: "urgent",
    });
    m.fetchTicket.mockResolvedValue(ticket);
    m.isMember.mockResolvedValue(true);
    m.save.mockResolvedValue({ error: null });
  });

  it("stops at the permission check", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await assignMaintenanceAction(form);

    expect(res.success).toBe(false);
    expect(m.fetchTicket).not.toHaveBeenCalled();
    expect(m.save).not.toHaveBeenCalled();
  });

  it("requires both a request and an operator", async () => {
    m.parse.mockReturnValue({ requestId: "t-1", operatorId: "" });
    const res = await assignMaintenanceAction(form);

    expect(res.error).toBe("Request ID and Operator are required");
    expect(m.save).not.toHaveBeenCalled();
  });

  it("loads the ticket within the caller's school", async () => {
    await assignMaintenanceAction(form);
    expect(m.fetchTicket).toHaveBeenCalledWith({ marker: "supabase" }, "t-1", "s-1");
  });

  it("rejects an operator from another school (cross-tenant assignment)", async () => {
    m.isMember.mockResolvedValue(false);
    const res = await assignMaintenanceAction(form);

    expect(m.isMember).toHaveBeenCalledWith({ marker: "supabase" }, "op-1", "s-1");
    expect(res.success).toBe(false);
    expect(res.error).toBe("The selected operator does not belong to this school");
    expect(m.save).not.toHaveBeenCalled();
    expect(m.dispatch).not.toHaveBeenCalled();
  });

  it("saves the assignment, notifies the new operator and refreshes both pages", async () => {
    const res = await assignMaintenanceAction(form);

    expect(res).toEqual({ success: true });
    expect(m.save.mock.calls[0][1]).toMatchObject({
      requestId: "t-1",
      schoolId: "s-1",
      operatorId: "op-1",
      assignedBy: "mgr-1",
      currentStatus: "open",
      priority: "high",
    });
    expect(m.dispatch.mock.calls[0][0]).toMatchObject({
      recipientUserIds: ["op-1"],
      schoolId: "s-1",
      entityId: "t-1",
    });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/maintenance/t-1", "page");
  });

  it("does not re-notify an operator who is already assigned", async () => {
    m.fetchTicket.mockResolvedValue({ ...ticket, assigned_operator_id: "op-1" });
    await assignMaintenanceAction(form);

    expect(m.dispatch).not.toHaveBeenCalled();
  });

  it("reports a failed save without notifying or refreshing", async () => {
    m.save.mockResolvedValue({ error: { code: "42501", message: "denied" } });
    const res = await assignMaintenanceAction(form);

    expect(res.success).toBe(false);
    expect(m.dispatch).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
