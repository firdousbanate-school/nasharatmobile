import type { SupabaseClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger/logError";

const DEFAULT_RETENTION_DAYS = 90;

export async function cleanupOldReadNotifications(
  adminClient: SupabaseClient,
  retentionDays = DEFAULT_RETENTION_DAYS,
): Promise<number> {
  const cutoffIso = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await adminClient
    .from("notifications")
    .delete()
    .not("read_at", "is", null)
    .lt("read_at", cutoffIso)
    .select("id");

  if (error) {
    logError(error, { scope: "cleanupOldReadNotifications", retentionDays });
    return 0;
  }

  return (data ?? []).length;
}
