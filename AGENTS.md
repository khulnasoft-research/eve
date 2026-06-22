# AGENTS.md

Guidance for coding agents working in this repo. For setup, PR workflow, and
release, see [CONTRIBUTING.md](./CONTRIBUTING.md). For eve agent development,
see [`SKILL.md`](./SKILL.md).

## Repository layout

- `packages/eve` — the framework and `eve` CLI (published as `eve`)
- `packages/eve-catalog` — internal unpublished library (`@vercel/eve-catalog`)
- `apps/fixtures` — shared agent fixtures for e2e, TUI, and dev
- `apps/frameworks`, `apps/templates`, `apps/docs` — framework integrations, templates, docs site
- `docs/` — published documentation
- `e2e/fixtures/` — fixture-owned `eve eval` end-to-end tests

## Git workflow

Commits must be cryptographically signed with a GitHub-verified key and include
the DCO `Signed-off-by` trailer. Use `git commit -s` for every commit; amend
with `git commit --amend -s --no-edit` if missing.

## Commands

```sh
pnpm install              # install workspace deps
pnpm build                # build all packages (turbo)
pnpm dev                  # watch-mode build + weather fixture on local port

pnpm typecheck            # TypeScript across workspace
pnpm lint                 # oxlint (auto-fixes)
pnpm fmt                  # oxfmt
pnpm check:deps           # syncpack — dependency versions must stay in sync
pnpm fix:deps             # syncpack fix-mismatches + format
pnpm guard:invariants     # mechanical code-invariant checks (CI lint job)
pnpm docs:check           # docs frontmatter and nav validation

pnpm test                 # unit + integration
pnpm test:unit            # unit tests (<3s)
pnpm test:integration     # integration tests (<10s)
pnpm test:scenario        # scenario tests (2–5 min; requires pnpm build first)
pnpm test:e2e             # fixture-owned eve eval suites (turbo, concurrency=1)
pnpm test:tui             # TUI smoke scripts
```

Verify iteratively: `typecheck` → `lint` → `fmt` → `build` → `test:unit` →
`test:integration`. Run `test:scenario` when touching compiler, runtime, dev
server, CLI, or scenario fixtures.

## Build pipeline

- `build:compiled` (in `packages/eve`) runs first — it vendors third-party code
  via `scripts/vendor-compiled.mjs` into `.generated/compiled/`. **Edit the
  vendor scripts** under `scripts/vendor-compiled/`, not the generated output.
- `#compiled/*` import aliases resolve via `package.json` `imports`:
  - Source: `.generated/compiled/*`
  - Published: `dist/src/compiled/*`
- Package exports use an `eve-source` condition for source-level resolution
  during dev. When adding a new export subpath, mirror the pattern from
  `packages/eve/package.json`.
- `pnpm --filter eve build:compiled` must run before any test tier — the vitest
  configs do not rebuild it automatically.
- `turbo.json` has `envMode: "strict"` — every env var used in tasks must be
  declared there. Test tasks declare `EVE_EXPERIMENTAL_CODE_MODE`.

## TypeScript

```json
{
  "target": "ES2024",
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "verbatimModuleSyntax": true,
  "erasableSyntaxOnly": true,
  "noUncheckedIndexedAccess": true,
  "noUncheckedSideEffectImports": true
}
```

These are non-negotiables. TypeScript 7.0.1-rc is the workspace version. Note
`verbatimModuleSyntax` means `import type` / `export type` is mandatory for
type-only imports and exports.

## Toolchain

- **Lint/format:** oxlint + oxfmt only. No Prettier, no ESLint.
- **Pre-commit hook:** runs `oxfmt` only (via `simple-git-hooks`).
  Lint/typecheck/test are manual — run them before pushing.
- **Deps:** syncpack enforces the `catalog:` protocol for shared deps (defined
  in `pnpm-workspace.yaml`). Run `pnpm check:deps` / `pnpm fix:deps`.

## Testing

Tests have four tiers. Pick the tightest one that fits:

- **Unit** (`src/**/*.test.ts`): pure logic, colocated. No FS/subprocess/network.
- **Integration** (`src/**/*.integration.test.ts`): multiple modules in memory.
- **Scenario** (`src/**/*.scenario.test.ts`, `test/scenarios/`): real subprocess,
  HTTP port, or bundler.
- **E2E** (`e2e/fixtures/*/evals/`, `apps/fixtures/*/evals/`): `eve eval` suites
  against real models (`openai/gpt-5.5`). See `e2e/README.md` for full detail.

**Run a single test file with the tier config** — bare `vitest run <path>`
resolves `#*` imports to stale `dist/` output:

```sh
pnpm --filter eve exec vitest run --config vitest.unit.config.ts <path> [-t "<name>"]
```

Do not commit fixture trees under `packages/eve/test/fixtures/` — scenario app
content uses inline `ScenarioAppDescriptor` objects (CI enforces this).

## Coding principles

1. **Public APIs need docs and tests.** Exported functions, classes, and public
   types get doc comments and at least one test.
2. **Wrap third-party deps.** Don't expose third-party APIs as eve public APIs.
   Prefer vendoring over runtime dependencies. `eve` targets `nitro` as its
   only runtime dep.
3. **Pre-1.0: prefer breaking changes.** Correctness over backwards compat. No
   legacy fallback logic.
4. **Derive names from file paths.** Connection/tool/skill names come from the
   filesystem path (`agent/connections/linear.ts` → `"linear"`). No redundant
   `name` fields.
5. **Name definitions for the protocol they target.** Use
   `defineMcpClientConnection`, not `defineConnection`.
6. **All runtime functionality lives in `packages/eve`.** Never rely on emitted
   or generated code for runtime behavior.

Machine-checkable invariants in `pnpm guard:invariants` (CI lint job). If the
guard fails, fix the violation — baselines may only shrink.

## Documentation

- `docs/**` is published. Update relevant docs and run `pnpm docs:check` when
  changing public behavior.
- Sidebar order: `docs/meta.json`. Keep markdown framework-agnostic (no MDX
  unless the page is `.mdx`).

## Changesets

Every PR touching the published `eve` package needs a changeset (`pnpm changeset`).
Pre-1.0, use `patch` for bug fixes and features, `minor` for breaking API
changes. Docs-only and fixture changes are exempt. When in doubt, add one.
