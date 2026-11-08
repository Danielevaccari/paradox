# Paradox

Paradox is a web app for the [Hedera](https://hedera.com) Consensus Service. You can create topics, submit and read topic messages, look up accounts and browse transactions. A built-in Claude assistant does the same through chat, using the official [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit-js) tools.

Live demo: https://paradoxhedera.netlify.app

## Architecture

```
Browser (React 19, MUI 9, Vite 8)
  ├─ reads ─────────────► Hedera mirror node REST API (public, no keys)
  └─ writes / chat ─────► Netlify Functions (/api/*)
                            ├─ /api/config        server network, account, enabled features
                            ├─ /api/hedera/:action create / submit / renew / delete topic, transfer
                            └─ /api/chat          Claude tool loop, streamed as NDJSON
                                   └─ ToolRegistry
                                        ├─ HederaAgentKitProvider (in-process Hedera Agent Kit tools)
                                        └─ McpToolProvider × n   (remote MCP servers from MCP_SERVERS)
```

- **No keys in the browser.** The Hedera private key and the Anthropic API key exist only as server environment variables. The browser bundle contains no secrets.
- **Testnet by default.** Mainnet signing is refused unless `HEDERA_ALLOW_MAINNET=true`. Any network can still be browsed read-only.
- **Pluggable chatbot tools.** The chat loop only knows the `ToolProvider` interface. To add another MCP server, such as a traceability server, add it to `MCP_SERVERS`; its tools appear as `<id>__<tool>`.
- **Guards.** Requests are validated with zod, checked for same origin, rate-limited per IP and size-capped. The chatbot only gets non-destructive Hedera tools.

## Getting started

Requires Node 22.12 or later.

```bash
npm install
cp .env.example .env   # then fill in HEDERA_* and ANTHROPIC_API_KEY
npm run dev            # http://localhost:5173, frontend and functions together
```

`npm run dev` serves the Netlify Functions through a small Vite plugin (`vite/netlifyFunctionsDev.ts`), so you don't need `netlify-cli`. Without a configured backend the app still works read-only.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with the API functions |
| `npm run lint` | ESLint 10 (flat config) |
| `npm run typecheck` | TypeScript for the app and the functions |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run format` | Prettier |

## Deploying to Netlify

`netlify.toml` configures the build, the functions directory, Node 24 and the SPA fallback. Set the variables from `.env.example` in the Netlify UI. Do not create any `VITE_*` variables for secrets.

## Tech stack

React 19, TypeScript 6, Vite 8, MUI 9 (Emotion), react-router 8, Netlify Functions, `@hiero-ledger/sdk`, `@hashgraph/hedera-agent-kit`, `@anthropic-ai/sdk`, `@modelcontextprotocol/sdk`.

TypeScript is pinned to 6.0 because typescript-eslint 8.72 supports TypeScript below 6.1 only.
