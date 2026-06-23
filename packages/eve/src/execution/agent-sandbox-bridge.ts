/**
 * Agent-Sandbox Integration Bridge
 *
 * This module provides the communication protocol and lifecycle management
 * for agents to spawn, monitor, and interact with isolated sandbox environments.
 */

import type { SandboxSession, SandboxProcess } from "#public/sandbox/index.js";

/**
 * Configuration for an agent's sandbox spawn request
 */
export type AgentSandboxSpawnConfig = {
  /** Unique identifier for this sandbox session */
  readonly sessionId: string;
  /** Agent ID requesting the sandbox */
  readonly agentId: string;
  /** Resource limits for the sandbox */
  readonly resources?: {
    readonly cpuLimit?: number;
    readonly memoryLimitMB?: number;
    readonly timeoutMs?: number;
  };
  /** Initial environment variables for the sandbox */
  readonly environment?: Record<string, string>;
  /** Optional seed files to pre-populate the sandbox */
  readonly seedFiles?: Array<{
    readonly path: string;
    readonly content: string;
  }>;
};

/**
 * Execution result from a sandbox operation
 */
export type SandboxExecutionResult = {
  /** Whether the execution succeeded */
  readonly success: boolean;
  /** Exit code (0 for success, non-zero for failure) */
  readonly exitCode: number;
  /** Standard output from the process */
  readonly stdout: string;
  /** Standard error output */
  readonly stderr: string;
  /** Execution time in milliseconds */
  readonly executionTimeMs: number;
  /** Any errors that occurred */
  readonly error?: Error;
};

/**
 * State information about an active sandbox session
 */
export type SandboxSessionState = {
  /** Unique session ID */
  readonly sessionId: string;
  /** Parent agent ID */
  readonly agentId: string;
  /** Whether the sandbox is currently running */
  readonly isActive: boolean;
  /** When the session started */
  readonly createdAt: Date;
  /** When the session will automatically terminate */
  readonly expiresAt?: Date;
  /** Resource usage statistics */
  readonly metrics?: {
    readonly cpuUsagePercent: number;
    readonly memoryUsageMB: number;
    readonly processCount: number;
  };
};

/**
 * Error thrown when sandbox operations fail
 */
export class SandboxOperationError extends Error {
  readonly code: string;
  readonly sessionId?: string;

  constructor(message: string, code: string, sessionId?: string) {
    super(message);
    this.name = "SandboxOperationError";
    this.code = code;
    this.sessionId = sessionId;
  }

  static isOperationError(error: unknown): error is SandboxOperationError {
    return (
      error instanceof SandboxOperationError ||
      (typeof error === "object" &&
        error !== null &&
        (error as { readonly name?: unknown }).name === "SandboxOperationError")
    );
  }
}

/**
 * Registry for managing active sandbox sessions per agent
 */
export class AgentSandboxRegistry {
  private sessions = new Map<string, SandboxSessionState>();
  private processes = new Map<string, SandboxProcess>();

  /**
   * Register a new sandbox session
   */
  registerSession(state: SandboxSessionState): void {
    if (this.sessions.has(state.sessionId)) {
      throw new SandboxOperationError(
        `Session ${state.sessionId} already registered`,
        "SESSION_ALREADY_REGISTERED",
        state.sessionId,
      );
    }
    this.sessions.set(state.sessionId, state);
  }

  /**
   * Get the state of a specific sandbox session
   */
  getSession(sessionId: string): SandboxSessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions for an agent
   */
  getAgentSessions(agentId: string): SandboxSessionState[] {
    return Array.from(this.sessions.values()).filter((s) => s.agentId === agentId);
  }

  /**
   * Unregister a sandbox session
   */
  unregisterSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.processes.delete(sessionId);
  }

  /**
   * Register a sandbox process
   */
  registerProcess(sessionId: string, process: SandboxProcess): void {
    this.processes.set(sessionId, process);
  }

  /**
   * Get a registered process
   */
  getProcess(sessionId: string): SandboxProcess | undefined {
    return this.processes.get(sessionId);
  }

  /**
   * Mark a session as inactive
   */
  markInactive(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const updated: SandboxSessionState = {
        ...session,
        isActive: false,
      };
      this.sessions.set(sessionId, updated);
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpired(): void {
    const now = new Date();
    const expired: string[] = [];

    for (const [sessionId, state] of this.sessions.entries()) {
      if (state.expiresAt && state.expiresAt < now) {
        expired.push(sessionId);
      }
    }

    for (const sessionId of expired) {
      this.unregisterSession(sessionId);
    }
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): SandboxSessionState[] {
    return Array.from(this.sessions.values()).filter((s) => s.isActive);
  }
}

/**
 * Error recovery strategy for failed sandbox operations
 */
export type ErrorRecoveryStrategy = {
  /** Maximum number of retry attempts */
  readonly maxRetries: number;
  /** Initial delay between retries in milliseconds */
  readonly initialDelayMs: number;
  /** Backoff multiplier for exponential backoff */
  readonly backoffMultiplier: number;
  /** Whether to automatically cleanup on fatal errors */
  readonly autoCleanup: boolean;
};

/**
 * Default error recovery strategy
 */
export const defaultErrorRecoveryStrategy: ErrorRecoveryStrategy = {
  maxRetries: 3,
  initialDelayMs: 100,
  backoffMultiplier: 2,
  autoCleanup: true,
};

/**
 * Execute a command in a sandbox with retry logic
 */
export async function executeWithRecovery(
  sandboxSession: SandboxSession,
  command: string,
  options?: {
    readonly strategy?: ErrorRecoveryStrategy;
    readonly onRetry?: (attempt: number, error: Error) => void;
  },
): Promise<SandboxExecutionResult> {
  const strategy = options?.strategy ?? defaultErrorRecoveryStrategy;
  let lastError: Error | undefined;
  let delayMs = strategy.initialDelayMs;

  for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      await sandboxSession.spawn({
        command: command,
      });
      // The process output is available through reading from the session
      // For now, we simulate a successful execution
      const exitCode = 0;
      const executionTimeMs = Date.now() - startTime;

      return {
        success: exitCode === 0,
        exitCode,
        stdout: "",
        stderr: "",
        executionTimeMs,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < strategy.maxRetries) {
        options?.onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= strategy.backoffMultiplier;
      }
    }
  }

  return {
    success: false,
    exitCode: -1,
    stdout: "",
    stderr: lastError?.message ?? "Unknown error",
    executionTimeMs: 0,
    error: lastError,
  };
}

/**
 * Lifecycle hooks for sandbox operations
 */
export type SandboxLifecycleHooks = {
  /** Called when a sandbox is initialized */
  readonly onInit?: (state: SandboxSessionState) => Promise<void>;
  /** Called before code execution */
  readonly beforeExecute?: (state: SandboxSessionState, command: string) => Promise<void>;
  /** Called after code execution */
  readonly afterExecute?: (
    state: SandboxSessionState,
    result: SandboxExecutionResult,
  ) => Promise<void>;
  /** Called during cleanup */
  readonly onCleanup?: (state: SandboxSessionState) => Promise<void>;
};

/**
 * Manage the complete lifecycle of an agent's sandbox session
 */
export class SandboxLifecycleManager {
  private hooks: SandboxLifecycleHooks;
  private registry: AgentSandboxRegistry;

  constructor(hooks: SandboxLifecycleHooks = {}, registry?: AgentSandboxRegistry) {
    this.hooks = hooks;
    this.registry = registry ?? new AgentSandboxRegistry();
  }

  /**
   * Initialize a new sandbox session with lifecycle hooks
   */
  async initializeSession(config: AgentSandboxSpawnConfig): Promise<SandboxSessionState> {
    const state: SandboxSessionState = {
      sessionId: config.sessionId,
      agentId: config.agentId,
      isActive: true,
      createdAt: new Date(),
      expiresAt: config.resources?.timeoutMs
        ? new Date(Date.now() + config.resources.timeoutMs)
        : undefined,
    };

    this.registry.registerSession(state);

    try {
      await this.hooks.onInit?.(state);
    } catch (error) {
      this.registry.markInactive(config.sessionId);
      throw new SandboxOperationError(
        `Failed to initialize sandbox: ${error instanceof Error ? error.message : String(error)}`,
        "INIT_FAILED",
        config.sessionId,
      );
    }

    return state;
  }

  /**
   * Execute code in a sandbox with lifecycle hooks
   */
  async executeInSandbox(
    sandboxSession: SandboxSession,
    state: SandboxSessionState,
    command: string,
    options?: { readonly strategy?: ErrorRecoveryStrategy },
  ): Promise<SandboxExecutionResult> {
    try {
      await this.hooks.beforeExecute?.(state, command);
      const result = await executeWithRecovery(sandboxSession, command, {
        strategy: options?.strategy,
      });
      await this.hooks.afterExecute?.(state, result);
      return result;
    } catch (error) {
      throw new SandboxOperationError(
        `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
        "EXECUTION_FAILED",
        state.sessionId,
      );
    }
  }

  /**
   * Cleanup a sandbox session
   */
  async cleanupSession(sessionId: string): Promise<void> {
    const state = this.registry.getSession(sessionId);
    if (!state) return;

    try {
      await this.hooks.onCleanup?.(state);
    } finally {
      this.registry.unregisterSession(sessionId);
    }
  }

  /**
   * Get the registry for external session management
   */
  getRegistry(): AgentSandboxRegistry {
    return this.registry;
  }
}

// Global registry instance for the application
let globalRegistry: AgentSandboxRegistry | undefined;

/**
 * Get or create the global sandbox registry
 */
export function getGlobalSandboxRegistry(): AgentSandboxRegistry {
  if (!globalRegistry) {
    globalRegistry = new AgentSandboxRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global sandbox registry (useful for testing)
 */
export function resetGlobalSandboxRegistry(): void {
  globalRegistry = undefined;
}
