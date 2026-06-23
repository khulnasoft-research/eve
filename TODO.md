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

## Task 2: Agent & Sandbox Integration 🔄 IN PROGRESS

**Status:** Starting

### Goals

- Integrate agent lifecycle management with sandbox runtime
- Enable agents to spawn isolated execution environments
- Establish communication protocols between agents and sandboxes

### Key Components

- [ ] Agent-to-Sandbox communication protocol
- [ ] Sandbox lifecycle hooks (init, execute, cleanup)
- [ ] Error handling and recovery mechanisms
- [ ] Resource management and isolation

### Files to Modify/Create

- `sandbox/src/runtime.ts` - Core sandbox runtime
- `packages/eve/src/agent-sandbox-bridge.ts` - New integration layer
- `sandbox/src/executor.ts` - Execution engine updates

### Definition of Done

- Agents can spawn sandboxes programmatically
- Sandbox execution is isolated and monitored
- Error propagation works reliably

---

## Task 3: Web Application UI Integration

**Status:** Planned

### Goals

- Build interactive web UI for agent management and monitoring
- Integrate with `ai-elements` for chat and UI components
- Provide real-time agent state visibility

### Key Components

- [ ] Agent dashboard (list, status, logs)
- [ ] Real-time agent communication interface
- [ ] Sandbox execution monitor
- [ ] Tool execution history and replay

### Files to Create/Modify

- `apps/web/` - Main web application
- Integration with `ai-elements` components

### Definition of Done

- Web UI can connect to running agents
- Real-time updates work via WebSocket/SSE
- Dashboard displays agent and sandbox metrics

---

## Task 4: Testing & Verification

**Status:** Planned

### Goals

- Create comprehensive test coverage for all integrations
- Establish E2E testing for agent-sandbox workflows
- Performance and reliability benchmarks

### Scope

- [ ] Unit tests for agent-sandbox bridge
- [ ] E2E tests for complete workflows
- [ ] Load testing for concurrent sandbox execution
- [ ] Error scenario validation

### Files to Create

- Test files in `e2e/` directory
- Test utilities and fixtures

### Definition of Done

- > 80% code coverage for new/modified code
- All critical paths have E2E tests
- Performance baselines established

---

## Task 5: Documentation & Release

**Status:** Planned

### Goals

- Update public documentation with new features
- Prepare release notes and migration guides
- Set up CI/CD for automated releases

### Scope

- [ ] API documentation updates
- [ ] Tutorial: "Building agents with sandboxes"
- [ ] Migration guide for existing projects
- [ ] Release notes for v1.0
- [ ] CI/CD pipeline configuration

### Files to Modify/Create

- `docs/` - Documentation site updates
- `CHANGELOG.md` - Release notes
- CI/CD configuration files

### Definition of Done

- Docs reflect all new features
- Release process is automated
- Community has clear upgrade path

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

| Task                           | Status         | Owner | ETA |
| ------------------------------ | -------------- | ----- | --- |
| 1. Package Consolidation       | ✅ Complete    | -     | -   |
| 2. Agent & Sandbox Integration | 🔄 In Progress | -     | -   |
| 3. Web Application UI          | 📋 Planned     | -     | -   |
| 4. Testing & Verification      | 📋 Planned     | -     | -   |
| 5. Documentation & Release     | 📋 Planned     | -     | -   |
| 6. Community & Adoption        | 📋 Planned     | -     | -   |

## Notes

- All tasks build incrementally; each depends on the previous milestone
- Regular sync points are recommended between tasks
- Community feedback should inform prioritization of remaining work
