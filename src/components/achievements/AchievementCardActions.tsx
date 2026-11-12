"use client";

import { useTranslations } from "next-intl";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AchievementCardActions({
  canManage = false,
  onClick,
  onEdit,
  onDelete,
}: {
  canManage?: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        title={tCommon("view", { defaultValue: "View" })}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <EyeIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
      </Button>

      {canManage && onEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          title={tCommon("edit", { defaultValue: "Edit" })}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <PencilIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}

      {canManage && onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
          title={tCommon("delete", { defaultValue: "Delete" })}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
