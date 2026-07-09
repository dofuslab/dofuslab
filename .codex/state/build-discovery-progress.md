# Build Discovery Progress

Last updated: 2026-07-08

## Current Workspace Finding

The active DofusLab worktree is `C:\Users\jerem\code\dofuslab` on branch `codex/build-discovery-prototype`.

Build discovery prototype files are present, including:

- `server/oneoff/build_discovery_prototype.py`
- `scripts/test_build_discovery_prototype.py`
- `server/oneoff/generate_build_discovery_index.py`
- `scripts/test_generate_build_discovery_index.py`
- `server/oneoff/sync_game_data.py`

The worktree contains a substantial dirty diff across the prototype, tests, sync tooling, and unrelated-looking client layout/page files. The evaluator should start by separating Build Discovery PRD work from unrelated UI/layout changes before recommending implementation.

## Next Required Step

Run the initial evaluator pass:

1. Confirm branch/worktree status.
2. Review all dirty Build Discovery prototype, index, sync, and test changes against the PRD.
3. Identify unrelated dirty client/page changes and call out whether they should be excluded from this effort.
4. Produce a PRD coverage matrix and the next smallest implementation slice.

## Progress Log

### 2026-07-08

- Created Codex multi-agent harness for Build Discovery v1 in `C:\Users\jerem\code\dofuslab`.
- Added planner, worker, and evaluator custom agents.
- Added initial evaluation and iterative cycle prompts.
- Added local PRD summary and state files.
- Updated PRD interpretation: AP/MP/range are minimum targets with caps and light surplus scoring, not exact-match targets. Replaced the initial budget model with 4 coarse availability tiers.
- Updated harness design: future reviewable steps should be stacked PRs. The current oversized prototype branch should be treated as a baseline to commit, stash, or park before clean child PR work begins.
- Started Milestone 4 as a stacked benchmark-quality slice:
  - Added `server/oneoff/build_discovery_benchmark_report.py`.
  - Added `scripts/build_discovery_benchmark_report.py`.
  - Added `scripts/test_build_discovery_benchmark_report.py`.
  - The report defines the PRD's five scoreable DofusLab Strength Iop benchmarks, preserves the Fashionista links as manual comparison references, and can compare benchmark scores against generated prototype JSON output.
  - Verification passed: `python -m unittest scripts.test_build_discovery_benchmark_report`, `python -m unittest scripts.test_generate_build_discovery_index`, `python -m unittest scripts.test_build_discovery_prototype`, and `git diff --check`.
- Started ordered Milestones 1-4 execution:
  - Milestone 1: added `BuildDiscoveryQuery`, product-shaped response envelope, `solverVersion`, `datasetVersion`, target semantics, warnings, avoided-item plumbing, and query validation around the prototype.
  - Milestone 2: added initial 4-tier availability classification, budget filtering through candidate loading/search, and `exoPolicy=none` behavior for generated AP/MP/Range exos.
  - Milestone 3: added stable query cache keys that include query inputs, `datasetVersion`, and `solverVersion`.
  - Milestone 4: added benchmark report tooling and tests.
  - Verification passed: `python -m unittest scripts.test_build_discovery_prototype` (101 tests), `python -m unittest scripts.test_generate_build_discovery_index` (5 tests), `python -m unittest scripts.test_build_discovery_benchmark_report` (4 tests), `python scripts\build_discovery_benchmark_report.py --help`, and `git diff --check`.

## Remaining To Reach Shippable Milestone 4

- Baseline the current oversized prototype branch or split unrelated client/layout work before opening stacked PRs.
- Promote the prototype contract into the intended backend API surface, or explicitly mark the oneoff contract as the Milestone 1 baseline.
- Add persistent cache or async job behavior once fresh-query timing dictates the launch path.
- Generate and review at least one real benchmark report from live/local benchmark data, not only injected unit-test scorer data.
- Add benchmark regression fixtures once the first accepted report is produced.

### 2026-07-08 Continuation

- Added `.codex/state/build-discovery-assumptions.md` so product/gameplay assumptions are reviewable in one place.
- Strengthened Milestone 1 query behavior:
  - `lockedItemIds` are now enforced as final-result requirements.
  - overlapping locked/avoided item IDs are rejected.
- Strengthened Milestone 3 index/version behavior:
  - runtime rejects unsupported build discovery index schema versions.
  - generated indexes now include `datasetVersion`.
- Strengthened Milestone 4 report behavior:
  - benchmark reports support `--allow-errors`, producing per-benchmark error entries instead of aborting on first failure.
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_prototype` (102 tests)
  - `python -m unittest scripts.test_generate_build_discovery_index` (7 tests)
  - `python -m unittest scripts.test_build_discovery_benchmark_report` (5 tests)
  - `python scripts\build_discovery_benchmark_report.py --help`
  - `git diff --check`

## Remaining For Updated Goal

- Review and correct the assumptions ledger, especially class, budget, Dofus, exo, and performance assumptions.
- Add real cache storage or an explicit async job path for the shippable query target.
- Measure fresh and cached query timings against the generated index.
- Push fresh p95 under 5s if synchronous; otherwise make async job behavior the product path.
- Add Milestone 6 validation for non-Strength Iop elements before UI tinkering depends on them.

### 2026-07-08 Cache/Perf And Milestone 6 Slice

- Added in-process query response caching to the prototype response wrapper.
  - Responses expose `cache.status`, `cache.storage`, `diagnostics.cacheHit`, and `cacheKey`.
  - Cache keys still include query inputs, dataset version, and solver version.
  - `use_cache=False` bypasses the process cache for fresh-query measurement.
- Added query performance measurement tooling:
  - `server/oneoff/build_discovery_query_perf.py`
  - `scripts/build_discovery_query_perf.py`
  - `scripts/test_build_discovery_query_perf.py`
  - Reports runs, cache hits, result count, cache key, and min/avg/p95/max timings.
- Added Milestone 6 contract coverage for Iop Strength, Intelligence, Chance, and Agility query profiles.
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_prototype` (105 tests)
  - `python -m unittest scripts.test_generate_build_discovery_index` (7 tests)
  - `python -m unittest scripts.test_build_discovery_benchmark_report` (5 tests)
  - `python -m unittest scripts.test_build_discovery_query_perf` (2 tests)
  - `python scripts\build_discovery_query_perf.py --help`
  - `git diff --check`

## Remaining For Shippable Query Target

- Run the perf script against a real generated index and representative queries.
- If fresh p95 is still above 5s, choose async job flow as the product path.
- Replace or supplement process-memory cache with the intended app cache storage.
- Validate generated build quality for Intelligence, Chance, and Agility Iop, not just query/profile contract support.
- Produce accepted benchmark report artifacts and convert them into regression fixtures.

### 2026-07-08 Local Validation Checkpoint

- Created stacked branch `codex/build-discovery-local-benchmark-fixtures` on top of `codex/build-discovery-agility-quality`.
- Added deterministic local query validation for the supported Iop element matrix:
  - fixed profile: level 200 Iop, 11/6/0, budget tier 4, `exoPolicy=allow`
  - generated JSON index only; validation mode refuses DB fallback
  - fails on missing element rows, empty result sets, or p95 above 5000ms
  - report includes profile, query, index, threshold, expected element profile, timing, cache, and per-element validation metadata
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_query_perf` (11 tests)
  - `git diff --check`
  - generated JSON index smoke with `python scripts\build_discovery_query_perf.py --index-path <temp-index> --validate-local-profile --runs 1 --no-cache`
  - smoke result: Strength, Intelligence, Chance, and Agility all returned nonempty results under the 5s p95 threshold
- PR creation remains blocked by GitHub connector permissions:
  - `_create_pull_request` returns `403 Resource not accessible by integration`
  - pushed branch URL: `https://github.com/dofuslab/dofuslab/pull/new/codex/build-discovery-local-benchmark-fixtures`

## Remaining After Local Validation Checkpoint

- Update or add app-level cache behavior if the product path should depend on a cache beyond the current process-memory prototype cache.
- Use the readonly prod database cautiously to discover representative real-user benchmark queries once local validation remains stable.
- Produce accepted benchmark artifacts for representative queries and convert them into regression fixtures.
- Expand beyond Iop only after the Iop element matrix and benchmark artifacts are stable enough to review.

### 2026-07-08 Local Query Regression Suite Checkpoint

- Created stacked branch `codex/build-discovery-local-query-regression-suite` on top of `codex/build-discovery-local-benchmark-fixtures`.
- Added `--validate-local-suite` to the query perf harness:
  - validates Iop Strength, Intelligence, Chance, and Agility for both 11/6/0 and 12/6/0
  - uses budget tier 4, `exoPolicy=allow`, generated JSON index only
  - fails on missing element rows, empty result sets, or p95 above 5000ms
  - refuses DB fallback in validation modes, even when `--allow-db` is passed
  - rejects ambiguous simultaneous `--validate-local-profile` and `--validate-local-suite`
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_query_perf` (15 tests)
  - `git diff --check`
  - generated JSON index smoke with `python scripts\build_discovery_query_perf.py --index-path <temp-index> --validate-local-suite --runs 1 --no-cache`
  - smoke result: all 8 element/profile rows returned nonempty results under the 5s p95 threshold; slowest observed row was about 3.57s
- PR creation remains blocked by GitHub connector permissions:
  - `_create_pull_request` returns `403 Resource not accessible by integration`
  - pushed branch URL: `https://github.com/dofuslab/dofuslab/pull/new/codex/build-discovery-local-query-regression-suite`

### 2026-07-08 Prod Benchmark Discovery Helper

- Created stacked branch `codex/build-discovery-prod-benchmark-discovery` on top of `codex/build-discovery-local-query-regression-suite`.
- Added a bounded readonly prod discovery helper:
  - reads `DOFUSLAB_READONLY_DATABASE_URL`
  - samples recent level-200 `custom_set` rows with configurable hard caps
  - runs inside an explicit read-only transaction with `statement_timeout`
  - reports aggregate class/profile distributions and common item aggregates only for buckets with at least 3 matching builds
  - omits custom set IDs, custom set names, owner IDs, and singleton profile item lists
  - enforces bounds in both CLI parsing and the callable discovery function
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_prod_benchmark_discovery` (8 tests)
  - `python scripts\build_discovery_prod_benchmark_discovery.py --help`
  - `git diff --check`
- Actual prod sample execution is blocked in the current environment:
  - `DOFUSLAB_READONLY_DATABASE_URL` is not present in the host shell
  - `DOFUSLAB_READONLY_DATABASE_URL` is not present in the running `dofuslab-server-1` container env

### 2026-07-08 Local Regression Artifact Support

- Created stacked branch `codex/build-discovery-local-regression-artifacts` on top of `codex/build-discovery-prod-benchmark-discovery`.
- Added local suite artifact support to the query performance harness:
  - `--output` writes the full JSON report to a file and keeps stdout quiet
  - `--fixture-output` writes a normalized fixture JSON for `--validate-local-suite`
  - artifact files are written before nonzero validation exit so failed runs remain inspectable
  - fixture normalization strips volatile timing, result count, cache hit, cache key, and index path values
  - fixture normalization preserves report versions, suite/profile/query metadata, expected element profiles, result presence, cache metadata shape, and validation failures
- Added committed fixture `scripts/fixtures/build_discovery_local_query_suite_fixture.json`.
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_query_perf` (21 tests)
  - `python scripts\build_discovery_query_perf.py --help`
  - `git diff --check`
  - generated JSON index smoke with `--validate-local-suite --runs 1 --no-cache --output <report> --fixture-output <fixture>` produced `status=pass` with 2 profiles

### 2026-07-08 GraphQL App Cache Checkpoint

- Created stacked branch `codex/build-discovery-app-cache` on top of `codex/build-discovery-local-regression-artifacts`.
- Added app-level caching behind the GraphQL `buildDiscovery` resolver:
  - uses `cache_region` dogpile/Redis infrastructure
  - builds cache keys from the prototype cache-key helper, including dataset version, solver version, and query identity
  - checks generated-index availability before cache access so stale cache cannot mask missing index setup
  - bypasses prototype process-memory cache on app-cache misses with `use_cache=False`
  - marks app-cache hits with `cache.status=hit`, `cache.storage=app_cache`, `diagnostics.appCacheHit=true`, and `diagnostics.elapsedMs=0.0`
  - treats dogpile `NO_VALUE` as a miss and deep-copies cached responses before hit annotation
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_query_perf` (21 tests)
  - `python -m unittest scripts.test_build_discovery_prototype` (112 tests)
  - `git diff --check`
  - server-container inline GraphQL checks for identical-request hit, changed-query miss, dataset-version miss, `NO_VALUE` miss, prototype-cache bypass, missing-index no-cache-access, and cached-object immutability
- Host GraphQL unit test execution is blocked by missing host Flask dependencies; GraphQL behavior was verified inside `dofuslab-server-1`.

### 2026-07-08 Client Contract Bridge Checkpoint

- Created stacked branch `codex/build-discovery-client-contract` on top of `codex/build-discovery-app-cache`.
- Added a client-side Build Discovery contract bridge without visible UI:
  - canonical GraphQL document `client/graphql/queries/buildDiscovery.graphql`
  - generated operation types for the `buildDiscovery` GenericScalar query
  - defensive `client/common/buildDiscovery.ts` facade for parsing the GenericScalar response
  - typed v1 input helper/hook with server-aligned defaults: Iop, level 200, PvM, Strength, 11/6/0, budget tier 2, limit 5
  - preserves cache observability fields for future UI/debugging
- Verification passed:
  - `cd client && yarn generate`
  - `cd client && yarn type-check`
  - `git diff --check`
- Residual risk: client defaults intentionally mirror backend defaults until the UI has explicit controls; future backend default changes should update this bridge or gain a contract test.

### 2026-07-08 Contract Drift Guard Checkpoint

- Created stacked branch `codex/build-discovery-contract-drift-guard` on top of `codex/build-discovery-client-contract`.
- Added executable default/shape drift guards:
  - split pure client contract code into `client/common/buildDiscoveryContract.ts`
  - kept `client/common/buildDiscovery.ts` as the Apollo hook facade and public re-export surface
  - added `client/scripts/check-build-discovery-contract.ts`
  - added `yarn check-build-discovery-contract`
  - added a backend GraphQL omitted-args test asserting the server defaults match the client defaults
- Verification passed:
  - `cd client && yarn check-build-discovery-contract`
  - `cd client && yarn type-check`
  - `git diff --check`
  - server-container inline GraphQL omitted-args default check
- Reviewer finding fixed before commit:
  - restored `BuildDiscoveryQueryInput` re-export from `client/common/buildDiscovery.ts`
- Residual risk:
  - the new client drift check is a standalone script and is not yet wired into build or CI.

### 2026-07-08 Contract Guard Type-Check Wiring

- Created stacked branch `codex/build-discovery-contract-ci-check` on top of `codex/build-discovery-contract-drift-guard`.
- Wired the client contract drift guard into the normal client type-check path:
  - `yarn type-check` now runs `tsc && yarn check-build-discovery-contract`
- Verification passed:
  - `cd client && yarn type-check`

### 2026-07-09 First Client Page Checkpoint

- Created stacked branch `codex/build-discovery-first-client-page` on top of `codex/build-discovery-contract-ci-check`.
- Added a first usable `/build-discovery` client route:
  - controls for element, AP, MP, range, budget, limit, exo policy, and weapon policy
  - explicit `Run` submission so filter edits do not immediately spam solver requests
  - result cards for item slots, score, totals, warnings, cache status, and elapsed time
  - mobile-first grids with desktop min-width overrides
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx pages/build-discovery.tsx`
  - `cd client && yarn type-check`
  - `git diff --check`
  - `Invoke-WebRequest http://localhost:3000/build-discovery/` returned HTTP 200 after clearing stale generated `.next` cache in the client container
- Reviewer findings fixed before commit:
  - corrected responsive breakpoint direction
  - changed query behavior from edit-triggered requests to explicit `Run`
- Residual risk:
  - in-app browser navigation timed out during visual smoke, so screenshot/mobile visual verification is still pending.

### 2026-07-09 Build Discovery Navigation Checkpoint

- Created stacked branch `codex/build-discovery-ui-visual-smoke` on top of `codex/build-discovery-first-client-page`.
- Added Build Discovery navigation entry points:
  - desktop header button linking to `/build-discovery`
  - mobile drawer menu item linking to `/build-discovery`
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/desktop/Layout.tsx components/mobile/Layout.tsx`
  - `cd client && yarn type-check`
- Reviewer findings fixed before commit:
  - desktop navigation uses a compact icon-only `Button href` with tooltip instead of a wide nested `Link > Button`
  - desktop and mobile labels use the `common:BUILD_DISCOVERY` translation key
  - locale files include `BUILD_DISCOVERY`

### 2026-07-09 Manual Run Page Checkpoint

- Created stacked branch `codex/build-discovery-manual-run-page` on top of `codex/build-discovery-ui-visual-smoke`.
- Changed the Build Discovery page to avoid solver requests on initial page load:
  - query hook is skipped until the user presses `Run`
  - refresh is disabled until a query has been submitted
  - empty results are shown only after a submitted query returns no builds
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `cd client && yarn type-check`

### 2026-07-09 Open In Builder Checkpoint

- Created stacked branch `codex/build-discovery-open-in-builder` on top of `codex/build-discovery-manual-run-page`.
- Added a result-level `Open in builder` action:
  - extracts and deduplicates item IDs from the Build Discovery GenericScalar result
  - reuses the existing `useEquipItemsMutation` flow
  - creates/opens a normal DofusLab build via existing navigation after mutation success
  - disables the action when a result does not contain usable item IDs
  - disables the action when a result includes generated exos, because the existing equip-items mutation cannot yet preserve them
- Verification passed:
  - `cd client && npx eslint --fix-dry-run common/buildDiscoveryContract.ts components/common/BuildDiscoveryPage.tsx`
  - `cd client && yarn type-check`

### 2026-07-09 Preserve Exos In Builder Import

- Created stacked branch `codex/build-discovery-preserve-exos` on top of `codex/build-discovery-open-in-builder`.
- Changed `Open in builder` from a no-exo-safe import into an exo-preserving import:
  - equips the discovered item IDs into a normal DofusLab build
  - matches generated AP/MP/Range exos back to returned equipped items by item ID
  - applies supported exos with the existing `setEquippedItemExo` mutation before navigating to the builder
  - keeps the action disabled for unsupported exo stats
- Reviewer findings fixed before commit:
  - duplicate item IDs are preserved instead of deduped
  - generated exos match by item ID and serialized slot name
  - numbered discovery slots such as `ring_1` match generic returned slots such as `Ring` by slot family and slot order
  - exos are applied sequentially
  - if exo application fails after build creation, navigation still opens the created build rather than leaving it orphaned
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `cd client && yarn type-check`

### 2026-07-09 Exo Result Details

- Created stacked branch `codex/build-discovery-exo-result-details` on top of `codex/build-discovery-preserve-exos`.
- Added visible generated-exo tags to Build Discovery result cards:
  - labels AP/MP/Range exos with the matched item name when available
  - keeps exo details visible before using `Open in builder`
- Reviewer finding fixed before commit:
  - capped exo tag width with ellipsis to avoid narrow viewport overflow
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `cd client && yarn type-check`

### 2026-07-09 Exo Import Contract Guards

- Created stacked branch `codex/build-discovery-exo-import-guards` on top of `codex/build-discovery-exo-result-details`.
- Extracted Build Discovery result helper logic into the pure client contract module:
  - item ID extraction preserves duplicates
  - generated exo labels are derived from `build.exos` and `build.items`
  - unsupported exo detection shares the same supported AP/MP/Range map
  - numbered slot parsing covers discovery slots such as `ring_2`
- Extended `yarn check-build-discovery-contract` with executable assertions for those helpers.
- Verification passed:
  - `cd client && npx eslint --fix-dry-run common/buildDiscovery.ts common/buildDiscoveryContract.ts components/common/BuildDiscoveryPage.tsx`
  - `cd client && yarn type-check`

### 2026-07-09 Client Analytics Instrumentation

- Created stacked branch `codex/build-discovery-client-analytics` on top of `codex/build-discovery-exo-import-guards`.
- Added Build Discovery client analytics events:
  - query run
  - refresh
  - results shown
  - open-in-builder attempt
  - open-in-builder success
  - open-in-builder partial exo failure with created-build navigation
  - open-in-builder error before build creation
- Hardened the shared `gtag` helper so missing `window.gtag` does not crash local/dev sessions.
- Reviewer finding fixed before commit:
  - analytics uses a bounded error label instead of sending raw exception messages to GA
- Verification passed:
  - `cd client && npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx gtag.ts`
  - `cd client && yarn type-check`

### 2026-07-09 Target Semantics Contract Guard

- Created stacked branch `codex/build-discovery-target-semantics-guard` on top of `codex/build-discovery-client-analytics`.
- Made the AP/MP/Range target semantics explicit in the backend response:
  - targets are minimums, not exact equality requirements
  - AP/MP/Range remain bounded by hard caps
  - surplus remains a light capped scoring reward
- Added focused tests for the semantics helper and response contract.
- Reviewer finding fixed before commit:
  - `BuildDiscoveryQuery.validate()` now rejects AP/MP/Range targets below zero or above hard caps instead of accepting impossible solver requests.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "python - <<'PY' ... PY"` inline assertions for `target_semantics_response()` and mocked `build_discovery_response()`
  - `python -m unittest scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_target_semantics_response_declares_minimum_targets_with_hard_caps scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_build_discovery_response_exposes_product_query_contract scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_action_stats_meet_target_allows_surplus_within_caps scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_action_stats_meet_target_rejects_missing_or_over_cap_stats scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_surplus_range_is_allowed_up_to_hard_cap scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_over_hard_range_cap_is_rejected scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_build_discovery_query_rejects_out_of_scope_inputs`
  - `git diff --check`
- Full Docker `python -m unittest scripts.test_build_discovery_prototype` still has unrelated pre-existing failures in completion-target and strength-profile tests.

### 2026-07-09 Target Copy Clarity

- Created stacked branch `codex/build-discovery-target-copy` on top of `codex/build-discovery-target-semantics-guard`.
- Renamed Build Discovery AP/MP/Range input labels and aria labels to make the minimum-target semantics visible at the control:
  - `Min AP`
  - `Min MP`
  - `Min Range`
- Verification passed:
  - `cd client; npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `cd client; yarn type-check`
  - `git diff --check`

### 2026-07-09 Target Semantics Client Contract

- Created stacked branch `codex/build-discovery-target-semantics-client-contract` on top of `codex/build-discovery-target-copy`.
- Narrowed the client parser for `targetSemantics` instead of exposing it as an arbitrary record:
  - preserves `minimum_with_hard_caps`
  - preserves AP/MP/Range `minimum` target semantics
  - preserves AP/MP/Range caps
  - preserves `light_reward_with_cap`
  - filters unsupported stat keys from the defensive GenericScalar parser
- Reviewer finding: no issues. Note: the AP/MP/Range key set currently reuses the exo stat map; split to a dedicated action-stat set if those universes diverge.
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts common/buildDiscoveryContract.ts scripts/check-build-discovery-contract.ts` (existing `no-console` warning in the contract check script)
  - `git diff --check`

### 2026-07-09 Generated Build Label

- Created stacked branch `codex/build-discovery-generated-build-label` on top of `codex/build-discovery-target-semantics-client-contract`.
- Made `Open in builder` visibly mark persisted generated builds:
  - after `equipItems` creates the custom set, the client calls `editCustomSetMetadata`
  - generated rows are named `Generated Build Discovery #<rounded score>` when a score is available
  - metadata save is best-effort so labeling failures do not prevent exo application or opening the generated build
- Reviewer finding fixed before commit:
  - metadata save failure no longer hard-stops generated exo application or navigation
- Recorded the longer-term data cleanliness decision: if Build Discovery generated rows remain persisted artifacts, add a durable generation/source model such as `GenerationRequest` linked to `custom_set`.
- Verification passed:
  - `cd client; npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `cd client; yarn type-check`
  - `git diff --check`
