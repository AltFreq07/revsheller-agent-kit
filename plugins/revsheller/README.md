# revsheller plugin for Claude Code

This plugin connects Claude Code to the [revsheller](https://revsheller.com) MCP server and adds a skill that tells Claude when to use it. With it, Claude can open a hosted listener for a CTF box or one of your own lab machines, run commands once the target connects, and give a local web server a public https URL for webhook or phone testing.

Set `RSH_API_KEY` to a key from the [account page](https://revsheller.com/account) before starting Claude Code. The plugin sends it as a Bearer token to `https://revsheller.com/mcp`. Agent access is free for registered accounts during the beta.

Use it only on systems you own, CTF and lab targets, or machines you have written permission to test. Docs are at [revsheller.com/api-docs#mcp](https://revsheller.com/api-docs#mcp) and the privacy policy is at [revsheller.com/privacy](https://revsheller.com/privacy).
