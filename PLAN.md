# Paradox rework: plan

Branch: `paradox-rework`. Each step gets its own commit. Nothing is pushed.

## Done so far
- ✅ **Rename** (`53e906e`): `package.json` name is now `paradox`, plus the `index.html` description, the manifest name and a new README.
- ⚠️ **Upgrade (started, interrupted):** `package.json` is rewritten, but `package-lock.json` and `.eslintrc.json` are deleted and `node_modules` is half-installed. Not committed. I'll finish this step or roll it back, whichever you prefer.

## 1. Library upgrades
| Package | Now | Target | Note |
|---|---|---|---|
| react / react-dom / @types | 18 | 19.3 | |
| vite / @vitejs/plugin-react | 5 / 4 | 8.3 / 6.2 | |
| react-router-dom 7 | | `react-router` 8.5 | `-dom` package no longer needed |
| @mui/material, icons | 7 | 9.5 | check Grid/API breaks |
| eslint / @eslint/js | 8 + v9 config | 10 | new flat `eslint.config.js` |
| typescript | 5.8 | **6.0.3 (pinned)** | typescript-eslint 8.72 supports TS `<6.1`; TS 7 is not supported yet |
| eslint-plugin-react | 7.37 | **removed** | no ESLint 10 support; replaced by react-hooks 7 + react-refresh |
| @hashgraph/sdk | 2.63 | `@hiero-ledger/sdk` 2.90 (server only) | renamed SDK; Hedera Agent Kit requires it |
| styled-components | 6 | **removed** | keep Emotion, which MUI needs |
| @types/jest, @types/react-router-dom, @typescript-eslint/* | | **removed** | unused or redundant |

New scripts: `lint`, `typecheck`, `format`. `build` runs `tsc` first. Lint, typecheck and build must all pass.

## 2. UI refresh (same layout, more modern)
- Theme: rounded corners (currently 0), consistent spacing scale, Inter or system font, and proper dark and light palettes. The dark-mode override that recolours all Typography goes away. Follows the OS colour preference until the user toggles it.
- Sidebar becomes a temporary drawer with an app bar and menu button below `md`. The topic-messages drawer goes full width on phones.
- Views use one shared page header and card pattern instead of ad-hoc Paper and Grid. Tables scroll horizontally, and Transactions hides minor columns on small screens.
- Network shown as a chip, a clear "testnet" badge and empty or loading states.

## 3. Bugs and structure found
1. **Critical:** private keys, including mainnet, ship in the public JS bundle (`VITE_*`). See §4.
2. `createTopic(memo, adminKey, submitKey)` is called with the arguments swapped in `TopicView`, so the Admin and Private toggles are crossed.
3. `updateClient()` always uses `Client.forTestnet()`, whatever network is selected.
4. The mirror network is hard-coded to mainnet for every network.
5. `queryAccountBalance` returns the query *cost*, not the balance.
6. The theme mode key is stored per network, so switching networks flips the theme.
7. `getTopicInfoById` shows an error but keeps parsing a failed response, which leads to a crash or a bogus topic.
8. `topicMessages.sort()` mutates props during render, and message list keys are indexes.
9. Transaction type "All" (`value={undefined}`) never works, and the default filter is CONSENSUSCREATETOPIC.
10. `TransferRow` compares account IDs as strings while the prop can be an `AccountId`. `getNextAccountTransactions` returns a misspelled `link` type.
11. Create topic uses fixed `setTimeout(3000/6000)` waits instead of polling the mirror node. Errors in `onCreateTopic` are unhandled, so the spinner sticks.
12. Duplicate topics after "Get" (no dedupe). The `importAppDataFromFile` promise never rejects when parsing fails.
13. Settings page lets users type a private key into the browser. It will be removed and the account becomes server-configured.
14. Structure: duplicate base64 helpers, `Buffer` used in the browser, `let X = styled(X)` reassignment pattern, `main.tsx` exporting a hook (breaks fast refresh), and `process.env` in Vite code.

## 4. Security and backend (**needs your OK: Netlify Functions?**)
- The browser gets **no keys at all**. It reads from the public mirror node REST API (topics, messages, accounts, transactions), so it no longer needs the Hedera SDK.
- Writes (create, update or delete topic, submit message, transfer) go to `netlify/functions/hedera-*`, which sign with server-only env vars `HEDERA_NETWORK`, `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY` (no `VITE_` prefix).
- **Testnet only** by default. Mainnet is refused unless the server sets `HEDERA_ALLOW_MAINNET=true`. The network selector only offers what the server allows.
- Abuse guards on a public demo: message size cap, per-call max fee, a simple rate limit, and HBAR transfer disabled unless enabled server-side.
- `.env.example` lists variable names only. The `.env` file was never committed (confirmed). **You still need to rotate the exposed keys** and delete the old `VITE_*` vars in Netlify.
- Local dev uses `netlify dev`, which serves Vite and the functions together.

## 5. Chatbot design
- A chat panel (a floating button that opens a drawer, full screen on phones) streams replies from `netlify/functions/chat`.
- The function runs the Anthropic SDK tool loop server-side. `ANTHROPIC_API_KEY` stays server-only. Model comes from env `CLAUDE_MODEL`, default `claude-sonnet-5-5` (cheaper for a public demo; can be switched to `claude-opus-5-5`).
- **Tool sources behind one interface** (`ToolProvider { listTools(); callTool(name, args) }`):
  - `HederaAgentKitProvider` uses the in-process `@hashgraph/hedera-agent-kit` consensus tools: create topic, submit message and query topic messages, scoped to testnet and the server account.
  - `McpToolProvider` (later) connects to a remote MCP server over Streamable HTTP, such as Daniele's C# traceability server, configured via `MCP_SERVERS` env. Tool names get a namespace per provider.
- Guards: max tool iterations per request, max tokens, rate limit, and a short system prompt explaining Paradox.

## 6. Verify
Click through every view and flow in the browser: the drawer, Topics (create, get, messages on testnet), Accounts, Transactions, Settings and the chatbot. Check light and dark mode, desktop and 375px widths, and the console for errors. Then open the app in Chrome and leave the dev server running.
