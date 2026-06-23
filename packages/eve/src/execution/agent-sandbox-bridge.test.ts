import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  AgentSandboxRegistry,
  SandboxOperationError,
  SandboxLifecycleManager,
  executeWithRecovery,
  defaultErrorRecoveryStrategy,
  getGlobalSandboxRegistry,
  resetGlobalSandboxRegistry,
} from "./agent-sandbox-bridge.js";
import type { SandboxSessionState, AgentSandboxSpawnConfig } from "./agent-sandbox-bridge.js";
import type { SandboxSession } from "#public/sandbox/index.js";

describe("AgentSandboxRegistry", () => {
  let registry: AgentSandboxRegistry;

  beforeEach(() => {
    registry = new AgentSandboxRegistry();
  });

  it("registers a sandbox session", () => {
    const state: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    registry.registerSession(state);
    expect(registry.getSession("session-1")).toEqual(state);
  });

  it("throws error when registering duplicate session", () => {
    const state: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    registry.registerSession(state);
    expect(() => registry.registerSession(state)).toThrow(SandboxOperationError);
  });

  it("retrieves all sessions for an agent", () => {
    const state1: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    const state2: SandboxSessionState = {
      sessionId: "session-2",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    const state3: SandboxSessionState = {
      sessionId: "session-3",
      agentId: "agent-2",
      isActive: true,
      createdAt: new Date(),
    };

    registry.registerSession(state1);
    registry.registerSession(state2);
    registry.registerSession(state3);

    const agentSessions = registry.getAgentSessions("agent-1");
    expect(agentSessions).toHaveLength(2);
    expect(agentSessions.map((s) => s.sessionId)).toContain("session-1");
    expect(agentSessions.map((s) => s.sessionId)).toContain("session-2");
  });

  it("unregisters a session", () => {
    const state: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    registry.registerSession(state);
    registry.unregisterSession("session-1");
    expect(registry.getSession("session-1")).toBeUndefined();
  });

  it("marks a session as inactive", () => {
    const state: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    registry.registerSession(state);
    registry.markInactive("session-1");

    const updated = registry.getSession("session-1");
    expect(updated?.isActive).toBe(false);
  });

  it("cleans up expired sessions", () => {
    const now = new Date();
    const expiredState: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(now.getTime() - 10000),
      expiresAt: new Date(now.getTime() - 1000),
    };

    const activeState: SandboxSessionState = {
      sessionId: "session-2",
      agentId: "agent-1",
      isActive: true,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10000),
    };

    registry.registerSession(expiredState);
    registry.registerSession(activeState);

    registry.cleanupExpired();

    expect(registry.getSession("session-1")).toBeUndefined();
    expect(registry.getSession("session-2")).toBeDefined();
  });

  it("returns all active sessions", () => {
    const state1: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    const state2: SandboxSessionState = {
      sessionId: "session-2",
      agentId: "agent-1",
      isActive: false,
      createdAt: new Date(),
    };

    registry.registerSession(state1);
    registry.registerSession(state2);

    const activeSessions = registry.getAllSessions();
    expect(activeSessions).toHaveLength(1);
    expect(activeSessions[0]!.sessionId).toBe("session-1");
  });
});

describe("SandboxOperationError", () => {
  it("creates error with code and session ID", () => {
    const error = new SandboxOperationError("Test error", "TEST_ERROR", "session-1");

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.sessionId).toBe("session-1");
    expect(error.name).toBe("SandboxOperationError");
  });

  it("identifies SandboxOperationError correctly", () => {
    const error = new SandboxOperationError("Test", "TEST_ERROR");
    expect(SandboxOperationError.isOperationError(error)).toBe(true);
    expect(SandboxOperationError.isOperationError(new Error("Other"))).toBe(false);
  });
});

describe("executeWithRecovery", () => {
  let mockSession: Partial<SandboxSession>;
  let mockProcess: any;

  beforeEach(() => {
    mockProcess = {
      stdout: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("success"));
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

    mockSession = {
      spawn: vi.fn().mockResolvedValue(mockProcess),
    };
  });

  it("executes command successfully", async () => {
    const result = await executeWithRecovery(mockSession as SandboxSession, "echo hello");

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("success");
  });

  it("retries on failure with exponential backoff", async () => {
    const onRetry = vi.fn();
    let attemptCount = 0;

    (mockSession.spawn as any).mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error("Temporary failure");
      }
      return mockProcess;
    });

    const result = await executeWithRecovery(mockSession as SandboxSession, "echo hello", {
      strategy: {
        maxRetries: 3,
        initialDelayMs: 10,
        backoffMultiplier: 2,
        autoCleanup: true,
      },
      onRetry,
    });

    expect(result.success).toBe(true);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("returns failure after max retries exceeded", async () => {
    (mockSession.spawn as any).mockRejectedValue(new Error("Persistent failure"));

    const result = await executeWithRecovery(mockSession as SandboxSession, "echo hello", {
      strategy: {
        maxRetries: 2,
        initialDelayMs: 10,
        backoffMultiplier: 2,
        autoCleanup: true,
      },
    });

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(-1);
    expect(result.error).toBeDefined();
  });

  it("returns error result for non-zero exit code", async () => {
    mockProcess.wait = vi.fn().mockResolvedValue({ exitCode: 1 });

    const result = await executeWithRecovery(mockSession as SandboxSession, "false");

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });
});

describe("SandboxLifecycleManager", () => {
  let manager: SandboxLifecycleManager;
  let onInit: any;
  let beforeExecute: any;
  let afterExecute: any;
  let onCleanup: any;

  beforeEach(() => {
    onInit = vi.fn();
    beforeExecute = vi.fn();
    afterExecute = vi.fn();
    onCleanup = vi.fn();

    manager = new SandboxLifecycleManager({
      onInit,
      beforeExecute,
      afterExecute,
      onCleanup,
    });
  });

  it("initializes a sandbox session with hooks", async () => {
    const config: AgentSandboxSpawnConfig = {
      sessionId: "session-1",
      agentId: "agent-1",
      resources: {
        timeoutMs: 5000,
      },
    };

    const state = await manager.initializeSession(config);

    expect(state.sessionId).toBe("session-1");
    expect(state.agentId).toBe("agent-1");
    expect(state.isActive).toBe(true);
    expect(onInit).toHaveBeenCalledWith(expect.objectContaining(state));
  });

  it("throws error if init hook fails", async () => {
    onInit.mockRejectedValue(new Error("Init failed"));

    const config: AgentSandboxSpawnConfig = {
      sessionId: "session-1",
      agentId: "agent-1",
    };

    await expect(manager.initializeSession(config)).rejects.toThrow(SandboxOperationError);
  });

  it("executes code with lifecycle hooks", async () => {
    const mockSession: Partial<SandboxSession> = {
      spawn: vi.fn().mockResolvedValue({
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
      }),
    };

    const state: SandboxSessionState = {
      sessionId: "session-1",
      agentId: "agent-1",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await manager.executeInSandbox(
      mockSession as SandboxSession,
      state,
      "echo test",
    );

    expect(beforeExecute).toHaveBeenCalledWith(state, "echo test");
    expect(afterExecute).toHaveBeenCalledWith(state, expect.objectContaining(result));
  });

  it("cleans up a sandbox session", async () => {
    const config: AgentSandboxSpawnConfig = {
      sessionId: "session-1",
      agentId: "agent-1",
    };

    const state = await manager.initializeSession(config);
    await manager.cleanupSession(state.sessionId);

    expect(onCleanup).toHaveBeenCalledWith(state);
    expect(manager.getRegistry().getSession("session-1")).toBeUndefined();
  });
});

describe("Global sandbox registry", () => {
  beforeEach(() => {
    resetGlobalSandboxRegistry();
  });

  afterEach(() => {
    resetGlobalSandboxRegistry();
  });

  it("returns same instance on multiple calls", () => {
    const registry1 = getGlobalSandboxRegistry();
    const registry2 = getGlobalSandboxRegistry();

    expect(registry1).toBe(registry2);
  });

  it("resets to new instance after reset", () => {
    const registry1 = getGlobalSandboxRegistry();
    resetGlobalSandboxRegistry();
    const registry2 = getGlobalSandboxRegistry();

    expect(registry1).not.toBe(registry2);
  });
});

describe("Error recovery strategy", () => {
  it("has sensible defaults", () => {
    expect(defaultErrorRecoveryStrategy.maxRetries).toBe(3);
    expect(defaultErrorRecoveryStrategy.initialDelayMs).toBe(100);
    expect(defaultErrorRecoveryStrategy.backoffMultiplier).toBe(2);
    expect(defaultErrorRecoveryStrategy.autoCleanup).toBe(true);
  });
});
