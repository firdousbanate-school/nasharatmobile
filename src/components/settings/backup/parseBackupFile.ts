import JSZip from "jszip";
import type { DatabaseBackupPayload } from "@/lib/backup/types";
import { extractPayloadFromZip } from "./extractPayloadFromZip";
import {
  extractStorageFilesFromZip,
  type ExtractedStorageFile,
} from "./extractStorageFilesFromZip";

export type { ExtractedStorageFile } from "./extractStorageFilesFromZip";

export type BackupFileResult =
  | { ok: true; payload: DatabaseBackupPayload; storageFiles?: ExtractedStorageFile[] }
  | { ok: false; reason: "invalid" };

async function parseZipBackup(file: File): Promise<BackupFileResult> {
  try {
    const zip = await JSZip.loadAsync(file);
    const payload = await extractPayloadFromZip(zip);
    if (!payload) {
      return { ok: false, reason: "invalid" };
    }

    const storageFiles = await extractStorageFilesFromZip(zip);
    return { ok: true, payload, storageFiles };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export async function parseBackupFile(file: File): Promise<BackupFileResult> {
  const isZip = file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip");
  if (isZip) {
    return parseZipBackup(file);
  }

  try {
    const parsed = JSON.parse(await file.text()) as DatabaseBackupPayload;
    if (!parsed?.metadata || !parsed?.tables) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, payload: parsed };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
