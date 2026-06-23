"use client";

import { useDashboardData } from "@/hooks";
import { MetricsDisplay } from "@/components/MetricsDisplay";
import { AgentList } from "@/components/AgentList";

/**
 * Main dashboard page
 */
export default function DashboardPage() {
  const { agents, metrics, loading, error } = useDashboardData({
    pollInterval: 5000,
    enableRealtime: true,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of agents and sandbox environments
          </p>
        </div>
        <button className="btn btn-primary" aria-label="Create new agent">
          Create Agent
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* System Metrics */}
      <section aria-labelledby="metrics-heading">
        <h3 id="metrics-heading" className="sr-only">
          System Metrics
        </h3>
        <MetricsDisplay metrics={metrics} />
      </section>

      {/* Agents List */}
      <section aria-labelledby="agents-heading">
        <h3 id="agents-heading" className="text-2xl font-bold text-gray-900 mb-6">
          Agents
        </h3>
        {loading && agents.length === 0 ? (
          <div className="card card-body text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading agents...</p>
          </div>
        ) : (
          <AgentList agents={agents} />
        )}
      </section>
    </div>
  );
}
