# Monorepo Migration Plan

## Goal

Fully unify the 5 independent pnpm workspaces (root, `sandbox/`, `open-agents/`, `ai-elements/`, `workflow/`) into a single root-managed monorepo with consistent tooling, dependencies, and CI.

---

## Phase 1 — Toolchain Unification

**Standardize formatter, linter, and TypeScript across all sub-workspaces.**

| Step | Action                                                                          | Details                                                                                                 |
| ---- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1.1  | Pin all sub-workspaces to pnpm 11.7.0                                           | Update `packageManager` in `sandbox/`, `open-agents/`, `ai-elements/`, `workflow/` `package.json`       |
| 1.2  | Convert `sandbox/` Prettier → oxfmt + oxlint                                    | Remove Prettier config, add `.oxfmtrc.json`/`.oxlintrc.json`, update pre-commit hooks                   |
| 1.3  | Convert `workflow/` Biome → oxfmt + oxlint                                      | Remove `biome.json`, add oxlint/oxfmt configs, update `lint`/`format` scripts, update husky/lint-staged |
| 1.4  | Unify TS target to `ES2024` + `NodeNext`                                        | All sub-workspace tsconfigs must match root                                                             |
| 1.5  | Enable `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess` | Non-negotiable root standards                                                                           |
| 1.6  | Add `lint`/`fmt` turbo tasks to sub-workspaces                                  | Mirror root pattern                                                                                     |

**Verify:** `pnpm lint && pnpm fmt && pnpm typecheck` pass repo-wide.

---

## Phase 2 — Catalog & Dependency Unification

**Single source of truth for dependency versions.**

| Step | Action                                                        | Details                                                                   |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2.1  | Merge `sandbox/` catalog deps into root `pnpm-workspace.yaml` | `vitest`, `tsdown`                                                        |
| 2.2  | Merge `open-agents/` catalog deps into root                   | `ai`, `@ai-sdk/*`, `zod`                                                  |
| 2.3  | Merge `ai-elements/` catalog deps into root                   | Check for conflicts                                                       |
| 2.4  | Merge `workflow/` catalog deps into root                      | 17 entries including `typescript`, `@biomejs/biome` (to remove), `vitest` |
| 2.5  | Resolve version conflicts                                     | Pin to newest compatible version across all consumers                     |
| 2.6  | Remove duplicate `catalog:` sections from sub-workspaces      | Once merged into root                                                     |
| 2.7  | Update `.syncpackrc.json`                                     | Ensure all packages are covered                                           |

**Key conflicts to resolve:**

- `typescript@7.0.1-rc` (root) vs `^5.9.3` (workflow) vs `^5` (open-agents) vs `5.8.3` (sandbox)
- `ai@7.0.0-beta.178` (root) vs `^6.0.165` (open-agents)
- `vitest@4.1.7` (root) vs `3.2.1` (sandbox) vs `^4.0.17` (ai-elements) vs `^4.0.18` (workflow)
- `zod@4.4.3` (root) vs `^4.3.6` (open-agents) vs `4.3.6` (workflow)

---

## Phase 3 — Workspace Registration

**Absorb sub-workspace packages into the root workspace.**

| Step | Action                                                   | Details                                                                   |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| 3.1  | Add sub-workspace patterns to root `pnpm-workspace.yaml` | Add paths for all packages in sandbox, open-agents, ai-elements, workflow |
| 3.2  | Remove sub-workspace `pnpm-workspace.yaml` files         | Prevent nested workspace resolution                                       |
| 3.3  | Remove sub-workspace `turbo.json` files                  | Root turbo orchestrates everything                                        |
| 3.4  | Run `pnpm install`                                       | Single lockfile for all packages                                          |

---

## Phase 4 — Cross-Dependency Linking

**Convert registry references to `workspace:*` protocol.**

| Step | Target                                 | Current                              | New                                |
| ---- | -------------------------------------- | ------------------------------------ | ---------------------------------- |
| 4.1  | `sandbox/` → `workflow`                | `"workflow": "4.2.0-beta.73"`        | `"workflow": "workspace:*"`        |
| 4.2  | `open-agents` → `@vercel/sandbox`      | `"@vercel/sandbox": "2.0.0-beta.11"` | `"@vercel/sandbox": "workspace:*"` |
| 4.3  | `open-agents` → `workflow`             | `"workflow": "5.0.0-beta.5"`         | `"workflow": "workspace:*"`        |
| 4.4  | `sandbox` → `@vercel/sandbox` internal | Already `workspace:*`                | Verify                             |
| 4.5  | `workflow` internal deps               | Mostly `workspace:*`                 | Audit for registry refs            |

---

## Phase 5 — Root turbo.json Unification

**Single task graph for ~70+ packages.**

| Step | Action                                                                             |
| ---- | ---------------------------------------------------------------------------------- |
| 5.1  | Audit all `turbo.json` env vars across sub-workspaces and merge into root          |
| 5.2  | Add build dependency chains for cross-workspace packages                           |
| 5.3  | Ensure `test` tasks cover all test tiers                                           |
| 5.4  | Remove `envMode: "strict"` temporarily if needed during migration, then re-enforce |

---

## Phase 6 — Merge Changesets

**Single changeset pipeline for all published packages.**

| Step | Action                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 6.1  | Merge `sandbox/.changeset/`, `ai-elements/.changeset/`, `workflow/.changeset/` into root `.changeset/` |
| 6.2  | Update root `changeset/config.json` to cover all publishing packages                                   |
| 6.3  | Remove duplicate changeset scripts from sub-workspace `package.json`                                   |

---

## Phase 7 — CI Unification

**Single CI pipeline.**

| Step | Action                                                                 |
| ---- | ---------------------------------------------------------------------- |
| 7.1  | Update `pnpm test` to run tests from all workspaces                    |
| 7.2  | Update GitHub Actions workflows to remove sub-workspace-specific steps |
| 7.3  | Update `guard:invariants` for any sub-workspace invariants             |

---

## Phase 8 — Code Relocation (optional/long-term)

**Move packages into a flat hierarchy.**

| Step | Action                                                                 |
| ---- | ---------------------------------------------------------------------- |
| 8.1  | `sandbox/packages/*` → `packages/sandbox-*`                            |
| 8.2  | `workflow/packages/*` → `packages/workflow-*` or keep as `@workflow/*` |
| 8.3  | `ai-elements/packages/*` → `packages/ai-elements-*`                    |
| 8.4  | `open-agents/packages/*` → `packages/open-agents-*`                    |
| 8.5  | Update imports, tsconfig paths, and workspace references               |

---

## Risk Assessment

| Risk                                               | Impact | Mitigation                                                                          |
| -------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| TypeScript 7.0.1-rc breaking 5.x code              | High   | Phase 1 TS migration first; resolve issues before merging workspaces                |
| Published version skew (e.g., workflow 4.x vs 5.x) | Medium | Use registry pins where workspace link is incompatible; upgrade downstream packages |
| Biome → oxlint rule differences                    | Medium | Address lint violations; may need temporary rule suppressions                       |
| Single lockfile size                               | Low    | pnpm handles large workspaces well                                                  |
| Git history fragmentation                          | Low    | No rebase needed; all files already in one repo                                     |

---

## Execution Order

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
                                    │
                                    ▼
                              Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8 (optional)
```
