# eve

## 1.0.0

### Major Changes

- **Agent Sandbox Bridge** — Structured lifecycle management for sandbox sessions with `AgentSandboxRegistry`, `SandboxLifecycleManager`, and `executeWithRecovery`. Agents can now register, monitor, and recover sandbox sessions with exponential backoff and lifecycle hooks.

- **SandboxProcess stream API** — `SandboxProcess.output()` has been removed. Use `process.wait()` combined with `process.stdout`/`process.stderr` `ReadableStream` to collect output.

- **Testing infrastructure** — Comprehensive test suite with 100+ tests across unit, integration, load/benchmark, and E2E eval layers. The agent-dashboard app achieves >80% coverage on testable modules.

- **Web Dashboard** — Full Next.js 16 application for agent monitoring with REST API, WebSocket support, and real-time sandbox session tracking.

### Minor Changes

- `SandboxSessionState` now includes optional `expiresAt` and `metrics` fields.
- `defaultErrorRecoveryStrategy` provides sensible defaults (3 retries, 2x backoff, auto-cleanup).
- `SandboxOperationError` includes typed `code` and `sessionId` for structured error handling.
- `getGlobalSandboxRegistry()` / `resetGlobalSandboxRegistry()` for singleton access patterns.
- Agent dashboard: `useParams` replaces custom `use()` for React 19 compatibility.
- Agent dashboard: ESM imports replace CommonJS `require` calls.
- Agent dashboard: `viewport` metadata separated from `Metadata` per Next.js 16.

### Patch Changes

- 680ff48: Text prompts now use block cursors, while active turns and model or channel setup use shared green progress pulses.
- 27a9701: Resolve extensionless relative imports whose target basename contains dots when bundling authored modules.
- 3a64a8f: `eve init` with no target, when run by a coding agent, now prints a setup guide.
- 86a35eb: Add inline tool auth provider overloads.
- 25ab1e7: Preserve dev-runtime snapshots for parked HITL turns.
- 504f59e: Allow `eve eval` target checks to match scoped package names.
- 0dca794: Restore Slack authorization status updates.
- 3548363: Strengthen Vercel and just-bash process streaming.
- 8f7d97b: Keep Vercel Sandbox option types synchronized with the installed SDK.
- 3f3a86b: Improve conversation compaction.
- e296fb8: The dev TUI now opens `/model` when the runtime confirms no model provider.
- f68ecbe: Set the Eve Vercel framework preset when creating standalone Eve projects.
- c084232: Verify remote Vercel deployment origins before sending ambient credentials.

## 0.12.3

### Patch Changes

- 680ff48: Text prompts now use block cursors, while active turns and model or channel setup use shared green progress pulses.
- 27a9701: Resolve extensionless relative imports whose target basename contains dots when bundling authored modules. Local files such as `./mock-registry.schemas` and dependency requires such as `./Reflect.getPrototypeOf` now probe Eve's configured `.ts` and `.js` extensions before being treated as asset imports.
- 3a64a8f: `eve init` with no target, when run by a coding agent, now prints a setup guide — what to ask the user, then the scaffold command — instead of scaffolding the current directory. The guide routes both channels (Slack credentials) and connections (per-user OAuth) through Vercel Connect so credentials are provisioned rather than hand-managed. `eve init <name>` and `eve init .` are unchanged.
- 3a64a8f: `eve init` now offers to open an installed coding-agent REPL when its CLI is on `PATH`, while keeping `eve dev` as the default. It detects Claude Code, Codex, Cursor, Droid, Gemini CLI, opencode, and Pi. The selected REPL starts with a project-specific setup prompt and `eve dev --no-ui` verification guidance. Coding-agent and non-interactive launches, plus systems without any supported CLI, keep the existing development-server handoff.
- 86a35eb: Add inline tool auth provider overloads so tools can call `ctx.getToken(provider, options?)` and `ctx.requireAuth(provider, options?)` without declaring a single top-level `auth`. Vercel Connect providers can be authored inline with `connect("service/agent")` or `connect({ connector, tokenParams })`; the existing top-level tool `auth` field and no-argument tool auth accessors remain supported for compatibility, but are now deprecated in favor of inline providers.
- 25ab1e7: Preserve dev-runtime snapshots that are still referenced by local durable workflow data so parked HITL turns can resume after `eve dev` rebuilds.
- 504f59e: Allow `eve eval` target checks to match a scoped package name such as `@acme/agent` against the runtime agent identity `agent`.
- 0dca794: Restore Slack authorization status updates by posting a link-free public status while sending the sign-in challenge privately, then updating the public status when authorization completes.
- 3548363: Strengthen Vercel and just-bash process streaming with deterministic completion, safe output cancellation, and idempotent process operations.

## 0.12.2

### Patch Changes

- 8f7d97b: Keep Vercel Sandbox option types synchronized with the installed SDK by vendoring its upstream declaration files instead of maintaining a hand-written copy. Vercel-backed file reads now convert provider Node streams to Eve's public Web stream contract.

## 0.12.1

### Patch Changes

- 3f3a86b: Improve conversation compaction for longer, more reliable sessions.
- e296fb8: The dev TUI now opens `/model` when the runtime confirms no model provider is configured and refreshes model access after setup. Selected rows now use padded inverse labels with a filled arrow.
- f68ecbe: Set the Eve Vercel framework preset when creating standalone Eve projects.
- c084232: Verify remote Vercel deployment origins against the owner and project supplied by `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, or by a local project link, before sending ambient credentials. Remote dev and eval clients now refresh scoped OIDC tokens per request and refuse to forward credentials across redirects. Remote `eve dev` and `eve eval --url` targets now require `https://` (loopback hosts may still use `http://`).
