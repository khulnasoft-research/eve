import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentList } from "./AgentList";
import type { Agent } from "@/types";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks", () => ({
  useAgentStore: vi.fn((selector) => {
    const state = { selectAgent: vi.fn() };
    return selector(state);
  }),
}));

const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Document Analyzer",
    status: "active",
    description: "Analyzes documents",
    createdAt: new Date("2024-01-01"),
    lastHeartbeat: new Date("2024-06-01T12:00:00"),
    activeSandboxes: 2,
    totalExecutions: 145,
    errorCount: 3,
  },
  {
    id: "agent-2",
    name: "Data Processor",
    status: "idle",
    createdAt: new Date("2024-01-02"),
    lastHeartbeat: new Date("2024-06-01T11:00:00"),
    activeSandboxes: 0,
    totalExecutions: 312,
    errorCount: 1,
  },
];

describe("AgentList", () => {
  it("renders empty state when no agents", () => {
    render(<AgentList agents={[]} />);
    expect(screen.getByText("No agents found. Create one to get started.")).toBeInTheDocument();
  });

  it("renders agent cards", () => {
    render(<AgentList agents={mockAgents} />);
    expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    expect(screen.getByText("Data Processor")).toBeInTheDocument();
  });

  it("renders agent descriptions", () => {
    render(<AgentList agents={mockAgents} />);
    expect(screen.getByText("Analyzes documents")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<AgentList agents={mockAgents} />);
    expect(screen.getAllByText("active")).toHaveLength(1);
    expect(screen.getAllByText("idle")).toHaveLength(1);
  });

  it("renders sandbox and execution counts", () => {
    render(<AgentList agents={mockAgents} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.getByText("312")).toBeInTheDocument();
  });

  it("renders View Details links", () => {
    render(<AgentList agents={mockAgents} />);
    const links = screen.getAllByText("View Details");
    expect(links).toHaveLength(2);
    expect(links[0].closest("a")).toHaveAttribute("href", "/agents/agent-1");
    expect(links[1].closest("a")).toHaveAttribute("href", "/agents/agent-2");
  });

  it("renders error counts", () => {
    render(<AgentList agents={mockAgents} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
