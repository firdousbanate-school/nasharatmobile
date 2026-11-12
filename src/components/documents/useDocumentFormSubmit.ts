"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { resolveDocumentErrorMessage } from "@/lib/documents/resolveDocumentErrorMessage";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";
import { submitDocumentDirect } from "./submitDocumentDirect";

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

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
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(t("titleRequired"));
      return;
    }

    if (!existingDoc && !file) {
      setErrorMessage(t("fileRequired"));
      return;
    }

    if (file && file.size > MAX_DOCUMENT_BYTES) {
      const msg = t("fileTooLarge");
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitDocumentDirect({
      slug,
      existingDoc,
      title,
      description,
      file,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(existingDoc ? t("documentUpdated") : t("documentCreated"));
      onSuccess();
      onClose();
    } else {
      const friendlyError = resolveDocumentErrorMessage(result.error, t);
      setErrorMessage(friendlyError);
      toast.error(friendlyError);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    isSubmitting,
    errorMessage,
    handleSubmit,
  };
}
