#!/usr/bin/env node
// stdio bridge to the revsheller remote MCP server (https://revsheller.com/mcp).
// Reads newline-delimited JSON-RPC from stdin, POSTs each message to the server
// and writes the JSON reply to stdout. The server is stateless, so no session
// handshake or SSE is needed. No dependencies; needs Node 18+ for fetch.
"use strict";

const readline = require("node:readline");

const URL_ = process.env.RSH_MCP_URL || "https://revsheller.com/mcp";
const KEY = process.env.RSH_API_KEY || "";
// run_command waits up to 55 s and read_output up to 25 s, so leave headroom.
const TIMEOUT_MS = 90_000;

if (!KEY) {
  process.stderr.write(
    "revsheller-mcp: RSH_API_KEY is not set. tools/list will work, tool calls will fail.\n" +
      "Create a key at https://revsheller.com/account\n",
  );
}

function write(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function rpcError(id, message) {
  write({ jsonrpc: "2.0", id, error: { code: -32603, message } });
}

async function forward(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }
  const id = msg && typeof msg === "object" && "id" in msg ? msg.id : undefined;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (KEY) headers.Authorization = `Bearer ${KEY}`;

  let res;
  try {
    res = await fetch(URL_, {
      method: "POST",
      headers,
      body: line,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (id !== undefined) rpcError(id, `revsheller unreachable: ${err && err.message ? err.message : err}`);
    return;
  }

  if (res.status === 202) return; // notification accepted, nothing to send back
  const text = await res.text();
  if (!text) {
    if (id !== undefined) rpcError(id, `HTTP ${res.status} with an empty body`);
    return;
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    if (id !== undefined) rpcError(id, `HTTP ${res.status}: ${text.slice(0, 200)}`);
    return;
  }
  if (body && body.jsonrpc === "2.0") {
    write(body);
  } else if (id !== undefined) {
    // Plain JSON errors (for example a missing or bad API key) become JSON-RPC errors.
    const reason = body && body.error ? body.error : `HTTP ${res.status}`;
    rpcError(id, body && body.hint ? `${reason} (${body.hint})` : reason);
  }
}

const pending = new Set();
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  if (!line.trim()) return;
  const p = forward(line).finally(() => pending.delete(p));
  pending.add(p);
});
rl.on("close", async () => {
  await Promise.allSettled([...pending]);
  process.exit(0);
});
