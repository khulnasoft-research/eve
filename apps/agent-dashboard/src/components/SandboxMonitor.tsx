"use client";

import type { SandboxSession } from "@/types";

/**
 * Component for monitoring individual sandbox sessions
 */
export function SandboxMonitor({ sandboxes }: { sandboxes: SandboxSession[] }) {
  const getStatusColor = (status: SandboxSession["status"]) => {
    switch (status) {
      case "running":
        return "badge-success";
      case "paused":
        return "badge-warning";
      case "stopped":
        return "badge-info";
      case "error":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  if (sandboxes.length === 0) {
    return (
      <div className="card card-body text-center text-gray-500">
        <p>No active sandboxes</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">
          Active Sandboxes ({sandboxes.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="table-responsive">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Status</th>
              <th>CPU Usage</th>
              <th>Memory Usage</th>
              <th>Uptime</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {sandboxes.map((sandbox) => (
              <tr key={sandbox.sessionId}>
                <td>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{sandbox.sessionId}</code>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(sandbox.status)}`}>
                    {sandbox.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(sandbox.resourceUsage.cpuPercent, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{sandbox.resourceUsage.cpuPercent}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{sandbox.resourceUsage.memoryMB} MB</span>
                  </div>
                </td>
                <td>
                  <span className="text-sm">{formatUptime(sandbox.resourceUsage.uptime)}</span>
                </td>
                <td>
                  <span className="text-sm text-gray-600">
                    {formatTimeAgo(sandbox.lastActivity)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

/**
 * Format time as "X ago"
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffS = Math.floor(diffMs / 1000);

  if (diffS < 60) return "Just now";
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`;
  return `${Math.floor(diffS / 86400)}d ago`;
}
