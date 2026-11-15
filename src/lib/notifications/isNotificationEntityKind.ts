import type { NotificationEntityKind } from "./types";

const ENTITY_KINDS: readonly string[] = ["circular", "maintenance_request", "calendar_event"];

export function isNotificationEntityKind(value: unknown): value is NotificationEntityKind {
  return typeof value === "string" && ENTITY_KINDS.includes(value);
}
