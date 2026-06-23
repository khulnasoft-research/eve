import { describe, it, expect } from "vitest";
import { GET } from "./route";

function createMockRequest() {
  return {
    url: "http://localhost:3000/api/metrics",
    headers: new Headers(),
    nextUrl: { searchParams: new URLSearchParams() },
  } as any;
}

describe("GET /api/metrics", () => {
  it("returns 200 with metrics data", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.metrics).toBeDefined();
  });

  it("returns correct metrics structure", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();
    const metrics = body.data.metrics;

    expect(metrics).toHaveProperty("activeAgents");
    expect(metrics).toHaveProperty("activeSandboxes");
    expect(metrics).toHaveProperty("totalCpuPercent");
    expect(metrics).toHaveProperty("totalMemoryMB");
    expect(metrics).toHaveProperty("errorRate");
    expect(metrics).toHaveProperty("timestamp");
  });

  it("returns consistent mock values", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();
    const metrics = body.data.metrics;

    expect(metrics.activeAgents).toBe(2);
    expect(metrics.activeSandboxes).toBe(3);
    expect(metrics.totalCpuPercent).toBe(135);
    expect(metrics.totalMemoryMB).toBe(896);
    expect(metrics.errorRate).toBe(0.008);
  });
});
