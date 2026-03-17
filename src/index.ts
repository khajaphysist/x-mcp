#!/usr/bin/env node

// If invoked with no args (or just --help/--version), run the CLI.
// MCP clients call this binary with no args over stdio, but they pipe JSON-RPC,
// so we detect whether stdin is a TTY to decide:
//   - TTY (human at terminal) → CLI mode
//   - Not TTY (piped by MCP client) → MCP server mode

const args = process.argv.slice(2);
const hasSubcommand = args.length > 0;

if (hasSubcommand || process.stdin.isTTY) {
  import("./cli.js");
} else {
  import("./mcp-server.js");
}
