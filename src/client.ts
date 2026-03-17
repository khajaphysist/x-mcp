import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Client, OAuth1 } from "@xdevplatform/xdk";

export interface StoredCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

const CREDENTIALS_DIR = path.join(os.homedir(), ".x-mcp");
const CREDENTIALS_PATH = path.join(CREDENTIALS_DIR, "credentials.json");

export function loadCredentials(): StoredCredentials | null {
  try {
    const data = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(data) as StoredCredentials;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: StoredCredentials): void {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), {
    mode: 0o600,
  });
}

export function createClient(): Client {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (apiKey && apiSecret && accessToken && accessTokenSecret) {
    const oauth1 = new OAuth1({
      apiKey,
      apiSecret,
      callback: "oob",
      accessToken,
      accessTokenSecret,
    });
    return new Client({ oauth1 });
  }

  const creds = loadCredentials();
  if (creds) {
    const oauth1 = new OAuth1({
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      callback: "oob",
      accessToken: creds.accessToken,
      accessTokenSecret: creds.accessTokenSecret,
    });
    return new Client({ oauth1 });
  }

  throw new Error(
    "No credentials found. Run `npx @kms_dev/x-mcp login` or set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET env vars."
  );
}

export async function getAuthenticatedUserId(client: Client): Promise<string> {
  const me = await client.users.getMe();
  const id = me?.data?.id;
  if (!id) {
    throw new Error("Could not retrieve authenticated user ID");
  }
  return id;
}
