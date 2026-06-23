import { create } from "zustand";
import type { Agent, SandboxSession, SystemMetrics } from "@/types";

interface AgentStoreState {
  agents: Agent[];
  selectedAgentId: string | null;
  sandboxes: SandboxSession[];
  metrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
}

interface AgentStoreActions {
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  setSandboxes: (sandboxes: SandboxSession[]) => void;
  updateSandbox: (sessionId: string, updates: Partial<SandboxSession>) => void;
  setMetrics: (metrics: SystemMetrics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type AgentStore = AgentStoreState & AgentStoreActions;

const initialState: AgentStoreState = {
  agents: [],
  selectedAgentId: null,
  sandboxes: [],
  metrics: null,
  loading: false,
  error: null,
};

/**
 * Global store for agent and sandbox state management
 * Uses Zustand for efficient state updates and subscriptions
 */
export const useAgentStore = create<AgentStore>((set) => ({
  ...initialState,

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent)),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),

  selectAgent: (id) => set({ selectedAgentId: id }),

  setSandboxes: (sandboxes) => set({ sandboxes }),

  updateSandbox: (sessionId, updates) =>
    set((state) => ({
      sandboxes: state.sandboxes.map((sandbox) =>
        sandbox.sessionId === sessionId ? { ...sandbox, ...updates } : sandbox,
      ),
    })),

  setMetrics: (metrics) => set({ metrics }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

/**
 * Selector hook for selected agent
 */
export const useSelectedAgent = () => {
  const agents = useAgentStore((state) => state.agents);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);

  if (!selectedAgentId) return null;
  return agents.find((agent) => agent.id === selectedAgentId) ?? null;
};

/**
 * Selector hook for agent sandboxes
 */
export const useAgentSandboxes = (agentId: string) => {
  const sandboxes = useAgentStore((state) => state.sandboxes);
  return sandboxes.filter((sandbox) => sandbox.agentId === agentId);
};
