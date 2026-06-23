---
title: "Migration Guide"
description: "Upgrade your eve project to the latest sandbox APIs, agent lifecycle, and testing infrastructure."
---

This guide covers the breaking changes and new features introduced across recent releases. Follow the section that matches your current version.

## Upgrading to the Agent Sandbox Bridge

The agent-sandbox integration now provides a structured lifecycle for spawning, monitoring, and recovering sandbox sessions.

### New imports

The `AgentSandboxRegistry` and `SandboxLifecycleManager` replace ad-hoc session management:

```ts
// Before — manual session tracking
const sessions = new Map<string, SandboxSessionState>();

function register(sessionId: string, agentId: string) {
  sessions.set(sessionId, { sessionId, agentId, isActive: true, createdAt: new Date() });
}

// After — use the registry
import { AgentSandboxRegistry } from "eve/agent-sandbox";

const registry = new AgentSandboxRegistry();
registry.registerSession({ sessionId, agentId, isActive: true, createdAt: new Date() });
```

### Lifecycle hooks

Use `SandboxLifecycleManager` to attach `onInit`, `beforeExecute`, `afterExecute`, and `onCleanup` hooks:

```ts
import { SandboxLifecycleManager } from "eve/agent-sandbox";

const manager = new SandboxLifecycleManager({
  onInit: async (state) => {
    /* allocation logic */
  },
  beforeExecute: async (state, command) => {
    /* pre-flight checks */
  },
  afterExecute: async (state, result) => {
    /* post-processing */
  },
  onCleanup: async (state) => {
    /* teardown */
  },
});
```

### Error recovery

Replace inline retry logic with `executeWithRecovery`, which applies exponential backoff:

```ts
import { executeWithRecovery, defaultErrorRecoveryStrategy } from "eve/agent-sandbox";

const result = await executeWithRecovery(sandboxSession, command, {
  strategy: { maxRetries: 3, initialDelayMs: 100, backoffMultiplier: 2 },
  onRetry: (attempt, error) => console.warn(`Retry ${attempt}: ${error.message}`),
});
```

### Removed APIs

- `SandboxProcess.output()` — removed. Use `process.wait()` with `process.stdout`/`process.stderr` `ReadableStream` instead.

```ts
// Before
const { exitCode, stdout, stderr } = await process.output();

// After
const [{ exitCode }, stdout, stderr] = await Promise.all([
  process.wait(),
  streamToBuffer(process.stdout).then((b) => b.toString()),
  streamToBuffer(process.stderr).then((b) => b.toString()),
]);
```

## Upgrading to Testing Infrastructure

### Test configuration

If you maintain tests for sandbox-related code, add a `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/internal/testing/unit-guard.ts"],
  },
});
```

### Mock sandbox processes

Mock `SandboxProcess` using the stream API instead of the removed `output()`:

```ts
const mockProcess = {
  stdout: new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("output"));
      controller.close();
    },
  }),
  stderr: new ReadableStream({
    start(controller) {
      controller.close();
    },
  }),
  wait: vi.fn().mockResolvedValue({ exitCode: 0 }),
};
```

### Load testing

Benchmark tests should follow the `*.bench.test.ts` naming convention and can use `AgentSandboxRegistry` directly:

```ts
it("handles 1000 concurrent sessions", () => {
  const registry = new AgentSandboxRegistry();
  for (let i = 0; i < 1000; i++) {
    registry.registerSession({
      sessionId: `s-${i}`,
      agentId: "a",
      isActive: true,
      createdAt: new Date(),
    });
  }
  expect(registry.getAllSessions()).toHaveLength(1000);
});
```

## Upgrading an agent-dashboard project

If you maintain the agent dashboard application:

1. Update your Next.js page to use `useParams` instead of the React 19 `use()` hook:

```tsx
// Before
import { use } from "react";
const params = use(paramsPromise);

// After
const resolvedParams = useParams(params);
function useParams<T>(promise: Promise<T>): T {
  /* ... */
}
```

2. Replace CommonJS `require` calls with ESM imports:

```ts
// Before
const crypto = require("crypto");

// After
import crypto from "crypto";
```

3. Separate `viewport` metadata from `Metadata`:

```ts
// Before
export const metadata: Metadata = { viewport: "width=device-width" };

// After
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  /* non-viewport fields */
};
```

## Need help?

Open a [GitHub issue](https://github.com/vercel/eve/issues/new) or start a discussion. For security issues, follow [SECURITY.md](https://github.com/vercel/eve/security/policy).
