# revsheller-mcp

A stdio bridge to the [revsheller](https://revsheller.com) remote MCP server, for MCP clients that only start local processes. It reads JSON-RPC from stdin, posts each message to `https://revsheller.com/mcp` with your API key and writes the reply to stdout. It has no dependencies and needs Node 18 or newer.

revsheller gives an agent a hosted shell listener for CTF boxes and your own lab machines, and public https URLs for local web servers. Use it only on systems you own or have permission to test.

## Setup

Create an API key on the [account page](https://revsheller.com/account), then add this to your client's config (for Claude Desktop, `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "revsheller": {
      "command": "npx",
      "args": ["-y", "revsheller-mcp"],
      "env": { "RSH_API_KEY": "rsh_your_api_key" }
    }
  }
}
```

Clients that support remote servers over HTTP don't need this package. Point them at `https://revsheller.com/mcp` with the header `Authorization: Bearer rsh_your_api_key`.

## Environment

| Variable | Meaning |
|----------|---------|
| `RSH_API_KEY` | Your key (`rsh_...`). Required for every call. |
| `RSH_MCP_URL` | Server URL. Defaults to `https://revsheller.com/mcp`. |

Docs are at [revsheller.com/api-docs#mcp](https://revsheller.com/api-docs#mcp).

## License

MIT
