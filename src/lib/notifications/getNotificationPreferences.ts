import { createSupabaseServerClient } from "@/lib/supabase";

export interface NotificationPreferences {
  circular_in_app: boolean;
  circular_push: boolean;
  maintenance_in_app: boolean;
  maintenance_push: boolean;
  calendar_in_app: boolean;
  calendar_push: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  circular_in_app: true,
  circular_push: true,
  maintenance_in_app: true,
  maintenance_push: true,
  calendar_in_app: true,
  calendar_push: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    return DEFAULT_PREFERENCES;
  }

  const { data } = await supabase
    .from("notification_preferences")
    .select(
      "circular_in_app, circular_push, maintenance_in_app, maintenance_push, calendar_in_app, calendar_push",
    )
    .eq("user_id", userRes.user.id)
    .maybeSingle();

  return (data as NotificationPreferences | null) ?? DEFAULT_PREFERENCES;
}
