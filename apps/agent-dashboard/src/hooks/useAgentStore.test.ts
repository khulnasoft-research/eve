import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAgentStore, useSelectedAgent, useAgentSandboxes } from "./useAgentStore";
import type { Agent, SandboxSession, SystemMetrics } from "@/types";

const mockAgent: Agent = {
  id: "agent-1",
  name: "Test Agent",
  status: "active",
  description: "A test agent",
  createdAt: new Date("2024-01-01"),
  lastHeartbeat: new Date("2024-01-02"),
  activeSandboxes: 2,
  totalExecutions: 10,
  errorCount: 1,
};

const mockSandbox: SandboxSession = {
  sessionId: "sb-1",
  agentId: "agent-1",
  status: "running",
  createdAt: new Date("2024-01-01"),
  resourceUsage: { cpuPercent: 50, memoryMB: 256, uptime: 3600 },
  lastActivity: new Date("2024-01-02"),
};

const mockMetrics: SystemMetrics = {
  timestamp: new Date(),
  activeAgents: 2,
  activeSandboxes: 3,
  totalCpuPercent: 135,
  totalMemoryMB: 896,
  errorRate: 0.008,
};

describe("useAgentStore", () => {
  beforeEach(() => {
    useAgentStore.setState({
      agents: [],
      selectedAgentId: null,
      sandboxes: [],
      metrics: null,
      loading: false,
      error: null,
    });
  });

  describe("initial state", () => {
    it("starts with empty agents list", () => {
      const state = useAgentStore.getState();
      expect(state.agents).toEqual([]);
      expect(state.selectedAgentId).toBeNull();
      expect(state.sandboxes).toEqual([]);
      expect(state.metrics).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("setAgents", () => {
    it("sets the agents list", () => {
      useAgentStore.getState().setAgents([mockAgent]);
      expect(useAgentStore.getState().agents).toEqual([mockAgent]);
    });

    it("replaces existing agents", () => {
      useAgentStore.getState().setAgents([mockAgent]);
      useAgentStore.getState().setAgents([]);
      expect(useAgentStore.getState().agents).toEqual([]);
    });
  });

  describe("addAgent", () => {
    it("appends agent to list", () => {
      useAgentStore.getState().addAgent(mockAgent);
      expect(useAgentStore.getState().agents).toHaveLength(1);
      expect(useAgentStore.getState().agents[0].id).toBe("agent-1");
    });

    it("adds multiple agents", () => {
      const agent2 = { ...mockAgent, id: "agent-2" };
      useAgentStore.getState().addAgent(mockAgent);
      useAgentStore.getState().addAgent(agent2);
      expect(useAgentStore.getState().agents).toHaveLength(2);
    });
  });

  describe("updateAgent", () => {
    it("updates existing agent fields", () => {
      useAgentStore.getState().addAgent(mockAgent);
      useAgentStore.getState().updateAgent("agent-1", { status: "idle", activeSandboxes: 0 });
      const agent = useAgentStore.getState().agents[0];
      expect(agent.status).toBe("idle");
      expect(agent.activeSandboxes).toBe(0);
    });

    it("does not modify other agents", () => {
      const agent2 = { ...mockAgent, id: "agent-2" };
      useAgentStore.getState().addAgent(mockAgent);
      useAgentStore.getState().addAgent(agent2);
      useAgentStore.getState().updateAgent("agent-1", { name: "Updated" });
      expect(useAgentStore.getState().agents[0].name).toBe("Updated");
      expect(useAgentStore.getState().agents[1].name).toBe("Test Agent");
    });
  });

  describe("removeAgent", () => {
    it("removes agent by id", () => {
      useAgentStore.getState().addAgent(mockAgent);
      useAgentStore.getState().removeAgent("agent-1");
      expect(useAgentStore.getState().agents).toHaveLength(0);
    });

    it("removes only the specified agent", () => {
      const agent2 = { ...mockAgent, id: "agent-2" };
      useAgentStore.getState().addAgent(mockAgent);
      useAgentStore.getState().addAgent(agent2);
      useAgentStore.getState().removeAgent("agent-1");
      expect(useAgentStore.getState().agents).toHaveLength(1);
      expect(useAgentStore.getState().agents[0].id).toBe("agent-2");
    });
  });

  describe("selectAgent", () => {
    it("sets selected agent id", () => {
      useAgentStore.getState().selectAgent("agent-1");
      expect(useAgentStore.getState().selectedAgentId).toBe("agent-1");
    });

    it("clears selection with null", () => {
      useAgentStore.getState().selectAgent("agent-1");
      useAgentStore.getState().selectAgent(null);
      expect(useAgentStore.getState().selectedAgentId).toBeNull();
    });
  });

  describe("setSandboxes / updateSandbox", () => {
    it("sets sandboxes list", () => {
      useAgentStore.getState().setSandboxes([mockSandbox]);
      expect(useAgentStore.getState().sandboxes).toEqual([mockSandbox]);
    });

    it("updates existing sandbox by sessionId", () => {
      useAgentStore.getState().setSandboxes([mockSandbox]);
      useAgentStore.getState().updateSandbox("sb-1", { status: "stopped" });
      expect(useAgentStore.getState().sandboxes[0].status).toBe("stopped");
    });
  });

  describe("setMetrics", () => {
    it("sets metrics data", () => {
      useAgentStore.getState().setMetrics(mockMetrics);
      expect(useAgentStore.getState().metrics).toEqual(mockMetrics);
    });
  });

  describe("setLoading / setError", () => {
    it("sets loading state", () => {
      useAgentStore.getState().setLoading(true);
      expect(useAgentStore.getState().loading).toBe(true);
    });

    it("sets error message", () => {
      useAgentStore.getState().setError("Something went wrong");
      expect(useAgentStore.getState().error).toBe("Something went wrong");
    });

    it("clears error with null", () => {
      useAgentStore.getState().setError("error");
      useAgentStore.getState().setError(null);
      expect(useAgentStore.getState().error).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets to initial state", () => {
      useAgentStore.getState().setAgents([mockAgent]);
      useAgentStore.getState().selectAgent("agent-1");
      useAgentStore.getState().setLoading(true);
      useAgentStore.getState().setError("err");
      useAgentStore.getState().reset();
      const s = useAgentStore.getState();
      expect(s.agents).toEqual([]);
      expect(s.selectedAgentId).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
    });
  });
});

describe("useSelectedAgent", () => {
  beforeEach(() => {
    useAgentStore.setState({ agents: [], selectedAgentId: null });
  });

  it("returns null when no agent selected", () => {
    const { result } = renderHook(() => useSelectedAgent());
    expect(result.current).toBeNull();
  });

  it("returns the selected agent", () => {
    useAgentStore.setState({ agents: [mockAgent], selectedAgentId: "agent-1" });
    const { result } = renderHook(() => useSelectedAgent());
    expect(result.current).toEqual(mockAgent);
  });

  it("returns null when selected id does not match any agent", () => {
    useAgentStore.setState({ agents: [mockAgent], selectedAgentId: "nonexistent" });
    const { result } = renderHook(() => useSelectedAgent());
    expect(result.current).toBeNull();
  });
});

describe("useAgentSandboxes", () => {
  beforeEach(() => {
    useAgentStore.setState({ sandboxes: [] });
  });

  it("returns empty array when no sandboxes", () => {
    const { result } = renderHook(() => useAgentSandboxes("agent-1"));
    expect(result.current).toEqual([]);
  });

  it("filters sandboxes by agent id", () => {
    const sb2: SandboxSession = { ...mockSandbox, sessionId: "sb-2", agentId: "agent-2" };
    useAgentStore.setState({ sandboxes: [mockSandbox, sb2] });
    const { result } = renderHook(() => useAgentSandboxes("agent-1"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].sessionId).toBe("sb-1");
  });
});
