import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsDisplay } from "./MetricsDisplay";
import type { SystemMetrics } from "@/types";

const mockMetrics: SystemMetrics = {
  timestamp: new Date("2024-06-01T12:00:00"),
  activeAgents: 2,
  activeSandboxes: 3,
  totalCpuPercent: 135,
  totalMemoryMB: 896,
  errorRate: 0.008,
};

describe("MetricsDisplay", () => {
  it("renders skeleton when metrics is null", () => {
    render(<MetricsDisplay metrics={null} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders active agents count", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders active sandboxes count", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders total CPU percentage", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText("135%")).toBeInTheDocument();
  });

  it("renders total memory", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText("896 MB")).toBeInTheDocument();
  });

  it("renders all metric labels", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText("Active Agents")).toBeInTheDocument();
    expect(screen.getByText("Active Sandboxes")).toBeInTheDocument();
    expect(screen.getByText("Total CPU")).toBeInTheDocument();
    expect(screen.getByText("Total Memory")).toBeInTheDocument();
  });

  it("renders error rate banner when errorRate > 0", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    expect(screen.getByText(/Error Rate:/)).toBeInTheDocument();
    expect(screen.getByText(/0.80%/)).toBeInTheDocument();
  });

  it("does not render error rate banner when errorRate is 0", () => {
    const zeroError: SystemMetrics = { ...mockMetrics, errorRate: 0 };
    render(<MetricsDisplay metrics={zeroError} />);
    expect(screen.queryByText(/Error Rate:/)).not.toBeInTheDocument();
  });

  it("renders last updated timestamp on each metric", () => {
    render(<MetricsDisplay metrics={mockMetrics} />);
    const timestamps = screen.getAllByText(/Updated:/);
    expect(timestamps).toHaveLength(4);
  });
});
