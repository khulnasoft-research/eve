# Eve Framework Development Roadmap

## Overview

This document tracks the ongoing development of the eve framework for durable AI agents. The work is organized into 6 major milestones, each representing a distinct system or integration phase.

---

## Task 1: Package Consolidation & Migration ✅ COMPLETE

**Status:** Completed

### Goals

- Consolidate package structure across the monorepo
- Migrate existing packages to aligned dependency versions
- Ensure all packages follow consistent export patterns

### Deliverables

- [x] Unified package management strategy
- [x] Dependency version alignment across `ai-elements`, `sandbox`, `workflow`, and `open-agents`
- [x] Consistent build and export configuration

---

## Task 2: Agent & Sandbox Integration ✅ COMPLETE

**Status:** Completed

### Goals

- Integrate agent lifecycle management with sandbox runtime
- Enable agents to spawn isolated execution environments
- Establish communication protocols between agents and sandboxes

### Completed Components

- [x] Agent-to-Sandbox communication protocol via AgentSandboxRegistry
- [x] Sandbox lifecycle hooks (init, execute, cleanup) via SandboxLifecycleManager
- [x] Error handling and recovery mechanisms with exponential backoff
- [x] Resource management and session state tracking
- [x] Comprehensive test suite (400+ lines, 20+ test cases)

### Files Created/Modified

- `packages/eve/src/execution/agent-sandbox-bridge.ts` - Core integration layer (393 lines)
- `packages/eve/src/public/agent-sandbox/index.ts` - Public API exports
- `packages/eve/src/execution/agent-sandbox-bridge.test.ts` - Integration tests (402 lines)
- `packages/eve/package.json` - Added "./agent-sandbox" export
- `.pnpmfile.mjs` - Fixed missing pnpm config

### Deliverables

- ✅ Agents can spawn sandboxes programmatically via `SandboxLifecycleManager`
- ✅ Sandbox execution is isolated and monitored with session state tracking
- ✅ Error propagation works reliably with automatic retry logic (3 retries, 2x backoff)
- ✅ Public API exported as `eve/agent-sandbox` for agent developers
- ✅ Build verification passed - TypeScript compilation successful

---

## Task 3: Web Application UI Integration ✅ COMPLETE

**Status:** Completed

### Goals

- Build interactive web UI for agent management and monitoring
- Integrate with eve APIs for agent/sandbox data
- Provide real-time agent state visibility

### Completed Components

- [x] Agent dashboard (list, status, metrics display)
- [x] Real-time data fetching with polling and WebSocket
- [x] Sandbox execution monitor with resource visualization
- [x] Agent detail pages with sandbox session tracking
- [x] Responsive UI built with React 19 and Tailwind CSS
- [x] Zustand state management for efficient updates

### Files Created

- `apps/agent-dashboard/` - Full Next.js 16 application
  - Dashboard UI components (7 components)
  - REST API routes (5 endpoints)
  - State management hooks (2 hooks)
  - Type definitions and styling
  - Production build verified

### Deliverables

- ✅ Web UI connects to agents via REST API with real-time updates
- ✅ WebSocket and polling support for real-time agent/sandbox updates
- ✅ Dashboard displays agent list, metrics, and sandbox sessions
- ✅ Agent detail pages with sandbox resource monitoring
- ✅ 2000+ lines of production code, fully typed
- ✅ Next.js build completed successfully

---

## Task 4: Testing & Verification ✅ COMPLETE

**Status:** Completed

### Goals

- Create comprehensive test coverage for all integrations
- Establish E2E testing for agent-sandbox workflows
- Performance and reliability benchmarks

### Completed Components

- [x] 68 unit/integration tests for agent-dashboard (store, components, API routes)
- [x] 12 load/benchmark tests for AgentSandboxRegistry (concurrency, O(1) lookup, cleanup)
- [x] 20 existing unit tests for agent-sandbox-bridge
- [x] E2E fixture (agent-dashboard-workflow) with 7 eval tests
- [x] Code coverage instrumentation (47% overall, >80% for testable modules)
- [x] Fixed executeWithRecovery to properly handle process output
- [x] Fixed code issues: `require("crypto")` → ESM import, `use` → `useParams`, `viewport` deprecation
- [x] Performance baselines for AgentSandboxRegistry (1000 concurrent, O(1) lookup)

### Files Created/Modified

- `apps/agent-dashboard/package.json` - Added test deps (vitest, testing-library, jsdom, coverage)
- `apps/agent-dashboard/vitest.config.ts` - Test configuration (jsdom, setup file, aliases)
- `apps/agent-dashboard/src/internal/testing/setup.ts` - Test setup (jest-dom matchers)
- `apps/agent-dashboard/src/hooks/useAgentStore.test.ts` - 23 store tests (100% coverage)
- `apps/agent-dashboard/src/hooks/useDashboardData.test.ts` - Module export tests
- `apps/agent-dashboard/src/components/AgentList.test.tsx` - 7 component tests
- `apps/agent-dashboard/src/components/MetricsDisplay.test.tsx` - 9 component tests
- `apps/agent-dashboard/src/components/SandboxMonitor.test.tsx` - 11 component tests
- `apps/agent-dashboard/src/app/api/agents/route.test.ts` - 8 API route tests
- `apps/agent-dashboard/src/app/api/agents/[id]/sandboxes/route.test.ts` - 5 API route tests
- `apps/agent-dashboard/src/app/api/metrics/route.test.ts` - 3 API route tests
- `apps/agent-dashboard/src/app/agents/[id]/page.tsx` - Fixed `use` → `useParams` rename
- `apps/agent-dashboard/src/app/api/ws/route.ts` - Fixed `require("crypto")` → ESM import
- `apps/agent-dashboard/src/app/layout.tsx` - Fixed `viewport` metadata deprecation
- `packages/eve/src/execution/agent-sandbox-bridge.ts` - Fixed `executeWithRecovery` output handling
- `packages/eve/src/execution/agent-sandbox-bridge.bench.test.ts` - 12 bench tests
- `e2e/fixtures/agent-dashboard-workflow/` - Full E2E fixture with 7 eval tests

---

## Task 5: Documentation & Release ✅ COMPLETE

**Status:** Completed

### Goals

- Update public documentation with new features
- Prepare release notes and migration guides
- Set up CI/CD for automated releases

### Completed Components

- [x] CI/CD pipeline (GitHub Actions: CI + Release via Changesets)
- [x] Migration guide (`docs/guides/migration.md`)
- [x] Tutorial: "Building agents with sandboxes" (`docs/tutorial/building-agents-with-sandboxes.mdx`)
- [x] Updated CHANGELOG.md with v1.0.0 release notes
- [x] Navigation updates (meta.json files)
- [x] Created TASK_5_COMPLETION.md

### Files Created

- `.github/workflows/ci.yml` - 7-job CI pipeline (lint, typecheck, tests, deps, invariants, docs)
- `.github/workflows/release.yml` - Changesets-based automated release workflow
- `docs/guides/migration.md` - Migration guide covering sandbox bridge, stream API, testing infra, dashboard upgrades
- `docs/tutorial/building-agents-with-sandboxes.mdx` - 7-step tutorial
- `TASK_5_COMPLETION.md` - Completion summary

### Files Modified

- `packages/eve/CHANGELOG.md` - Added v1.0.0 release notes
- `docs/meta.json` - Added migration to guides nav
- `docs/guides/meta.json` - Added migration page
- `docs/tutorial/meta.json` - Added sandbox tutorial page
- `TODO.md` - Marked Task 5 complete

### Definition of Done

- ✅ Docs reflect all new features (migration guide + tutorial)
- ✅ Release process is automated (Changesets + GitHub Actions)
- ✅ Community has clear upgrade path (migration guide)

---

## Task 6: Community & Adoption

**Status:** Planned

### Goals

- Support early adopters
- Gather feedback for stabilization
- Build example projects and case studies

### Scope

- [ ] Community feedback collection
- [ ] Example agent projects
- [ ] Performance optimization based on feedback
- [ ] Stability improvements

### Definition of Done

- Framework stabilized based on feedback
- Example projects demonstrating key features
- Ready for general availability

---

## Quick Reference

| Task                           | Status      | Progress | ETA  |
| ------------------------------ | ----------- | -------- | ---- |
| 1. Package Consolidation       | ✅ Complete | 100%     | Done |
| 2. Agent & Sandbox Integration | ✅ Complete | 100%     | Done |
| 3. Web Application UI          | ✅ Complete | 100%     | Done |
| 4. Testing & Verification      | ✅ Complete | 100%     | Done |
| 5. Documentation & Release     | ✅ Complete | 100%     | Done |
| 6. Community & Adoption        | 📋 Planned  | 0%       | TBD  |

## Notes

- All tasks build incrementally; each depends on the previous milestone
- Regular sync points are recommended between tasks
- Community feedback should inform prioritization of remaining work
