"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "./LocationPicker";
import type { LocationRow } from "@/lib/school/getSchoolLocations";

export function EditMaintenanceLocationFields({
  locations,
  defaultValue,
  area,
  onAreaChange,
}: {
  locations: LocationRow[];
  defaultValue?: string | null;
  area: string;
  onAreaChange: (area: string) => void;
}) {
  const t = useTranslations("maintenance");

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="edit-location">{t("location")}</Label>
        <LocationPicker locations={locations} defaultValue={defaultValue ?? undefined} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-area">{t("specificArea")}</Label>
        <Input id="edit-area" value={area} onChange={(e) => onAreaChange(e.target.value)} />
      </div>
    </>
  );
}
