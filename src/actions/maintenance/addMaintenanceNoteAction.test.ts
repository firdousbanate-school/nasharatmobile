import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  parse: vi.fn(),
  from: vi.fn(),
  assertCanAdd: vi.fn(),
  insertUpdate: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: m.from }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/validation/parseMaintenanceNoteData", () => ({
  parseMaintenanceNoteData: m.parse,
}));
vi.mock("@/lib/maintenance/assertCanAddNote", () => ({ assertCanAddNote: m.assertCanAdd }));
vi.mock("@/lib/maintenance/insertMaintenanceUpdate", () => ({
  insertMaintenanceUpdate: m.insertUpdate,
}));

import { addMaintenanceNoteAction } from "./addMaintenanceNoteAction";

const form = new FormData();
const ticketRow = {
  id: "t-1",
  school_id: "s-1",
  reporter_id: "rep-1",
  assigned_operator_id: "op-1",
};

describe("addMaintenanceNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "me", school_id: "s-1" });
    m.parse.mockReturnValue({ requestId: "t-1", note: "  checked the unit  " });
    m.from.mockReturnValue(createQueryChain({ data: ticketRow }).chain);
    m.assertCanAdd.mockResolvedValue(true);
    m.insertUpdate.mockResolvedValue({ error: null });
  });

  it("requires a profile with a school", async () => {
    m.profile.mockResolvedValue({ id: "me", school_id: null });
    const res = await addMaintenanceNoteAction(form);

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("rejects an empty or whitespace-only note", async () => {
    m.parse.mockReturnValue({ requestId: "t-1", note: "   " });
    const res = await addMaintenanceNoteAction(form);

    expect(res.error).toBe("Note cannot be empty");
    expect(m.insertUpdate).not.toHaveBeenCalled();
  });

  it("reports an unknown ticket", async () => {
    m.from.mockReturnValue(createQueryChain({ data: null }).chain);
    const res = await addMaintenanceNoteAction(form);

    expect(res.error).toBe("Ticket not found");
    expect(m.insertUpdate).not.toHaveBeenCalled();
  });

  it("only participants (or staff with the right) may add a note", async () => {
    m.assertCanAdd.mockResolvedValue(false);
    const res = await addMaintenanceNoteAction(form);

    expect(m.assertCanAdd).toHaveBeenCalledWith("s-1", "me", "rep-1", "op-1");
    expect(res.error).toBe("Unauthorized to add notes");
    expect(m.insertUpdate).not.toHaveBeenCalled();
  });

  it("saves the trimmed note as the caller and refreshes the ticket page", async () => {
    const res = await addMaintenanceNoteAction(form);

    expect(res).toEqual({ success: true });
    expect(m.insertUpdate.mock.calls[0][1]).toEqual({
      requestId: "t-1",
      schoolId: "s-1",
      authorId: "me",
      kind: "note",
      reason: "checked the unit",
    });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/maintenance/t-1", "page");
  });

  it("reports a failed save without refreshing", async () => {
    m.insertUpdate.mockResolvedValue({ error: { code: "42501", message: "denied" } });
    const res = await addMaintenanceNoteAction(form);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
