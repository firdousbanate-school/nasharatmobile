"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { resolveDocumentErrorMessage } from "@/lib/documents/resolveDocumentErrorMessage";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";
import { validateDocumentFormFiles } from "./validateDocumentFormFiles";
import { executeDocumentSubmission } from "./executeDocumentSubmission";

export function useDocumentFormSubmit({
  slug,
  existingDoc,
  onSuccess,
  onClose,
}: {
  slug: SchoolDocumentSlug;
  existingDoc?: SchoolDocumentRow | null;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("documents");
  const [title, setTitle] = useState(existingDoc?.title || "");
  const [description, setDescription] = useState(existingDoc?.description || "");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateDocumentFormFiles({
      existingDoc,
      files,
      title,
      messages: {
        fileRequired: t("fileRequired"),
        titleRequired: t("titleRequired"),
        fileTooLarge: t("fileTooLarge"),
      },
    });
    if (valErr) {
      setErrorMessage(valErr);
      toast.error(valErr);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await executeDocumentSubmission({
      slug,
      existingDoc,
      title,
      description,
      files,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.isUpdate ? t("documentUpdated") : t("documentCreated"));
      onSuccess();
      onClose();
      return;
    }

    const friendly = resolveDocumentErrorMessage(result.error, t);
    const msg = result.failedFile ? `${result.failedFile}: ${friendly}` : friendly;
    setErrorMessage(msg);
    toast.error(msg);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    files,
    setFiles,
    file: files[0] ?? null,
    setFile: (f: File | null) => setFiles(f ? [f] : []),
    isSubmitting,
    errorMessage,
    handleSubmit,
  };
}
