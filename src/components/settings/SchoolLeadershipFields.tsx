import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SchoolFullDetails } from "@/lib/school/getSchoolFullDetails";

export function SchoolLeadershipFields({
  school,
  canManage,
}: {
  school: SchoolFullDetails;
  canManage: boolean;
}) {
  const t = useTranslations("settings");

  return (
    <>
      <div className="border-t border-border pt-2 sm:col-span-2">
        <h3 className="text-sm font-semibold text-foreground">{t("leadership")}</h3>
      </div>
      <div className="space-y-2">
        <Label htmlFor="manager_name_ar">{t("managerNameAr")}</Label>
        <Input
          id="manager_name_ar"
          name="manager_name_ar"
          defaultValue={school.manager_name_ar ?? ""}
          disabled={!canManage}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="manager_name_en">{t("managerNameEn")}</Label>
        <Input
          id="manager_name_en"
          name="manager_name_en"
          defaultValue={school.manager_name_en ?? ""}
          disabled={!canManage}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="assistant_manager_ar">{t("assistantManagerAr")}</Label>
        <Input
          id="assistant_manager_ar"
          name="assistant_manager_ar"
          defaultValue={school.assistant_manager_ar ?? ""}
          disabled={!canManage}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="assistant_manager_en">{t("assistantManagerEn")}</Label>
        <Input
          id="assistant_manager_en"
          name="assistant_manager_en"
          defaultValue={school.assistant_manager_en ?? ""}
          disabled={!canManage}
        />
      </div>
      <LeadershipPair
        arId="assistant_manager_2_ar"
        enId="assistant_manager_2_en"
        arLabel={t("assistantManager2Ar")}
        enLabel={t("assistantManager2En")}
        arDefault={school.assistant_manager_2_ar ?? ""}
        enDefault={school.assistant_manager_2_en ?? ""}
        disabled={!canManage}
      />
      <LeadershipPair
        arId="assistant_manager_3_ar"
        enId="assistant_manager_3_en"
        arLabel={t("assistantManager3Ar")}
        enLabel={t("assistantManager3En")}
        arDefault={school.assistant_manager_3_ar ?? ""}
        enDefault={school.assistant_manager_3_en ?? ""}
        disabled={!canManage}
      />
    </>
  );
}

interface LeadershipPairProps {
  arId: string;
  enId: string;
  arLabel: string;
  enLabel: string;
  arDefault: string;
  enDefault: string;
  disabled: boolean;
}

function LeadershipPair({
  arId,
  enId,
  arLabel,
  enLabel,
  arDefault,
  enDefault,
  disabled,
}: LeadershipPairProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={arId}>{arLabel}</Label>
        <Input id={arId} name={arId} defaultValue={arDefault} disabled={disabled} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={enId}>{enLabel}</Label>
        <Input id={enId} name={enId} defaultValue={enDefault} disabled={disabled} />
      </div>
    </>
  );
}
