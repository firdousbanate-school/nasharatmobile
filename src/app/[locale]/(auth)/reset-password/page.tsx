import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getCurrentSchool } from "@/lib/school/getCurrentSchool";
import { AuthShell } from "@/components/auth/AuthShell";
import { AUTH_BUTTON } from "@/components/ui/auth-styles";
import { LockIcon } from "lucide-react";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");
  const [school, user] = await Promise.all([getCurrentSchool(), getSessionUser()]);
  const schoolName = school ? (locale === "ar" ? school.name_ar : school.name_en) : null;

  return (
    <AuthShell
      school={school}
      schoolName={schoolName}
      icon={<LockIcon className="size-5" />}
      title={t("resetPasswordTitle")}
      description={t("resetPasswordDesc")}
    >
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">{t("resetLinkInvalid")}</p>
          <Link href="/forgot-password" className={AUTH_BUTTON}>
            {t("requestNewResetLink")}
          </Link>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            {t("backToSignIn")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
