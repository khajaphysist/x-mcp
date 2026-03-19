#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools/index.js";
import { createClient, getAuthenticatedUserId } from "./client.js";
import type { Client } from "@xdevplatform/xdk";

const server = new McpServer({
  name: "x-mcp",
  version: "0.1.0",
});

let client: Client | undefined;
let userId: string | undefined;

async function getClient(): Promise<Client> {
  if (!client) {
    client = createClient();
  }
  return client;
}

async function getUserId(): Promise<string> {
  if (!userId) {
    userId = await getAuthenticatedUserId(await getClient());
  }
  return userId;
}

for (const tool of tools) {
  server.tool(tool.name, tool.description, tool.schema, async (args: Record<string, unknown>) => {
    try {
      const c = await getClient();
      const id = await getUserId();
      const result = await tool.handler(c, id, args);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err: any) {
      let message = err instanceof Error ? err.message : String(err);
      if (err?.data) {
        message += `\n${JSON.stringify(err.data, null, 2)}`;
      }
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
