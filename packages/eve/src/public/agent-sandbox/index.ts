/**
 * Agent-Sandbox Integration API
 *
 * Public API for managing agent-sandbox communication and lifecycle.
 * Agents can use these exports to spawn isolated sandbox environments,
 * monitor execution, and coordinate multi-environment workflows.
 */

export {
  AgentSandboxRegistry,
  SandboxOperationError,
  SandboxLifecycleManager,
  defaultErrorRecoveryStrategy,
  executeWithRecovery,
  getGlobalSandboxRegistry,
  resetGlobalSandboxRegistry,
} from "#execution/agent-sandbox-bridge.js";

export type {
  AgentSandboxSpawnConfig,
  SandboxExecutionResult,
  SandboxSessionState,
  SandboxLifecycleHooks,
  ErrorRecoveryStrategy,
} from "#execution/agent-sandbox-bridge.js";

export type { SandboxSession, SandboxProcess } from "#public/sandbox/index.js";
