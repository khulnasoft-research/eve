import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SandboxMonitor } from "./SandboxMonitor";
import type { SandboxSession } from "@/types";

vi.mock("@/hooks", () => ({
  useAgentStore: vi.fn((selector) => {
    const state = {};
    return selector(state);
  }),
}));

const mockSandboxes: SandboxSession[] = [
  {
    sessionId: "sb-001",
    agentId: "agent-1",
    status: "running",
    createdAt: new Date("2024-06-01T11:00:00"),
    resourceUsage: { cpuPercent: 45, memoryMB: 256, uptime: 3600 },
    lastActivity: new Date("2024-06-01T11:55:00"),
  },
  {
    sessionId: "sb-002",
    agentId: "agent-2",
    status: "paused",
    createdAt: new Date("2024-06-01T10:00:00"),
    resourceUsage: { cpuPercent: 12, memoryMB: 128, uptime: 7200 },
    lastActivity: new Date("2024-06-01T11:00:00"),
  },
];

describe("SandboxMonitor", () => {
  it("renders empty state when no sandboxes", () => {
    render(<SandboxMonitor sandboxes={[]} />);
    expect(screen.getByText("No active sandboxes")).toBeInTheDocument();
  });

  it("renders sandbox count in header", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("Active Sandboxes (2)")).toBeInTheDocument();
  });

  it("renders session IDs", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("sb-001")).toBeInTheDocument();
    expect(screen.getByText("sb-002")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("paused")).toBeInTheDocument();
  });

  it("renders CPU usage", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("renders memory usage", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("256 MB")).toBeInTheDocument();
    expect(screen.getByText("128 MB")).toBeInTheDocument();
  });

  it("renders uptime", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("1h")).toBeInTheDocument();
    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<SandboxMonitor sandboxes={mockSandboxes} />);
    expect(screen.getByText("Session ID")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
    expect(screen.getByText("Memory Usage")).toBeInTheDocument();
    expect(screen.getByText("Uptime")).toBeInTheDocument();
    expect(screen.getByText("Last Activity")).toBeInTheDocument();
  });
});

describe("formatUptime", () => {
  it("formats seconds", () => {
    const { SandboxMonitor: SM } = { SandboxMonitor };
    // Test through rendered output
    const sandbox: SandboxSession = {
      ...mockSandboxes[0],
      resourceUsage: { cpuPercent: 10, memoryMB: 64, uptime: 30 },
    };
    render(<SM sandboxes={[sandbox]} />);
    expect(screen.getByText("30s")).toBeInTheDocument();
  });

  it("formats minutes", () => {
    const sandbox: SandboxSession = {
      ...mockSandboxes[0],
      resourceUsage: { cpuPercent: 10, memoryMB: 64, uptime: 300 },
    };
    render(<SandboxMonitor sandboxes={[sandbox]} />);
    expect(screen.getByText("5m")).toBeInTheDocument();
  });

  it("formats hours", () => {
    const sandbox: SandboxSession = {
      ...mockSandboxes[0],
      resourceUsage: { cpuPercent: 10, memoryMB: 64, uptime: 7200 },
    };
    render(<SandboxMonitor sandboxes={[sandbox]} />);
    expect(screen.getByText("2h")).toBeInTheDocument();
  });
});
