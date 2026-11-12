import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n";
import { ArrowLeftIcon } from "lucide-react";
import { PublicTopBar } from "@/components/public/PublicTopBar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCircularsArchive } from "@/components/public/PublicCircularsArchive";
import { getPublicSchoolProfile } from "@/lib/school/getPublicSchoolProfile";
import { getPublicCalendarEvents } from "@/lib/calendar/getPublicCalendarEvents";
import { getPublicCirculars } from "@/lib/circulars/getPublicCirculars";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("archiveTitle"),
    description: t("archiveSubtitle"),
  };
}

export default async function PublicCircularsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tPublic = await getTranslations("publicCircular");
  const school = await getPublicSchoolProfile();

  const [events, circulars] = await Promise.all([
    getPublicCalendarEvents(school?.id),
    getPublicCirculars(school?.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <PublicTopBar school={school} events={events} />

      <main className="flex-1 px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[1520px] space-y-8 animate-hero-fade-up">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c1f44] transition-colors hover:text-[#0b5cce] dark:text-white"
            >
              <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden="true" />
              <span>{tPublic("backToHome")}</span>
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gold">
                <span className="h-0.5 w-8 rounded-full bg-gold/70" />
                <span>{t("circularsEyebrow")}</span>
              </div>
              <h1 className="font-heading text-2xl font-black tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-4xl dark:text-foreground">
                {t("archiveTitle")}
              </h1>
              <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("archiveSubtitle")}
              </p>
            </div>
          </div>

          <PublicCircularsArchive circulars={circulars} />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
