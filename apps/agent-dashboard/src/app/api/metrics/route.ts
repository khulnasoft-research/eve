import { NextRequest, NextResponse } from "next/server";
import type { SystemMetrics, ApiResponse } from "@/types";

/**
 * GET /api/metrics
 * Fetch current system metrics for active agents and sandboxes
 */
export async function GET(_request: NextRequest) {
  try {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      activeAgents: 2,
      activeSandboxes: 3,
      totalCpuPercent: 45 + 12 + 78,
      totalMemoryMB: 256 + 128 + 512,
      errorRate: 0.008,
    };

    const response: ApiResponse<{ metrics: SystemMetrics }> = {
      data: { metrics },
      status: 200,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error fetching metrics:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch metrics",
        status: 500,
      } as ApiResponse<never>,
      { status: 500 },
    );
  }
}
