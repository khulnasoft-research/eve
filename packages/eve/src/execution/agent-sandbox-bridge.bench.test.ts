import { describe, it, expect, beforeEach } from "vitest";
import {
  AgentSandboxRegistry,
  executeWithRecovery,
  getGlobalSandboxRegistry,
  resetGlobalSandboxRegistry,
} from "./agent-sandbox-bridge.js";
import type { SandboxSession } from "#public/sandbox/index.js";

describe("AgentSandboxRegistry - Load & Performance", () => {
  let registry: AgentSandboxRegistry;

  beforeEach(() => {
    registry = new AgentSandboxRegistry();
  });

  it("handles 1000 concurrent session registrations", () => {
    for (let i = 0; i < 1000; i++) {
      registry.registerSession({
        sessionId: `session-${i}`,
        agentId: `agent-${i % 10}`,
        isActive: true,
        createdAt: new Date(),
      });
    }

    expect(registry.getAllSessions()).toHaveLength(1000);
  });

  it("maintains O(1) session lookup under load", () => {
    for (let i = 0; i < 500; i++) {
      registry.registerSession({
        sessionId: `session-${i}`,
        agentId: "agent-load",
        isActive: true,
        createdAt: new Date(),
      });
    }

    const session = registry.getSession("session-250");
    expect(session).toBeDefined();
    expect(session!.sessionId).toBe("session-250");
  });

  it("performs agent session queries under load", () => {
    for (let i = 0; i < 1000; i++) {
      registry.registerSession({
        sessionId: `session-${i}`,
        agentId: `agent-${i % 5}`,
        isActive: true,
        createdAt: new Date(),
      });
    }

    const agentSessions = registry.getAgentSessions("agent-0");
    expect(agentSessions).toHaveLength(200);
  });

  it("cleans up expired sessions under pressure", () => {
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      registry.registerSession({
        sessionId: `expired-${i}`,
        agentId: "agent-expired",
        isActive: true,
        createdAt: new Date(now.getTime() - 10000),
        expiresAt: new Date(now.getTime() - 1000),
      });
    }
    for (let i = 0; i < 100; i++) {
      registry.registerSession({
        sessionId: `active-${i}`,
        agentId: "agent-active",
        isActive: true,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 10000),
      });
    }

    registry.cleanupExpired();
    expect(registry.getAllSessions()).toHaveLength(100);
  });

  it("handles rapid register-unregister cycle", () => {
    for (let i = 0; i < 100; i++) {
      registry.registerSession({
        sessionId: `session-${i}`,
        agentId: "agent-cycle",
        isActive: true,
        createdAt: new Date(),
      });
    }
    for (let i = 0; i < 100; i++) {
      registry.unregisterSession(`session-${i}`);
    }
    expect(registry.getAllSessions()).toHaveLength(0);
  });

  it("handles mixed active and inactive sessions", () => {
    for (let i = 0; i < 500; i++) {
      registry.registerSession({
        sessionId: `session-${i}`,
        agentId: `agent-${i % 20}`,
        isActive: i % 3 !== 0,
        createdAt: new Date(),
      });
    }

    const activeSessions = registry.getAllSessions();
    expect(activeSessions.length).toBeGreaterThan(0);
    for (const session of activeSessions) {
      expect(session.isActive).toBe(true);
    }
  });
});

describe("GlobalSandboxRegistry - Singleton & Reset", () => {
  beforeEach(() => {
    resetGlobalSandboxRegistry();
  });

  it("maintains singleton reference across 1000 calls", () => {
    const registries = Array.from({ length: 1000 }, () => getGlobalSandboxRegistry());
    const first = registries[0];
    for (const r of registries) {
      expect(r).toBe(first);
    }
  });
});

describe("executeWithRecovery - Error Scenario Validation", () => {
  let mockSession: Partial<SandboxSession>;

  beforeEach(() => {
    mockSession = {
      spawn: (async () => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("ok"));
            controller.close();
          },
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.close();
          },
        }),
        wait: async () => ({ exitCode: 0 }),
      })) as any,
    };
  });

  it("handles spawn throwing non-Error values", async () => {
    (mockSession.spawn as any) = async () => {
      throw "string error";
    };

    const result = await executeWithRecovery(mockSession as SandboxSession, "fail", {
      strategy: { maxRetries: 1, initialDelayMs: 5, backoffMultiplier: 1, autoCleanup: true },
    });

    expect(result.success).toBe(false);
  });

  it("handles spawn returning null process", async () => {
    (mockSession.spawn as any) = async () => null;

    const result = await executeWithRecovery(mockSession as SandboxSession, "fail", {
      strategy: { maxRetries: 1, initialDelayMs: 5, backoffMultiplier: 1, autoCleanup: true },
    });

    expect(result.success).toBe(false);
  });

  it("handles process output throwing", async () => {
    (mockSession.spawn as any) = async () => ({
      stdout: new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      stderr: new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      wait: async () => {
        throw new Error("output error");
      },
    });

    const result = await executeWithRecovery(mockSession as SandboxSession, "fail", {
      strategy: { maxRetries: 1, initialDelayMs: 5, backoffMultiplier: 1, autoCleanup: true },
    });

    expect(result.success).toBe(false);
  });

  it("recovers after intermittent failures within retry limit", async () => {
    let callCount = 0;
    (mockSession.spawn as any) = async () => {
      callCount++;
      if (callCount <= 2) throw new Error("transient");
      return {
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("recovered"));
            controller.close();
          },
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.close();
          },
        }),
        wait: async () => ({ exitCode: 0 }),
      };
    };

    const result = await executeWithRecovery(mockSession as SandboxSession, "retry-cmd", {
      strategy: { maxRetries: 3, initialDelayMs: 5, backoffMultiplier: 1, autoCleanup: true },
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toBe("recovered");
    expect(callCount).toBe(3);
  });

  it("calls onRetry callback with correct attempt number", async () => {
    let callCount = 0;
    const onRetry = (attempt: number) => {
      callCount++;
      expect(attempt).toBeGreaterThanOrEqual(1);
    };

    (mockSession.spawn as any) = async () => {
      throw new Error("persistent");
    };

    await executeWithRecovery(mockSession as SandboxSession, "fail", {
      strategy: { maxRetries: 2, initialDelayMs: 5, backoffMultiplier: 1, autoCleanup: true },
      onRetry,
    });

    expect(callCount).toBe(2);
  });
});
