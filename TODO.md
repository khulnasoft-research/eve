# Monorepo Migration — Task List

**Legend:** `[ ]` pending · `[~]` in progress · `[x]` completed · `[-]` blocked

---

## Phase 1 — Toolchain Unification

### 1.1 Pin pnpm versions

- [ ] Update `sandbox/package.json` → `"packageManager": "pnpm@11.7.0"`
- [ ] Update `open-agents/package.json` → `"packageManager": "pnpm@11.7.0"`
- [ ] Update `ai-elements/package.json` → `"packageManager": "pnpm@11.7.0"`
- [ ] Update `workflow/package.json` → `"packageManager": "pnpm@11.7.0"`

### 1.2 Convert sandbox/ Prettier → oxfmt + oxlint

- [ ] Remove `npx husky` / `lint-staged` / Prettier config from `sandbox/`
- [ ] Add `.oxfmtrc.json` to `sandbox/`
- [ ] Add `.oxlintrc.json` to `sandbox/`
- [ ] Add `lint` and `fmt` scripts to `sandbox/package.json`
- [ ] Add `simple-git-hooks` config to `sandbox/` (match root)

### 1.3 Convert workflow/ Biome → oxfmt + oxlint

- [ ] Remove `workflow/biome.json`
- [ ] Remove `@biomejs/biome` from workflow catalog/deps
- [ ] Add `.oxfmtrc.json` to `workflow/`
- [ ] Add `.oxlintrc.json` to `workflow/`
- [ ] Update `workflow/package.json` `lint`/`format`/`check` scripts
- [ ] Update `workflow/` husky/lint-staged to use oxfmt
- [ ] Update `.editorconfig` if needed to match root conventions

### 1.4 Unify TypeScript configs

- [ ] Audit all tsconfigs in `sandbox/` — update to ES2024/NodeNext
- [ ] Audit all tsconfigs in `open-agents/` — update to ES2024/NodeNext
- [ ] Audit all tsconfigs in `ai-elements/` — update to ES2024/NodeNext
- [ ] Audit all tsconfigs in `workflow/` — update to ES2024/NodeNext

### 1.5 Enable strict TS flags everywhere

- [ ] Add `verbatimModuleSyntax: true` to all sub-workspace tsconfigs
- [ ] Add `erasableSyntaxOnly: true` to all sub-workspace tsconfigs
- [ ] Add `noUncheckedIndexedAccess: true` to all sub-workspace tsconfigs
- [ ] Add `noUncheckedSideEffectImports: true` to all sub-workspace tsconfigs

### 1.6 Add lint/fmt turbo tasks

- [ ] Add `lint` and `fmt` tasks to each sub-workspace `turbo.json`
- [ ] Run `pnpm lint` repo-wide and fix violations
- [ ] Run `pnpm fmt` repo-wide
- [ ] Run `pnpm typecheck` repo-wide and fix errors

---

## Phase 2 — Catalog & Dependency Unification

### 2.1 Merge sandbox catalog

- [ ] Identify sandbox-only catalog entries (`tsdown`, `vitest@3.2.1`)
- [ ] Merge into root `pnpm-workspace.yaml` catalog
- [ ] Resolve `vitest@3.2.1` vs root `vitest@4.1.7`

### 2.2 Merge open-agents catalog

- [ ] Identify open-agents-only catalog entries
- [ ] Merge into root catalog
- [ ] Resolve `ai@^6.0.165` vs `ai@7.0.0-beta.178`
- [ ] Resolve `@ai-sdk/*` version differences

### 2.3 Merge ai-elements catalog

- [ ] Identify ai-elements-only catalog entries
- [ ] Merge into root catalog

### 2.4 Merge workflow catalog (largest)

- [ ] Identify all 17 workflow catalog entries
- [ ] Merge into root catalog
- [ ] Resolve `typescript: ^5.9.3` vs `typescript: 7.0.1-rc`
- [ ] Resolve `vitest: ^4.0.18` vs root `vitest: 4.1.7`
- [ ] Handle `zod: 4.3.6` vs root `zod: 4.4.3`
- [ ] Handle `@types/node: 22.19.0` vs root `@types/node: 25.9.1`

### 2.5 Resolve all version conflicts

- [ ] Audit every package's actual dependency requirements
- [ ] Pin compatible versions in root catalog
- [ ] Use `overrides`/`pnpm.overrides` for blocking conflicts
- [ ] Run `pnpm install` and verify no peer dep warnings

### 2.6 Remove duplicate catalog sections

- [ ] Remove `catalog:` from `sandbox/pnpm-workspace.yaml`
- [ ] Remove `catalog:` from `open-agents/pnpm-workspace.yaml`
- [ ] Remove `catalog:` from `ai-elements/pnpm-workspace.yaml`
- [ ] Remove `catalog:` from `workflow/pnpm-workspace.yaml`

### 2.7 Update syncpack

- [ ] Audit `.syncpackrc.json` workspace pattern coverage
- [ ] Add any missing sub-workspace patterns
- [ ] Run `pnpm check:deps` and fix mismatches
- [ ] Run `pnpm fix:deps`

---

## Phase 3 — Workspace Registration

### 3.1 Add sub-workspace patterns to root pnpm-workspace.yaml

- [ ] Add `sandbox/packages/*`
- [ ] Add `sandbox/examples/*`
- [ ] Add `open-agents/packages/*`
- [ ] Add `open-agents/apps/*`
- [ ] Add `ai-elements/packages/*`
- [ ] Add `ai-elements/apps/*`
- [ ] Add `workflow/packages/*`
- [ ] Add `workflow/workbench/*`
- [ ] Add `workflow/docs`
- [ ] Add `workflow/tarballs`

### 3.2 Remove sub-workspace configs

- [ ] Delete `sandbox/pnpm-workspace.yaml`
- [ ] Delete `open-agents/pnpm-workspace.yaml`
- [ ] Delete `ai-elements/pnpm-workspace.yaml`
- [ ] Delete `workflow/pnpm-workspace.yaml`
- [ ] Delete `sandbox/turbo.json`
- [ ] Delete `open-agents/turbo.json`
- [ ] Delete `ai-elements/turbo.json`
- [ ] Delete `workflow/turbo.json`

### 3.3 Verify single lockfile

- [ ] Run `pnpm install`
- [ ] Verify all packages resolve correctly
- [ ] Fix any package resolution errors
- [ ] Verify `pnpm-lock.yaml` is at root only

---

## Phase 4 — Cross-Dependency Linking

### 4.1 sandbox → workflow

- [ ] Find all `sandbox/` packages referencing `workflow`
- [ ] Change `"workflow": "4.2.0-beta.73"` → `"workflow": "workspace:*"`
- [ ] Update import paths if needed

### 4.2 open-agents → @vercel/sandbox

- [ ] Change `"@vercel/sandbox": "2.0.0-beta.11"` → `"@vercel/sandbox": "workspace:*"`

### 4.3 open-agents → workflow

- [ ] Change `"workflow": "5.0.0-beta.5"` → `"workflow": "workspace:*"`
- [ ] Change `"@workflow/ai": "5.0.0-beta.4"` → `"@workflow/ai": "workspace:*"`

### 4.4 sandbox internal deps

- [ ] Verify `@vercel/sandbox` in sandbox uses `workspace:*`
- [ ] Audit all other inter-sub-workspace deps

### 4.5 workflow internal deps audit

- [ ] Verify all `@workflow/*` packages reference each other via `workspace:*`
- [ ] Check `workflow/` workbench apps reference published packages correctly
- [ ] Run `pnpm install` and verify resolution

---

## Phase 5 — Root turbo.json Unification

### 5.1 Collect env vars

- [ ] Gather all env vars from sub-workspace `turbo.json` `globalEnv` and task `env` arrays
- [ ] Add them to root `turbo.json` `globalEnv` or task env vars
- [ ] Ensure `envMode: "strict"` is satisfied

### 5.2 Add build dependency chains

- [ ] Map inter-package build order
- [ ] Add `dependsOn` entries for cross-workspace builds
- [ ] Test `pnpm build` repo-wide

### 5.3 Add test tasks

- [ ] Ensure `test`, `test:unit`, `test:integration` tasks cover all packages
- [ ] Add any sub-workspace-specific test tasks

### 5.4 Verify strict mode

- [ ] Run full `pnpm build && pnpm test && pnpm typecheck`
- [ ] Fix any turbo env var issues

---

## Phase 6 — Merge Changesets

### 6.1 Merge changeset configs

- [ ] Copy published package entries from `sandbox/.changeset/config.json`
- [ ] Copy from `ai-elements/.changeset/config.json`
- [ ] Copy from `workflow/.changeset/config.json`
- [ ] Merge into root `.changeset/config.json`

### 6.2 Remove duplicate configs

- [ ] Delete `sandbox/.changeset/`
- [ ] Delete `ai-elements/.changeset/`
- [ ] Delete `workflow/.changeset/`

### 6.3 Update scripts

- [ ] Remove `changeset`/`version-packages`/`release` from sub-workspace `package.json`
- [ ] Update root scripts to cover all published packages
- [ ] Verify `pnpm changeset` works

---

## Phase 7 — CI Unification

### 7.1 Update root test scripts

- [ ] Ensure `pnpm test` runs all tiers
- [ ] Update turbo test pipeline configs

### 7.2 Update GitHub Actions

- [ ] Review `.github/workflows/` for sub-workspace-specific jobs
- [ ] Consolidate into unified workflows
- [ ] Remove redundant CI steps

### 7.3 Update invariants guard

- [ ] Add any sub-workspace-specific invariants to `scripts/`
- [ ] Run `pnpm guard:invariants`

---

## Phase 8 — Code Relocation (optional)

- [ ] 8.1 Move `sandbox/packages/*` into `packages/`
- [ ] 8.2 Move `workflow/packages/*` into `packages/`
- [ ] 8.3 Move `ai-elements/packages/*` into `packages/`
- [ ] 8.4 Move `open-agents/packages/*` into `packages/`
- [ ] 8.5 Update all import paths and tsconfig references
- [ ] 8.6 Clean up empty sub-workspace directories

---

## Verification Gates

Each phase must pass before starting the next:

| Gate             | Check                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Phase 1 done** | `pnpm lint`, `pnpm fmt`, `pnpm typecheck` all pass on entire repo                       |
| **Phase 2 done** | `pnpm check:deps` passes; `pnpm install` clean                                          |
| **Phase 3 done** | All packages visible via `pnpm ls --depth -1`; `pnpm install` single lockfile           |
| **Phase 4 done** | `workspace:*` protocol used for all inter-package deps; `pnpm install` resolves cleanly |
| **Phase 5 done** | `pnpm build` repo-wide succeeds                                                         |
| **Phase 6 done** | `pnpm changeset status` shows all publishing packages                                   |
| **Phase 7 done** | CI passes on a PR branch                                                                |
| **Phase 8 done** | Directory tree is flat and consistent; all tests pass                                   |

---

**Total checklist items:** ~120 tasks across 8 phases.
