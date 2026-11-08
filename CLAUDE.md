# CLAUDE.md

Paradox is a React app for the Hedera network: Consensus Service topics and messages, accounts and transactions, plus a Claude chatbot that uses Hedera tools. It runs at https://paradoxhedera.netlify.app (GitHub: `Danielevaccari/paradox`). It is a portfolio piece, so the UI should stay polished.

The rework in progress is described in `PLAN.md`. Do not change code beyond what the approved plan covers.

## Commands
- `npm run dev`: Vite dev server, frontend only.
- `netlify dev`: Vite and the Netlify Functions together. Use this once the backend exists.
- `npm run lint`, `npm run typecheck`, `npm run build`: all three must pass before committing.
- `npm run format`: Prettier, with 4 spaces, double quotes and print width 140.

## Stack
React 19, TypeScript, Vite, MUI with Emotion (no styled-components) and react-router. The backend is Netlify Functions in `netlify/functions/` (planned). Server-side Hedera code uses `@hiero-ledger/sdk` and `@hashgraph/hedera-agent-kit`. The chatbot uses `@anthropic-ai/sdk`.

TypeScript is pinned to 6.0.x because typescript-eslint does not support TS 7 yet. Check this again before bumping it.

## Layout
- `src/Views/`: pages (Topics, Accounts, Transactions, Settings).
- `src/components/`: view parts, grouped by feature.
- `src/Main/`: app shell, navigation drawer and routes.
- `src/Hedera/`: mirror node REST client (reads), Hedera types and enums.
- `src/Theme/`: light and dark MUI themes.
- `src/LocalStorage/`: persisted UI preferences and saved topic IDs.
- `netlify/functions/`: server endpoints that sign Hedera transactions and run the chatbot (planned).

## Security rules (non-negotiable)
- **Never put a private key, API key or secret in frontend code or in a `VITE_*` variable.** Vite bundles every `VITE_*` value into public JavaScript.
- The browser only reads, from the public mirror node REST API. Anything that signs or costs HBAR goes through a Netlify Function.
- Server variables have no `VITE_` prefix: `HEDERA_NETWORK`, `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY` and `ANTHROPIC_API_KEY`. List their names in `.env.example` only.
- Default to testnet. Mainnet must be explicitly enabled server-side.
- Never open, print or commit `.env`. Refer to variables by name only.

## Chatbot
- `netlify/functions/chat` runs the Claude tool loop on the server. The model comes from `CLAUDE_MODEL`.
- Tools come from `ToolProvider` sources: the Hedera Agent Kit now, and remote MCP servers later, such as the C# traceability server planned in `C:\ParadoxMcp`.
- To add a tool source, add a provider. Do not change the loop.

## Conventions
- Use MUI `sx` or `styled` from `@mui/material/styles`. Use theme tokens instead of hard-coded colours, so light and dark mode both work.
- Every view must work at 375px width.
- Use named exports. Each component file exports only components, so fast refresh keeps working.
- Show user-facing errors with `Notifier` (notistack).
- Git: commit in small logical steps on a feature branch. Do not push or open a PR without asking.
