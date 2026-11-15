import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockBatchInsert, mockAdminFrom } = vi.hoisted(() => ({
  mockBatchInsert: vi.fn(),
  mockAdminFrom: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: () => ({ from: mockAdminFrom }),
}));

vi.mock("./insertBatchNotificationRecords", () => ({
  insertBatchNotificationRecords: (...args: unknown[]) => mockBatchInsert(...args),
}));

import { dispatchModuleNotification } from "./dispatchModuleNotification";

function profileLookup(result: { data: unknown; error: unknown }) {
  const chain = {
    select: () => chain,
    in: () => chain,
    eq: () => chain,
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

const baseInput = {
  type: "circular" as const,
  title: "Reminder",
  schoolId: "school-1",
};

describe("dispatchModuleNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchInsert.mockResolvedValue(1);
  });

  it("drops recipients that are not active members of the school (H-12)", async () => {
    mockAdminFrom.mockReturnValue(profileLookup({ data: [{ id: "member-1" }], error: null }));

    const result = await dispatchModuleNotification({
      ...baseInput,
      recipientUserIds: ["member-1", "foreign-user"],
    });

    expect(mockBatchInsert).toHaveBeenCalledTimes(1);
    expect(mockBatchInsert).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userIds: ["member-1"], schoolId: "school-1" }),
    );
    expect(result).toEqual({ delivered: 1 });
  });

  it("fails closed when the recipient lookup errors", async () => {
    mockAdminFrom.mockReturnValue(profileLookup({ data: null, error: { message: "boom" } }));

    const result = await dispatchModuleNotification({
      ...baseInput,
      recipientUserIds: ["member-1"],
    });

    expect(mockBatchInsert).not.toHaveBeenCalled();
    expect(result).toEqual({ delivered: 0 });
  });

  it("refuses to dispatch without a school context", async () => {
    const result = await dispatchModuleNotification({
      ...baseInput,
      schoolId: null,
      recipientUserIds: ["member-1"],
    });

    expect(mockAdminFrom).not.toHaveBeenCalled();
    expect(mockBatchInsert).not.toHaveBeenCalled();
    expect(result).toEqual({ delivered: 0 });
  });

  it("delivers nothing when no recipient belongs to the school", async () => {
    mockAdminFrom.mockReturnValue(profileLookup({ data: [], error: null }));

    const result = await dispatchModuleNotification({
      ...baseInput,
      recipientUserIds: ["foreign-1", "foreign-2"],
    });

    expect(mockBatchInsert).not.toHaveBeenCalled();
    expect(result).toEqual({ delivered: 0 });
  });
});
