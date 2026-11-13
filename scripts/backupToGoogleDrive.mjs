import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";

const DEFAULT_ROOT_FOLDER_NAME = "NasharatMobile Backups";
const BUCKETS = ["public-assets", "school-documents", "circular-attachments", "maintenance-photos"];

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
  "maintenance_requests",
  "maintenance_assignments",
  "maintenance_updates",
  "calendar_events",
  "school_achievements",
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

function loadGoogleTokenData() {
  if (process.env.GDRIVE_TOKEN_JSON) {
    return JSON.parse(process.env.GDRIVE_TOKEN_JSON);
  }
  const localTokenPath = path.join(
    process.env.USERPROFILE || "",
    ".gemini/antigravity/plugin_data/gdrive/token.json",
  );
  if (fs.existsSync(localTokenPath)) {
    return JSON.parse(fs.readFileSync(localTokenPath, "utf8"));
  }
  throw new Error("No Google Drive authentication token found.");
}

async function getServiceAccountAccessToken(tokenData) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: tokenData.client_email,
      scope: "https://www.googleapis.com/auth/drive",
      aud: tokenData.token_uri || "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  ).toString("base64url");

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${claim}`)
    .sign(tokenData.private_key, "base64url");

  const params = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${header}.${claim}.${signature}`,
  });

  const res = await fetch(tokenData.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to get service account token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function getFreshAccessToken(tokenData) {
  if (tokenData.type === "service_account") {
    return getServiceAccountAccessToken(tokenData);
  }

  const refreshToken = tokenData.token?.refresh_token || tokenData.refresh_token;
  const clientId = tokenData.client_id;
  const clientSecret = tokenData.client_secret;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to refresh Google access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function findOrCreateFolder(accessToken, folderName, parentId) {
  const parentClause = parentId ? `'${parentId}' in parents and ` : `'root' in parents and `;
  const query = `${parentClause}name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const listData = await listRes.json();
  if (listData.files?.length > 0) {
    console.log(`Found existing folder "${folderName}" (ID: ${listData.files[0].id})`);
    return listData.files[0].id;
  }

  console.log(`Creating folder in Google Drive: "${folderName}"...`);
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  const createData = await createRes.json();
  if (!createData.id) {
    throw new Error(`Failed to create folder "${folderName}": ${JSON.stringify(createData)}`);
  }
  console.log(`Created folder ID: ${createData.id}`);
  return createData.id;
}

async function uploadFileToDrive(accessToken, parentId, fileName, mimeType, buffer) {
  const boundary = `boundary_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--\r\n`;

  const metadata = { name: fileName, parents: [parentId] };
  const body = Buffer.concat([
    Buffer.from(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    ),
    Buffer.from(`${delimiter}Content-Type: ${mimeType}\r\n\r\n`),
    buffer,
    Buffer.from(closeDelim),
  ]);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  const data = await res.json();
  if (!data.id) throw new Error(`Drive upload failed for ${fileName}: ${JSON.stringify(data)}`);
  return data.id;
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

async function exportTableRows(supabase, table, schoolId) {
  let query = supabase.from(table).select("*");
  if (table === "schools") {
    query = query.eq("id", schoolId);
  } else if (table === "role_permissions") {
    const { data: roles } = await supabase.from("roles").select("id").eq("school_id", schoolId);
    const roleIds = (roles || []).map((r) => r.id);
    query = query.in(
      "role_id",
      roleIds.length ? roleIds : ["00000000-0000-0000-0000-000000000000"],
    );
  } else {
    query = query.eq("school_id", schoolId);
  }
  const { data: rows } = await query;
  return rows || [];
}

async function exportDatabaseTables(supabase, schoolId, schoolName) {
  const payload = {
    version: 2,
    metadata: {
      exportedAt: new Date().toISOString(),
      schoolId,
      schoolName,
      scope: "school",
      totalRows: 0,
      tableCounts: {},
    },
    tables: {},
  };

  let totalRows = 0;
  for (const table of TABLES) {
    const rows = await exportTableRows(supabase, table, schoolId);
    payload.tables[table] = rows;
    payload.metadata.tableCounts[table] = rows.length;
    totalRows += rows.length;
  }
  payload.metadata.totalRows = totalRows;
  return payload;
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
  const tokenData = loadGoogleTokenData();
  const accessToken = await getFreshAccessToken(tokenData);

  const { data: schools } = await supabase.from("schools").select("*").limit(1);
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
    (await findOrCreateFolder(accessToken, DEFAULT_ROOT_FOLDER_NAME, null));

  const datedFolderId = await findOrCreateFolder(accessToken, `Backup_${dateStr}`, parentFolderId);

  console.log("Uploading full zip package to Google Drive...");
  await uploadFileToDrive(
    accessToken,
    datedFolderId,
    `Al_Firdous_Full_Backup_${dateStr}.zip`,
    "application/zip",
    zipBuffer,
  );

  console.log("Uploading database JSON to Google Drive...");
  await uploadFileToDrive(
    accessToken,
    datedFolderId,
    `database_backup_${dateStr}.json`,
    "application/json",
    Buffer.from(jsonContent),
  );

  console.log("Uploading README to Google Drive...");
  await uploadFileToDrive(
    accessToken,
    datedFolderId,
    "README.txt",
    "text/plain",
    Buffer.from(readme),
  );

  console.log("==========================================================");
  console.log(`SUCCESS: Cloud backup completed and saved into "Backup_${dateStr}".`);
  console.log("==========================================================");
}

runWeeklyBackup().catch((err) => {
  console.error("Weekly backup failed:", err);
  process.exit(1);
});
