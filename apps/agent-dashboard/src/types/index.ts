/**
 * Frontend types for Agent Dashboard
 * Mirrors and extends backend types from eve package
 */

export type AgentStatus = "active" | "idle" | "error" | "terminated";

export type SandboxStatus = "running" | "paused" | "stopped" | "error";

/**
 * Agent information displayed in the dashboard
 */
export type Agent = {
  readonly id: string;
  readonly name: string;
  readonly status: AgentStatus;
  readonly description?: string;
  readonly createdAt: Date;
  readonly lastHeartbeat: Date;
  readonly activeSandboxes: number;
  readonly totalExecutions: number;
  readonly errorCount: number;
};

/**
 * Sandbox session info for real-time monitoring
 */
export type SandboxSession = {
  readonly sessionId: string;
  readonly agentId: string;
  readonly status: SandboxStatus;
  readonly createdAt: Date;
  readonly resourceUsage: {
    readonly cpuPercent: number;
    readonly memoryMB: number;
    readonly uptime: number;
  };
  readonly lastActivity: Date;
};

/**
 * Real-time metrics for agents and sandboxes
 */
export type SystemMetrics = {
  readonly timestamp: Date;
  readonly activeAgents: number;
  readonly activeSandboxes: number;
  readonly totalCpuPercent: number;
  readonly totalMemoryMB: number;
  readonly errorRate: number;
};

/**
 * Agent execution history entry
 */
export type ExecutionLog = {
  readonly id: string;
  readonly agentId: string;
  readonly sandboxId?: string;
  readonly command: string;
  readonly status: "success" | "failed" | "timeout";
  readonly duration: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timestamp: Date;
};

/**
 * API response wrapper
 */
export type ApiResponse<T> = {
  readonly data?: T;
  readonly error?: string;
  readonly status: number;
};
