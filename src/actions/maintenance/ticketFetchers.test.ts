import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createQueryChain } from "@/test-utils/createQueryChain";
import { fetchAssignableTicket } from "./fetchAssignableTicket";
import { fetchTicketForTransition } from "./fetchTicketForTransition";

const client = (result: Parameters<typeof createQueryChain>[0]) =>
  ({ from: () => createQueryChain(result).chain }) as unknown as SupabaseClient;

describe("fetchAssignableTicket", () => {
  const ticket = { id: "t-1", school_id: "s-1", status: "open", priority: "normal" };

  it("returns a ticket of the caller's school", async () => {
    expect(await fetchAssignableTicket(client({ data: ticket }), "t-1", "s-1")).toEqual(ticket);
  });

  it("treats a ticket of another school as not found (no cross-school assignment)", async () => {
    await expect(fetchAssignableTicket(client({ data: ticket }), "t-1", "s-2")).rejects.toThrow(
      "Ticket not found",
    );
  });

  it("reports an unknown ticket and database errors", async () => {
    await expect(fetchAssignableTicket(client({ data: null }), "t-9", "s-1")).rejects.toThrow(
      "Ticket not found",
    );
    await expect(
      fetchAssignableTicket(client({ error: { code: "42501", message: "denied" } }), "t-1", "s-1"),
    ).rejects.toBeDefined();
  });
});

describe("fetchTicketForTransition", () => {
  it("returns the ticket and reports unknown tickets and database errors", async () => {
    const ticket = {
      id: "t-1",
      school_id: "s-1",
      status: "open",
      reporter_id: "r",
      assigned_operator_id: null,
    };
    expect(await fetchTicketForTransition(client({ data: ticket }), "t-1")).toEqual(ticket);
    await expect(fetchTicketForTransition(client({ data: null }), "t-9")).rejects.toThrow(
      "Ticket not found",
    );
    await expect(
      fetchTicketForTransition(client({ error: { code: "42501", message: "denied" } }), "t-1"),
    ).rejects.toBeDefined();
  });
});
