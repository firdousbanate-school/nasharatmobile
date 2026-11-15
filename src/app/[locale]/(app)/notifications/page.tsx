import { setRequestLocale } from "next-intl/server";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { redirect } from "@/i18n";
import { getUserNotifications } from "@/lib/notifications/getUserNotifications";
import { getUnreadNotificationCount } from "@/lib/notifications/getUnreadNotificationCount";
import { getNotificationPreferences } from "@/lib/notifications/getNotificationPreferences";
import {
  BrowserNotificationBanner,
  NotificationHeader,
  NotificationList,
  NotificationPreferencesCard,
} from "@/components/notifications";

const INITIAL_PAGE_SIZE = 20;

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSessionUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const [rawNotifications, unreadCount, preferences] = await Promise.all([
    getUserNotifications(INITIAL_PAGE_SIZE + 1, 0, "all"),
    getUnreadNotificationCount(),
    getNotificationPreferences(),
  ]);

  const initialHasMore = rawNotifications.length > INITIAL_PAGE_SIZE;
  const notifications = initialHasMore
    ? rawNotifications.slice(0, INITIAL_PAGE_SIZE)
    : rawNotifications;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <NotificationHeader unreadCount={unreadCount} />
      <BrowserNotificationBanner />
      <NotificationPreferencesCard initialPreferences={preferences} />
      <NotificationList notifications={notifications} initialHasMore={initialHasMore} />
    </div>
  );
}
