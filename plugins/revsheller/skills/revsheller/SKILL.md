---
name: revsheller
description: Use when the user needs a listener for a reverse shell on a CTF box or a lab machine they're allowed to test, wants to run commands on such a machine through a hosted relay, or wants a public https URL for a local web server (webhooks, phone testing, sharing a dev server). Uses the revsheller MCP tools.
---

# revsheller

revsheller is a hosted relay. For shells, it gives you a listener on the public internet so the user doesn't need a VPS, port forwarding or `nc -lvnp`. For web work, it gives a local port a public https URL.

## Before you start

Only connect to machines the user owns, CTF and training lab targets, or systems they have written permission to test. If the target isn't clearly one of those, ask. The account holder is responsible for what you connect to.

The tools need an API key in `RSH_API_KEY` (from https://revsheller.com/account). If every call fails with "Missing API key", tell the user to set it and restart.

## Getting a shell on a lab target

1. Call `create_session`. A reverse session (the default) returns `target_commands` with a `posix` and a `windows` command.
2. Give the user the command for their target's OS and ask them to run it there, or run it yourself if you already have a foothold the user asked you to use. The command contains a secret token, so don't paste it anywhere public.
3. Poll `session_status` until `targetConnected` is true. A few seconds is normal. If it stays false after a minute, the target probably can't reach the internet on port 443; `get_target_command` with another `type` (for example `bash_curl` or `powershell_ws`) can help.
4. Use `run_command` for each step. It returns the output and the exit code. Run one at a time per session, since parallel calls mix their output.
5. Call `close_session` when you're done. Sessions also end when idle.

If the target is reachable on a public IP and port, `create_session` with `mode: "forward"`, `target_host` and `target_port` makes the relay connect out to it instead. Private addresses and port 25 are blocked.

### When run_command times out

`run_command` waits for an end marker. Interactive programs (a pager, a REPL, `mysql`, an unfinished heredoc) never print it, so you get `completed: false`. Send Ctrl-C with `send_input` (`data: "\u0003"`), then `read_output` from the returned cursor to see where the shell is. For a program that needs typed input, use `send_input` and `read_output` directly, or `run_command` with `shell: "raw"`, which finishes after a stretch of silence.

`read_output` returns `reset: true` if the relay restarted and lost the buffer, and `dropped_bytes` if output scrolled past the 256 KiB buffer.

## Public URL for a local web server

1. Call `tunnel_create` with the local `port`. It returns the public URL and a `connect_command` (posix and powershell) for the user's machine.
2. Ask the user to swap `rsh_YOUR_KEY` in that command for their own key, run it and keep it running. Don't ask for the key yourself. `tunnel_list` shows whether the client is online.
3. `tunnel_delete` frees the slot when they're finished.

Visitors opening the URL in a browser see a one-time warning page first. Webhook senders and other non-browser clients don't.

## Limits worth knowing

During the beta every registered account gets 5 concurrent shell sessions (3 forward) and 2 tunnels. Rate limits answer HTTP 429 or JSON-RPC error -32029; wait and retry. Full docs are at https://revsheller.com/api-docs#mcp.
