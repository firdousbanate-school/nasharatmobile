import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import type { ProfileRow } from "@/lib/auth/getCurrentProfile";

export async function removeSingleAttachmentFile(
  bucket: string,
  storagePath: string,
  profile: ProfileRow,
): Promise<void> {
  const admin = createSupabaseAdminClient({
    actorId: profile.id,
    actorLabel: profile.full_name,
  });
  await admin.storage.from(bucket).remove([storagePath]);
}
