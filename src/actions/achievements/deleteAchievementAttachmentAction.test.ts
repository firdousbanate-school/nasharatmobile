import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetCurrentProfile,
  mockCreateSupabaseServerClient,
  mockCreateSupabaseAdminClient,
  mockStorageRemove,
} = vi.hoisted(() => ({
  mockGetCurrentProfile: vi.fn(),
  mockCreateSupabaseServerClient: vi.fn(),
  mockCreateSupabaseAdminClient: vi.fn(),
  mockStorageRemove: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/getCurrentProfile", () => ({
  getCurrentProfile: mockGetCurrentProfile,
}));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
}));
vi.mock("@/lib/supabase/createSupabaseAdminClient", () => ({
  createSupabaseAdminClient: mockCreateSupabaseAdminClient,
}));

import { deleteAchievementAttachmentAction } from "./deleteAchievementAttachmentAction";

function createDeleteClient(result: { data: { id: string; path: string } | null; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ maybeSingle }));
  const eq2 = vi.fn(() => ({ select }));
  const eq1 = vi.fn(() => ({ eq: eq2 }));
  const del = vi.fn(() => ({ eq: eq1 }));
  return { from: vi.fn(() => ({ delete: del })) };
}

describe("deleteAchievementAttachmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentProfile.mockResolvedValue({
      id: "user-1",
      school_id: "school-1",
      is_active: true,
      full_name: "Test User",
    });
    mockCreateSupabaseAdminClient.mockReturnValue({
      storage: { from: vi.fn(() => ({ remove: mockStorageRemove })) },
    });
  });

  it("does not remove storage objects when RLS blocks or misses the row", async () => {
    mockCreateSupabaseServerClient.mockResolvedValue(
      createDeleteClient({ data: null, error: null }),
    );

    const result = await deleteAchievementAttachmentAction("att-1", "ach-1");

    expect(result.success).toBe(false);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it("removes storage object only after the DB row is deleted", async () => {
    mockCreateSupabaseServerClient.mockResolvedValue(
      createDeleteClient({
        data: { id: "att-1", path: "school-1/achievements/file.pdf" },
        error: null,
      }),
    );
    mockStorageRemove.mockResolvedValue({ error: null });

    const result = await deleteAchievementAttachmentAction("att-1", "ach-1");

    expect(result).toEqual({ success: true });
    expect(mockStorageRemove).toHaveBeenCalledWith(["school-1/achievements/file.pdf"]);
  });
});
