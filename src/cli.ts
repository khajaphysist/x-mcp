#!/usr/bin/env node
import { Command } from "commander";
import { z } from "zod";
import { password } from "@inquirer/prompts";
import { tools } from "./tools/index.js";
import {
  createClient,
  getAuthenticatedUserId,
  saveCredentials,
  loadCredentials,
} from "./client.js";

const program = new Command();

program
  .name("x-mcp")
  .description("CLI for interacting with X/Twitter")
  .version("0.1.0");

// Login command (hand-written — not a tool)
program
  .command("login")
  .description("Save X/Twitter API credentials")
  .action(async () => {
    const existing = loadCredentials();
    if (existing) {
      console.log(
        "Existing credentials found. Press Enter to keep current value.\n"
      );
    }

    const apiKey =
      (await password({ message: "API Key (Consumer Key):", mask: "*" })) ||
      existing?.apiKey;
    const apiSecret =
      (await password({ message: "API Secret (Consumer Secret):", mask: "*" })) ||
      existing?.apiSecret;
    const accessToken =
      (await password({ message: "Access Token:", mask: "*" })) ||
      existing?.accessToken;
    const accessTokenSecret =
      (await password({ message: "Access Token Secret:", mask: "*" })) ||
      existing?.accessTokenSecret;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      console.error("Error: All four credentials are required.");
      process.exit(1);
    }

    saveCredentials({ apiKey, apiSecret, accessToken, accessTokenSecret });
    console.log("Credentials saved to ~/.x-mcp/credentials.json");
  });

// Auto-register tool commands from registry
for (const tool of tools) {
  const cmd = program.command(tool.name.replaceAll("_", "-"));
  cmd.description(tool.description);

  const schemaEntries = Object.entries(tool.schema) as [string, z.ZodTypeAny][];

  for (const [key, zodType] of schemaEntries) {
    const desc = zodType.description ?? key;
    const isOpt = zodType.isOptional();
    const inner = isOpt ? (zodType as z.ZodOptional<z.ZodTypeAny>).unwrap() : zodType;

    if (inner instanceof z.ZodNumber) {
      cmd.option(`--${key.replaceAll("_", "-")} <value>`, desc);
    } else if (inner instanceof z.ZodArray) {
      cmd.argument(`<${key}...>`, desc);
    } else if (isOpt) {
      cmd.argument(`[${key}]`, desc);
    } else {
      cmd.argument(`<${key}>`, desc);
    }
  }

  cmd.action(async (...cmdArgs: unknown[]) => {
    try {
      const client = createClient();
      const userId = await getAuthenticatedUserId(client);

      const args: Record<string, unknown> = {};
      let positionalIndex = 0;

      for (const [key, zodType] of schemaEntries) {
        const isOpt = zodType.isOptional();
        const inner = isOpt ? (zodType as z.ZodOptional<z.ZodTypeAny>).unwrap() : zodType;

        if (inner instanceof z.ZodNumber) {
          const opts = cmdArgs[cmdArgs.length - 2] as Record<string, string>;
          const optKey = key.replaceAll("_", "-");
          if (opts[optKey] !== undefined) {
            args[key] = parseInt(opts[optKey], 10);
          }
        } else {
          args[key] = cmdArgs[positionalIndex++];
        }
      }

      const result = await tool.handler(client, userId, args);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });
}

program.parse();
