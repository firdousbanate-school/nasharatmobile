import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import type { ProfileRow } from "@/lib/auth/getCurrentProfile";

export async function removeMaintenanceStorageFiles(
  supabase: SupabaseClient,
  requestId: string,
  profile: ProfileRow,
): Promise<void> {
  const { data: attachments } = await supabase
    .from("maintenance_attachments")
    .select("path")
    .eq("request_id", requestId);

  if (attachments && attachments.length > 0) {
    const admin = createSupabaseAdminClient({
      actorId: profile.id,
      actorLabel: profile.full_name,
    });
    await admin.storage.from("maintenance-photos").remove(attachments.map((a) => a.path));
  }
}
