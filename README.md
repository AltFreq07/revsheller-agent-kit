# revsheller agent kit

[![revsheller MCP connector](https://glama.ai/mcp/connectors/com.revsheller/revsheller/badges/score.svg)](https://glama.ai/mcp/connectors/com.revsheller/revsheller)

Ways to plug [revsheller](https://revsheller.com) into an AI agent. revsheller is a hosted relay with two jobs. It gives you a shell listener on the public internet for CTF boxes and your own lab machines, so there's no VPS or port forwarding to set up, and it gives a local web server a public https URL.

The server side is a remote MCP server at `https://revsheller.com/mcp`. Everything here is a different way of reaching it.

Use it only on machines you own, CTF and training lab targets, or systems you have written permission to test. You're responsible for what your agent connects to.

## Get an API key

Sign in at [revsheller.com](https://revsheller.com) and create a key on the [account page](https://revsheller.com/account). Keys start with `rsh_`. Agent and MCP access is free for registered accounts during the beta.

## Claude Code plugin

The plugin adds the MCP server and a skill that tells Claude when to use it and how to recover when a command hangs.

```
/plugin marketplace add AltFreq07/revsheller-agent-kit
/plugin install revsheller@revsheller
```

The plugin reads your key from the `RSH_API_KEY` environment variable, so set it before starting Claude Code.

If you'd rather skip the plugin, add the server directly:

```
claude mcp add --transport http revsheller https://revsheller.com/mcp \
  --header "Authorization: Bearer rsh_your_api_key"
```

## Clients that only speak stdio

Claude Desktop and some other clients start MCP servers as local processes. [`revsheller-mcp`](packages/revsheller-mcp) is a small bridge with no dependencies that forwards stdio to the remote server.

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

## Other agents

If your framework calls REST APIs, use the OpenAPI description at [revsheller.com/openapi.json](https://revsheller.com/openapi.json). Models that read docs can start at [llms.txt](https://revsheller.com/llms.txt) or the single-file [llms-full.txt](https://revsheller.com/llms-full.txt).

## What the tools do

| Tool | Use |
|------|-----|
| `create_session` | Start a reverse or forward shell session. Returns the command to run on the target. |
| `get_target_command` | Get that command again, for another OS or transport. |
| `session_status` | Check whether the target has connected. |
| `run_command` | Run one command and get its output and exit code. |
| `send_input` / `read_output` | Type into the shell and read raw output, for interactive programs. |
| `list_sessions` / `close_session` | See and end your sessions. |
| `tunnel_create` / `tunnel_list` / `tunnel_delete` | Give a local port a public https URL. |

Full docs are at [revsheller.com/api-docs#mcp](https://revsheller.com/api-docs#mcp). Report abuse at [revsheller.com/abuse](https://revsheller.com/abuse).

## License

MIT
