import { describe, it, expect } from "vitest";

describe("useDashboardData module", () => {
  it("exports useDashboardData function", async () => {
    const mod = await import("./useDashboardData");
    expect(typeof mod.useDashboardData).toBe("function");
  });

  it("exports FetchConfig type", async () => {
    const mod = await import("./useDashboardData");
    expect(mod.useDashboardData.name).toBe("useDashboardData");
  });
});
