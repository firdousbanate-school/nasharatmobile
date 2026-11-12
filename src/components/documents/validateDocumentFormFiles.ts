import type { SchoolDocumentRow } from "@/lib/documents/types";

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

interface ValidateDocumentInput {
  existingDoc?: SchoolDocumentRow | null;
  files: File[];
  title: string;
  messages: {
    fileRequired: string;
    titleRequired: string;
    fileTooLarge: string;
  };
}

export function validateDocumentFormFiles({
  existingDoc,
  files,
  title,
  messages,
}: ValidateDocumentInput): string | null {
  if (!existingDoc && files.length === 0) {
    return messages.fileRequired;
  }

  if (existingDoc && !title.trim()) {
    return messages.titleRequired;
  }

  for (const f of files) {
    if (f.size > MAX_DOCUMENT_BYTES) {
      return `${f.name}: ${messages.fileTooLarge}`;
    }
  }

  return null;
}
