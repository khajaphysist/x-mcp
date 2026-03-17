# x-mcp

An MCP server and CLI for interacting with X/Twitter, built with [@xdevplatform/xdk](https://github.com/xdevplatform/xdk).

## Tools

| Tool | Description |
|------|-------------|
| `post_tweet` | Post a tweet |
| `search_tweets` | Search recent tweets (last 7 days) |
| `get_user_info` | Get user profile info by username(s) |
| `get_timeline` | Get your home timeline |
| `like_tweet` | Like a tweet by ID |
| `retweet` | Retweet a tweet by ID |
| `delete_tweet` | Delete a tweet by ID |

## Setup

### Prerequisites

You need X/Twitter API credentials (OAuth 1.0a). Get them from the [X Developer Portal](https://developer.x.com/en/portal/dashboard):

- **API Key** (Consumer Key)
- **API Secret** (Consumer Secret)
- **Access Token**
- **Access Token Secret**

### Authenticate

Either log in interactively (credentials are saved to `~/.x-mcp/credentials.json`):

```bash
npx @kms_dev/x-mcp login
```

Or set environment variables:

```bash
export X_API_KEY=your_api_key
export X_API_SECRET=your_api_secret
export X_ACCESS_TOKEN=your_access_token
export X_ACCESS_TOKEN_SECRET=your_access_token_secret
```

Environment variables take precedence over stored credentials.

## Usage

### MCP Server

Add to your MCP client config (e.g. Claude Desktop `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "x-mcp": {
      "command": "npx",
      "args": ["-y", "@kms_dev/x-mcp"],
      "env": {
        "X_API_KEY": "your_api_key",
        "X_API_SECRET": "your_api_secret",
        "X_ACCESS_TOKEN": "your_access_token",
        "X_ACCESS_TOKEN_SECRET": "your_access_token_secret"
      }
    }
  }
}
```

If you've already run `npx @kms_dev/x-mcp login`, you can omit the `env` block:

```json
{
  "mcpServers": {
    "x-mcp": {
      "command": "npx",
      "args": ["-y", "@kms_dev/x-mcp"]
    }
  }
}
```

### CLI

```bash
npx @kms_dev/x-mcp login
npx @kms_dev/x-mcp post-tweet "Hello world!"
npx @kms_dev/x-mcp search-tweets "typescript" --max-results 5
npx @kms_dev/x-mcp get-user-info XDevelopers
npx @kms_dev/x-mcp get-timeline --max-results 10
npx @kms_dev/x-mcp like-tweet 1234567890
npx @kms_dev/x-mcp retweet 1234567890
npx @kms_dev/x-mcp delete-tweet 1234567890
```

## Development

```bash
git clone https://github.com/khajaphysist/x-mcp.git
cd x-mcp
npm install

# Run tests
npm test

# Run CLI
npx tsx src/cli.ts search-tweets "test"

# Run MCP server
npx tsx src/mcp-server.ts

# Test MCP server with inspector
npx @modelcontextprotocol/inspector npx tsx src/mcp-server.ts
```
