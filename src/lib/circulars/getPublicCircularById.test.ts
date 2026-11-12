import { describe, expect, it, vi, beforeEach } from "vitest";
import { getPublicCircularById } from "./getPublicCircularById";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase";

const mockMaybeSingle = vi.fn();
const filters: { column: string; value: unknown }[] = [];

const chain = {
  eq: (column: string, value: unknown) => {
    filters.push({ column, value });
    return chain;
  },
  maybeSingle: () => mockMaybeSingle(),
};

const mockSelect = vi.fn(() => chain);

const mockSupabase = {
  from: () => ({ select: mockSelect }),
} as unknown as SupabaseClient;

describe("getPublicCircularById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filters.length = 0;
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);
    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase);
  });

  it("returns the circular when it is published and public", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "circ-1", title: "Public circular", visibility: "public", status: "published" },
      error: null,
    });

    const result = await getPublicCircularById("circ-1");

    expect(result?.id).toBe("circ-1");
  });

  it("restricts the query to a published, public circular", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await getPublicCircularById("circ-2");

    expect(mockSelect).toHaveBeenCalled();
    expect(filters.slice(0, 3)).toEqual([
      { column: "id", value: "circ-2" },
      { column: "status", value: "published" },
      { column: "visibility", value: "public" },
    ]);
  });

  it("returns null when the circular is not visible", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getPublicCircularById("circ-missing");

    expect(result).toBeNull();
  });

  it("returns null and logs when the query fails", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    const result = await getPublicCircularById("circ-3");

    expect(result).toBeNull();
  });
});
