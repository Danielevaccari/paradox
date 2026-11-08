# CLAUDE.md

Paradox is a React app for the Hedera Consensus Service: topics, topic messages, accounts and transactions, plus a Claude chatbot that uses the Hedera Agent Kit tools. It is live at https://paradoxhedera.netlify.app (GitHub: `Danielevaccari/paradox`). It is a portfolio piece, so the UI should stay polished.

## Commands
- `npm run dev`: Vite with the Netlify Functions served by `vite/netlifyFunctionsDev.ts`, so you don't need netlify-cli. It reads server variables from `.env`.
- `npm run lint`, `npm run typecheck` (app and functions), `npm run build`: all three must pass before committing.
- `npm run format`: Prettier, with 4 spaces, double quotes and print width 140.

## Stack
React 19, TypeScript 6.0 (pinned; typescript-eslint does not support TS 7 yet), Vite 8, MUI 9 with Emotion, react-router 8, Netlify Functions, `@hiero-ledger/sdk`, `@hashgraph/hedera-agent-kit`, `@anthropic-ai/sdk` and `@modelcontextprotocol/sdk`.

## Layout
- `src/api/`: `mirrorNode.ts` (public reads) and `serverApi.ts` (calls to `/api/*`).
- `src/app/`: app context (network, theme, server config, `canWrite`) and localStorage preferences.
- `src/views/`: pages. `src/components/`: feature parts (`topics`, `transactions`, `chat`, `layout`, `common`).
- `shared/api.ts`: request and response types and limits shared by the browser and the functions.
- `netlify/functions/`: `config.ts`, `hedera.ts` (`/api/hedera/:action`) and `chat.ts` (streamed NDJSON).
- `netlify/lib/`: env parsing, the Hedera client and operations, HTTP helpers, rate limit and `chat/` (tool loop and tool providers).

## Security rules (non-negotiable)
- **Never put a private key, API key or secret in frontend code or in a `VITE_*` variable.** Vite bundles every `VITE_*` value into public JavaScript.
- The browser only reads, from the public mirror node REST API. Anything that signs or costs HBAR goes through a Netlify Function.
- Server variables are listed in `.env.example` by name only. The default network is testnet, and mainnet needs `HEDERA_ALLOW_MAINNET=true`.
- Never open, print or commit `.env`. Refer to variables by name only.
- New endpoints call `assertSameOrigin`, `rateLimit` and zod validation, and return errors through `errorResponse`, which never leaks internals.

## Chatbot
- `netlify/lib/chat/agent.ts` runs a manual streaming tool loop. The model comes from `CLAUDE_MODEL` (default `claude-opus-5-5`), with server-side refusal fallbacks.
- Tools come from `ToolProvider` sources merged by `ToolRegistry`, with names prefixed `<provider>__<tool>`. Hedera Agent Kit tools run in-process. Remote MCP servers come from the `MCP_SERVERS` env var.
- To add a tool source, add a provider (or an `MCP_SERVERS` entry). Do not change the loop. Keep destructive tools out of the chatbot.

## Conventions
- Use MUI `sx` and theme tokens (`src/theme/theme.ts`), never hard-coded colours, so light and dark mode both work.
- Every view must work down to 320px width with no horizontal page scroll. Hide secondary table columns below `md`.
- Keep the UI compact and square (theme `borderRadius: 4`, small controls). The page never scrolls on list views: lists fill the height and only their rows scroll, using `fillCardSx`, `scrollAreaSx` and sticky table headers.
- Load data with `useAsyncData`. Don't call setState synchronously in effects (react-hooks 7 flags it).
- Component files export only components, so fast refresh keeps working.
- Show user-facing messages with `notify` (notistack).
- Git: commit in small logical steps on a feature branch. Do not push or open a PR without asking.
- No Claude or AI attribution anywhere: no `Co-Authored-By: Claude` trailer, and no "Generated with Claude (Code)" or robot line in commits, PRs, code or docs.
