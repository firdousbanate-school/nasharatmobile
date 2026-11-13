import type JSZip from "jszip";
import type { DatabaseBackupPayload } from "@/lib/backup/types";

export async function extractPayloadFromZip(zip: JSZip): Promise<DatabaseBackupPayload | null> {
  const jsonFileNames = Object.keys(zip.files).filter(
    (name) => !name.startsWith("storage/") && name.endsWith(".json"),
  );

  for (const jsonName of jsonFileNames) {
    try {
      const text = await zip.files[jsonName].async("text");
      const parsed = JSON.parse(text) as DatabaseBackupPayload;
      if (parsed?.metadata && parsed?.tables) {
        return parsed;
      }
    } catch {
      // Continue to next JSON file
    }
  }

  return null;
}
