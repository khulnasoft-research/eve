# Eve Agent Dashboard

A real-time web application for monitoring and managing AI agents and sandbox environments in the Eve framework.

## Features

- **Agent Management**: View all agents with status, execution history, and error tracking
- **Sandbox Monitoring**: Real-time monitoring of active sandbox sessions with resource usage
- **System Metrics**: Dashboard-wide metrics including active agents, sandboxes, CPU, and memory
- **Real-time Updates**: WebSocket support for live data updates
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# From the workspace root
cd apps/agent-dashboard
```

### Development

```bash
# Start the development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── agents/       # Agent management endpoints
│   │   ├── metrics/      # System metrics endpoint
│   │   └── ws/           # WebSocket handler
│   ├── agents/           # Agent detail pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard home
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── AgentList.tsx
│   ├── MetricsDisplay.tsx
│   └── SandboxMonitor.tsx
├── hooks/               # Custom React hooks
│   ├── useAgentStore.ts # Zustand state management
│   └── useDashboardData.ts # Data fetching with polling
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

## API Endpoints

### GET /api/agents

Fetch all agents with their current status.

**Response:**

```json
{
  "data": {
    "agents": [
      {
        "id": "agent-001",
        "name": "Document Analyzer",
        "status": "active",
        "activeSandboxes": 2,
        "totalExecutions": 145,
        "errorCount": 3,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastHeartbeat": "2024-01-01T12:00:00Z"
      }
    ]
  },
  "status": 200
}
```

### GET /api/agents/[id]/sandboxes

Fetch sandbox sessions for a specific agent.

**Response:**

```json
{
  "data": {
    "sandboxes": [
      {
        "sessionId": "sandbox-001",
        "agentId": "agent-001",
        "status": "running",
        "resourceUsage": {
          "cpuPercent": 45,
          "memoryMB": 256,
          "uptime": 3600
        },
        "createdAt": "2024-01-01T11:00:00Z",
        "lastActivity": "2024-01-01T12:00:00Z"
      }
    ]
  },
  "status": 200
}
```

### GET /api/metrics

Fetch current system metrics.

**Response:**

```json
{
  "data": {
    "metrics": {
      "timestamp": "2024-01-01T12:00:00Z",
      "activeAgents": 2,
      "activeSandboxes": 3,
      "totalCpuPercent": 135,
      "totalMemoryMB": 896,
      "errorRate": 0.008
    }
  },
  "status": 200
}
```

### WS /api/ws

WebSocket endpoint for real-time updates.

**Message Types:**

- `agent:update` - Agent status updated
- `sandbox:update` - Sandbox status updated
- `metrics:update` - System metrics updated

## Technologies

- **Next.js 16** - React framework with server components
- **React 19** - UI library
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Axios** - HTTP client

## State Management

The app uses Zustand for centralized state management with the following stores:

- `useAgentStore` - Manages agents, sandboxes, metrics, and UI state
- `useSelectedAgent` - Selector hook for currently selected agent
- `useAgentSandboxes` - Selector hook for agent's sandboxes

## Data Fetching

The `useDashboardData` hook provides:

- Polling-based data fetching with configurable intervals
- Automatic WebSocket connection management
- Error handling and retry logic
- Real-time updates via WebSocket

```typescript
const { agents, sandboxes, metrics, loading, error } = useDashboardData({
  pollInterval: 5000,
  enableRealtime: true,
});
```

## Development Guidelines

- Use TypeScript for all new code
- Follow component composition patterns (split large components)
- Implement proper error handling and loading states
- Use semantic HTML and ARIA attributes
- Keep components pure and side-effect free
- Use hooks for state and lifecycle management

## Performance Considerations

- Images are lazy-loaded
- API responses are cached using Zustand
- WebSocket reduces polling overhead
- CSS is scoped and optimized
- Code splitting is handled automatically by Next.js

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `pnpm dev`
4. Submit a pull request

## License

MIT
