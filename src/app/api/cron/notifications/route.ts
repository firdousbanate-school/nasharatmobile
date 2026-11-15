import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron/assertCronAuthorized";
import { withApiErrorHandler } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { cleanupOldReadNotifications } from "@/lib/notifications/cleanupOldReadNotifications";
import { sendCircularDeadlineReminders } from "@/lib/notifications/sendCircularDeadlineReminders";
import { sendCalendarUpcomingReminders } from "@/lib/notifications/sendCalendarUpcomingReminders";

async function handleNotificationCron(request: Request) {
  const auth = assertCronAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminClient = createSupabaseAdminClient();
  const [deletedRead, circularReminders, calendarReminders] = await Promise.all([
    cleanupOldReadNotifications(adminClient, 90),
    sendCircularDeadlineReminders(adminClient),
    sendCalendarUpcomingReminders(adminClient),
  ]);

  return NextResponse.json({
    status: "ok",
    deletedRead,
    circularReminders,
    calendarReminders,
  });
}

export const GET = withApiErrorHandler(handleNotificationCron);
