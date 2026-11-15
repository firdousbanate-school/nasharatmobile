import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  adminFrom: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(() => ({ from: m.adminFrom })),
}));
vi.mock("@/lib/notifications/dispatchModuleNotification", () => ({
  dispatchModuleNotification: m.dispatch,
}));

import { notifyMaintenanceCreated } from "./notifyMaintenanceCreated";
import { notifyMaintenanceStatusUpdated } from "./notifyMaintenanceStatusUpdated";

describe("maintenance notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.dispatch.mockResolvedValue({ delivered: 1 });
  });

  it("notifyMaintenanceCreated notifies maintenance.assign holders excluding the reporter", async () => {
    m.adminFrom.mockImplementation((table: string) => {
      if (table === "role_permissions") {
        return createQueryChain({ data: [{ role_id: "role-admin" }] }).chain;
      }
      if (table === "user_role_assignments") {
        return createQueryChain({
          data: [{ user_id: "admin-1" }, { user_id: "reporter-1" }],
        }).chain;
      }
      return createQueryChain({ data: [] }).chain;
    });

    await notifyMaintenanceCreated({
      requestId: "req-1",
      schoolId: "school-1",
      reporterId: "reporter-1",
      title: "Broken AC",
      priority: "emergency",
    });

    expect(m.dispatch).toHaveBeenCalledTimes(1);
    expect(m.dispatch.mock.calls[0][0]).toEqual({
      recipientUserIds: ["admin-1"],
      schoolId: "school-1",
      type: "maintenance",
      title: "maintenance_created",
      body: JSON.stringify({ title: "Broken AC", priority: "emergency" }),
      entityType: "maintenance_request",
      entityId: "req-1",
    });
  });

  it("notifyMaintenanceStatusUpdated notifies reporter and close-managers when operator resolves a ticket", async () => {
    m.adminFrom.mockImplementation((table: string) => {
      if (table === "role_permissions") {
        return createQueryChain({ data: [{ role_id: "role-admin" }] }).chain;
      }
      if (table === "user_role_assignments") {
        return createQueryChain({ data: [{ user_id: "admin-1" }] }).chain;
      }
      return createQueryChain({ data: [] }).chain;
    });

    await notifyMaintenanceStatusUpdated({
      requestId: "req-2",
      schoolId: "school-1",
      actorId: "op-1",
      reporterId: "rep-1",
      assignedOperatorId: "op-1",
      targetStatus: "resolved",
      title: "Water Leak",
    });

    expect(m.dispatch).toHaveBeenCalledTimes(1);
    expect(m.dispatch.mock.calls[0][0]).toEqual({
      recipientUserIds: ["rep-1", "admin-1"],
      schoolId: "school-1",
      type: "maintenance",
      title: "maintenance_status_updated",
      body: JSON.stringify({ status: "resolved", title: "Water Leak" }),
      entityType: "maintenance_request",
      entityId: "req-2",
      skipThrottle: true,
    });
  });
});
