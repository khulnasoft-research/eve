"use client";

import type { SystemMetrics } from "@/types";

/**
 * Component displaying system metrics
 */
export function MetricsDisplay({ metrics }: { metrics: SystemMetrics | null }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card card-body animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics_data = [
    {
      label: "Active Agents",
      value: metrics.activeAgents,
      color: "text-blue-600",
    },
    {
      label: "Active Sandboxes",
      value: metrics.activeSandboxes,
      color: "text-green-600",
    },
    {
      label: "Total CPU",
      value: `${metrics.totalCpuPercent}%`,
      color: "text-orange-600",
    },
    {
      label: "Total Memory",
      value: `${metrics.totalMemoryMB} MB`,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {metrics_data.map((metric) => (
        <div key={metric.label} className="card card-body">
          <p className="metric-label">{metric.label}</p>
          <p className={`metric-value ${metric.color}`}>{metric.value}</p>
          <p className="text-xs text-gray-500 mt-2">
            Updated: {metrics.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}

      {metrics.errorRate > 0 && (
        <div className="md:col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">
            Error Rate: {(metrics.errorRate * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
