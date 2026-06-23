import { NextRequest, NextResponse } from "next/server";
import type { Agent, ApiResponse } from "@/types";

/**
 * GET /api/agents
 * Fetch list of all agents with their current status
 */
export async function GET(_request: NextRequest) {
  try {
    // In a real implementation, this would query the eve runtime
    // For now, return mock data that demonstrates the structure
    const agents: Agent[] = [
      {
        id: "agent-001",
        name: "Document Analyzer",
        status: "active",
        description: "Analyzes documents and extracts structured data",
        createdAt: new Date(Date.now() - 86400000),
        lastHeartbeat: new Date(),
        activeSandboxes: 2,
        totalExecutions: 145,
        errorCount: 3,
      },
      {
        id: "agent-002",
        name: "Data Processor",
        status: "idle",
        description: "Processes and transforms data pipelines",
        createdAt: new Date(Date.now() - 172800000),
        lastHeartbeat: new Date(Date.now() - 60000),
        activeSandboxes: 0,
        totalExecutions: 312,
        errorCount: 1,
      },
      {
        id: "agent-003",
        name: "Code Generator",
        status: "active",
        description: "Generates code based on specifications",
        createdAt: new Date(Date.now() - 259200000),
        lastHeartbeat: new Date(Date.now() - 5000),
        activeSandboxes: 1,
        totalExecutions: 89,
        errorCount: 5,
      },
    ];

    const response: ApiResponse<{ agents: Agent[] }> = {
      data: { agents },
      status: 200,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error fetching agents:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch agents",
        status: 500,
      } as ApiResponse<never>,
      { status: 500 },
    );
  }
}

/**
 * POST /api/agents
 * Create or register a new agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name: string; description?: string };

    if (!body.name) {
      return NextResponse.json(
        {
          error: "Agent name is required",
          status: 400,
        } as ApiResponse<never>,
        { status: 400 },
      );
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: body.name,
      status: "idle",
      description: body.description,
      createdAt: new Date(),
      lastHeartbeat: new Date(),
      activeSandboxes: 0,
      totalExecutions: 0,
      errorCount: 0,
    };

    return NextResponse.json(
      {
        data: { agent: newAgent },
        status: 201,
      } as ApiResponse<{ agent: Agent }>,
      { status: 201 },
    );
  } catch (error) {
    console.error("[v0] Error creating agent:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create agent",
        status: 500,
      } as ApiResponse<never>,
      { status: 500 },
    );
  }
}
