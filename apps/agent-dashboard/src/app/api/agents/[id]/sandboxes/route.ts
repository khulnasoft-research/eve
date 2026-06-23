import { NextRequest, NextResponse } from "next/server";
import type { SandboxSession, ApiResponse } from "@/types";

/**
 * GET /api/agents/[id]/sandboxes
 * Fetch sandbox sessions for a specific agent
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await context.params;

    // Mock sandbox data for the agent
    const sandboxes: SandboxSession[] =
      agentId === "agent-001"
        ? [
            {
              sessionId: "sandbox-001",
              agentId,
              status: "running",
              createdAt: new Date(Date.now() - 3600000),
              resourceUsage: {
                cpuPercent: 45,
                memoryMB: 256,
                uptime: 3600,
              },
              lastActivity: new Date(Date.now() - 5000),
            },
            {
              sessionId: "sandbox-002",
              agentId,
              status: "running",
              createdAt: new Date(Date.now() - 1800000),
              resourceUsage: {
                cpuPercent: 12,
                memoryMB: 128,
                uptime: 1800,
              },
              lastActivity: new Date(Date.now() - 15000),
            },
          ]
        : agentId === "agent-003"
          ? [
              {
                sessionId: "sandbox-003",
                agentId,
                status: "running",
                createdAt: new Date(Date.now() - 600000),
                resourceUsage: {
                  cpuPercent: 78,
                  memoryMB: 512,
                  uptime: 600,
                },
                lastActivity: new Date(Date.now() - 2000),
              },
            ]
          : [];

    const response: ApiResponse<{ sandboxes: SandboxSession[] }> = {
      data: { sandboxes },
      status: 200,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error fetching sandboxes:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch sandboxes",
        status: 500,
      } as ApiResponse<never>,
      { status: 500 },
    );
  }
}
