import crypto from "crypto";
import fs from "fs";
import path from "path";

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
  const params = new URLSearchParams({
    client_id: tokenData.client_id,
    client_secret: tokenData.client_secret,
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

export async function createDriveClient() {
  const tokenData = loadGoogleTokenData();
  const accessToken = await getFreshAccessToken(tokenData);
  return {
    findOrCreateFolder: (folderName, parentId) =>
      findOrCreateFolder(accessToken, folderName, parentId),
    uploadFile: (parentId, fileName, mimeType, buffer) =>
      uploadFileToDrive(accessToken, parentId, fileName, mimeType, buffer),
  };
}
