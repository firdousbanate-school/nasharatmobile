import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n";

export default async function DocumentsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect({ href: "/documents/operational-plan", locale });
  return null;
}
