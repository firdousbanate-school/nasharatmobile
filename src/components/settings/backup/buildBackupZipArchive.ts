import JSZip from "jszip";
import type { DatabaseBackupPayload } from "@/lib/backup/types";
import type { StorageFileEntry } from "@/lib/backup/listSchoolStorageFiles";

/**
 * Bundles the database JSON export, all physical storage files, and a manifest
 * into a single compressed ZIP blob ready for browser download.
 */
export async function buildBackupZipArchive(
  backup: DatabaseBackupPayload,
  files: StorageFileEntry[],
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add database JSON
  zip.file("database_backup.json", JSON.stringify(backup, null, 2));

  // 2. Fetch and add each storage file
  for (const f of files) {
    try {
      const resp = await fetch(f.signedUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        zip.file(`storage/${f.bucket}/${f.path}`, blob);
      }
    } catch (fileErr) {
      console.error(`Failed to download storage file ${f.path}:`, fileErr);
    }
  }

  // 3. Add README manifest
  const readme = [
    `Complete System Backup Archive`,
    `Generated at: ${new Date().toISOString()}`,
    `School: ${backup.metadata.schoolName ?? backup.metadata.schoolId ?? "Platform"}`,
    `Database Total Records: ${backup.metadata.totalRows}`,
    `Database SHA-256 Checksum: ${backup.metadata.checksum}`,
    `Total Attached Storage Files: ${files.length}`,
  ].join("\n");

  zip.file("README.txt", readme);

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
