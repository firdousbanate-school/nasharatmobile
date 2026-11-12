import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAssert, mockValidate, mockRestore, mockAudit, mockRevalidate } = vi.hoisted(() => ({
  mockAssert: vi.fn(),
  mockValidate: vi.fn(),
  mockRestore: vi.fn(),
  mockAudit: vi.fn(),
  mockRevalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/backup", () => ({
  assertCanManageBackup: mockAssert,
  validateBackupPayload: mockValidate,
  restoreDatabaseBackup: mockRestore,
  writeBackupAudit: mockAudit,
}));

import { restoreBackupAction } from "./restoreBackupAction";

const access = { allowed: true, role: "owner" };
const payload = {
  metadata: { scope: "school", schoolId: "s-1", totalRows: 10, checksum: "abc" },
};
const phases = () => mockAudit.mock.calls.map((c) => c[0].phase);

describe("restoreBackupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssert.mockResolvedValue(access);
    mockValidate.mockReturnValue(payload);
  });

  it("refuses callers without backup access before touching anything", async () => {
    mockAssert.mockResolvedValue({ allowed: false });
    const res = await restoreBackupAction({});

    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
    expect(mockValidate).not.toHaveBeenCalled();
    expect(mockRestore).not.toHaveBeenCalled();
    expect(mockAudit).not.toHaveBeenCalled();
  });

  it("rejects a malformed file without writing an audit trail or restoring", async () => {
    mockValidate.mockImplementation(() => {
      throw new Error("Invalid backup file");
    });
    const res = await restoreBackupAction({ junk: true });

    expect(res.success).toBe(false);
    expect(mockRestore).not.toHaveBeenCalled();
    expect(mockAudit).not.toHaveBeenCalled();
  });

  it("audits start then success, returns the summary and refreshes the app", async () => {
    const summary = {
      totalRecords: 10,
      tableCounts: {},
      snapshotId: "snap-1",
      authUsersCreated: 0,
    };
    mockRestore.mockResolvedValue(summary);
    const res = await restoreBackupAction({});

    expect(res).toEqual({ success: true, summary });
    expect(phases()).toEqual(["start", "success"]);
    expect(mockRestore).toHaveBeenCalledWith(access, payload);
    expect(mockRevalidate).toHaveBeenCalledWith("/", "layout");
  });

  it("audits a failure, reports it and does not refresh when the restore fails", async () => {
    mockRestore.mockRejectedValue(new Error("restore exploded"));
    const res = await restoreBackupAction({});

    expect(res.success).toBe(false);
    expect(phases()).toEqual(["start", "failure"]);
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
