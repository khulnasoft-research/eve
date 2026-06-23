"use client";

import { useEffect, useCallback } from "react";
import { useAgentStore } from "./useAgentStore";
import type { Agent, SandboxSession, SystemMetrics } from "@/types";

/**
 * Configuration for data fetching behavior
 */
export interface FetchConfig {
  readonly pollInterval?: number; // ms between polls
  readonly retryCount?: number;
  readonly retryDelay?: number;
  readonly enableRealtime?: boolean; // Use WebSocket if available
}

/**
 * Custom hook for fetching and managing dashboard data
 * Handles polling, real-time updates, and error recovery
 */
export function useDashboardData(config: FetchConfig = {}) {
  const pollInterval = config.pollInterval ?? 5000;
  const retryCount = config.retryCount ?? 3;
  const retryDelay = config.retryDelay ?? 1000;
  const enableRealtime = config.enableRealtime ?? true;

  const store = useAgentStore();

  /**
   * Fetch agents from API
   */
  const fetchAgents = useCallback(async () => {
    try {
      store.setLoading(true);
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error(`Failed to fetch agents: ${response.status}`);
      const data = (await response.json()) as { agents: Agent[] };
      store.setAgents(data.agents);
      store.setError(null);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "Failed to fetch agents");
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  /**
   * Fetch sandbox sessions for an agent
   */
  const fetchSandboxes = useCallback(
    async (agentId: string) => {
      try {
        const response = await fetch(`/api/agents/${agentId}/sandboxes`);
        if (!response.ok) throw new Error(`Failed to fetch sandboxes: ${response.status}`);
        const data = (await response.json()) as { sandboxes: SandboxSession[] };
        store.setSandboxes(data.sandboxes);
      } catch (error) {
        store.setError(error instanceof Error ? error.message : "Failed to fetch sandboxes");
      }
    },
    [store],
  );

  /**
   * Fetch system metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics");
      if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.status}`);
      const data = (await response.json()) as { metrics: SystemMetrics };
      store.setMetrics(data.metrics);
    } catch (error) {
      console.error("[v0] Failed to fetch metrics:", error);
    }
  }, [store]);

  /**
   * Set up polling for agents and metrics
   */
  useEffect(() => {
    // Initial fetch
    void fetchAgents();
    void fetchMetrics();

    // Set up polling intervals
    const agentsInterval = setInterval(() => {
      void fetchAgents();
    }, pollInterval);

    const metricsInterval = setInterval(() => {
      void fetchMetrics();
    }, pollInterval * 2); // Less frequent metrics polling

    return () => {
      clearInterval(agentsInterval);
      clearInterval(metricsInterval);
    };
  }, [fetchAgents, fetchMetrics, pollInterval]);

  /**
   * Set up WebSocket connection for real-time updates if enabled
   */
  useEffect(() => {
    if (!enableRealtime) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        ws = new WebSocket(`${protocol}://${window.location.host}/api/ws`);

        ws.onopen = () => {
          console.log("[v0] WebSocket connected");
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as {
              type: string;
              data: unknown;
            };

            if (message.type === "agent:update") {
              const agent = message.data as Agent;
              store.updateAgent(agent.id, agent);
            } else if (message.type === "sandbox:update") {
              const sandbox = message.data as SandboxSession;
              store.updateSandbox(sandbox.sessionId, sandbox);
            } else if (message.type === "metrics:update") {
              const metrics = message.data as SystemMetrics;
              store.setMetrics(metrics);
            }
          } catch (error) {
            console.error("[v0] Failed to parse WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("[v0] WebSocket disconnected");
          if (reconnectAttempts < retryCount) {
            reconnectAttempts++;
            const delay = retryDelay * Math.pow(2, reconnectAttempts - 1);
            reconnectTimeout = setTimeout(connect, delay);
          }
        };
      } catch (error) {
        console.error("[v0] Failed to connect WebSocket:", error);
      }
    };

    if (typeof window !== "undefined") {
      connect();
    }

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [enableRealtime, retryCount, retryDelay, store]);

  return {
    agents: store.agents,
    sandboxes: store.sandboxes,
    metrics: store.metrics,
    loading: store.loading,
    error: store.error,
    fetchAgents,
    fetchSandboxes,
    fetchMetrics,
  };
}
