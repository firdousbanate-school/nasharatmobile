import { isPlatformOwner } from "@/lib/auth/isPlatformOwner";
import { hasPermission } from "@/lib/rbac/hasPermission";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";

export async function assertCanDeleteCalendarEvent(
  profileId: string,
  schoolId: string,
): Promise<void> {
  const [isOwner, canManage] = await Promise.all([
    isPlatformOwner(profileId),
    hasPermission("calendar.manage", schoolId).catch(() => false),
  ]);

  if (!isOwner && !canManage) {
    throw new ForbiddenError("Unauthorized to delete calendar events");
  }
}
