# CLAUDE.md

Paradox is a React app for the Hedera Consensus Service: topics, topic messages, accounts and transactions, plus a Claude chatbot that uses the Hedera Agent Kit tools. It is live at https://paradoxhedera.netlify.app (GitHub: `Danielevaccari/paradox`). It is a portfolio piece, so the UI should stay polished.

## Commands
- `npm run dev`: Vite with the Netlify Functions served by `vite/netlifyFunctionsDev.ts`, so you don't need netlify-cli. It reads server variables from `.env`.
- `npm run lint`, `npm run typecheck` (app and functions), `npm run build`: all three must pass before committing.
- `npm run format`: Prettier, with 4 spaces, double quotes and print width 140.

## Stack
React 19, TypeScript 6.0 (pinned; typescript-eslint does not support TS 7 yet), Vite 8, MUI 9 with Emotion, MUI X Data Grid (MIT), react-router 8, Netlify Functions, `@hiero-ledger/sdk`, `@hashgraph/hedera-agent-kit`, `@anthropic-ai/sdk` and `@modelcontextprotocol/sdk`.

## Layout
- `src/api/`: `mirrorNode.ts` (public reads) and `serverApi.ts` (calls to `/api/*`).
- `src/app/`: app context (network, theme, server config, `canWrite`) and localStorage preferences.
- `src/views/`: pages. `src/components/`: feature parts (`topics`, `transactions`, `chat`, `layout`, `common`).
- `shared/api.ts`: request and response types and limits shared by the browser and the functions.
- `netlify/functions/`: `config.ts`, `hedera.ts` (`/api/hedera/:action`), `chat.ts` (streamed NDJSON) and `chat-execute.ts` (runs a chatbot action after the user accepted it).
- `netlify/lib/`: env parsing, the Hedera client and operations, HTTP helpers, rate limit and `chat/` (tool loop and tool providers).

## Hedera cost rule (non-negotiable)
- **Free first: every read uses the free Hedera mirror node REST API** (`src/api/mirrorNode.ts`, and the Agent Kit's query tools, which already use it). Never add SDK queries such as `TopicInfoQuery`, `AccountBalanceQuery` or `TopicMessageQuery`: they cost HBAR. The server client's query payment cap is 0 on purpose.
- **Anything that costs HBAR must be accepted by the user before it runs.** That covers every transaction (create/update/delete topic, submit message, transfer) and any third-party tool that is not declared read-only.
  - In the UI, call `usePaidAction()` and pass the work as `run`; it shows the network, paying account and typical fee, and only runs `run` after the user accepts. Never call `serverApi` write methods directly from a click handler.
  - In the chatbot, paid tools never run inside the chat loop. `ToolProvider.approval()` marks them, the loop emits an approval card instead, and `/api/chat/execute` runs the tool only after the user accepts it.
  - New paid actions need a typical fee in `TYPICAL_FEE_HBAR` (`shared/api.ts`).

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
- Paid tools (create topic, submit message, and any MCP tool not marked `readOnlyHint`) become approval cards in the chat; see the Hedera cost rule.

## Conventions
- Use MUI `sx` and theme tokens (`src/theme/theme.ts`), never hard-coded colours, so light and dark mode both work.
- Every view must work down to 320px width with no horizontal page scroll. Hide secondary table columns below `md`.
- Design is minimal and theme-driven. Themes live in `src/theme/theme.ts` (`THEMES`: paper, clean, forest, graphite, each with light and dark); the user picks one (`useApp().themeId`, saved in preferences). Components must only use theme tokens (`palette`, `theme.custom`, `typography`), never hard-coded colours or fonts, so every theme works. Adding a theme means adding an id to `themeIds.ts` and an entry to `THEMES`. Pages use all the space (no page padding or max width) and scroll only their own content: grid rows, message lists. Tabular data uses `AppDataGrid` (MUI X Data Grid; pass view controls through `slotProps.toolbar.start`). Topics are a list plus a detail pane (`TopicList`, `TopicDetail`) at `/` and `/topics/:id`.
- Load data with `useAsyncData`. Don't call setState synchronously in effects (react-hooks 7 flags it).
- Component files export only components, so fast refresh keeps working.
- Show user-facing messages with `notify` (notistack).
- Git: commit in small logical steps on a feature branch. Do not push or open a PR without asking.
- No Claude or AI attribution anywhere: no `Co-Authored-By: Claude` trailer, and no "Generated with Claude (Code)" or robot line in commits, PRs, code or docs.
