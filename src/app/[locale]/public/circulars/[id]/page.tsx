import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n";
import { ArrowLeftIcon } from "lucide-react";
import { PublicTopBar } from "@/components/public/PublicTopBar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCircularArticle } from "@/components/public/PublicCircularArticle";
import { getPublicSchoolProfile } from "@/lib/school/getPublicSchoolProfile";
import { getPublicCalendarEvents } from "@/lib/calendar/getPublicCalendarEvents";
import { getPublicCircularById } from "@/lib/circulars/getPublicCircularById";
import { getCircularAttachments } from "@/lib/circulars/getCircularAttachments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const circular = await getPublicCircularById(id);

  return {
    title: circular?.title ?? "Circular",
  };
}

export default async function PublicCircularDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("publicCircular");

  const school = await getPublicSchoolProfile();
  const circular = await getPublicCircularById(id);

  if (!circular) {
    notFound();
  }

  const [events, attachments] = await Promise.all([
    getPublicCalendarEvents(school?.id),
    getCircularAttachments(circular.id).catch(() => []),
  ]);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      <PublicTopBar school={school} events={events} />

      <main className="flex-1 px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c1f44] transition-colors hover:text-[#0b5cce] dark:text-white"
          >
            <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden="true" />
            {t("backToHome")}
          </Link>

          <PublicCircularArticle
            circular={circular}
            attachments={attachments}
            locale={locale}
          />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
