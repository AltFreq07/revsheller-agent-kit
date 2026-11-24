# Installing the revsheller MCP server

These steps are for an AI agent setting up revsheller for a user.

1. Ask the user for a revsheller API key. They create one at https://revsheller.com/account after signing in; it starts with `rsh_`. Don't invent one and don't try to create an account for them.
2. If the client supports remote MCP servers over Streamable HTTP, add:
   - URL: `https://revsheller.com/mcp`
   - Header: `Authorization: Bearer <the user's key>`
3. If the client only starts local stdio servers, add this instead (needs Node 18 or newer):

```json
{
  "mcpServers": {
    "revsheller": {
      "command": "npx",
      "args": ["-y", "revsheller-mcp"],
      "env": { "RSH_API_KEY": "<the user's key>" }
    }
  }
}
```

4. Check it works by calling `list_sessions`. An empty list is a pass. "Missing API key" or "Invalid API key" means the key wasn't passed through.

Use the tools only on machines the user owns, CTF and lab targets, or systems they have written permission to test. Docs are at https://revsheller.com/api-docs#mcp.
