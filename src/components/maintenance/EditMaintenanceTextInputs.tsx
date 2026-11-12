"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EditMaintenanceTextInputs({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}) {
  const t = useTranslations("maintenance");

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="edit-title">{t("ticketTitle")} *</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-description">{t("ticketDescription")} *</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          required
        />
      </div>
    </>
  );
}
