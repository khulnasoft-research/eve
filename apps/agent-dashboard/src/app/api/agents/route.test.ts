import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "./route";

function createMockRequest(options: { method?: string; body?: unknown; url?: string } = {}) {
  const url = options.url ?? "http://localhost:3000/api/agents";
  return {
    url,
    json: () => Promise.resolve(options.body),
    headers: new Headers(),
    method: options.method ?? "GET",
    nextUrl: { searchParams: new URLSearchParams() },
  } as any;
}

describe("GET /api/agents", () => {
  it("returns 200 with agents array", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(200);
    expect(body.data.agents).toBeInstanceOf(Array);
    expect(body.data.agents.length).toBeGreaterThan(0);
  });

  it("returns agents with correct structure", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();
    const agent = body.data.agents[0];

    expect(agent).toHaveProperty("id");
    expect(agent).toHaveProperty("name");
    expect(agent).toHaveProperty("status");
    expect(agent).toHaveProperty("activeSandboxes");
    expect(agent).toHaveProperty("totalExecutions");
    expect(agent).toHaveProperty("errorCount");
    expect(agent).toHaveProperty("createdAt");
    expect(agent).toHaveProperty("lastHeartbeat");
  });

  it("returns agents with valid statuses", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();
    const statuses = body.data.agents.map((a: any) => a.status);
    expect(statuses).toEqual(expect.arrayContaining(["active", "idle"]));
  });

  it("returns 3 mock agents", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();
    expect(body.data.agents).toHaveLength(3);
  });
});

describe("POST /api/agents", () => {
  it("creates agent and returns 201", async () => {
    const response = await POST(
      createMockRequest({ body: { name: "New Agent", description: "Test" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.agent.name).toBe("New Agent");
    expect(body.data.agent.description).toBe("Test");
    expect(body.data.agent.status).toBe("idle");
    expect(body.data.agent.activeSandboxes).toBe(0);
    expect(body.data.agent.totalExecutions).toBe(0);
    expect(body.data.agent.errorCount).toBe(0);
  });

  it("returns 400 when name is missing", async () => {
    const response = await POST(createMockRequest({ body: { description: "No name" } }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Agent name is required");
  });

  it("generates unique agent id", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const r1 = await POST(createMockRequest({ body: { name: "Agent 1" } }));
    vi.advanceTimersByTime(1);
    const r2 = await POST(createMockRequest({ body: { name: "Agent 2" } }));
    const b1 = await r1.json();
    const b2 = await r2.json();
    vi.useRealTimers();

    expect(b1.data.agent.id).not.toBe(b2.data.agent.id);
  });

  it("handles empty body as missing name", async () => {
    const response = await POST(createMockRequest({ body: {} }));
    expect(response.status).toBe(400);
  });
});
