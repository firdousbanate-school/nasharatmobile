import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const m = vi.hoisted(() => ({ action: vi.fn(), refresh: vi.fn() }));

vi.mock("@/i18n", () => ({ useRouter: () => ({ refresh: m.refresh }) }));
vi.mock("@/actions/notifications/markEntityNotificationsReadAction", () => ({
  markEntityNotificationsReadAction: (...args: unknown[]) => m.action(...args),
}));

import { MarkEntityNotificationsRead } from "./MarkEntityNotificationsRead";

describe("MarkEntityNotificationsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks the entity read on mount and refreshes when something changed", async () => {
    m.action.mockResolvedValue({ success: true, updated: 1 });
    render(<MarkEntityNotificationsRead entityType="circular" entityId="c-1" />);

    await waitFor(() => expect(m.refresh).toHaveBeenCalledTimes(1));
    expect(m.action).toHaveBeenCalledWith("circular", "c-1");
  });

  it("does not refresh when nothing was unread", async () => {
    m.action.mockResolvedValue({ success: true, updated: 0 });
    render(<MarkEntityNotificationsRead entityType="calendar_event" entityId="e-1" />);

    await waitFor(() => expect(m.action).toHaveBeenCalled());
    expect(m.refresh).not.toHaveBeenCalled();
  });
});
