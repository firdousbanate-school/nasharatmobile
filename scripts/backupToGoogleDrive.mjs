import crypto from "crypto";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { createDriveClient } from "./gdrive/createDriveClient.mjs";

const DEFAULT_ROOT_FOLDER_NAME = "NasharatMobile Backups";
const BUCKETS = [
  "public-assets",
  "school-documents",
  "circular-attachments",
  "maintenance-photos",
  "achievement-attachments",
];

const TABLES = [
  "schools",
  "school_settings",
  "departments",
  "locations",
  "roles",
  "role_permissions",
  "profiles",
  "user_role_assignments",
  "school_sequences",
  "circulars",
  "circular_targets",
  "circular_responses",
  "circular_attachments",
  "maintenance_requests",
  "maintenance_assignments",
  "maintenance_updates",
  "maintenance_attachments",
  "calendar_events",
  "school_documents",
  "school_achievements",
  "achievement_attachments",
];

function loadSupabaseCredentials() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  let envPath = ".env.cloud.local";
  if (!fs.existsSync(envPath)) envPath = ".env.local";
  const envContent = fs.readFileSync(envPath, "utf8");
  let url = "";
  let key = "";
  for (const line of envContent.split("\n")) {
    if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = line.split("=")[1].trim();
    if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) key = line.split("=")[1].trim();
  }
  return createClient(url, key);
}

async function listFolderFiles(supabase, bucket, prefix) {
  const { data: items, error } = await supabase.storage.from(bucket).list(prefix);
  if (error || !items) return [];

  const files = [];
  for (const item of items) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (!item.id) {
      const nested = await listFolderFiles(supabase, bucket, itemPath);
      files.push(...nested);
    } else {
      files.push({ bucket, path: itemPath, size: item.metadata?.size || 0 });
    }
  }
  return files;
}

function computeBackupChecksum(tables) {
  const canonicalize = (value) => {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, canonicalize(value[key])]),
      );
    }
    return value;
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(tables)))
    .digest("hex");
}

async function fetchSchoolRoleIds(supabase, schoolId) {
  const { data: roles, error } = await supabase
    .from("roles")
    .select("id")
    .eq("school_id", schoolId);
  if (error) throw new Error(`Failed to query roles: ${error.message}`);
  return (roles || []).map((r) => r.id);
}

function buildTableQuery(supabase, table, schoolId, roleIds) {
  const query = supabase.from(table).select("*");
  if (table === "schools") return query.eq("id", schoolId);
  if (table === "role_permissions") return query.in("role_id", roleIds);
  return query.eq("school_id", schoolId);
}

async function exportTableRows(supabase, table, schoolId) {
  const roleIds = table === "role_permissions" ? await fetchSchoolRoleIds(supabase, schoolId) : [];
  if (table === "role_permissions" && roleIds.length === 0) return [];

  const allRows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const query = buildTableQuery(supabase, table, schoolId, roleIds);
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(`Failed to export table ${table}: ${error.message}`);
    const page = data || [];
    allRows.push(...page);
    if (page.length < pageSize) return allRows;
  }
}

async function exportDatabaseTables(supabase, schoolId, schoolName) {
  const tables = {};
  const tableCounts = {};
  let totalRows = 0;

  for (const table of TABLES) {
    const rows = await exportTableRows(supabase, table, schoolId);
    tables[table] = rows;
    tableCounts[table] = rows.length;
    totalRows += rows.length;
  }

  return {
    metadata: {
      version: 2,
      exportedAt: new Date().toISOString(),
      exportedBy: "github-actions-backup",
      scope: "school",
      schoolId,
      schoolName,
      totalRows,
      tableCounts,
      checksum: computeBackupChecksum(tables),
    },
    tables,
  };
}

async function downloadAndZipStorage(supabase, schoolId, zip) {
  let count = 0;
  for (const bucket of BUCKETS) {
    const files = await listFolderFiles(supabase, bucket, schoolId);
    for (const file of files) {
      const { data: blob, error } = await supabase.storage.from(bucket).download(file.path);
      if (!error && blob) {
        const buffer = Buffer.from(await blob.arrayBuffer());
        zip.file(`storage/${bucket}/${file.path}`, buffer);
        count++;
      }
    }
  }
  return count;
}

async function runWeeklyBackup() {
  console.log("==========================================================");
  console.log("STARTING CONTINUOUS CLOUD GOOGLE DRIVE BACKUP:", new Date().toISOString());
  console.log("==========================================================");

  const supabase = loadSupabaseCredentials();
  const drive = await createDriveClient();

  const { data: schools, error: schoolsError } = await supabase
    .from("schools")
    .select("*")
    .limit(1);
  if (schoolsError) throw new Error(`Failed to query schools: ${schoolsError.message}`);
  const school = schools?.[0];
  if (!school) throw new Error("No school found for backup");

  const dateStr = new Date().toISOString().slice(0, 10);
  const dbPayload = await exportDatabaseTables(supabase, school.id, school.name_ar);

  const zip = new JSZip();
  const jsonContent = JSON.stringify(dbPayload, null, 2);
  zip.file(`database_backup_${dateStr}.json`, jsonContent);

  const storageCount = await downloadAndZipStorage(supabase, school.id, zip);
  const readme = `Backup: ${school.name_ar}\nDate: ${new Date().toISOString()}\nRows: ${dbPayload.metadata.totalRows}\nFiles: ${storageCount}`;
  zip.file("README.txt", readme);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const parentFolderId =
    process.env.GDRIVE_PARENT_FOLDER_ID ||
    (await drive.findOrCreateFolder(DEFAULT_ROOT_FOLDER_NAME, null));

  const datedFolderId = await drive.findOrCreateFolder(`Backup_${dateStr}`, parentFolderId);

  console.log("Uploading full zip package to Google Drive...");
  await drive.uploadFile(
    datedFolderId,
    `Al_Firdous_Full_Backup_${dateStr}.zip`,
    "application/zip",
    zipBuffer,
  );

  console.log("Uploading database JSON to Google Drive...");
  await drive.uploadFile(
    datedFolderId,
    `database_backup_${dateStr}.json`,
    "application/json",
    Buffer.from(jsonContent),
  );

  console.log("Uploading README to Google Drive...");
  await drive.uploadFile(datedFolderId, "README.txt", "text/plain", Buffer.from(readme));

  console.log("==========================================================");
  console.log(`SUCCESS: Cloud backup completed and saved into "Backup_${dateStr}".`);
  console.log("==========================================================");
}

runWeeklyBackup().catch((err) => {
  console.error("Weekly backup failed:", err);
  process.exit(1);
});
