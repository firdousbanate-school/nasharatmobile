import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { getCurrentSchool } from "@/lib/school/getCurrentSchool";
import { AuthShell } from "@/components/auth/AuthShell";
import { LockIcon } from "lucide-react";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getCurrentProfile();
  if (profile?.is_active) redirect({ href: "/dashboard", locale });
  const t = await getTranslations("auth");
  const school = await getCurrentSchool();
  const schoolName = school ? (locale === "ar" ? school.name_ar : school.name_en) : null;

  return (
    <AuthShell
      school={school}
      schoolName={schoolName}
      icon={<LockIcon className="size-5" />}
      title={t("loginTitle")}
    >
      <LoginForm />
    </AuthShell>
  );
}
