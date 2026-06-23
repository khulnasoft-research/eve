"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useAgentStore } from "@/hooks";
import type { Agent } from "@/types";

/**
 * Component displaying list of all agents
 */
export function AgentList({ agents }: { agents: Agent[] }) {
  const selectAgent = useAgentStore((state) => state.selectAgent);

  const handleSelectAgent = useCallback(
    (agentId: string) => {
      selectAgent(agentId);
    },
    [selectAgent],
  );

  if (agents.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">No agents found. Create one to get started.</p>
      </div>
    );
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "idle":
        return "badge-info";
      case "error":
        return "badge-danger";
      case "terminated":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <div key={agent.id} className="card">
          <div className="card-body">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <span className={`badge ${getStatusColor(agent.status)}`}>{agent.status}</span>
            </div>

            {agent.description && <p className="text-sm text-gray-600 mb-4">{agent.description}</p>}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Sandboxes</p>
                <p className="text-2xl font-bold text-gray-900">{agent.activeSandboxes}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Executions</p>
                <p className="text-2xl font-bold text-gray-900">{agent.totalExecutions}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Errors</p>
                <p className="text-2xl font-bold text-red-600">{agent.errorCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Last Seen</p>
                <p className="text-sm text-gray-900">{agent.lastHeartbeat.toLocaleTimeString()}</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectAgent(agent.id)}
              className="btn btn-primary w-full"
              aria-label={`View details for ${agent.name}`}
            >
              <Link href={`/agents/${agent.id}`} className="block">
                View Details
              </Link>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
