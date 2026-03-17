import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";

function sendJsonRpc(
  messages: object[]
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["tsx", "src/mcp-server.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        X_API_KEY: "test",
        X_API_SECRET: "test",
        X_ACCESS_TOKEN: "test",
        X_ACCESS_TOKEN_SECRET: "test",
      },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", () => {
      resolve({ stdout, stderr });
    });

    proc.on("error", reject);

    const input = messages.map((m) => JSON.stringify(m)).join("\n") + "\n";
    proc.stdin.write(input);

    // Give the server time to process, then close stdin
    setTimeout(() => proc.stdin.end(), 1000);
    setTimeout(() => proc.kill(), 3000);
  });
}

describe("MCP Server", () => {
  it("responds to initialize", async () => {
    const { stdout } = await sendJsonRpc([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1.0" },
        },
      },
    ]);

    const response = JSON.parse(stdout.trim().split("\n")[0]);
    expect(response.result.serverInfo.name).toBe("x-mcp");
    expect(response.result.serverInfo.version).toBe("0.1.0");
    expect(response.result.capabilities.tools).toBeDefined();
  }, 10000);

  it("lists all tools", async () => {
    const { stdout } = await sendJsonRpc([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
    ]);

    const lines = stdout.trim().split("\n");
    const toolsResponse = JSON.parse(lines[lines.length - 1]);
    const toolNames = toolsResponse.result.tools.map(
      (t: { name: string }) => t.name
    );

    expect(toolNames).toContain("post_tweet");
    expect(toolNames).toContain("search_tweets");
    expect(toolNames).toContain("get_user_info");
    expect(toolNames).toContain("get_timeline");
    expect(toolNames).toContain("like_tweet");
    expect(toolNames).toContain("retweet");
    expect(toolNames).toContain("delete_tweet");
    expect(toolNames).toHaveLength(7);
  }, 10000);

  it("each tool has description and inputSchema", async () => {
    const { stdout } = await sendJsonRpc([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
    ]);

    const lines = stdout.trim().split("\n");
    const toolsResponse = JSON.parse(lines[lines.length - 1]);

    for (const tool of toolsResponse.result.tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  }, 10000);
});
