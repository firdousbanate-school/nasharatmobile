import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  exportBackup: vi.fn(),
  audit: vi.fn(),
  validate: vi.fn(),
  diff: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn().mockReturnValue({ marker: "admin" }),
}));
vi.mock("@/lib/backup", () => ({
  assertCanManageBackup: m.assertCan,
  exportDatabaseBackup: m.exportBackup,
  writeBackupAudit: m.audit,
  validateBackupPayload: m.validate,
  computeRestoreDiff: m.diff,
}));

import { exportBackupAction } from "./exportBackupAction";
import { previewRestoreAction } from "./previewRestoreAction";

const access = { allowed: true, role: "owner" };
const phases = () => m.audit.mock.calls.map((c) => c[0].phase);

describe("exportBackupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue(access);
  });

  it("refuses callers without backup access, with no audit entry and no export", async () => {
    m.assertCan.mockResolvedValue({ allowed: false });
    const res = await exportBackupAction();

    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
    expect(m.exportBackup).not.toHaveBeenCalled();
    expect(m.audit).not.toHaveBeenCalled();
  });

  it("audits start and success and returns the backup, logging counts but not the data", async () => {
    const backup = {
      metadata: { scope: "school", schoolId: "s-1", totalRows: 3, tableCounts: {}, checksum: "c" },
      data: { profiles: [{ email: "secret@school.com" }] },
    };
    m.exportBackup.mockResolvedValue(backup);
    const res = await exportBackupAction();

    expect(res).toEqual({ success: true, backup });
    expect(phases()).toEqual(["start", "success"]);
    expect(JSON.stringify(m.audit.mock.calls)).not.toContain("secret@school.com");
  });

  it("audits a failure and reports it when the export fails", async () => {
    m.exportBackup.mockRejectedValue(new Error("export exploded"));
    const res = await exportBackupAction();

    expect(res.success).toBe(false);
    expect(phases()).toEqual(["start", "failure"]);
  });
});

describe("previewRestoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue(access);
    m.validate.mockReturnValue({ metadata: {} });
  });

  it("refuses callers without backup access before validating or reading anything", async () => {
    m.assertCan.mockResolvedValue({ allowed: false });
    const res = await previewRestoreAction({});

    expect(res.success).toBe(false);
    expect(m.validate).not.toHaveBeenCalled();
    expect(m.diff).not.toHaveBeenCalled();
  });

  it("rejects a malformed file without computing a diff", async () => {
    m.validate.mockImplementation(() => {
      throw new Error("Invalid backup file");
    });
    const res = await previewRestoreAction({ junk: true });

    expect(res.success).toBe(false);
    expect(m.diff).not.toHaveBeenCalled();
  });

  it("returns the diff for a valid file and never writes an audit entry (read-only)", async () => {
    m.diff.mockResolvedValue({ creates: 1, updates: 2 });
    const res = await previewRestoreAction({});

    expect(res).toEqual({ success: true, diff: { creates: 1, updates: 2 } });
    expect(m.diff).toHaveBeenCalledWith({ marker: "admin" }, { metadata: {} });
    expect(m.audit).not.toHaveBeenCalled();
  });
});
