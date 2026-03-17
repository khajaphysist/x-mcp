import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

vi.mock("@xdevplatform/xdk", () => ({
  Client: function (config: any) {
    return {
      _config: config,
      users: {
        getMe: vi.fn().mockResolvedValue({ data: { id: "12345" } }),
      },
    };
  },
}));

import {
  loadCredentials,
  saveCredentials,
  createClient,
  getAuthenticatedUserId,
} from "../src/client.js";

const CREDS_DIR = path.join(os.homedir(), ".x-mcp");
const CREDS_PATH = path.join(CREDS_DIR, "credentials.json");

describe("client", () => {
  const envBackup: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of [
      "X_API_KEY",
      "X_API_SECRET",
      "X_ACCESS_TOKEN",
      "X_ACCESS_TOKEN_SECRET",
    ]) {
      envBackup[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const [key, val] of Object.entries(envBackup)) {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    }
  });

  describe("saveCredentials / loadCredentials", () => {
    it("roundtrip save and load", () => {
      const creds = {
        apiKey: "test-key",
        apiSecret: "test-secret",
        accessToken: "test-token",
        accessTokenSecret: "test-token-secret",
      };

      const existingCreds = loadCredentials();

      try {
        saveCredentials(creds);
        const loaded = loadCredentials();
        expect(loaded).toEqual(creds);
      } finally {
        if (existingCreds) {
          saveCredentials(existingCreds);
        } else {
          try {
            fs.unlinkSync(CREDS_PATH);
          } catch {}
        }
      }
    });
  });

  describe("createClient", () => {
    it("creates client from env vars", () => {
      process.env.X_API_KEY = "env-key";
      process.env.X_API_SECRET = "env-secret";
      process.env.X_ACCESS_TOKEN = "env-token";
      process.env.X_ACCESS_TOKEN_SECRET = "env-token-secret";

      const client = createClient();
      expect(client).toBeDefined();
      expect((client as any)._config.oauth1.apiKey).toBe("env-key");
    });

    it("throws when no credentials available", () => {
      const backup = loadCredentials();
      if (backup) {
        fs.unlinkSync(CREDS_PATH);
      }

      try {
        expect(() => createClient()).toThrow("No credentials found");
      } finally {
        if (backup) {
          saveCredentials(backup);
        }
      }
    });

    it("falls back to stored credentials when env vars missing", () => {
      const existingCreds = loadCredentials();
      const testCreds = {
        apiKey: "stored-key",
        apiSecret: "stored-secret",
        accessToken: "stored-token",
        accessTokenSecret: "stored-token-secret",
      };

      try {
        saveCredentials(testCreds);
        const client = createClient();
        expect(client).toBeDefined();
        expect((client as any)._config.oauth1.apiKey).toBe("stored-key");
      } finally {
        if (existingCreds) {
          saveCredentials(existingCreds);
        } else {
          try {
            fs.unlinkSync(CREDS_PATH);
          } catch {}
        }
      }
    });
  });

  describe("getAuthenticatedUserId", () => {
    it("returns user ID from getMe", async () => {
      process.env.X_API_KEY = "k";
      process.env.X_API_SECRET = "s";
      process.env.X_ACCESS_TOKEN = "t";
      process.env.X_ACCESS_TOKEN_SECRET = "ts";

      const client = createClient();
      const userId = await getAuthenticatedUserId(client);
      expect(userId).toBe("12345");
    });
  });
});
