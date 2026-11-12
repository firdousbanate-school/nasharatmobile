import { isPlatformOwner } from "@/lib/auth/isPlatformOwner";
import { hasPermission } from "@/lib/rbac/hasPermission";
import type { ProfileRow } from "@/lib/auth/getCurrentProfile";

export async function assertCanManageMaintenanceTicket(
  profile: ProfileRow,
  reporterId: string,
): Promise<boolean> {
  if (!profile.school_id) return false;

  const isOwner = await isPlatformOwner(profile.id);
  if (isOwner) return true;

  if (profile.id === reporterId) return true;

  const canAssign = await hasPermission("maintenance.assign", profile.school_id).catch(() => false);
  if (canAssign) return true;

  const canUpdate = await hasPermission("maintenance.update", profile.school_id).catch(() => false);
  return canUpdate;
}
