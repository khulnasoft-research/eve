"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAgentStore, useSelectedAgent, useAgentSandboxes, useDashboardData } from "@/hooks";
import { SandboxMonitor } from "@/components/SandboxMonitor";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const resolvedParams = useParams(params);
  const { selectAgent, error: storeError } = useAgentStore((state) => ({
    selectAgent: state.selectAgent,
    error: state.error,
  }));

  const { fetchSandboxes } = useDashboardData();
  const agent = useSelectedAgent();
  const sandboxes = useAgentSandboxes(resolvedParams.id);

  useEffect(() => {
    selectAgent(resolvedParams.id);
    void fetchSandboxes(resolvedParams.id);
  }, [resolvedParams.id, selectAgent, fetchSandboxes]);

  if (!agent) {
    return (
      <div className="space-y-6">
        <Link href="/" className="btn btn-secondary inline-block">
          ← Back to Dashboard
        </Link>
        <div className="card card-body text-center">
          <p className="text-gray-600">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link href="/" className="btn btn-secondary inline-block">
        ← Back to Dashboard
      </Link>

      {/* Agent Header */}
      <div className="card">
        <div className="card-header flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
            {agent.description && <p className="text-gray-600 mt-2">{agent.description}</p>}
          </div>
          <span
            className={`badge ${
              agent.status === "active"
                ? "badge-success"
                : agent.status === "error"
                  ? "badge-danger"
                  : "badge-info"
            }`}
          >
            {agent.status}
          </span>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="metric-label">ID</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1">{agent.id}</code>
            </div>
            <div>
              <p className="metric-label">Active Sandboxes</p>
              <p className="metric-value text-blue-600">{agent.activeSandboxes}</p>
            </div>
            <div>
              <p className="metric-label">Total Executions</p>
              <p className="metric-value text-green-600">{agent.totalExecutions}</p>
            </div>
            <div>
              <p className="metric-label">Errors</p>
              <p className="metric-value text-red-600">{agent.errorCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="metric-label">Created</p>
              <p className="text-sm text-gray-900 mt-1">{agent.createdAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="metric-label">Last Heartbeat</p>
              <p className="text-sm text-gray-900 mt-1">{agent.lastHeartbeat.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {storeError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {storeError}</p>
        </div>
      )}

      {/* Sandboxes */}
      <section aria-labelledby="sandboxes-heading">
        <h2 id="sandboxes-heading" className="text-2xl font-bold text-gray-900 mb-4">
          Sandbox Sessions
        </h2>
        <SandboxMonitor sandboxes={sandboxes} />
      </section>
    </div>
  );
}

function useParams<T>(promise: Promise<T>): T {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    promise
      .then((result) => {
        if (isMounted) setValue(result);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      });

    return () => {
      isMounted = false;
    };
  }, [promise]);

  if (error) throw error;
  if (value === null) {
    throw promise;
  }

  return value;
}
