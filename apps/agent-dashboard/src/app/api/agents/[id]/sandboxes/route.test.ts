import { describe, it, expect } from "vitest";
import { GET } from "./route";

function createMockRequest() {
  return {
    url: "http://localhost:3000/api/agents/test/sandboxes",
    headers: new Headers(),
    nextUrl: { searchParams: new URLSearchParams() },
  } as any;
}

describe("GET /api/agents/[id]/sandboxes", () => {
  it("returns sandboxes for agent-001", async () => {
    const response = await GET(createMockRequest(), {
      params: Promise.resolve({ id: "agent-001" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.sandboxes).toBeInstanceOf(Array);
    expect(body.data.sandboxes).toHaveLength(2);
  });

  it("returns sandbox for agent-003", async () => {
    const response = await GET(createMockRequest(), {
      params: Promise.resolve({ id: "agent-003" }),
    });
    const body = await response.json();

    expect(body.data.sandboxes).toHaveLength(1);
    expect(body.data.sandboxes[0].sessionId).toBe("sandbox-003");
  });

  it("returns empty array for unknown agent", async () => {
    const response = await GET(createMockRequest(), {
      params: Promise.resolve({ id: "agent-unknown" }),
    });
    const body = await response.json();

    expect(body.data.sandboxes).toEqual([]);
  });

  it("returns sandboxes with correct structure", async () => {
    const response = await GET(createMockRequest(), {
      params: Promise.resolve({ id: "agent-001" }),
    });
    const body = await response.json();
    const sandbox = body.data.sandboxes[0];

    expect(sandbox).toHaveProperty("sessionId");
    expect(sandbox).toHaveProperty("agentId");
    expect(sandbox).toHaveProperty("status");
    expect(sandbox).toHaveProperty("resourceUsage");
    expect(sandbox.resourceUsage).toHaveProperty("cpuPercent");
    expect(sandbox.resourceUsage).toHaveProperty("memoryMB");
    expect(sandbox.resourceUsage).toHaveProperty("uptime");
    expect(sandbox).toHaveProperty("lastActivity");
  });

  it("returns running sandboxes with resource data", async () => {
    const response = await GET(createMockRequest(), {
      params: Promise.resolve({ id: "agent-001" }),
    });
    const body = await response.json();

    for (const sb of body.data.sandboxes) {
      expect(sb.status).toBe("running");
      expect(sb.resourceUsage.cpuPercent).toBeGreaterThan(0);
      expect(sb.resourceUsage.memoryMB).toBeGreaterThan(0);
    }
  });
});
