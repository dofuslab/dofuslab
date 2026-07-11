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

### 2026-07-09 Generation Request Model

- Created stacked branch `codex/build-discovery-generation-request-model` on top of `codex/build-discovery-generated-build-label`.
- Added durable generated-build provenance groundwork:
  - new `generation_request` table/model linked one-to-one to `custom_set`
  - `CustomSet.generationRequest` GraphQL field
  - atomic `importGeneratedCustomSet` GraphQL mutation that creates the custom set, equips generated items/exos, and writes provenance in one server transaction
  - provenance fields for source, dataset version, solver version, request payload, and creation date
- Added mocked GraphQL tests for atomic generated import and provenance metadata validation.
- Reviewer findings fixed before commit:
  - replaced the separate post-create provenance mutation with an atomic generated import mutation
  - removed client-authoritative provenance overwrite behavior
  - added source/version length validation and request-payload size validation
  - changed the atomic import input to `CustomSetImportedItemInput` so generated AP/MP/Range exos can be persisted in the same transaction
  - rejected empty generated imports before creating a custom set
  - exposed `GenerationRequest.requestPayload` as `GenericScalar` so clients read an object instead of Graphene's default JSON string
- Verification passed:
  - Docker inline GraphQL assertions for atomic import, exo handoff, and provenance validation behavior
  - Docker inline GraphQL assertion that `generationRequest.requestPayload` reads back as an object
  - `docker exec dofuslab-server-1 python -m py_compile app/database/model_generation_request.py app/database/model_custom_set.py app/schema.py`
  - `python -m py_compile scripts/test_build_discovery_graphql.py`
  - `git diff --check`
- Host `python -m unittest scripts.test_build_discovery_graphql...` is blocked by missing `dogpile`; Docker's `/home/dofuslab/scripts` does not see the repo-level edited test file, so the equivalent mutation checks were run inline in Docker.

### 2026-07-09 Atomic Generated Import Client

- Created stacked branch `codex/build-discovery-atomic-generated-import-client` on top of `codex/build-discovery-generation-request-model`.
- Added client mutation document `importGeneratedCustomSet`.
- Rewired Build Discovery `Open in builder` to use the atomic generated import mutation:
  - sends generated item inputs, including AP/MP/Range exo flags
  - sends generated build name, dataset version, solver version, and compact request payload
  - removes separate generated label mutation and client-side exo follow-up mutations
- Reviewer findings fixed before commit:
  - import now disables when a generated exo cannot be matched to exactly one returned item slot
  - unknown-slot exos no longer fan out across duplicate item IDs
  - Build Discovery results now expose `item.internalId` from `ModelItem.uuid`; the client uses that UUID for generated import while keeping `item.id` as the Dofus DB ID for display/exo matching
  - generated indexes now preserve the internal item UUID and the runtime indexed item loader restores it for generated imports
  - the generated index now defaults to the DB source so normal/generated artifacts carry internal item UUIDs; JSON remains an explicit smoke/dev source
  - `Open in builder` now disables visibly when generated results are missing internal import IDs instead of authenticating and silently returning
  - generated import rows are sorted by numbered slot family/index before sending to the server
- Codegen exposed a backend mapper registration issue; fixed `ModelCustomSet` by explicitly importing `ModelGenerationRequest`, then restarted `dofuslab-server-1` and reran `cd client; yarn generate`.
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx common/buildDiscoveryContract.ts scripts/check-build-discovery-contract.ts` (existing `no-console` warning in the contract check script)
  - `cd client; yarn type-check`
  - `docker exec dofuslab-server-1 python -m py_compile app/database/model_generation_request.py app/database/model_custom_set.py app/schema.py oneoff/build_discovery_prototype.py oneoff/generate_build_discovery_index.py`
  - `python -m unittest scripts.test_generate_build_discovery_index.GenerateBuildDiscoveryIndexTest`
  - `python -m unittest scripts.test_generate_build_discovery_index.GenerateBuildDiscoveryIndexTest.test_serializable_item_includes_internal_id_for_generated_imports scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_indexed_item_record_preserves_internal_item_id_for_imports scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_serialize_build_exposes_internal_item_id_for_imports`
  - `git diff --check`

### 2026-07-09 Generated Build Badge

- Created stacked branch `codex/build-discovery-generated-build-badge` on top of `codex/build-discovery-atomic-generated-import-client`.
- Made generated persisted builds visible in existing build lists:
  - abbreviated and full `CustomSet` fragments now request `generationRequest { id source }`
  - build cards render a compact `Generated` badge when provenance exists
  - `GenerationRequest` is resolved through a dataloader to avoid list-card N+1 queries
- Reviewer finding fixed before commit:
  - added the `GENERATED` locale key to every common locale file so non-English locales do not render the raw key
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run components/common/BuildCard.tsx`
  - `docker exec dofuslab-server-1 python -m py_compile app/__init__.py app/loaders.py app/schema.py`
  - parsed all `client/public/locales/*/common.json` files and asserted `GENERATED` is present
  - `git diff --check`

### 2026-07-09 Oneoff Import Provenance

- Created stacked branch `codex/build-discovery-oneoff-import-provenance` on top of `codex/build-discovery-generated-build-badge`.
- Updated the legacy `oneoff.import_build_discovery_candidates` script so generated custom sets created outside the GraphQL import path also get `GenerationRequest` provenance:
  - source is `build_discovery_oneoff_import`
  - dataset and solver versions are recorded
  - request payload captures target/query knobs, generated item IDs, exos, score, and base allocation
- Reviewer finding: no issues.
- Verification passed:
  - `docker exec dofuslab-server-1 python -m py_compile oneoff/import_build_discovery_candidates.py`
  - Docker inline assertions for `generation_request_payload`
  - `git diff --check`

### 2026-07-09 Primary Stat Allocation

- Created stacked branch `codex/build-discovery-primary-stat-allocation` on top of `codex/build-discovery-oneoff-import-provenance`.
- Fixed non-Strength Iop base stat allocation:
  - allocation now explicitly carries the active profile primary stat into final build optimization
  - base allocation resets non-primary elemental stats to scrolled baseline before applying the selected primary stat allocation
  - Chance/Intelligence/Agility no longer keep baked-in free Strength from the old Strength-only baseline
- Reviewer finding fixed before commit:
  - corrected the first pass that optimized Chance but still preserved `BASE_STATS["Strength"]`
- Verification passed:
  - focused unittest coverage for Strength allocation, Chance allocation baseline, Chance optimizer allocation, and all-element response contract
  - `docker exec dofuslab-server-1 python -m py_compile oneoff/build_discovery_prototype.py`
  - `git diff --check`

### 2026-07-09 Generated Build Filter

- Created stacked branch `codex/build-discovery-generated-build-filter` on top of `codex/build-discovery-primary-stat-allocation`.
- Added an optional `generated` field to `CustomSetFilters`:
  - omitted keeps existing build-list behavior
  - `generated: true` returns custom sets with `GenerationRequest` provenance
  - `generated: false` returns custom sets without generation provenance
- Regenerated client GraphQL global types.
- Reviewer finding: no issues.
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `docker exec dofuslab-server-1 python -m py_compile app/schema.py`
  - Docker schema assertion that `CustomSetFilters.generated` exists as `Boolean`
  - `git diff --check`

### 2026-07-09 Generated Import Default Class

- Created stacked branch `codex/build-discovery-generated-import-default-class` on top of `codex/build-discovery-generated-build-filter`.
- Made Build Discovery generated imports open with the generated class context:
  - `ImportGeneratedCustomSet` reads `requestPayload.query.className`
  - for `source == "build_discovery"` only, the mutation maps that class name through English class translations and sets `custom_set.default_class_id`
  - unknown/missing class names keep existing default-class behavior
- Reviewer finding fixed before commit:
  - gated class derivation on `source == "build_discovery"` so other generated import sources are not affected by client-controlled provenance fields
- Verification passed:
  - `python -m py_compile scripts/test_build_discovery_graphql.py`
  - `docker exec dofuslab-server-1 python -m py_compile app/schema.py`
  - Docker inline mutation assertion for generated default-class assignment and non-Build-Discovery source gating
  - `git diff --check`

### 2026-07-09 Descriptive Generated Names

- Created stacked branch `codex/build-discovery-descriptive-generated-names` on top of `codex/build-discovery-generated-import-default-class`.
- Made imported generated build names include query context:
  - `Generated Strength Iop #123` when element/class context exists
  - `Generated Build Discovery #123` fallback when context is missing
- Reviewer finding: no issues.
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `git diff --check`

### 2026-07-09 Action Stat Surplus Scoring

- Created stacked branch `codex/build-discovery-action-stat-surplus-score` on top of `codex/build-discovery-descriptive-generated-names`.
- Added light capped utility weights for AP/MP/Range:
  - AP: 12
  - MP: 10
  - Range: 8
- This encodes the product decision that extra AP/MP/Range is good within hard caps, but should not dominate build quality.
- Reviewer finding: no issues.
- Verification passed:
  - focused unittest coverage for action-stat surplus scoring, target semantics, and surplus target behavior
  - nearby utility/cap tests for score caps and damage/survivability exclusion
  - `docker exec dofuslab-server-1 python -m py_compile oneoff/build_discovery_prototype.py`
  - `git diff --check`

### 2026-07-09 Generated Build List Filter UI

- Created stacked branch `codex/build-discovery-generated-build-list-filter-ui` on top of `codex/build-discovery-action-stat-surplus-score`.
- Added a generated-build filter to the existing build list controls:
  - All builds
  - Generated builds
  - User-created builds
- Wired the control to `CustomSetFilters.generated` and made pagination carry the full current filter set.
- Added locale keys for the filter labels to all common locale files using English fallback labels.
- Reviewer finding: no issues.
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run components/common/BuildList.tsx`
  - parsed all `client/public/locales/*/common.json` files and asserted filter keys are present
  - `git diff --check`

### 2026-07-09 Client Import Contract Tests

- Created stacked branch `codex/build-discovery-client-import-contract-tests` on top of `codex/build-discovery-generated-build-list-filter-ui`.
- Extracted Build Discovery generated-import helpers from `BuildDiscoveryPage` into the pure client contract module:
  - generated build name
  - generated import item rows
  - import request payload
  - result key
  - import block/exo messages
- Extended `yarn check-build-discovery-contract` assertions for:
  - using internal UUIDs for mutation item IDs
  - using Dofus IDs only for generated exo matching
  - missing internal IDs
  - unmatched/null-slot exos
  - deterministic import row sorting from an unsorted fixture
  - generated-name fallback behavior
  - compact request payload shape
- Reviewer finding fixed before commit:
  - added an unsorted fixture so the slot sorting assertion would fail if sorting were removed
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts common/buildDiscoveryContract.ts components/common/BuildDiscoveryPage.tsx scripts/check-build-discovery-contract.ts` (existing `no-console` warning in the contract check script)
  - `git diff --check`

### 2026-07-09 Atomic Import Regression

- Created stacked branch `codex/build-discovery-atomic-import-regression` on top of `codex/build-discovery-client-import-contract-tests`.
- Strengthened the mocked GraphQL regression for `importGeneratedCustomSet`:
  - two internal item UUID inputs
  - AP and Range exo flags passed atomically to `equip_items`
  - generated provenance metadata persisted and read back
  - Build Discovery source assigns generated default class
  - non-Build-Discovery generated source preserves an existing default class
- Reviewer finding fixed before commit:
  - the non-Build-Discovery test now starts with an existing class UUID, so it catches accidental clearing as well as accidental reassignment
- Verification passed:
  - `python -m py_compile scripts/test_build_discovery_graphql.py`
  - Docker inline assertions equivalent to the strengthened atomic import path
  - `git diff --check`
- Docker's checked-out `scripts` package is stale in this environment, so direct Docker unittest could not see this edited test file.

### 2026-07-09 Local Query Contract Fixture

- Created stacked branch `codex/build-discovery-local-query-contract-fixture` on top of `codex/build-discovery-atomic-import-regression`.
- Extended local query validation reports with a compact first-build contract summary:
  - item count and slot/type shape
  - Dofus item ID presence/shape
  - internal UUID presence/shape
  - exo references targeting known item IDs and slots
  - base allocation
  - AP/MP/Range action stats
- Regenerated the committed local query suite fixture from a real Docker/local DB generated index, not fake data.
- Kept the 5s fresh-query threshold intact; the fixture intentionally records `p95_threshold_exceeded` rows while proving every supported Iop element/profile still returns an importable first-build contract.
- Reviewer findings fixed before commit:
  - removed fake-data fixture comparison and replaced it with structural assertions over the committed real fixture
  - kept the PRD sync/async threshold signal instead of relaxing the pass bar to 15s
  - asserted AP/MP/Range values meet profile targets
- Verification passed:
  - `docker exec dofuslab-server-1 python -m oneoff.generate_build_discovery_index --output /tmp/build_discovery_index.json --source db`
  - `docker exec dofuslab-server-1 python -m oneoff.build_discovery_query_perf --index-path /tmp/build_discovery_index.json --validate-local-suite --runs 1 --no-cache --fixture-output /tmp/build_discovery_local_query_suite_fixture.json --output /tmp/build_discovery_local_query_suite_report.json` (exited nonzero after writing artifacts because the 5s performance threshold is intentionally exceeded)
  - `python scripts\test_build_discovery_query_perf.py`
  - `docker exec dofuslab-server-1 python -m py_compile oneoff/build_discovery_query_perf.py`
  - `git diff --check`

### 2026-07-09 Async Contract Skeleton

- Created stacked branch `codex/build-discovery-async-contract-skeleton` on top of `codex/build-discovery-local-query-contract-fixture`.
- Added a typed `BuildDiscoveryJob` GraphQL contract and `startBuildDiscovery` mutation.
- The mutation still executes through the existing cached synchronous path, but now exposes the product decision surface needed for async UI/workers:
  - `status`
  - `progress`
  - `freshThresholdMs`
  - `elapsedMs`
  - `cacheHit`
  - `syncRecommended`
  - `asyncRecommended`
  - nullable future `generationRequest`
  - `generationRequestSource`
  - dataset/solver versions
  - compact request payload
  - existing result payload
- This keeps the current `buildDiscovery` query intact while giving the client a stable contract for slow fresh queries.
- Reviewer finding: no issues.
- Verification passed:
  - `docker exec dofuslab-server-1 python -m py_compile app/schema.py`
  - Docker inline GraphQL assertions for slow fresh result -> `asyncRecommended` and cached result -> `syncRecommended`
  - `python -m py_compile scripts\test_build_discovery_graphql.py`
  - `git diff --check`
- Host unittest execution is blocked by missing host dependency `dogpile`; Docker's checked-out `scripts` package is stale, so representative GraphQL assertions were run inline against Docker's current `app.schema`.

### 2026-07-09 Generated Provenance Display

- Created stacked branch `codex/build-discovery-generated-provenance-display` on top of `codex/build-discovery-async-contract-skeleton`.
- Added server-derived `GenerationRequest` display fields:
  - source label
  - safe query class/elements/AP/MP/Range fields
  - compact display summary
- Updated custom-set fragments and generated client types so build cards can show generated provenance without fetching raw `requestPayload`.
- Updated the generated build badge tooltip to show compact provenance such as:
  - `Build Discovery - Iop chance 12/6/0 - dataset dataset-v1 - solver solver-v1`
- Added client contract coverage for generation source/display summary formatting.
- Added backend regression coverage for the derived GenerationRequest metadata/display summary helpers.
- Reviewer finding fixed before commit:
  - removed raw `requestPayload` from list/detail fragments and moved parsing/minimization to server-derived fields
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscoveryContract.ts components/common/BuildCard.tsx scripts/check-build-discovery-contract.ts` (existing `no-console` warning in the contract check script)
  - `docker exec dofuslab-server-1 python -m py_compile app/schema.py`
  - Docker inline GenerationRequest display assertions
  - `python -m py_compile scripts\test_build_discovery_graphql.py`
  - `git diff --check`

### 2026-07-09 Generated Data Audit

- Created stacked branch `codex/build-discovery-generated-data-audit` on top of `codex/build-discovery-generated-provenance-display`.
- Added read-only generated build data audit tooling:
  - generated request/custom set counts
  - source and source/version buckets
  - aggregate age buckets
  - orphan `GenerationRequest` samples
  - custom sets with multiple generation requests
  - generated-looking legacy custom set samples without `GenerationRequest`
- The audit script does not delete or archive anything.
- The script handles local/pre-migration DBs by returning explicit `generation_request_table_missing` status instead of crashing.
- Reviewer findings fixed before commit:
  - UUID values in report rows are serialized as strings
  - age buckets use aggregate count queries instead of loading every row into Python
- Verification passed:
  - `python scripts\test_generated_build_data_audit.py`
  - `docker exec dofuslab-server-1 python -m py_compile oneoff/generated_build_data_audit.py`
  - local Docker audit run completed with `generation_request_table_missing`
  - `git diff --check`

### 2026-07-09 Start Job Client Bridge

- Created stacked branch `codex/build-discovery-start-job-client-bridge` on top of `codex/build-discovery-generated-data-audit`.
- Added the `startBuildDiscovery` GraphQL mutation document and generated client types.
- Added `BuildDiscoveryJob` and `parseBuildDiscoveryJob` to the client Build Discovery contract.
- Added `useStartBuildDiscoveryMutation` as a behavior-neutral client bridge; the existing Build Discovery page still uses the old query path in this checkpoint.
- Extended the client contract script to assert job parser behavior, including async/sync recommendation fields and defensive nested result parsing.
- Reviewer finding: no issues.
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts common/buildDiscoveryContract.ts scripts/check-build-discovery-contract.ts` (existing `no-console` warning in the contract check script)
  - `git diff --check`

### 2026-07-09 Build Discovery Page Job Contract

- Created stacked branch `codex/build-discovery-page-start-job` on top of `codex/build-discovery-start-job-client-bridge`.
- Switched the Build Discovery page run/refresh path to `startBuildDiscovery`.
- Continued rendering the returned job result with the existing result-card UI and generated import flow.
- Added small job metadata tags:
  - `async recommended`
  - `sync ready`
- Made the mutation helper callback stable for page use.
- Reviewer finding fixed before commit:
  - page now clears previous results at the start of a new run and stores displayed results paired with the input that produced them, preventing stale builds from importing with a newer request payload
  - out-of-order mutation completions are ignored
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts components/common/BuildDiscoveryPage.tsx`
  - `git diff --check`

### 2026-07-09 Build Discovery Job Model Skeleton

- Created stacked branch `codex/build-discovery-job-model-skeleton` on top of `codex/build-discovery-page-start-job`.
- Added durable backend job persistence groundwork:
  - SQLAlchemy `ModelBuildDiscoveryJob`
  - Alembic migration stacked after `generation_request`
  - nullable provenance link to `GenerationRequest`
  - status/progress, request/result/error payloads, dataset/solver versions, elapsed timing, and lookup indexes
- Reviewer finding: no issues.
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_job_model.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile app/database/model_build_discovery_job.py app/migrations/versions/395c1a10243a_add_build_discovery_job.py scripts/test_build_discovery_job_model.py`
  - `git diff --check`

### 2026-07-09 Persist Start Build Discovery Jobs

- Created stacked branch `codex/build-discovery-persist-start-job` on top of `codex/build-discovery-job-model-skeleton`.
- Wired successful `startBuildDiscovery` executions to persist a `build_discovery_job` row:
  - persisted job UUID is returned as the GraphQL job id
  - request payload stores display query, full cache identity query, and result key
  - result payload stores the full current solver response
  - dataset version, solver version, elapsed time, status, and progress are copied to indexed job metadata
- Kept validation/index errors on the existing GraphQL error path; failed job persistence is intentionally out of scope for this checkpoint.
- Reviewer finding: no issues.
- Residual risk:
  - `startBuildDiscovery` requires the new migration to be applied before the mutation is exercised.
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_job_persistence.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile app/schema.py scripts/test_build_discovery_job_persistence.py`
  - `git diff --check`

### 2026-07-09 Build Discovery Job Lookup

- Created stacked branch `codex/build-discovery-job-lookup` on top of `codex/build-discovery-persist-start-job`.
- Added backend `buildDiscoveryJob(id)` GraphQL lookup for persisted Build Discovery jobs:
  - nullable lookup for unknown ids
  - explicit row-to-contract adapter instead of exposing the table as a SQLAlchemy GraphQL type
  - supports future partial jobs with nullable result/timing fields while keeping status/progress required
- Reviewer finding: no issues.
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_job_persistence.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile app/schema.py scripts/test_build_discovery_job_persistence.py`
  - `git diff --check`

### 2026-07-09 Client Job Lookup Bridge

- Created stacked branch `codex/build-discovery-client-job-lookup` on top of `codex/build-discovery-job-lookup`.
- Added the client GraphQL query and generated types for `buildDiscoveryJob(id)`.
- Added `useBuildDiscoveryJobQuery` to the Build Discovery client bridge.
- Reviewer finding fixed before commit:
  - skipped job lookups now return `buildDiscoveryJob: null` so Apollo-retained stale data is not exposed when no job id is active.
- Verification passed:
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts`
  - `git diff --check`

### 2026-07-09 Build Discovery Page Job Polling

- Created stacked branch `codex/build-discovery-page-job-polling` on top of `codex/build-discovery-client-job-lookup`.
- Wired the Build Discovery page to refresh the currently displayed persisted job by id:
  - polls only while the displayed job is non-terminal
  - updates displayed results only when the refreshed id matches the displayed job id
  - preserves the submitted input paired with the displayed job for generated import provenance
- Memoized parsed job lookup results in the client bridge to avoid fresh parsed objects on each render.
- Reviewer finding fixed before commit:
  - job lookup errors now render visibly and are not hidden behind the initial loading skeleton.
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts components/common/BuildDiscoveryPage.tsx`
  - `git diff --check`

### 2026-07-09 Build Discovery Worker Task Skeleton

- Created stacked branch `codex/build-discovery-worker-task-skeleton` on top of `codex/build-discovery-page-job-polling`.
- Changed `startBuildDiscovery` to cache-first async behavior:
  - app-cache hits persist and return a succeeded job synchronously
  - app-cache misses persist a queued job, enqueue an RQ worker task, and return the queued job immediately
- Added `run_build_discovery_job` worker task:
  - marks queued jobs running
  - rebuilds the query from stored `requestPayload.queryIdentity`
  - computes with prototype process cache bypassed
  - writes the result to app cache and persists terminal job metadata
  - persists worker failures to `errorPayload`
- Exposed `errorPayload` through the backend/client job contract and page UI.
- Reviewer findings fixed before commit:
  - enqueue failures now mark the persisted row failed and return a reachable failed job contract
  - worker failures render as page errors instead of empty results
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_job_persistence.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile app/schema.py app/tasks.py scripts/test_build_discovery_job_persistence.py`
  - `cd client; yarn generate`
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run common/buildDiscovery.ts common/buildDiscoveryContract.ts components/common/BuildDiscoveryPage.tsx scripts/check-build-discovery-contract.ts`
  - `git diff --check`
- Residual note:
  - the client contract script still has the pre-existing `no-console` lint warning.

### 2026-07-09 Docker Worker Service

- Created stacked branch `codex/build-discovery-docker-worker-service` on top of `codex/build-discovery-worker-task-skeleton`.
- Added a `worker` service to `docker-compose.yml`:
  - reuses the existing server image
  - runs `python worker.py`
  - depends on postgres and redis
  - mirrors server develop-watch sync for local edits
- Reviewer finding: no issues.
- Verification passed:
  - `docker compose config --quiet`
  - `git diff --check`
- Residual note:
  - the worker consumes the existing default RQ queue, so it also handles non-Build-Discovery jobs such as email tasks in local Compose.

### 2026-07-09 Build Discovery Job Status UI

- Created stacked branch `codex/build-discovery-job-status-ui` on top of `codex/build-discovery-docker-worker-service`.
- Added a compact job status tag to the Build Discovery page:
  - queued/running/default states use a gold/blue status tag
  - succeeded uses green
  - failed uses red
  - progress is shown when between 1 and 99 percent
- Reviewer finding: no issues.
- Verification passed:
  - `cd client; yarn type-check`
  - `cd client; npx eslint --fix-dry-run components/common/BuildDiscoveryPage.tsx`
  - `git diff --check`

### 2026-07-09 Assumptions And Readiness Refresh

- Created stacked branch `codex/build-discovery-assumptions-refresh` on top of `codex/build-discovery-job-status-ui`.
- Refreshed `.codex/state/build-discovery-assumptions.md` for the current async job/cache/product path.
- Added `.codex/state/build-discovery-readiness-checklist.md` with explicit checked/open items for query contract, performance path, result quality, generated data cleanliness, assumptions, and prod benchmarks.
- Reviewer finding: no issues.
- Verification passed:
  - `git diff --check`

### 2026-07-09 Prod Review Packet Readiness Gate

- Created stacked branch `codex/build-discovery-prod-review-packet-readiness-gate` on top of `codex/build-discovery-prod-review-packet-readiness`.
- Extended `server/scripts/build_discovery_local_readiness_report.py` with optional `--prod-benchmark-review-packet` validation.
- The readiness report now summarizes:
  - prod benchmark review packet status
  - supported prompt count
  - future prompt count
  - structural/privacy validation failures
- Supplied prod benchmark review packets fail readiness if they are missing, malformed, wrong-version, or include forbidden custom-set/owner identifier keys.
- Extended `server/scripts/build_discovery_local_readiness_pipeline.py` so local readiness runs can pass a prod review packet artifact through to the readiness report.
- Added focused tests for aggregate packet validation, forbidden identifier rejection, and pipeline pass-through.
- Synthetic host readiness smoke result:
  - prod benchmark review packet status: `pass`
  - supported prompt count: 1
  - future prompt count: 1
  - readiness status: `incomplete`
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_report.py scripts/test_build_discovery_local_readiness_report.py scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `python server\scripts\build_discovery_local_readiness_report.py --prod-benchmark-review-packet $env:TEMP\build_discovery_prod_review_packet_smoke.json --output .codex/state/build-discovery-local-readiness-report.json`
  - `git diff --check`

### 2026-07-09 Prod Review Packet Summary

- Created stacked branch `codex/build-discovery-prod-review-packet-summary` on top of `codex/build-discovery-prod-review-packet-readiness-gate`.
- Extended `server/scripts/build_discovery_local_readiness_pipeline.py` so compact pipeline summaries surface `prodBenchmarkReviewPacket` status and prompt counts from the nested readiness report.
- Added focused test coverage for the summary field.
- Docker pipeline smoke with a synthetic prod review packet and `--skip-benchmark-comparison`:
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.8ms`
  - prod benchmark review packet status: `pass`
  - supported prompt count: 1
  - future prompt count: 1
  - readiness status: `incomplete`
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py scripts/build_discovery_local_readiness_report.py scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_prod_packet_summary_smoke --state-dir /tmp/build_discovery_local_readiness_state --prod-benchmark-review-packet /tmp/prod_review_packet_summary_smoke.json --skip-benchmark-comparison`
  - `git diff --check`

### 2026-07-09 Prod Review Packet Limits

- Created stacked branch `codex/build-discovery-prod-review-packet-limits` on top of `codex/build-discovery-prod-review-packet-summary`.
- Added hard bounds to prod benchmark review packet prompt limits.
- Added `--review-supported-limit` and `--review-future-limit` to `server/scripts/build_discovery_prod_benchmark_pipeline.py`.
- The prod pipeline now passes those review limits through to `prod_benchmark_review_packet.json`.
- `--check-env` remains connection-free and accepts the new limit flags without opening prod.
- Verification passed:
  - `python server\scripts\test_build_discovery_prod_benchmark_review_packet.py`
  - `python server\scripts\test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_prod_benchmark_review_packet.py scripts/test_build_discovery_prod_benchmark_review_packet.py scripts/build_discovery_prod_benchmark_pipeline.py scripts/test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_prod_benchmark_review_packet.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_prod_benchmark_pipeline.py --check-env --review-supported-limit 1 --review-future-limit 1`
  - `git diff --check`

### 2026-07-09 Async Job Docker Smoke

- Created stacked branch `codex/build-discovery-async-smoke` on top of `codex/build-discovery-assumptions-refresh`.
- Added Docker-runnable async smoke script:
  - clears the app-cache key for a bounded Strength Iop query
  - calls `startBuildDiscovery`
  - asserts a queued job is returned on cache miss
  - captures the intended enqueue call without leaving an RQ job behind
  - runs the captured worker task against that job id
  - calls `buildDiscoveryJob(id)`
  - asserts the job succeeds with nonempty builds
- Applied local Docker migrations through `395c1a10243a` before the smoke.
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 flask db current` reported `395c1a10243a (head)`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_async_smoke.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_job_persistence.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_async_smoke.py app/schema.py app/tasks.py`
  - `git diff --check`
- Residual note:
  - local Docker emitted Datadog trace-send warnings because no local intake is running; the smoke itself passed.

### 2026-07-09 Fresh Local Suite Measurement

- Created stacked branch `codex/build-discovery-fresh-suite-measurement` on top of `codex/build-discovery-async-smoke`.
- Regenerated a current Docker DB-backed Build Discovery index:
  - 3753 items
  - 519 sets
- Re-ran the local Iop element/profile fresh suite with `--runs 1 --no-cache`.
- Recorded compact timing evidence in `.codex/state/build-discovery-fresh-suite-measurement.md`.
- Result:
  - overall status remains `fail` at the 5000ms p95 threshold
  - every row returned at least one build
  - 7 of 8 rows exceeded 5000ms
  - worst row was 12/6/0 Intelligence at 12558.5ms
- Interpretation:
  - fresh synchronous serving is not currently shippable for the supported matrix
  - app-cache misses should stay on the async job path unless slow rows are optimized substantially
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.generate_build_discovery_index --output /tmp/build_discovery_index_current.json --source db`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.build_discovery_query_perf --index-path /tmp/build_discovery_index_current.json --validate-local-suite --runs 1 --no-cache --output /tmp/build_discovery_fresh_suite_report.json --fixture-output /tmp/build_discovery_fresh_suite_fixture.json` wrote artifacts and exited nonzero due to expected threshold failures

### 2026-07-09 Prod Discovery Env Preflight

- Created stacked branch `codex/build-discovery-prod-env-preflight` on top of `codex/build-discovery-fresh-suite-measurement`.
- Added `--check-env` to the bounded prod benchmark discovery helper:
  - reports whether `DOFUSLAB_READONLY_DATABASE_URL` is present
  - reports whether SQLAlchemy is available
  - does not open a database connection
  - does not print the database URL
- Confirmed current runtime state:
  - host shell: `DOFUSLAB_READONLY_DATABASE_URL` missing
  - running `dofuslab-server-1` container: `DOFUSLAB_READONLY_DATABASE_URL` missing

### 2026-07-09 Cache Prewarm Tool

- Created stacked branch `codex/build-discovery-cache-prewarm` on top of `codex/build-discovery-prod-env-preflight`.
- Added Docker-runnable cache prewarm tooling for the supported local Iop suite:
  - `server/scripts/build_discovery_cache_prewarm.py`
  - warms 11/6/0 and 12/6/0 Strength, Intelligence, Chance, and Agility queries through the real app-cache path
  - writes a compact JSON report when `--output` is provided
- Added focused prewarm report tests in `server/scripts/test_build_discovery_cache_prewarm.py`.
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_cache_prewarm.py scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_cache_prewarm.py --output /tmp/build_discovery_cache_prewarm_report.json`
  - second prewarm run against warmed cache reported `status=pass`, `cacheHits=8`, `cacheMisses=0`, `emptyResults=0`, and max observed row elapsed `137.1ms`
  - `git diff --check`

### 2026-07-09 Benchmark Artifact Scoring

- Created stacked branch `codex/build-discovery-benchmark-artifact-scoring` on top of `codex/build-discovery-cache-prewarm`.
- Fixed benchmark view scoring to use the solver hard caps for equip caps instead of the requested AP/MP/Range target:
  - the requested target remains the condition target
  - surplus AP/MP/Range up to hard caps is allowed during benchmark ingestion
  - this matches the current product assumption that surplus action stats are useful but lightly weighted
- Added a regression test that a benchmark item can carry AP above the requested AP target when still within hard caps.
- Produced a compact accepted human-reference artifact in `.codex/state/build-discovery-benchmark-artifact.md`.
- Current Docker benchmark report result:
  - 5 benchmarks
  - 0 errors
  - generated-vs-benchmark comparison not yet included
- Verification passed:
  - `python scripts\test_build_discovery_benchmark_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile oneoff/score_dofuslab_view.py oneoff/build_discovery_benchmark_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.build_discovery_benchmark_report --allow-errors --output /tmp/build_discovery_benchmark_report_current.json`
  - `git diff --check`

### 2026-07-09 Generated Benchmark Comparisons

- Created stacked branch `codex/build-discovery-generated-benchmark-comparison` on top of `codex/build-discovery-benchmark-artifact-scoring`.
- Updated benchmark report tooling so generated outputs can be keyed per benchmark id instead of applying one generated result file to every benchmark.
- Added `server/scripts/build_discovery_benchmark_generated_results.py` to produce benchmark-keyed generated outputs from the benchmark catalog.
- Produced a current generated-vs-human comparison artifact:
  - 5 benchmarks
  - 0 scoring errors
  - budget tier 4, `exoPolicy=opti`
  - generated output beat 3 references and trailed 2 references under current scoring
- Verification passed:
  - `python scripts\test_build_discovery_benchmark_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile oneoff/build_discovery_benchmark_report.py scripts/build_discovery_benchmark_generated_results.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_benchmark_generated_results.py --output /tmp/build_discovery_benchmark_generated_results.json`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.build_discovery_benchmark_report --generated-results /tmp/build_discovery_benchmark_generated_results.json --allow-errors --output /tmp/build_discovery_benchmark_comparison_report.json`
  - `git diff --check`

### 2026-07-09 Direct Query Deprecation

- Created stacked branch `codex/build-discovery-deprecate-direct-query` on top of `codex/build-discovery-generated-benchmark-comparison`.
- Removed the unused frontend direct `buildDiscovery` query operation and `useBuildDiscoveryQuery` hook.
- Switched the shared query-input helper type to the async `startBuildDiscovery` mutation variables.
- Marked the backend `buildDiscovery` GraphQL field deprecated with guidance to use `startBuildDiscovery` plus `buildDiscoveryJob`.
- Decision:
  - product/client flow is async-first
  - direct `buildDiscovery` remains only as a legacy/dev GraphQL path for now
- Verification passed:
  - `cd client; yarn type-check`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile app/schema.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -c "import app.schema; print('schema import ok')"`
  - `git diff --check`

### 2026-07-09 Benchmark Regression Fixture

- Created stacked branch `codex/build-discovery-benchmark-regression-fixture` on top of `codex/build-discovery-deprecate-direct-query`.
- Added a compact generated-vs-human benchmark comparison fixture:
  - `server/oneoff/fixtures/build_discovery_benchmark_comparison_fixture.json`
  - records accepted statuses and scores for the current five Strength Iop benchmark refs
  - uses a 1.0 score tolerance to make drift explicit without committing full live report payloads
- Added `server/scripts/check_build_discovery_benchmark_comparison.py` to validate a full comparison report against the compact fixture.
- Added focused checker tests in `server/scripts/test_build_discovery_benchmark_comparison_fixture.py`.
- Verification passed:
  - `python server\scripts\test_build_discovery_benchmark_comparison_fixture.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/check_build_discovery_benchmark_comparison.py scripts/test_build_discovery_benchmark_comparison_fixture.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/check_build_discovery_benchmark_comparison.py /tmp/build_discovery_benchmark_comparison_report.json`
  - `git diff --check`

### 2026-07-09 Generated Data Retention Policy

- Created stacked branch `codex/build-discovery-generated-data-retention-policy` on top of `codex/build-discovery-benchmark-regression-fixture`.
- Documented generated data retention in `.codex/state/build-discovery-generated-data-retention.md`.
- Decision:
  - generated preview/job output is disposable execution data
  - imported generated custom sets are user-owned saved builds
  - `GenerationRequest` rows attached to existing custom sets are durable provenance
  - future cleanup should start as explicit dry-run tooling and target only orphan/duplicate/legacy anomalies
  - generated-looking legacy custom sets without provenance are audit/backfill/classification candidates, not cleanup targets
- Verification passed:
  - `git diff --check`

### 2026-07-09 Async Performance Acceptance

- Created stacked branch `codex/build-discovery-async-performance-acceptance` on top of `codex/build-discovery-generated-data-retention-policy`.
- Documented the current performance decision in `.codex/state/build-discovery-performance-acceptance.md`.
- Decision:
  - fresh synchronous Build Discovery remains above the original 5000 ms p95 threshold
  - this is accepted only because product/client serving is async-first for misses
  - synchronous responses are appropriate for app-cache hits
  - direct fresh synchronous `buildDiscovery` remains legacy/dev and should not be treated as shippable
- Verification passed:
  - `git diff --check`

### 2026-07-09 v1 Scope Boundary

- Created stacked branch `codex/build-discovery-v1-scope-boundary` on top of `codex/build-discovery-async-performance-acceptance`.
- Documented the v1 Iop-only support boundary in `.codex/state/build-discovery-v1-scope-boundary.md`.
- Decision:
  - non-Iop generated queries are not supported in v1
  - unsupported classes should continue to be rejected instead of returning low-confidence builds
  - adding another class requires a separate modeling milestone with class assumptions, benchmarks, validation, and product review
- Existing coverage noted:
  - `BuildDiscoveryQuery(class_name="Cra").validate()` rejection
  - GraphQL `buildDiscovery(className: "Cra", ...)` rejection
  - client query input narrows `className` to `Iop`
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py BuildDiscoveryPrototypeTest.test_build_discovery_query_rejects_out_of_scope_inputs`
  - `cd client; yarn type-check`
  - `git diff --check`
- Verification note:
  - host `scripts\test_build_discovery_graphql.py BuildDiscoveryGraphQLTest.test_build_discovery_query_rejects_out_of_scope_class` could not run because host Python is missing `dogpile`; the test remains present in the suite.

### 2026-07-09 Action Stat Score Test Maintenance

- Created stacked branch `codex/build-discovery-action-stat-score-test` on top of `codex/build-discovery-v1-scope-boundary`.
- Updated `test_score_state_treats_mp_and_range_as_small_feasibility_hints` to derive the expected delta from:
  - added MP/Range stat score over the default base state
  - removed MP/Range target-gap penalties
- This keeps the test aligned with the current target semantics where AP/MP/Range are minimum targets with light surplus scoring.
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `git diff --check`

### 2026-07-09 Prod Query Candidates

- Created stacked branch `codex/build-discovery-prod-query-candidates` on top of `codex/build-discovery-action-stat-score-test`.
- Extended the bounded read-only prod benchmark discovery report so each popular aggregate profile includes `generatedQueryCandidate`:
  - supported v1 profiles include the exact generated query shape to run
  - unsupported profiles include explicit reasons, such as non-Iop class or AP/MP/Range bounds
- Fixed prod aggregate AP/MP interpretation for query candidates:
  - discovery SQL reports equipped item/exo AP and MP bonuses
  - profile buckets and generated-query targets now add base 7 AP and 3 MP before comparing to Build Discovery bounds
- This does not connect to prod without `DOFUSLAB_READONLY_DATABASE_URL`; it makes the eventual prod aggregate output directly actionable for generated comparisons once access is available.
- Verification passed:
  - `python scripts\test_build_discovery_prod_benchmark_discovery.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile oneoff/build_discovery_prod_benchmark_discovery.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python oneoff/build_discovery_prod_benchmark_discovery.py --check-env`
  - `git diff --check`

### 2026-07-09 Prod Candidate Generated Results

- Created stacked branch `codex/build-discovery-prod-candidate-results` on top of `codex/build-discovery-prod-query-candidates`.
- Added `server/scripts/build_discovery_prod_candidate_generated_results.py`.
- The script consumes a prod discovery JSON report and:
  - runs generated Build Discovery outputs for supported `generatedQueryCandidate` profiles
  - keeps unsupported prod profiles visible as skipped candidates with reasons
  - skips malformed supported candidates instead of defaulting missing query fields
  - enforces a bounded candidate limit
  - does not connect to prod itself
- Added focused tests in `server/scripts/test_build_discovery_prod_candidate_generated_results.py`.
- Verification passed:
  - `python server\scripts\test_build_discovery_prod_candidate_generated_results.py`
  - `python scripts\test_build_discovery_prod_benchmark_discovery.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_prod_candidate_generated_results.py scripts/test_build_discovery_prod_candidate_generated_results.py`
  - `git diff --check`

### 2026-07-09 Prod Benchmark Pipeline

- Created stacked branch `codex/build-discovery-prod-benchmark-pipeline` on top of `codex/build-discovery-prod-candidate-results`.
- Added `server/scripts/build_discovery_prod_benchmark_pipeline.py`.
- The pipeline:
  - prints non-secret preflight status with `--check-env` without opening a prod connection
  - runs bounded prod aggregate discovery when `DOFUSLAB_READONLY_DATABASE_URL` is available
  - runs generated results for supported prod candidates
  - writes stable artifact names under an output directory
  - writes a compact summary with generated/skipped counts and artifact paths
- Added focused tests in `server/scripts/test_build_discovery_prod_benchmark_pipeline.py`.
- Verification passed:
  - `python server\scripts\test_build_discovery_prod_benchmark_pipeline.py`
  - `python server\scripts\test_build_discovery_prod_candidate_generated_results.py`
  - `python scripts\test_build_discovery_prod_benchmark_discovery.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_prod_benchmark_pipeline.py scripts/test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_prod_benchmark_pipeline.py --check-env`
  - `git diff --check`

### 2026-07-09 Gameplay Review Packet

- Created stacked branch `codex/build-discovery-gameplay-review-packet` on top of `codex/build-discovery-prod-benchmark-pipeline`.
- Added `.codex/state/build-discovery-gameplay-review-packet.md` as a compact gameplay/product review checklist.
- Refreshed stale assumptions:
  - direct `buildDiscovery` is now documented as deprecated legacy/dev path
  - fresh sync p95 remains above 5s locally; async misses are the accepted product path
- Verification passed:
  - `git diff --check`

### 2026-07-09 Cache Prewarm Readiness Gates

- Created stacked branch `codex/build-discovery-cache-prewarm-readiness` on top of `codex/build-discovery-gameplay-review-packet`.
- Extended `server/scripts/build_discovery_cache_prewarm.py` with optional readiness gates:
  - `--require-all-hits` fails unless every supported row is already an app-cache hit
  - `--max-hit-elapsed-ms` fails when any cache-hit row exceeds the given warmed-cache latency threshold
- Kept ordinary prewarm behavior unchanged for first-pass warming.
- Added focused tests in `server/scripts/test_build_discovery_cache_prewarm.py`.
- Strict warmed-cache gate result:
  - `status=pass`
  - `rowCount=8`
  - `cacheHits=8`
  - `cacheMisses=0`
  - `emptyResults=0`
  - max row elapsed `137.0ms`
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_cache_prewarm.py scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_cache_prewarm.py --output /tmp/build_discovery_cache_prewarm_readiness_warm.json`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_cache_prewarm.py --require-all-hits --max-hit-elapsed-ms 500 --output /tmp/build_discovery_cache_prewarm_readiness_strict.json`
  - `git diff --check`

### 2026-07-09 Cache Prewarm p95 Reporting

- Created stacked branch `codex/build-discovery-cache-prewarm-p95` on top of `codex/build-discovery-cache-prewarm-readiness`.
- Extended cache prewarm reports with elapsed summaries:
  - all rows: count, min, average, nearest-rank p95, max
  - cache-hit rows: count, min, average, nearest-rank p95, max
- Added `--max-hit-p95-ms` to fail strict warmed-cache checks when cache-hit p95 exceeds a threshold.
- Added focused tests for elapsed summary and p95 gating.
- Strict warmed-cache p95 gate result:
  - `status=pass`
  - `cacheHits=8`
  - `cacheMisses=0`
  - `emptyResults=0`
  - cache-hit p95 `156.4ms`
  - cache-hit max `156.4ms`
- Verification passed:
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_cache_prewarm.py scripts/test_build_discovery_cache_prewarm.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_cache_prewarm.py --output /tmp/build_discovery_cache_prewarm_p95_warm.json`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_cache_prewarm.py --require-all-hits --max-hit-p95-ms 500 --max-hit-elapsed-ms 500 --output /tmp/build_discovery_cache_prewarm_p95_strict.json`
  - `git diff --check`

### 2026-07-09 Local Readiness Report

- Created stacked branch `codex/build-discovery-local-readiness-report` on top of `codex/build-discovery-cache-prewarm-p95`.
- Added `server/scripts/build_discovery_local_readiness_report.py`.
- The report summarizes:
  - open readiness checklist items
  - gameplay review packet presence
  - cache prewarm report status and cache-hit p95 threshold
  - optional benchmark comparison fixture validation
  - prod preflight without opening a prod connection
- The report status remains `incomplete` while prod access and gameplay review are unresolved.
- Added focused tests in `server/scripts/test_build_discovery_local_readiness_report.py`.
- Host report result:
  - `status=incomplete`
  - open readiness items: 4
  - gameplay review packet exists
  - prod readonly database URL is unavailable
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `python server\scripts\build_discovery_local_readiness_report.py --output .codex/state/build-discovery-local-readiness-report.json`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_report.py scripts/test_build_discovery_local_readiness_report.py`
  - `git diff --check`
- Generated `.codex/state/build-discovery-local-readiness-report.json` was not committed because it contains machine-specific absolute paths.

### 2026-07-09 Local Readiness Pipeline

- Created stacked branch `codex/build-discovery-local-readiness-pipeline` on top of `codex/build-discovery-local-readiness-report`.
- Added `server/scripts/build_discovery_local_readiness_pipeline.py`.
- The pipeline writes stable local readiness artifacts:
  - warm cache prewarm report
  - strict warmed-cache prewarm report with p95 and max-hit gates
  - local readiness report using the strict cache artifact
  - compact summary with artifact paths, cache status, readiness status, and blockers
- Added focused tests in `server/scripts/test_build_discovery_local_readiness_pipeline.py`.
- Docker pipeline result with `.codex/state` files copied into `/tmp` because the server container does not mount repo-level `.codex` by default:
  - warm cache status: `pass`
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.7ms`
  - readiness status: `incomplete`
  - remaining blockers: gameplay review and prod benchmark access/work
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py scripts/build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_local_readiness_pipeline --readiness-checklist /tmp/build_discovery_local_readiness_state/build-discovery-readiness-checklist.md --gameplay-review-packet /tmp/build_discovery_local_readiness_state/build-discovery-gameplay-review-packet.md`
  - `git diff --check`

### 2026-07-09 Assumptions Readiness Surface

- Created stacked branch `codex/build-discovery-assumptions-readiness-surface` on top of `codex/build-discovery-local-readiness-pipeline`.
- Extended `server/scripts/build_discovery_local_readiness_report.py` with an `assumptionsReview` section:
  - assumptions ledger path and existence
  - assumptions ledger section count
  - assumptions ledger bullet count
  - gameplay review packet question count
- The readiness report now blocks on a missing assumptions ledger instead of silently omitting it.
- Extended `server/scripts/build_discovery_local_readiness_pipeline.py` so pipeline summaries surface `assumptionsReview` directly.
- Added focused tests for assumptions counting and pipeline pass-through.
- Host readiness report result:
  - readiness status: `incomplete`
  - assumptions ledger exists
  - assumptions sections: 17
  - assumptions bullets: 181
  - gameplay review questions: 15
- Docker pipeline result with state files copied into `/tmp`:
  - warm cache status: `pass`
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.7ms`
  - readiness status: `incomplete`
  - assumptions sections: 17
  - assumptions bullets: 181
  - gameplay review questions: 15
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_report.py scripts/test_build_discovery_local_readiness_report.py scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_local_readiness_pipeline --readiness-checklist /tmp/build_discovery_local_readiness_state/build-discovery-readiness-checklist.md --gameplay-review-packet /tmp/build_discovery_local_readiness_state/build-discovery-gameplay-review-packet.md --assumptions-ledger /tmp/build_discovery_local_readiness_state/build-discovery-assumptions.md`
  - `git diff --check`

### 2026-07-09 Local Benchmark Readiness Pipeline

- Created stacked branch `codex/build-discovery-local-benchmark-readiness-pipeline` on top of `codex/build-discovery-assumptions-readiness-surface`.
- Extended `server/scripts/build_discovery_local_readiness_pipeline.py` so local readiness evidence now includes benchmark artifacts by default:
  - generated benchmark Build Discovery results
  - DofusLab reference comparison report
  - compact fixture validation failures
  - readiness report wired to the benchmark comparison artifact
- Added `--skip-benchmark-comparison` for faster local evidence runs that only need cache/readiness state.
- Pipeline summaries now distinguish skipped benchmark artifacts from written benchmark artifacts.
- Added focused tests for benchmark artifact writing, fixture pass-through, summary statuses, and skip behavior.
- Docker full pipeline result:
  - warm cache status: `pass`
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.7ms`
  - benchmark generated status: `pass`
  - benchmark comparison status: `pass`
  - benchmark validation failures: 0
  - readiness status: `incomplete`
  - remaining blockers: gameplay review and prod benchmark access/work
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py scripts/build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_local_readiness_pipeline_full --readiness-checklist /tmp/build_discovery_local_readiness_state/build-discovery-readiness-checklist.md --gameplay-review-packet /tmp/build_discovery_local_readiness_state/build-discovery-gameplay-review-packet.md --assumptions-ledger /tmp/build_discovery_local_readiness_state/build-discovery-assumptions.md`
  - `git diff --check`

### 2026-07-09 Local Readiness State Directory

- Created stacked branch `codex/build-discovery-local-readiness-state-dir` on top of `codex/build-discovery-local-benchmark-readiness-pipeline`.
- Added `--state-dir` to `server/scripts/build_discovery_local_readiness_pipeline.py`.
- A state directory can now provide:
  - `build-discovery-readiness-checklist.md`
  - `build-discovery-gameplay-review-packet.md`
  - `build-discovery-assumptions.md`
- Explicit file path flags still override the state directory.
- Added focused test coverage for the expected state-directory filenames.
- Docker full pipeline result using `--state-dir /tmp/build_discovery_local_readiness_state`:
  - warm cache status: `pass`
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.8ms`
  - benchmark generated status: `pass`
  - benchmark comparison status: `pass`
  - benchmark validation failures: 0
  - readiness status: `incomplete`
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_local_readiness_pipeline_state_dir --state-dir /tmp/build_discovery_local_readiness_state`
  - `git diff --check`

### 2026-07-09 Assumptions Review Index

- Created stacked branch `codex/build-discovery-assumptions-review-index` on top of `codex/build-discovery-local-readiness-state-dir`.
- Added `.codex/state/build-discovery-assumptions-review-index.md`.
- The index extracts the highest-risk assumptions into a short review surface:
  - budget tier boundaries
  - exo policy semantics
  - AP/MP/Range surplus semantics
  - Iop element quality
  - special-effect modeling
  - benchmark representativeness
- It also lists shippability watch items for fresh synchronous performance, generated data cleanliness, v1 scope boundary, and prod benchmark safety.
- Verification passed:
  - `git diff --check`

### 2026-07-09 Review Index Readiness

- Created stacked branch `codex/build-discovery-review-index-readiness` on top of `codex/build-discovery-assumptions-review-index`.
- Extended `server/scripts/build_discovery_local_readiness_report.py` so `assumptionsReview` includes the compact review index:
  - review index path and existence
  - release blocker count
  - shippability watch item count
- The readiness report now blocks on a missing assumptions review index.
- Extended `server/scripts/build_discovery_local_readiness_pipeline.py` so `--state-dir` includes `build-discovery-assumptions-review-index.md`.
- Added focused tests for section item counting and review-index state-dir path resolution.
- Docker full pipeline result with review index in `--state-dir`:
  - warm cache status: `pass`
  - strict cache status: `pass`
  - strict cache hits: 8
  - strict cache misses: 0
  - strict cache-hit p95: `0.7ms`
  - benchmark generated status: `pass`
  - benchmark comparison status: `pass`
  - benchmark validation failures: 0
  - review index release blockers: 6
  - review index watch items: 4
  - readiness status: `incomplete`
- Verification passed:
  - `python server\scripts\test_build_discovery_local_readiness_report.py`
  - `python server\scripts\test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_local_readiness_report.py scripts/test_build_discovery_local_readiness_report.py scripts/build_discovery_local_readiness_pipeline.py scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_report.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_local_readiness_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_local_readiness_pipeline.py --output-dir /tmp/build_discovery_review_index_readiness --state-dir /tmp/build_discovery_local_readiness_state`
  - `git diff --check`

### 2026-07-09 Action Stat Scoring Guard

- Created stacked branch `codex/build-discovery-action-stat-scoring-guard` on top of `codex/build-discovery-review-index-readiness`.
- Added `server/scripts/test_build_discovery_action_stat_scoring.py`.
- The guard covers the user-facing AP/MP/Range target semantics:
  - AP/MP/Range are minimum targets, not exact targets
  - surplus inside hard caps is valid
  - over-cap action stats are invalid
  - surplus AP/MP/Range utility is capped and remains a light score delta
- Current scored surplus delta from 11/6/0 to 12/6/6 is `60`.
- Over-cap action stats do not add more utility score than capped action stats.
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_scoring.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_action_stat_scoring.py`
  - `git diff --check`

### 2026-07-09 Prod Readonly Compose Env

- Created stacked branch `codex/build-discovery-prod-readonly-compose-env` on top of `codex/build-discovery-action-stat-scoring-guard`.
- Updated `docker-compose.yml` to pass `DOFUSLAB_READONLY_DATABASE_URL` through to the `server` and `worker` containers when the variable exists in the host environment.
- No secret value is committed; the Compose default is empty.
- This keeps prod benchmark discovery blocked by default, but makes the intended readonly env wiring explicit for local Docker runs.
- Verification passed:
  - `docker compose config`
  - `git diff --check`

### 2026-07-09 Prod Benchmark Review Packet

- Created stacked branch `codex/build-discovery-prod-benchmark-review-packet` on top of `codex/build-discovery-prod-readonly-compose-env`.
- Added `server/scripts/build_discovery_prod_benchmark_review_packet.py`.
- The packet converts aggregate prod discovery profiles into a compact review artifact:
  - supported generated benchmark prompts
  - future benchmark prompts that are currently unsupported
  - generated query payloads where supported
  - unsupported reasons where not supported
  - common aggregate items per profile
- The packet does not connect to prod and does not expose custom set IDs, names, or owners.
- Extended `server/scripts/build_discovery_prod_benchmark_pipeline.py` so prod pipeline runs now write:
  - `prod_benchmark_discovery.json`
  - `prod_candidate_generated_results.json`
  - `prod_benchmark_review_packet.json`
  - `prod_benchmark_pipeline_summary.json`
- Pipeline summaries now include supported/future benchmark prompt counts.
- Verification passed:
  - `python server\scripts\test_build_discovery_prod_benchmark_review_packet.py`
  - `python server\scripts\test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python -m py_compile scripts/build_discovery_prod_benchmark_review_packet.py scripts/test_build_discovery_prod_benchmark_review_packet.py scripts/build_discovery_prod_benchmark_pipeline.py scripts/test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_prod_benchmark_review_packet.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/test_build_discovery_prod_benchmark_pipeline.py`
  - `docker exec -w /home/dofuslab dofuslab-server-1 python scripts/build_discovery_prod_benchmark_pipeline.py --check-env`
  - `git diff --check`

### 2026-07-09 Prod Review Packet Readiness

- Created stacked branch `codex/build-discovery-prod-review-packet-readiness` on top of `codex/build-discovery-prod-benchmark-review-packet`.
- Updated `.codex/state/build-discovery-readiness-checklist.md` to mark aggregate prod benchmark review packet tooling as present.
- Kept actual prod access, prod aggregate selection, and discovered-build scoring/comparison open.
- Verification passed:
  - `git diff --check`

### 2026-07-10 Level-Aware Query Contract

- Started the Milestone 3 any-level Iop expansion with the query/target
  contract instead of solver scoring.
- Added `base_ap_for_level(level)`:
  - levels `1-99` have baseline AP `6`
  - levels `100-200` have baseline AP `7`
- `BuildDiscoveryQuery.validate()` now accepts Iop levels `1-200` and rejects
  level `0` / `201`.
- `BuildTarget` now carries the level-specific AP minimum so sub-100 queries can
  request `6/3/0` while level 100+ queries still reject AP below `7`.
- `rangeTarget=None` is accepted at the query level and currently normalizes to
  `0` for target construction; true "any Range, even negative" solver semantics
  still need to be threaded through final validation.
- `targetSemantics` now reports the level-dependent AP minimums.
- The initial contract checkpoint guarded non-200 response execution so the old
  level-200 solver could not silently return mislabeled lower-level builds.
- This checkpoint does not prove non-200 solver quality yet. Remaining level
  work includes level-specific base stats during search, candidate item loading,
  index bucket use, spell selection, sampled benchmark rows, and generated build
  review.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py server\scripts\test_build_discovery_query_contract.py`

### 2026-07-10 Level-Threaded Solver Entry

- Threaded query level into `BuildTarget`, item/index candidate filtering, AP
  strategy helpers, exo search targets, base-stat defaults for new
  `BuildState()` seeds, base allocation, and response prototype metadata.
- Non-200 response execution is no longer blocked after the level context is
  installed.
- Added cheap coverage that:
  - level 50 response construction passes `target.level=50` and `min_ap=6` into
    the solver
  - level 50 candidate loading asks the generated index for level 50 candidates
    and excludes level 200 gear
  - `BuildState()` starts at AP 6 inside a level 50 context and returns to AP 7
    afterward
- Real local smoke results with intentionally small search limits:
  - Level 50 Strength Iop `6/3/None`, tier 1, no exo: no build found in 1340.9
    ms. Candidate pools showed no pet/mount item at level 50, so optional empty
    pet-slot handling is a likely next recall fix.
  - Level 60 Strength Iop `9/3/None`, tier 1, no exo: found one build in
    30153.9 ms with totals `9/5/6`.
  - Level 100 Strength Iop `7/3/None`, tier 1, no exo: no build found in 523.9
    ms. Needs AP-baseline/trophy transition investigation.
- Remaining caveat: `rangeTarget=None` still normalizes to `0` for final target
  checks; true "any Range, even negative" remains open.

### 2026-07-10 Optional Empty Pet Slot

- Treated the `pet` slot as optional when no Pet/Petsmount/Mount candidates are
  available for the target level and budget.
- This fixes an early-level recall gap where level 50 had no legal pet/mount
  pool, causing direct completion and slot-order search beams to collapse.
- The slot remains required when pet/mount candidates are available.
- Added cheap coverage for optional pet-slot behavior.
- Real local smoke after the fix:
  - Level 50 Strength Iop `6/3/None`, tier 1, no exo, small search:
    resultCount `1`, elapsed `6386.3` ms, totals `9/3/6`.
    Items: Arachnamu, Dazzling Belt, Ogralimde's Sword, Pippin Blop Ring,
    Treering, Black Wab Boots, Champo, Treecloak, Treechnid Shield, Minor
    Rabid, Minor Miracle Man, Minor Earth Devastator, Minor Vigour, Minor Earth
    Wrecker, Minor Friction.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py server\scripts\test_build_discovery_query_contract.py`
  - `git diff --check`

### 2026-07-10 Level-Aware Relevant Set Items

- Fixed another level-diversity recall gap: `candidate_pool_for_slot()` only
  admitted relevant set items at level `180+`, which dropped useful level-100
  set items such as Bwork Chief Bracelet.
- The relevant-set item threshold is now level-aware:
  - below level 180, relevant set items at the target level are allowed
  - at level 180+, the original endgame pruning behavior remains
- Added cheap coverage that a level-100 relevant set ring remains in the ring
  candidate pool alongside Gelano.
- Real local smoke after the fix:
  - Level 100 Strength Iop `7/3/None`, tier 1, no exo, small search:
    resultCount `1`, elapsed `9416.3` ms, totals `9/4/2`.
    Items: Dragon Pig Necklace, Krosmastrap, Pink Claw, Dragokart Cup, Bwork
    Chief Bracelet, Gelano, Krosmaboots, Bwork Chief Helmet, Boowoldlum Cloak,
    Ivory and Crimson Dragoturkey, Rabid, Miracle Man, Earth Devastator, Vigour,
    Earth Wrecker, Observer.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py server\scripts\test_build_discovery_query_contract.py`

### 2026-07-10 Level Diversity Smoke Matrix

- Added `server/scripts/test_build_discovery_level_diversity_generation_smoke.py`.
- The matrix encodes the 27 prod-derived Iop level-diversity targets currently
  listed in the PRD/state notes, with rotating elements and budget tiers.
- The generation test is opt-in through
  `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1`.
- The matrix can be sliced with:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_ELEMENTS`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_BUDGET_TIERS`
- Added a sub-180 flexible AP strategy so lower-level builds are not rejected
  solely because their AP sources do not match endgame AP assumptions such as an
  AP amulet.
- Verified first matrix rows:
  - `level_50_strength_7_3_1_budget1`
  - `level_100_strength_12_5_none_budget2`
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke scripts.test_build_discovery_query_contract"`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS=level_50_strength_7_3_1_budget1 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS=level_100_strength_12_5_none_budget2 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
  - `git diff --check`

### 2026-07-10 Sub-180 Flexible AP Sources

- Added `level_diversity_flexible_ap` for targets below level 180.
- This avoids rejecting otherwise valid lower-level builds merely because they
  do not use the endgame AP-source shape.
- Confirmed the first matrix rows now pass:
  - `level_50_strength_7_3_1_budget1`
  - `level_100_strength_12_5_none_budget2`
- Ran the level 50/60 matrix slice. Remaining failing rows:
  - `level_60_strength_10_4_2_budget2`
  - `level_60_intelligence_10_4_3_budget2`
  - `level_60_agility_9_3_none_budget1`
- Level 60 catalog inspection shows many AP, MP, and Range sources exist, so the
  next issue is search recall/strategy coverage rather than missing source data.

### 2026-07-10 Level 50/60 Matrix Green

- Increased the opt-in Level Diversity smoke width to `top_k=25`,
  `beam_width=100`, `per_signature_cap=10`, and `relevant_set_limit=40`.
- Fixed the remaining level 60 Agility row by filtering budget action gear seeds
  that already have unmet item conditions.
- Root cause: high-scoring Agility seeds used Cruel Trovel, whose condition
  requires `MP < 5`; those seeds already had MP 6 and could never become valid,
  but crowded out valid AP/MP paths.
- Verified the full level 50/60 slice now passes:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=50,60 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Focused checks also passed:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS=level_60_agility_9_3_none_budget1 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract scripts.test_build_discovery_level_diversity_generation_smoke"`

### 2026-07-10 Level 80/100 Matrix Green

- Verified the next level-diversity slice:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=80,100 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Result: pass in 104.622 seconds.
- Passing rows in this slice:
  - `level_80_agility_10_5_1_budget2`
  - `level_80_strength_9_5_2_budget1`
  - `level_100_strength_12_5_none_budget2`

### 2026-07-10 Level 120/150 Matrix Green

- Verified the next level-diversity slice:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=120,150 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Result: pass in 353.316 seconds.
- Passing rows in this slice:
  - `level_120_intelligence_11_5_1_budget2`
  - `level_120_chance_12_5_1_budget3`
  - `level_120_agility_11_4_1_budget1`
  - `level_150_strength_9_4_2_budget1`
  - `level_150_intelligence_12_5_2_budget3`
  - `level_150_chance_12_4_2_budget2`
  - `level_150_agility_11_5_2_budget2`

### 2026-07-10 Level 160 Matrix Green

- Verified the next level-diversity slice:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=160 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Result: pass in 477.634 seconds.
- Passing rows in this slice:
  - `level_160_strength_12_5_3_budget3`
  - `level_160_intelligence_12_5_2_budget2`
  - `level_160_chance_11_6_none_budget3`
  - `level_160_agility_12_6_3_budget4`

### 2026-07-10 Level 180 Previous Bucket Recall Fix

- The level 180 row initially failed with zero builds:
  - `level_180_strength_12_5_3_budget3`
- Root cause: indexed normal gear included only the current `180-200` bucket.
  At the level 180 transition, that starved the pool of normal level `150-179`
  gear and left key slots such as amulet, belt, and cloak empty.
- Fixed indexed candidate selection to include normal gear from the target
  bucket and the immediately previous bucket, matching the PRD's level-diversity
  candidate horizon.
- Added cheap contract coverage for current+previous normal gear buckets.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=180 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Level 180 smoke result: pass in 217.092 seconds.

### 2026-07-10 Level 199 Matrix Green

- Verified the final planned level-diversity slice:
  - `BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=199 python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversityGenerationSmokeTest`
- Result: pass in 522.274 seconds.
- Passing rows in this slice:
  - `level_199_strength_12_6_2_budget4`
  - `level_199_intelligence_12_5_2_budget3`
  - `level_199_chance_10_6_3_budget2`
  - `level_199_agility_10_5_2_budget2`
  - `level_199_strength_12_6_5_budget4`

### 2026-07-10 Level Diversity Build Matrix Artifact

- Added `server/scripts/build_discovery_level_diversity_matrix.py` to generate
  durable JSON and Markdown review artifacts from the sampled Level Diversity
  target matrix.
- The script records full solver responses in JSON and a compact item/stat table
  in Markdown.
- Generated current artifacts:
  - `.codex/state/build-discovery-level-diversity-matrix.json`
  - `.codex/state/build-discovery-level-diversity-matrix.md`
- Artifact summary:
  - targets: 27
  - generated: 27
  - no build: 0
- Full artifact generation command:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_level_diversity_matrix.py --output-json /tmp/build-discovery-level-diversity-matrix.json --output-md /tmp/build-discovery-level-diversity-matrix.md"`
- Result: pass in 2267.1 seconds.
- Fast verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_matrix.py"`

### 2026-07-10 Level Diversity Assumptions Review Surface

- Updated `.codex/state/build-discovery-assumptions.md` to clarify that the
  generated Level Diversity matrix is a sampled correctness surface, not
  exhaustive query proof or gameplay acceptance.
- Updated `.codex/state/build-discovery-assumptions-review-index.md` to point
  reviewers at `.codex/state/build-discovery-level-diversity-matrix.md`.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_local_readiness_report.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_local_readiness_pipeline.py"`

### 2026-07-10 Level-Aware Oneoff CLI

- Added oneoff CLI support for `--level`.
- Added AP/MP/Range aliases:
  - `--ap` for `--target-ap`
  - `--mp` for `--target-mp`
  - `--range` for `--target-range`
- Added `--range none` / `--range any` parsing for queries with no explicit
  Range floor.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m oneoff.build_discovery_prototype --level 50 --element strength --ap 6 --mp 3 --range none --limit 1 --top-k 3 --beam-width 3 --per-signature-cap 1 --relevant-set-limit 3 >/tmp/build_discovery_cli_level_smoke.json"`

### 2026-07-10 Level Diversity Artifact Checker

- Added `server/scripts/check_build_discovery_level_diversity_matrix.py`.
- The checker validates that the generated matrix artifact:
  - uses the expected report version
  - includes every sampled level-diversity target exactly once
  - has zero `no_build` rows
  - records a best-build summary with core numeric totals and item names
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/check_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-level-diversity-matrix.json"`

### 2026-07-10 Prod Level Target Refresh

- Confirmed the Windows user environment contains
  `DOFUSLAB_READONLY_DATABASE_URL`; Docker needs it passed explicitly with
  `docker exec -e DOFUSLAB_READONLY_DATABASE_URL`.
- Ran the bounded readonly aggregate Iop level-target discovery again:
  - `python -m oneoff.build_discovery_prod_level_target_discovery --sample-limit 300 --top-targets 8 --class-name Iop --bucket-size 20`
- Wrote refresh artifact:
  - `.codex/state/build-discovery-prod-level-targets-iop-refresh-2026-07-10.json`
- Updated `.codex/state/build-discovery-prod-level-targets-iop.md` with uncovered
  top-three exact-level target candidates.
- Result:
  - aggregate rows: 300
  - exact levels represented: 30
  - level buckets represented: 10

### 2026-07-10 Matrix Validation Refresh

- Addressed evaluator findings:
  - moved Level Diversity target rows and `query_for_target()` out of the smoke
    test module into `server/scripts/build_discovery_level_diversity_targets.py`
  - added matrix-side best-build validation for condition failures, AP/MP/Range
    target/cap checks, and item-level caps
  - added per-row `validationErrors`, `invalid` status, and report-level
    `invalidCount`
  - added provenance fields for target source and generator script
- Regenerated:
  - `.codex/state/build-discovery-level-diversity-matrix.json`
  - `.codex/state/build-discovery-level-diversity-matrix.md`
- Result:
  - targets: 27
  - generated: 27
  - invalid: 0
  - no build: 0
- Note: `provenance.gitSha` is `null` when generated inside the server-only
  Docker mount because the container cannot see the repo root `.git` directory.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_level_diversity_generation_smoke.BuildDiscoveryLevelDiversitySmokeShapeTest"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-level-diversity-matrix-check-v2.json"`

### 2026-07-10 Level 1 Empty Slot Fix

- Boundary probe found level 1 Iop generation returned zero builds even for
  base `6/3/None` constraints.
- Root cause: the solver forced every non-empty low-level slot pool to equip an
  item. At level 1, both ring slots had only the same unique ring candidate, so
  the second ring killed the beam.
- Added low-level optional slot choices for levels `1-19`, while preserving
  strict required slot behavior from level 20 onward.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `python -m oneoff.build_discovery_prototype --level 1 --element strength --ap 6 --mp 3 --range none --budget-tier 1 --exo-policy none --limit 1 --top-k 10 --beam-width 20 --per-signature-cap 5 --relevant-set-limit 10`
- Level 1 result: one generated build, totals `6/3/0`, no warnings.

### 2026-07-10 Boundary Level Smoke Matrix

- Added `BOUNDARY_LEVEL_TARGETS` in
  `server/scripts/build_discovery_level_diversity_targets.py`.
- Added `server/scripts/test_build_discovery_level_boundary_generation_smoke.py`
  for opt-in no-cache checks around level transition edges:
  - `1`, `19`, `20`
  - `99`, `100`
  - `149`, `150`
  - `179`, `180`
  - `200`
- Verified the first boundary slice:
  - `BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=1,99 python -m unittest scripts.test_build_discovery_level_boundary_generation_smoke.BuildDiscoveryLevelBoundaryGenerationSmokeTest`
- Result: pass in 45.146 seconds.
- Cheap verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_level_boundary_generation_smoke.BuildDiscoveryLevelBoundarySmokeShapeTest"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/test_build_discovery_level_boundary_generation_smoke.py"`

### 2026-07-10 Empty Dofus Slot Boundary Fix

- Boundary slice `19,20,100` initially failed at level 20 Chance `6/3/None`.
- Root cause: empty Dofus/trophy slots were still treated as required when no
  Dofus/trophy candidates existed at early levels.
- Fixed empty Dofus slots to be optional when their pool is empty, matching pet
  slot behavior.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `python -m oneoff.build_discovery_prototype --level 20 --element chance --ap 6 --mp 3 --range none --budget-tier 1 --exo-policy none --limit 1 --top-k 25 --beam-width 100 --per-signature-cap 10 --relevant-set-limit 40`
  - `BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=19,20,100 python -m unittest scripts.test_build_discovery_level_boundary_generation_smoke.BuildDiscoveryLevelBoundaryGenerationSmokeTest`
- Level 20 result: one generated build, totals `6/3/0`, no warnings.
- Boundary slice result: pass in 118.911 seconds.

### 2026-07-10 Boundary Level 149/150 Matrix Green

- Verified the next boundary slice:
  - `BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=149,150 python -m unittest scripts.test_build_discovery_level_boundary_generation_smoke.BuildDiscoveryLevelBoundaryGenerationSmokeTest`
- Result: pass in 162.201 seconds.
- Passing rows:
  - `boundary_level_149_intelligence_11_5_1_budget2`
  - `boundary_level_150_chance_11_5_1_budget2`

### 2026-07-10 Boundary Level 179/180/200 Matrix Green

- Verified the final boundary slice:
  - `BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=179,180,200 python -m unittest scripts.test_build_discovery_level_boundary_generation_smoke.BuildDiscoveryLevelBoundaryGenerationSmokeTest`
- Result: pass in 472.130 seconds.
- Passing rows:
  - `boundary_level_179_agility_12_5_2_budget3`
  - `boundary_level_180_strength_12_5_3_budget3`
  - `boundary_level_200_strength_10_5_0_budget4`

### 2026-07-10 Boundary Level Build Matrix Artifact

- Extended `server/scripts/build_discovery_level_diversity_matrix.py` and
  `server/scripts/check_build_discovery_level_diversity_matrix.py` with
  `--target-set boundary`.
- Generated current boundary artifacts:
  - `.codex/state/build-discovery-level-boundary-matrix.json`
  - `.codex/state/build-discovery-level-boundary-matrix.md`
- Artifact summary:
  - targets: 10
  - generated: 10
  - invalid: 0
  - no build: 0
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-level-boundary-matrix.json --target-set boundary"`
- Artifact generation result: pass in 793.8 seconds.

### 2026-07-10 AP/MP/Range Coverage Matrix Start

- Added `AP_MP_RANGE_COVERAGE_TARGETS` for systematic AP/MP/Range edge coverage
  across representative Iop level bands, elements, and budgets.
- Initial low-level coverage slice found `coverage_level_20_chance_range_budget1`
  failed when targeting `Range=6`.
- Catalog inspection showed level 20 tier 1 has only two +Range items and both
  are amulets, so level 20 `Range=6` is catalog-infeasible rather than a simple
  solver recall miss.
- Revised the level 20 Range coverage row to `6/3/1`, and documented the
  assumption that some syntactically valid AP/MP/Range targets can be
  catalog-infeasible for a given level/budget.
- Verification so far:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_ap_mp_range_coverage_generation_smoke.BuildDiscoveryApMpRangeCoverageSmokeShapeTest"`
  - `BUILD_DISCOVERY_AP_MP_RANGE_COVERAGE_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS=coverage_level_50_intelligence_mp_budget1 python -m unittest scripts.test_build_discovery_ap_mp_range_coverage_generation_smoke.BuildDiscoveryApMpRangeCoverageGenerationSmokeTest`

### 2026-07-10 AP/MP/Range Coverage Feasibility Corrections

- The next coverage slice found two additional infeasible/no-result rows under
  the original budget assumptions:
  - level 80 Agility `10/6/0` tier 2 no-exo
  - level 99 Strength `12/6/6` tier 2 no-exo
- Wide search still produced zero builds for both rows.
- Confirmed replacement assumptions:
  - level 80 Agility `10/5/0` tier 2 no-exo generates a build
  - level 99 Strength `12/6/6` tier 3 with exos generates a build
- Updated `AP_MP_RANGE_COVERAGE_TARGETS` accordingly.
- Verification passed:
  - `BUILD_DISCOVERY_AP_MP_RANGE_COVERAGE_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=80,99,100,120 python -m unittest scripts.test_build_discovery_ap_mp_range_coverage_generation_smoke.BuildDiscoveryApMpRangeCoverageGenerationSmokeTest`
- Result: pass in 254.429 seconds.

### 2026-07-10 AP/MP/Range Coverage Late Slice Green

- Verified the late-game AP/MP/Range coverage slice:
  - `BUILD_DISCOVERY_AP_MP_RANGE_COVERAGE_SMOKE=1 BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS=150,179,180,199,200 python -m unittest scripts.test_build_discovery_ap_mp_range_coverage_generation_smoke.BuildDiscoveryApMpRangeCoverageGenerationSmokeTest`
- Result: pass in 471.783 seconds.
- Passing rows:
  - `coverage_level_150_agility_mid_budget2`
  - `coverage_level_179_strength_cap_budget3`
  - `coverage_level_180_intelligence_cap_budget3`
  - `coverage_level_199_chance_mid_budget2`
  - `coverage_level_200_agility_cap_budget4`

### 2026-07-10 AP/MP/Range Coverage Build Matrix Artifact

- Generated current AP/MP/Range coverage artifacts:
  - `.codex/state/build-discovery-ap-mp-range-coverage-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-coverage-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 12
  - invalid: 0
  - no build: 0
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-coverage-matrix.json --target-set coverage"`
- Artifact generation result: pass in 749.2 seconds.

### 2026-07-10 Generated Matrix Review Index Update

- Updated `.codex/state/build-discovery-assumptions-review-index.md` to point
  reviewers at all current generated-build matrices:
  - `.codex/state/build-discovery-level-diversity-matrix.md`
  - `.codex/state/build-discovery-level-boundary-matrix.md`
  - `.codex/state/build-discovery-ap-mp-range-coverage-matrix.md`
- Current generated solver evidence across those artifacts:
  - targets: 49
  - generated: 49
  - invalid: 0
  - no build: 0

### 2026-07-10 AP/MP/Range Coverage Evidence Label

- Addressed evaluator finding that the coverage matrix proves AP/MP/Range
  plumbing, not realistic build quality at every level.
- Updated coverage matrix generation so `target-set=coverage` records
  `evidenceType=action_stat_feasibility`.
- Updated coverage Markdown to state that coverage artifacts are action-stat
  feasibility evidence only.
- Added `--git-sha` support to matrix generation so Docker runs can record the
  host commit even though the server container cannot see `.git`.
- Updated the AP/MP/Range coverage smoke test to reuse `validate_best_build()`
  from the artifact generator.
- Regenerated:
  - `.codex/state/build-discovery-ap-mp-range-coverage-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-coverage-matrix.md`
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py && python -m unittest scripts.test_build_discovery_ap_mp_range_coverage_generation_smoke.BuildDiscoveryApMpRangeCoverageSmokeShapeTest"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-coverage-matrix-v2.json --target-set coverage"`
- Artifact generation result: pass in 763.0 seconds.

### 2026-07-10 AP/MP/Range Grid Inventory

- Added `server/scripts/build_discovery_ap_mp_range_grid_inventory.py`.
- Added `server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`.
- Generated inventory artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.md`
- The inventory enumerates the valid query grid for representative levels,
  elements, and budget tiers, then compares it against current generated matrix
  artifacts.
- Result:
  - representative levels: `1,20,50,80,99,100,120,150,179,180,199,200`
  - elements: Strength, Intelligence, Chance, Agility
  - budget tiers: 1-4
  - valid query rows: 39,424
  - exact generated evidence rows: 37
  - unproven rows: 39,387
- This is a gap inventory, not a blocker fix. It makes explicit that current
  generated matrices prove selected rows, not full-grid build quality.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_ap_mp_range_grid_inventory.py scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`

### 2026-07-10 AP/MP/Range Grid Next-Target Selector

- Extended the grid inventory with `nextUnprovenTargets`.
- Added profile buckets for suggested target planning:
  - `minimum`
  - `middle`
  - `mp_heavy`
  - `range_heavy`
  - `ap_heavy`
  - `cap`
- The selector first chooses one unproven row per representative level, then
  round-robins stress profiles by level so the next generated-build slice
  exercises level transitions instead of only the first level in sort order.
- Stress-profile rows prefer higher budget tiers; minimum rows prefer cheaper
  budget tiers.
- Regenerated inventory artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.md`
- Current inventory remains:
  - valid query rows: 39,424
  - exact generated evidence rows: 37
  - unproven rows: 39,387
  - suggested next rows: 24
- The current suggested slice is one minimum row and one `12/6/6` tier 4 cap
  row per representative level.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_ap_mp_range_grid_inventory.py scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`

### 2026-07-10 Grid Next Minimum Matrix

- Added selector-derived target set
  `AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS`.
- Added `--target-set grid-next-minimum` support to the matrix generator and
  checker.
- Generated current artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 12
  - invalid: 0
  - no build: 0
- Regenerated the grid inventory with this artifact included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 49
  - unproven rows: 39,375
- The slowest rows in this slice were high-level tier 1 minimum queries,
  around 150-168 seconds each. This is correctness evidence only; optimization
  remains later milestone work.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-minimum-matrix.json --target-set grid-next-minimum"`

### 2026-07-10 Grid Next Cap Matrix

- Added selector-derived target set `AP_MP_RANGE_GRID_NEXT_CAP_TARGETS`.
- Added `--target-set grid-next-cap` support to the matrix generator and
  checker.
- Added checker support for diagnostic matrices with no-build rows via
  `--allow-no-build`.
- Generated current artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 9
  - invalid: 0
  - no build: 3
- No-build rows:
  - `grid_next_cap_level_1_strength_12_6_6_budget4`
  - `grid_next_cap_level_20_strength_12_6_6_budget4`
  - `grid_next_cap_level_50_strength_12_6_6_budget4`
- Generated rows:
  - levels 80, 99, 100, 120, 150, 179, 180, 199, and 200 all generated valid
    `12/6/6` tier 4 builds.
- Regenerated the grid inventory with this artifact included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 58
  - attempted evidence rows: 61
  - unproven rows: 39,366
  - unattempted rows: 39,363
- Note: lower-budget cap rows at levels 1, 20, and 50 remain syntactically
  unattempted in the inventory, but tier 4 no-build evidence strongly suggests
  the next useful work is infeasibility diagnostics rather than retrying lower
  budget tiers for the same cap target.
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix_check.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix_check.py scripts/build_discovery_ap_mp_range_grid_inventory.py scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-cap-matrix.json --target-set grid-next-cap --allow-no-build"`

### 2026-07-10 Cap No-Build Action-Stat Diagnostics

- Added `server/scripts/build_discovery_action_stat_diagnostics.py`.
- Added `server/scripts/test_build_discovery_action_stat_diagnostics.py`.
- Generated cap no-build diagnostic artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-diagnostics.md`
- Diagnostic method:
  - computes an optimistic independent per-slot AP/MP/Range upper bound from
    currently available catalog items under the row's level and budget rules
  - adds one optimistic AP/MP/Range exo when exos are allowed
  - does not include set bonuses yet
  - treats upper-bound misses as strong item-stat-only evidence, not full
    catalog-infeasibility proof
  - treats upper-bound success as inconclusive rather than feasible
- Diagnostic result:
  - level 1 `12/6/6` tier 4: item-stat upper bound `7/4/1`, below target
  - level 20 `12/6/6` tier 4: item-stat upper bound `10/6/4`, below target
  - level 50 `12/6/6` tier 4: optimistic upper bound `13/8/26`, so the
    diagnostic does not prove catalog infeasibility
- Next implication:
  - level 1 and 20 cap no-build rows have strong item-stat-only evidence
    against feasibility, but need set-bonus-aware diagnostics before claiming
    full catalog infeasibility
  - level 50 cap no-build should be investigated with deeper exact/witness
    diagnostics or solver recall work
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_action_stat_diagnostics.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py"`

### 2026-07-10 Level 50 Cap Action-Stat Witness

- Extended `server/scripts/build_discovery_action_stat_diagnostics.py` with
  optional exact action-stat witness search via `--witness-search`.
- Generated level 50 witness artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-level50-witness-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-level50-witness-diagnostics.md`
- Result:
  - level 50 Strength Iop `12/6/6` tier 4 has an action-stat witness with
    totals `12/6/6`
  - witness items: The Celestial Brooch, Luthuthu Belt, Khardboard Goultard,
    Sponghield, Treering, Ring of Satisfaction, Bowisse's Boots, Khardboard
    Gobball Headgear, Treecloak, Drhellbert, and Twitcher
- Interpretation:
  - the cap matrix no-build row at level 50 is not action-stat infeasible
  - this is now a solver recall/search gap to fix or explain
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_action_stat_diagnostics.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py"`

### 2026-07-10 Level 50 Cap Recall Fix

- The level 50 cap witness showed the solver was missing low-score action-stat
  enablers such as AP/MP gear with large stat penalties.
- Fixed candidate pool retention so positive AP/MP/Range sources are considered
  from the full compatible slot list and all low-level positive action sources
  are retained before score pruning.
- Added regression coverage that a low-score low-level AP source survives a
  small candidate pool.
- Regenerated the level 50 cap row:
  - `grid_next_cap_level_50_strength_12_6_6_budget4`
  - status: generated
  - totals: `12/6/6`
- Updated cap matrix artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.md`
- Updated cap no-build diagnostics:
  - remaining no-build rows are levels 1 and 20
  - both remain below target under the item-stat-only upper-bound diagnostic
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 59
  - attempted evidence rows: 61
  - unproven rows: 39,365
  - unattempted rows: 39,363
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_uncommon_action_sources.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m unittest scripts.test_build_discovery_query_contract"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile oneoff/build_discovery_prototype.py scripts/test_build_discovery_uncommon_action_sources.py"`

### 2026-07-10 Remaining Cap Witness Diagnostic

- Added witness-search metadata to action-stat diagnostics:
  - whether witness search was enabled
  - `maxStatesPerSlot`
  - whether the state cap was hit
  - whether a witness was found
- Generated remaining cap witness artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-remaining-witness-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-remaining-witness-diagnostics.md`
- Result:
  - level 1 `12/6/6` tier 4: no witness found, state cap not hit
  - level 20 `12/6/6` tier 4: no witness found, state cap hit
- Interpretation:
  - level 1 has stronger no-witness evidence under the current exact witness
    search
  - level 20 remains bounded/inconclusive and needs either a tighter exact
    diagnostic, a larger search, or a set-bonus-aware proof before calling it
    infeasible
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_action_stat_diagnostics.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py"`

### 2026-07-10 Grid Next Minimum 2 Matrix

- Added the second selector-derived minimum matrix artifact to the grid
  inventory's default artifact list.
- Generated current artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-2-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-2-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 12
  - invalid: 0
  - no build: 0
- Regenerated the grid inventory with this artifact included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 71
  - attempted evidence rows: 73
  - unproven rows: 39,353
  - unattempted rows: 39,351
- Interpretation:
  - all selector-derived minimum rows for the second availability pass now
    have generated evidence
  - the inventory remains a gap map; it does not prove full-grid quality
  - the next selector suggestions are another minimum budget pass and a lower
    budget cap pass, with level 1/20 cap rows still needing diagnostics before
    retrying broad generation work
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py && python scripts/test_build_discovery_level_diversity_matrix_check.py && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-minimum-2-matrix.json --target-set grid-next-minimum-2"`

### 2026-07-10 Grid Selector Element Rotation

- Fixed the AP/MP/Range grid inventory's next-target selector so suggested
  generated rows rotate preferred elements by representative level and stress
  profile.
- Regenerated the grid inventory with the same evidence counts:
  - valid query rows: 39,424
  - exact generated evidence rows: 71
  - attempted evidence rows: 73
- New next suggestions include Strength, Intelligence, Chance, and Agility rows
  instead of repeatedly selecting Strength first for every level.
- Interpretation:
  - this is selector planning behavior only; it does not add generated build
    evidence by itself
  - it better matches the Milestone 3 objective that any single-element Iop
    query should eventually work across all levels, budgets, and action-stat
    targets
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py && python -m py_compile scripts/build_discovery_ap_mp_range_grid_inventory.py scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`

### 2026-07-10 Matrix Markdown Target-Set Labels

- Updated matrix Markdown rendering so generated artifact titles reflect the
  actual target set, such as `Grid Next Minimum 3`, rather than using the
  generic Level Diversity title for every artifact.
- Refreshed:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-2-matrix.md`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-3-matrix.md`
- Interpretation:
  - this addresses a reviewer documentation finding
  - JSON provenance was already correct; the change improves review clarity

### 2026-07-10 Grid Next Minimum 3 Matrix

- Added selector-derived target set
  `AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS`.
- Generated current artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-3-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-3-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 12
  - invalid: 0
  - no build: 0
- This slice covers mixed elements across representative levels:
  - Strength: levels 1, 99, 179
  - Intelligence: levels 20, 100, 180
  - Chance: levels 50, 120, 199
  - Agility: levels 80, 150, 200
- Regenerated the grid inventory with this artifact included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 83
  - attempted evidence rows: 85
  - unproven rows: 39,341
  - unattempted rows: 39,339
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py && python scripts/test_build_discovery_level_diversity_matrix_check.py && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-minimum-3-matrix.json --target-set grid-next-minimum-3"`
  - `git diff --check`

### 2026-07-10 Grid Next Cap 2 Matrix

- Added selector-derived target set
  `AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS`.
- Generated current artifacts:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.md`
- Artifact summary:
  - targets: 12
  - generated: 7
  - invalid: 0
  - no build: 5
- Generated rows:
  - level 100 Chance `12/6/6` tier 4
  - level 120 Agility `12/6/6` tier 4
  - level 150 Strength `12/6/6` tier 3
  - level 179 Intelligence `12/6/6` tier 4
  - level 180 Chance `12/6/6` tier 4
  - level 199 Agility `12/6/6` tier 4
  - level 200 Strength `12/6/6` tier 3
- No-build rows:
  - level 1 Intelligence `12/6/6` tier 4
  - level 20 Chance `12/6/6` tier 4
  - level 50 Agility `12/6/6` tier 4
  - level 80 Strength `12/6/6` tier 3
  - level 99 Intelligence `12/6/6` tier 4
- Regenerated the grid inventory with this artifact included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 90
  - attempted evidence rows: 97
  - unproven rows: 39,334
  - unattempted rows: 39,327
- Interpretation:
  - these no-build rows are solver results, not infeasibility proof
  - the next cap work should run action-stat/set-aware diagnostics for the
    five cap-2 no-build rows before deciding whether to tune recall or mark
    them as bounded/catalog-infeasible evidence
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_level_diversity_matrix.py && python scripts/test_build_discovery_level_diversity_matrix_check.py && python scripts/test_build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/build_discovery_ap_mp_range_grid_inventory.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --target-set grid-next-cap-2 --allow-no-build"`
  - `git diff --check`

### 2026-07-10 Cap 2 Diagnostic Plan

- Attempted to run a five-row cap-2 witness diagnostic batch for the no-build
  rows in `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json`.
- The batch hit the 30-minute command timeout before producing a committed
  artifact.
- After the timeout, Docker Desktop started returning engine API errors for
  both `docker version` and `docker ps`, so solver-backed diagnostics could not
  continue in this turn.
- Host Python cannot run the diagnostic because server dependencies such as
  `sqlalchemy` are not installed outside the container.
- Added a resume plan artifact:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-diagnostic-plan.md`
- The plan documents:
  - Docker recovery checks
  - a fast all-row item-stat upper-bound diagnostic command
  - one witness-search command per cap-2 no-build target
  - interpretation rules for upper-bound misses, witnesses, and state-cap hits
- Interpretation:
  - this checkpoint adds no new generated-build or diagnostic evidence
  - it keeps the next diagnostic step reviewable and restartable once Docker is
    healthy

### 2026-07-10 Split Diagnostic Artifact Writer

- Added `--split-output-dir` to
  `server/scripts/build_discovery_action_stat_diagnostics.py`.
- Split-output mode writes one JSON and one Markdown diagnostic artifact per
  selected target, plus a `manifest.json`.
- This is intended for long witness searches where a later target might time
  out; completed earlier target artifacts remain available for checkpointing.
- Updated the cap-2 diagnostic plan to prefer split-output mode before falling
  back to one command per target.
- Docker Desktop is still returning engine API errors, so no new solver-backed
  cap-2 diagnostic evidence was generated in this checkpoint.
- Verification passed on the host:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `git diff --check`
- Reviewer findings fixed:
  - split mode now still honors aggregate `--output-json` and `--output-md`
    paths by writing a combined report assembled from completed split reports
  - split artifact filenames now avoid collisions after target-id sanitization

### 2026-07-10 Cap 2 Action-Stat Diagnostics

- Generated fast cap-2 no-build diagnostics:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md`
- Fast diagnostic result:
  - diagnostics: 5
  - item-stat upper-bound below target: 2
  - not proven infeasible: 3
  - action-stat witnesses found in fast pass: 0
- Item-stat upper-bound misses:
  - level 1 Intelligence `12/6/6` tier 4 upper bound: `7/4/1`
  - level 20 Chance `12/6/6` tier 4 upper bound: `10/6/4`
- Witness diagnostics for the three inconclusive rows:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level50-witness-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level50-witness-diagnostics.md`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level80-witness-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level80-witness-diagnostics.md`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level99-witness-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-level99-witness-diagnostics.md`
- Witness result:
  - level 50 Agility `12/6/6` tier 4 has an action-stat witness with totals
    `12/6/6`
  - level 80 Strength `12/6/6` tier 3 has an action-stat witness with totals
    `12/6/6`
  - level 99 Intelligence `12/6/6` tier 4 has an action-stat witness with
    totals `12/6/6`
- Interpretation:
  - level 1 and 20 cap-2 no-build rows have strong item-stat-only evidence
    against feasibility, but still need set-bonus-aware proof before claiming
    full infeasibility
  - level 50, 80, and 99 cap-2 no-build rows are solver recall/search gaps for
    action-stat validity
  - the next useful implementation work is candidate/search recall tuning for
    those three witness-backed rows
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_action_stat_diagnostics.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py"`
- Reviewer findings fixed in the next checkpoint:
  - review-index language now says witness-backed cap-2 no-build rows are
    recall/search gaps for action-stat validity, not full build-quality proof
  - witness Markdown now shows `found, state cap hit` when both are true

### 2026-07-10 Cap 2 Recall Tuning Probe

- Ran a wider no-cache generation probe for the three witness-backed cap-2
  rows:
  - level 50 Agility `12/6/6` tier 4
  - level 80 Strength `12/6/6` tier 3
  - level 99 Intelligence `12/6/6` tier 4
- Probe settings:
  - `top_k=60`
  - `beam_width=600`
  - `per_signature_cap=40`
  - `relevant_set_limit=80`
- Result:
  - the combined three-row probe hit the 30-minute command timeout before
    returning a completed result
  - no generated-build evidence was added by this probe
- Interpretation:
  - brute-force widening is too expensive as the next path
  - next recall work should be targeted, using witness item/pool membership
    diagnostics and pruning-specific tests before changing broad beam limits

### 2026-07-10 Cap Action-Stat Witness Seed Recall Fix

- Added a bounded cap-pressure action-stat witness seed path to
  `server/oneoff/build_discovery_prototype.py`.
- The seed path only runs for exact `12/6/6` cap targets and preserves
  low-score AP/MP/Range skeletons from the solver's existing candidate pools.
- Added focused regression coverage in
  `server/scripts/test_build_discovery_uncommon_action_sources.py`.
- Verified the three witness-backed cap-2 no-build rows now generate with
  normal matrix parameters:
  - level 50 Agility `12/6/6` tier 4: generated in about 53.5 seconds
  - level 80 Strength `12/6/6` tier 3: generated in about 175.2 seconds
  - level 99 Intelligence `12/6/6` tier 4: generated in about 152.2 seconds
- Interpretation:
  - this fixes the action-stat recall gap for those three rows
  - level 1 and level 20 cap-2 rows remain below target under the
    item-stat-only upper-bound diagnostic and still need stronger
    set-bonus-aware proof before claiming full infeasibility
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_uncommon_action_sources.py"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile oneoff/build_discovery_prototype.py scripts/test_build_discovery_uncommon_action_sources.py"`
  - targeted no-cache generation for the three witness-backed cap-2 rows
- Reviewer finding fixed in the next checkpoint:
  - witness seeds now honor the effective `exoPolicy`; no-exo budget rows
    cannot receive pre-applied generated exos from the seed path
  - the witness seed helper now establishes the target-level context itself so
    direct calls do not accidentally use level-200 base AP

### 2026-07-10 Witness Seed Exo Policy Fix

- Fixed `action_stat_witness_seed_states()` so it receives and uses the
  effective search `exo_policy`.
- Added regression coverage that the synthetic cap witness seed succeeds with
  `exo_policy=allow`, records generated exos, and returns no seeds with
  `exo_policy=none`.
- Verified a real lower-budget cap row:
  - query: level 80 Strength `12/6/6` budget tier 2 with requested
    `exoPolicy=allow`
  - effective behavior: no exos, because tier 2 forces `exoPolicy=none`
  - result: no build, with the expected no-exo warning
- Interpretation:
  - cap witness seeds no longer bypass budget/exo policy
  - the previously generated cap-3 artifact from before this fix should not be
    used; cap-3 must be regenerated after this checkpoint
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_uncommon_action_sources.py && python -m unittest scripts.test_build_discovery_query_contract"`
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python -m py_compile oneoff/build_discovery_prototype.py scripts/test_build_discovery_uncommon_action_sources.py"`
  - targeted no-cache generation for level 80 Strength `12/6/6` budget tier 2

### 2026-07-10 Cap 2 Matrix After Witness Seed Fix

- Regenerated `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json`
  and `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.md`
  at commit `d3d64b3d`.
- Updated cap-2 matrix result:
  - targets: 12
  - generated: 10
  - invalid: 0
  - no build: 2
- Newly generated rows after the recall fix:
  - level 50 Agility `12/6/6` tier 4
  - level 80 Strength `12/6/6` tier 3
  - level 99 Intelligence `12/6/6` tier 4
- Remaining no-build rows:
  - level 1 Intelligence `12/6/6` tier 4
  - level 20 Chance `12/6/6` tier 4
- Regenerated cap-2 diagnostics for the remaining no-build rows:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md`
- Current cap-2 diagnostic result:
  - diagnostics: 2
  - item-stat upper-bound below target: 2
  - not proven infeasible: 0
  - action-stat witnesses found: 0
- Regenerated the grid inventory with the updated cap-2 matrix.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 93
  - attempted evidence rows: 97
  - unproven rows: 39,331
  - unattempted rows: 39,327
- Interpretation:
  - the cap action-stat witness seed fixed the three witness-backed cap-2
    solver no-build rows
  - the remaining level 1 and level 20 cap rows still need stronger
    set-bonus-aware proof before calling them fully infeasible

### 2026-07-10 Lower-Budget Cap Matrix After Exo Policy Fix

- Regenerated `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json`
  and `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-matrix.md`
  at commit `dc5d01e30ff96fa7e9d79b5d01d0d8bb69a9a9eb`.
- Cap-3 matrix result:
  - targets: 12
  - generated: 8
  - invalid: 0
  - no build: 4
- Generated rows:
  - level 50 Agility `12/6/6` tier 3
  - level 99 Intelligence `12/6/6` tier 3
  - level 100 Chance `12/6/6` tier 3
  - level 120 Agility `12/6/6` tier 3
  - level 150 Strength `12/6/6` tier 2
  - level 179 Intelligence `12/6/6` tier 3
  - level 180 Chance `12/6/6` tier 3
  - level 199 Agility `12/6/6` tier 3
- No-build rows:
  - level 1 Intelligence `12/6/6` tier 3
  - level 20 Chance `12/6/6` tier 3
  - level 80 Strength `12/6/6` tier 2
  - level 200 Strength `12/6/6` tier 2
- Regenerated cap-3 diagnostics:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-diagnostics.md`
- Cap-3 diagnostic result:
  - diagnostics: 4
  - item-stat upper-bound below target: 2
  - not proven infeasible: 2
  - action-stat witnesses found: 0
- Diagnostic interpretation:
  - level 1 Intelligence tier 3 and level 20 Chance tier 3 are below target
    under the optimistic item-stat-only independent-slot upper bound
  - level 80 Strength tier 2 and level 200 Strength tier 2 are not proven
    infeasible because the optimistic item-stat-only upper bound reaches the
    target; they remain search, set-bonus, uniqueness, condition, budget, or
    scoring questions
  - the level 80 tier 2 no-build is expected to stay strict about exos because
    budget tier 2 forces the effective exo policy to `none`
- Regenerated the AP/MP/Range grid inventory.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 101
  - attempted evidence rows: 109
  - unproven rows: 39,323
  - unattempted rows: 39,315
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json --target-set grid-next-cap-3 --allow-no-build"`

### 2026-07-10 Search Architecture Risk

- Current state:
  - the scoring loop is anchored by benchmarks and generated matrix evidence,
    especially the steered level-200 melee Strength Iop work
  - the search prototype now has several recall-oriented seed paths, including
    set retention, uncommon action-stat sources, cap-pressure witness seeds,
    and final completion/validation
- Risk:
  - these paths are still readable in isolation, but they are starting to look
    like patch pressure around a shared search core
  - more target-specific fixes without a stage contract will make correctness
    harder to reason about and performance tuning less trustworthy
- Consolidation direction before productization:
  - define explicit stages for candidate generation, action-stat preservation,
    package/set retention, completion, final validation, and scoring
  - require every stage to state which policies it may apply, especially
    budget tier, exo policy, locked/avoided items, target level, and hard
    AP/MP/Range validation
  - keep generated artifacts separated from accepted gameplay benchmarks
  - add regression coverage for each new recall stage before using it to
    explain a matrix improvement

### 2026-07-10 Cap 3 Witness Diagnostic Guardrails

- Reviewer finding:
  - the cap-3 fast diagnostic's `Action-stat witnesses found: 0` was easy to
    misread because witness search was not run in that artifact
  - no-build matrix rows are current-search misses, not infeasibility proof
  - item-stat upper bounds are not set-bonus-aware
  - bounded witness misses must report state-cap settings
- Added a CLI guard to `server/scripts/build_discovery_action_stat_diagnostics.py`
  so diagnostic filters that match zero matrix rows fail with a parser error
  instead of silently writing empty or missing artifacts.
- Added regression coverage for the zero-match diagnostic CLI path.
- Added a restartable cap-3 diagnostic plan:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-diagnostic-plan.md`
- Generated bounded 2k witness diagnostics for the two cap-3 not-proven rows:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.md`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.md`
- Level 80 Strength tier 2 `12/6/6`:
  - witness search: not found, state cap hit
  - classification: bounded witness miss, not infeasibility proof
- Level 200 Strength tier 2 `12/6/6`:
  - witness search: found, state cap hit
  - witness totals: `12/6/6`
  - classification: solver recall gap for action-stat validity
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - copied changed diagnostic scripts into the Docker server container, then ran
    `python scripts/test_build_discovery_action_stat_diagnostics.py && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py`
- Regeneration commands included `--solver-pool-coverage` on the cap-4 level
  50 witness diagnostic and the cap-4 remaining witness split diagnostic.

### 2026-07-10 Lower-Budget Cap 4 Target Set

- Added `AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS` as the next inventory-suggested
  lower-budget `12/6/6` cap slice.
- Target shape:
  - level 1 Intelligence tier 2
  - level 20 Chance tier 2
  - level 50 Agility tier 2
  - level 80 Strength tier 1
  - level 99 Intelligence tier 2
  - level 100 Chance tier 2
  - level 120 Agility tier 2
  - level 150 Strength tier 1
  - level 179 Intelligence tier 2
  - level 180 Chance tier 2
  - level 199 Agility tier 2
  - level 200 Strength tier 1
- Wired `grid-next-cap-4` through the matrix generator, matrix checker, and
  focused tests.
- This checkpoint defines the next reviewable target slice only; generated
  matrix evidence should be committed separately.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_targets.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - copied changed matrix scripts into the Docker server container, then ran
    `python scripts/test_build_discovery_level_diversity_matrix.py && python scripts/test_build_discovery_level_diversity_matrix_check.py && python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Lower-Budget Cap 4 Matrix

- Generated `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json`
  and `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-matrix.md`
  at commit `4d6d1df6`.
- Cap-4 matrix result:
  - targets: 12
  - generated: 5
  - invalid: 0
  - no build: 7
- Generated rows:
  - level 100 Chance `12/6/6` tier 2
  - level 120 Agility `12/6/6` tier 2
  - level 150 Strength `12/6/6` tier 1
  - level 179 Intelligence `12/6/6` tier 2
  - level 180 Chance `12/6/6` tier 2
- No-build rows:
  - level 1 Intelligence `12/6/6` tier 2
  - level 20 Chance `12/6/6` tier 2
  - level 50 Agility `12/6/6` tier 2
  - level 80 Strength `12/6/6` tier 1
  - level 99 Intelligence `12/6/6` tier 2
  - level 199 Agility `12/6/6` tier 2
  - level 200 Strength `12/6/6` tier 1
- Generated fast cap-4 diagnostics:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-diagnostics.md`
- Cap-4 diagnostic result:
  - diagnostics: 7
  - item-stat upper-bound below target: 2
  - not proven infeasible: 5
  - action-stat witnesses found: 0 because witness search was not run
- Diagnostic interpretation:
  - level 1 Intelligence tier 2 and level 20 Chance tier 2 are below target
    under the item-stat-only independent-slot upper bound
  - level 50 Agility tier 2, level 80 Strength tier 1, level 99 Intelligence
    tier 2, level 199 Agility tier 2, and level 200 Strength tier 1 are
    not-proven no-build rows that need bounded witness/search diagnostics
- Regenerated the AP/MP/Range grid inventory with cap-4 included.
- Updated grid inventory result:
  - valid query rows: 39,424
  - exact generated evidence rows: 106
  - attempted evidence rows: 121
  - unproven rows: 39,318
  - unattempted rows: 39,303
- Verification passed:
  - `docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json --target-set grid-next-cap-4 --allow-no-build"`

### 2026-07-10 Cap 4 Level 50 Witness Diagnostic

Superseded by the 2026-07-10 level-base witness diagnostic fix below.

- Generated bounded 2k witness diagnostics for level 50 Agility tier 2:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.md`
- Result:
  - diagnostic status: `action_stat_witness_found`
  - witness search: found, state cap hit
  - witness totals: `12/6/6`
- Interpretation:
  - level 50 Agility tier 2 `12/6/6` is a solver recall gap for action-stat
    validity, not a catalog limit
  - this does not prove the found skeleton is a high-quality accepted build
- Command:
  - `docker exec dofuslab-server-1 sh -lc 'cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json --targets grid_next_cap4_level_50_agility_12_6_6_budget2 --witness-search --witness-max-states-per-slot 2000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.md'`
- Reviewer findings fixed in the next checkpoint:
  - matrix artifact wording no longer hardcodes `Milestone 3`; it now says
    `sampled target set`
  - diagnostic Markdown now reports `Witness searches run` and renders
    witness hits as `X of Y searched`, so `0` hits without witness search is
    not easy to misread as negative evidence
  - regenerated cap-4 matrix Markdown, cap-4 fast diagnostics, and the cap-4
    level 50 witness diagnostics with the safer wording

### 2026-07-10 Cap 4 Remaining Witness Sweep

Partially superseded by the 2026-07-10 level-base witness diagnostic fix below.

- Generated bounded 2k witness diagnostics for the remaining cap-4 not-proven
  rows:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.md`
  - split artifacts in `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k/`
- Aggregate result:
  - diagnostics: 4
  - witness searches run: 4
  - action-stat witnesses found: 3 of 4 searched
  - not proven infeasible: 1
- Solver recall gaps for action-stat validity:
  - level 99 Intelligence tier 2 `12/6/6`
  - level 199 Agility tier 2 `12/6/6`
  - level 200 Strength tier 1 `12/6/6`
- Bounded witness miss:
  - level 80 Strength tier 1 `12/6/6` was not found and hit the state cap
- Interpretation:
  - most cap-4 not-proven no-build rows are now demonstrated solver recall
    gaps for action-stat validity, not catalog limits
  - level 80 Strength tier 1 remains unresolved and should not be called
    infeasible without stronger diagnostics
- Command:
  - `docker exec dofuslab-server-1 sh -lc 'rm -rf /tmp/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k && cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json --targets grid_next_cap4_level_80_strength_12_6_6_budget1,grid_next_cap4_level_99_intelligence_12_6_6_budget2,grid_next_cap4_level_199_agility_12_6_6_budget2,grid_next_cap4_level_200_strength_12_6_6_budget1 --witness-search --witness-max-states-per-slot 2000 --split-output-dir /tmp/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.md'`

### 2026-07-10 Cap 4 Witness Pool-Coverage Diagnostics

Partially superseded by the 2026-07-10 level-base witness diagnostic fix below.

- Extended `server/scripts/build_discovery_action_stat_diagnostics.py` so a
  found action-stat witness can also report whether each witness item is
  present in the default solver candidate pool.
- Pool coverage is now explicit opt-in with `--solver-pool-coverage` and each
  row records elapsed milliseconds.
- Regenerated:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-level50-witness-2k-diagnostics.md`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.md`
  - split artifacts in `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k/`
- Pool-coverage result:
  - level 50 Agility tier 2: witness found; missing `Sponghield`; coverage
    check took 52.2ms
  - level 99 Intelligence tier 2: witness found; no witness items missing from
    the default solver candidate pool; coverage check took 70.5ms
  - level 199 Agility tier 2: witness found; missing `Bzzegg Supervisor's Fist`
    and `Golden Dragoone`; coverage check took 44.7ms
  - level 200 Strength tier 1: witness found; missing `Khardboard Moowolf Belt`
    and `Plum and Almond Dragoturkey`; coverage check took 58.4ms
  - level 80 Strength tier 1: no witness found, so pool coverage is not checked
- Interpretation:
  - level 50, 199, and 200 have candidate-pool recall gaps for their found
    action-stat witnesses
  - level 99 has full default candidate-pool coverage for the found witness, so
    pool exclusion is not implicated; remaining likely causes include seed
    retention, completion, validation, scoring, or another downstream
    interaction
  - level 80 remains unresolved as a bounded witness miss
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - copied changed diagnostic scripts into the Docker server container, then ran
    `python scripts/test_build_discovery_action_stat_diagnostics.py && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py`

### 2026-07-10 Level-Base Witness Diagnostic Fix

- Fixed `server/scripts/build_discovery_action_stat_diagnostics.py` so witness
  search runs inside `target_level_context(query.level)`.
- Before this fix, sub-100 witness diagnostics could accidentally use the
  ambient level-200 base AP of 7 instead of the correct level-1-99 base AP of
  6.
- Added regression coverage that a level 99 AP 7 query with no AP items does
  not produce a witness from ambient level-200 base AP.
- Regenerated cap-4 witness diagnostics after the fix:
  - level 50 Agility tier 2 changed from witness-found to bounded witness miss
  - level 99 Intelligence tier 2 changed from witness-found to bounded witness
    miss
  - level 199 Agility tier 2 and level 200 Strength tier 1 remain
    witness-backed recall gaps
- Corrected cap-4 remaining witness result:
  - diagnostics: 4
  - witness searches run: 4
  - action-stat witnesses found: 2 of 4 searched
  - not proven infeasible: 2
- Corrected default solver pool coverage:
  - level 199 Agility tier 2: missing `Bzzegg Supervisor's Fist` and
    `Golden Dragoone`; coverage check took 40.0ms
  - level 200 Strength tier 1: missing `Khardboard Moowolf Belt` and
    `Plum and Almond Dragoturkey`; coverage check took 57.2ms
  - level 50 Agility tier 2, level 80 Strength tier 1, and level 99
    Intelligence tier 2: no corrected witness found, so pool coverage is not
    checked
- Also fixed direct completion to accept already-valid gear-complete seeds
  without forcing every open Dofus slot to be filled; this is covered by a
  focused unit test and supports locked-item/full-skeleton workflows, but it
  did not by itself turn cap-4 level 99 into a generated row.
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - copied changed diagnostic scripts into the Docker server container, then ran
    `python scripts/test_build_discovery_action_stat_diagnostics.py && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py`
  - copied changed solver files into the Docker server container, then ran
    `python scripts/test_build_discovery_uncommon_action_sources.py && python -m py_compile oneoff/build_discovery_prototype.py scripts/test_build_discovery_uncommon_action_sources.py`

### 2026-07-10 Action-Set Recall Plan

- Added `.codex/state/build-discovery-action-set-recall-plan.md`.
- Motivation:
  - cap-4 witness diagnostics show missing candidate-pool items that are
    individually low-score but useful through AP/MP/Range set/package bonuses
  - named-item allowlisting would overfit the current artifacts
- Broad inclusion is too large:
  - level 50 tier 2 has 76 available AP/MP/Range-bonus sets, 50 outside the
    current relevant-set limit
  - level 199 tier 2 has 129 available AP/MP/Range-bonus sets, 89 outside the
    current relevant-set limit
  - level 200 tier 1 has 223 available AP/MP/Range-bonus sets, 184 outside the
    current relevant-set limit
- Proposed next step:
  - add a read-only action-set package diagnostic before solver consumption
  - report which set/package explains each missing witness item and whether a
    bounded package rank would select it
  - only then add a bounded package seed stage that honors budget, exo policy,
    conditions, level, locked items, and avoided items

### 2026-07-10 Action-Package Diagnostic Checkpoint

- Extended `server/scripts/build_discovery_action_stat_diagnostics.py` so
  default solver pool coverage explains missing witness items that belong to an
  AP/MP/Range set package.
- Package coverage now records:
  - set id/name
  - whether the set is inside the current relevant-set selection
  - set bonus score
  - available item count/levels
  - action-stat bonus thresholds such as `3pc AP+1`
- Regenerated corrected cap-4 remaining witness artifacts with
  `--solver-pool-coverage`:
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k-diagnostics.md`
  - split artifacts in `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-remaining-witness-2k/`
- Corrected result remains:
  - diagnostics: 4
  - witness searches run: 4
  - action-stat witnesses found: 2 of 4 searched
  - not proven infeasible: 2
- New package explanations:
  - level 199 Agility tier 2: missing `Bzzegg Supervisor's Fist` from Bzzegg
    Supervisor Set's 3-piece AP package and `Golden Dragoone` from Hax Or Set's
    5-piece MP package
  - level 200 Strength tier 1: missing `Khardboard Moowolf Belt` from
    Khardboard Set's 2-piece AP/MP/Range package and `Plum and Almond
    Dragoturkey`, which is not a set item
- Interpretation:
  - three of the four missing witness items are set/package recall misses
  - the mount miss should be handled by a separate bounded pet/mount recall
    rule, not by action-set package logic
  - the next implementation slice should consume bounded action packages in
    solver seeding and then rerun cap-4 before expanding the all-level matrix
- Verification passed:
  - `python server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - `python -m py_compile server\scripts\build_discovery_action_stat_diagnostics.py server\scripts\test_build_discovery_action_stat_diagnostics.py`
  - copied changed diagnostic scripts into the Docker server container, then ran
    `python scripts/test_build_discovery_action_stat_diagnostics.py && python -m py_compile scripts/build_discovery_action_stat_diagnostics.py scripts/test_build_discovery_action_stat_diagnostics.py`

### 2026-07-10 Bounded Action-Package Solver Seeds

- Added a bounded action-set package seed path to
  `server/oneoff/build_discovery_prototype.py`.
- The new path:
  - scans the full eligible item catalog, not only the already-pruned slot pools
  - considers only sets with AP/MP/Range set-bonus thresholds
  - builds packages at the first action-stat threshold
  - ranks packages primarily by AP/MP/Range threshold value, then by package
    action stats and normal package score
  - feeds those packages into the existing package seed/completion flow
- Also tightened candidate-pool action-source retention so high-level searches
  do not retain arbitrary sub-180 AP/MP/Range gear through the generic action
  stat/vector paths. Explicit uncommon-source retention and low-level target
  behavior remain separate.
- Cap-target matrix queries now use deeper search settings:
  - `beam_width=250`
  - `per_signature_cap=40`
  - `relevant_set_limit=60`
  - ordinary non-cap sampled targets keep the lighter `100/10/40` settings
- Added regression coverage:
  - action package indexing can recover a low-score AP/MP/Range set package
    that normal pruned pools cannot form
  - cap-target matrix queries use deeper search settings
- Generated focused Docker artifact:
  - `.codex/state/build-discovery-action-package-cap4-focus-matrix.json`
  - `.codex/state/build-discovery-action-package-cap4-focus-matrix.md`
- Focused cap-4 result:
  - level 199 Agility tier 2 `12/6/6`: generated, `12/6/6`, 116604.2ms
  - level 200 Strength tier 1 `12/6/6`: generated, `12/6/6`, 153369.1ms
- Interpretation:
  - the two corrected witness-backed cap-4 recall gaps now have generated
    builds under the deeper cap-target matrix settings
  - cache-miss runtime for these hard rows is far above the Milestone 2 p95
    goal and must remain a performance/optimization follow-up
  - full cap-4 regeneration is still pending; this checkpoint proves the two
    witness-backed rows, not the entire target set
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py server\scripts\build_discovery_level_diversity_targets.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `git diff --check`
  - copied changed files into Docker, then ran
    `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_prototype.py BuildDiscoveryPrototypeTest.test_action_set_package_index_keeps_low_score_action_package`
  - copied changed files into Docker, then ran
    `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_level_diversity_matrix.py`
  - copied changed files into Docker, then ran
    `python -m py_compile oneoff/build_discovery_prototype.py scripts/test_build_discovery_prototype.py scripts/build_discovery_level_diversity_targets.py scripts/test_build_discovery_level_diversity_matrix.py`
- Docker caveat:
  - the full Docker prototype unittest suite still fails on
    `test_strength_spell_damage_profile_falls_back_to_generic_profile` because
    this container can read real spell data, so the fallback path is not used
    there; the full host prototype suite passed.

### 2026-07-10 Matrix Split-Output Checkpoint

- Added `--split-output-dir` to
  `server/scripts/build_discovery_level_diversity_matrix.py`.
- The matrix generator now can write one JSON/Markdown report per selected
  target as each target finishes, plus a manifest. This prevents long all-level
  or cap-target runs from losing all evidence when a later row times out.
- Added regression coverage that split output writes per-target files and a
  manifest while preserving the aggregate report.
- Retried full `grid-next-cap-4` regeneration after the action-package seed
  checkpoint:
  - first non-split full run was stopped after more than 30 minutes with no new
    aggregate artifact because the generator writes aggregates only at the end
  - second split run was stopped after 15 minutes and preserved four completed
    row artifacts in
    `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-split-partial/`
- Partial split result:
  - level 1 Intelligence tier 2 `12/6/6`: no build
  - level 20 Chance tier 2 `12/6/6`: no build
  - level 50 Agility tier 2 `12/6/6`: no build
  - level 80 Strength tier 1 `12/6/6`: no build after 256951.2ms
- Interpretation:
  - split output is now required for long matrix work
  - the full cap-4 aggregate is still pending
  - level 80 Strength tier 1 remains a hard unresolved row and should be
    diagnosed separately before another broad full-cap run
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `git diff --check`
  - copied changed matrix scripts into Docker, then ran
    `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_level_diversity_matrix.py`
  - copied changed matrix scripts into Docker, then ran
    `python -m py_compile scripts/build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Level 80 Cap-4 Search Gap Investigation

- Generated higher-cap L80 witness diagnostics:
  - `.codex/state/build-discovery-cap4-level80-witness-10k-diagnostics.json`
  - `.codex/state/build-discovery-cap4-level80-witness-10k-diagnostics.md`
- Result:
  - level 80 Strength tier 1 `12/6/6` remains `not_proven_infeasible`
  - 10k witness search found no witness and hit the state cap
  - optimistic independent-slot upper bound remains `13/8/26`
- Manually assembled and validated a full level 80 tier 1 no-exo `12/6/6`
  action skeleton, so the row is a solver search gap rather than infeasible
  under current data assumptions.
- Valid locked skeleton:
  - `Gobbamu`
  - `Chafeerce Belt`
  - `Khardboard Goultard`
  - `Terrdala Shield`
  - `Gelano`
  - `Treering`
  - `Royal Pippin Bloopts`
  - `Khardboard Gobball Headgear`
  - `Khardboard Dazzling Cloak`
  - `Turquoise Rhineetle`
  - `Twitcher`
- Locked Docker query with those items generated a valid build:
  - totals: `12/6/6`
  - Strength: `758`
  - Vitality: `563`
  - set: `Khardboard Set x3`
  - elapsed: 24295.2ms
- Implemented solver-search improvements while investigating:
  - action-set package indexing now considers every AP/MP/Range set-bonus
    threshold, not only the first threshold
  - no-exo beam search can start from action-package seeds
  - Dofus slots are optional in beam search
  - direct completion accepts 3-piece package seeds
  - direct non-Dofus completion now trims by AP/MP/Range progress before
    general score
- Remaining gap:
  - the unassisted level 80 Strength tier 1 `12/6/6` query still returns no
    build after these changes
  - lower-level probing shows direct non-Dofus completion now reaches AP 12 /
    MP 5 / Range 6 variants from the Khardboard seed, but still loses the
    AP 12 / MP 6 / Range 6 variant
  - next likely fix is a completion beam signature/ranking that explicitly
    preserves balanced AP/MP/Range deficit closure, not just lexicographic
    action progress
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py`
  - `git diff --check`
  - copied changed solver/test files into Docker and ran focused regression
    tests plus `py_compile`

### 2026-07-10 Search Stage Consolidation Checkpoint

- Reviewer pass found the main architecture risk is not the scoring formula
  itself, but search recall paths accumulating without a shared stage contract.
- Added `SearchSeedStage` and `collect_search_seed_stages()` so package,
  action-package, AP-set-bonus, required-item, budget trophy, budget gear, and
  action-witness seeds are named policy stages instead of anonymous lists inside
  `find_builds()`.
- Preserved existing no-exo fallback behavior:
  - required item seeds still take over fallback search when locked items exist
  - otherwise beam fallback still tries an empty seed group first, then named
    budget/action seed stages
- Added unit coverage that seed collection returns the expected named stages
  and fallback-stage policy.
- Docker was unavailable with the Docker Desktop API internal server error, so
  this checkpoint is local-only verification.
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `python server\scripts\test_build_discovery_action_feasibility.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py server\scripts\build_discovery_action_feasibility.py`
  - `git diff --check`
- Next consolidation target from reviewer:
  - introduce shared AP/MP/Range progress/signature helpers and use them in
    solver trims plus feasibility diagnostics so balanced action-stat ranking
    is one explicit contract rather than repeated local sort keys.

### 2026-07-10 Shared Action-Progress Ranking Contract

- Added solver-owned AP/MP/Range progress helpers:
  - `action_stat_progress_values()`
  - `action_stat_deficit_total()`
  - `action_stat_progress_key()`
- Replaced duplicated action-progress sort logic in:
  - direct action-completion beam trimming
  - action-stat witness seed ranking
  - action feasibility diagnostic frontier sorting
- Added tests that:
  - completed `12/6/6` action targets outrank incomplete high-score states
  - feasibility diagnostics use the solver's action-progress key exactly
  - range `None` still ignores range deficits/progress
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `python server\scripts\test_build_discovery_action_feasibility.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py server\scripts\build_discovery_action_feasibility.py server\scripts\test_build_discovery_action_feasibility.py`
  - `git diff --check`
- Docker remains unavailable with the Docker Desktop API internal server error,
  so no container solver artifact was regenerated in this checkpoint.

### 2026-07-10 Full Milestone 3 Query-Space Inventory

- Promoted the AP/MP/Range inventory from representative-level enumeration to
  an explicit all-level target-space inventory.
- Added `iter_valid_iop_target_space()` as the shared query-space iterator for:
  - levels 1 through 200
  - elements Strength, Intelligence, Chance, and Agility
  - budget tiers 1 through 4
  - AP from level minimum to 12
  - MP from 3 through 6
  - Range `None` plus 0 through 6
- Test-locked the full single-element Iop Milestone 3 query universe at
  `665,088` valid query rows.
- Added regression coverage proving the static matrix `target-set=all` is only
  a subset of the full universe, not complete coverage.
- Generated full-grid inventory artifacts:
  - `.codex/state/build-discovery-ap-mp-range-full-grid-inventory.json`
  - `.codex/state/build-discovery-ap-mp-range-full-grid-inventory.md`
- Current evidence counts from existing artifacts:
  - valid query rows: `665,088`
  - generated evidence rows: `116`
  - attempted evidence rows: `131`
  - unproven rows: `664,972`
  - unattempted rows: `664,957`
- Verification passed:
  - `python server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server\scripts\build_discovery_ap_mp_range_grid_inventory.py server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `git diff --check`

### 2026-07-10 Target-File Matrix Batch Harness

- Added `--target-file` support to `build_discovery_level_diversity_matrix.py`
  so the matrix generator can consume arbitrary full-grid rows from:
  - inventory reports via `nextUnprovenTargets`
  - direct `targets` arrays
  - existing matrix `results[*].target`
  - bare target-row arrays
- Added deterministic generated target IDs such as
  `full_grid_level_100_chance_7_4_6_budget2`.
- Hardened target-file parsing after reviewer feedback:
  - coerces numeric string `rangeTarget` values
  - rejects negative `--target-file-limit`
  - reports malformed `results` rows with index context
  - reports missing required row keys with index context
  - rejects duplicate target rows/ids
  - records provenance as `path#sourceKind`
- This creates the handoff from full-grid inventory to reviewable generated
  matrix batches. Once Docker is healthy, the next runtime command should be:
  `python scripts/build_discovery_level_diversity_matrix.py --target-file /tmp/build-discovery-ap-mp-range-full-grid-inventory.json --target-file-prefix full_grid --target-file-limit 40 --split-output-dir /tmp/build-discovery-full-grid-next-40`
- Local verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `git diff --check`

### 2026-07-10 Split Matrix Output Inventory Ingestion

- Added `--artifact-dir` support to `build_discovery_ap_mp_range_grid_inventory.py`.
- Split-output directories from target-file matrix batches can now be counted
  by the inventory even if a long run only completes part of the batch.
- Directory ingestion:
  - reads local sibling `*.json` files rather than trusting copied manifests
  - skips `manifest.json`
  - includes only `build-discovery-level-diversity-matrix-v1` reports
  - ignores diagnostic JSON as generated/attempted solver evidence
  - fails fast for missing artifact directories
- Added tests that split matrix rows count generated/no-build evidence
  correctly and that aggregate artifacts can be combined with split-output
  directories.
- Local smoke with existing cap-4 split-partial artifacts:
  - levels: 1, 20, 50, 80
  - generated evidence: `27`
  - attempted evidence: `38`
- Verification passed:
  - `python server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server\scripts\build_discovery_ap_mp_range_grid_inventory.py server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `git diff --check`

### 2026-07-10 Resumable Split Matrix Batches

- Added `--resume-existing` for split matrix generation.
- In `--split-output-dir` mode, existing one-row target JSON files can now be
  reused instead of regenerating the same target.
- Resume behavior:
  - computes the same deterministic artifact stem before deciding whether to
    skip/generate
  - validates existing JSON has exactly one result for the current target id
  - appends resumed entries into the aggregate report
  - rebuilds the manifest every run with `resumed: true/false`
  - regenerates missing markdown from the existing JSON if needed
  - rejects `--resume-existing` without `--split-output-dir`
- This makes interrupted full-grid batches restartable without losing or
  duplicating completed target work.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `git diff --check`

### 2026-07-10 Retryable Full-Grid Inventory Queue

- Updated AP/MP/Range grid inventory so `nextUnprovenTargets` is selected from
  rows without generated proof, not merely rows that were never attempted.
- Previously attempted `no_build` rows are now labeled as `evidenceStatus:
  retry` and get a bounded front-of-queue quota, so search misses remain visible
  after solver improvements.
- The suggested queue now rotates profile buckets across levels instead of
  spending large batches only on minimum AP/MP rows.
- Regenerated the full-grid inventory artifact:
  - valid query rows: `665088`
  - generated evidence rows: `116`
  - attempted evidence rows: `131`
  - no-build evidence rows: `15`
  - suggested next rows: `80`, with `15` retries and `65` unattempted rows
- Verification passed:
  - `python server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server\scripts\build_discovery_ap_mp_range_grid_inventory.py server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `git diff --check`

### 2026-07-10 Current-Code Matrix Artifact Verification

- Strengthened `check_build_discovery_level_diversity_matrix.py` from a
  count/shape checker into a current-code artifact verifier.
- Generated rows now verify:
  - target identity matches the current target definition
  - query identity matches `query_for_target()`
  - the full `bestBuild` artifact is present
  - current `validate_best_build()` passes
  - item slots use compatible item types
  - duplicate item IDs are rejected
  - item availability tiers do not exceed the requested budget tier
  - generated exos are rejected when the effective exo policy is `none`
- Existing historical artifacts checked successfully:
  - `.codex/state/build-discovery-level-diversity-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json`
    with `--allow-no-build`
  - `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-matrix.json`
- This still proves artifact correctness, not best-build optimality; benchmark
  gates remain a separate needed layer.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Safer Split Resume Validation

- Tightened `--resume-existing` split matrix behavior so existing one-row JSON
  reports are reusable only when:
  - report version matches the current matrix report version
  - target payload matches the current target definition
  - query payload matches the current `query_for_target()` serialization
  - generated rows still pass current `validate_best_build()`
- This reduces the risk that a restarted batch silently mixes stale query
  evidence into a fresh aggregate report.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Serialized Artifact Availability Check

- Fixed `availability_tier_for_item()` so it accepts both internal item records
  (`itemType`/`dofusID`) and serialized build artifacts (`type`/`id`).
- This matters for current-code matrix verification: generated artifact rows
  serialize item type/id fields differently from solver internals, so budget
  tier checks could otherwise miss over-budget Dofus/items in committed matrix
  evidence.
- Added regression coverage for serialized accessible/opti Dofus shapes.
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_availability_tiers_follow_initial_budget_priors`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py server\scripts\check_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Level-Aware Characteristic Allocation Gate

- Fixed the non-200 base-stat model so available characteristic points now scale
  by level as `5 * (level - 1)` instead of silently using level-200 points for
  every target.
- Base stats remain intentionally scrolled (`100`) for now; this assumption is
  now explicit in `.codex/state/build-discovery-assumptions.md`.
- Base allocation optimization now derives legal allocation options for the
  active target level; for example, level 50 can use up to `172` primary stat
  points, not `398`.
- Strengthened matrix artifact verification so generated rows fail if
  `baseAllocation` spends more characteristic points than the target level
  allows.
- Existing historical non-200 matrix artifacts are now known stale under this
  verifier and must be regenerated before they count as Milestone 3 proof.
  Example failure:
  `level_50_strength_7_3_1_budget1` spent `992` characteristic points against a
  level 50 budget of `245`.
- Verification passed:
  - `python -m unittest scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_base_stats_for_level_scale_characteristic_points scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_legal_base_allocation_options_scale_by_level scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_optimize_base_allocation_uses_level_legal_points`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Availability Policy Fixture

- Converted availability tier coverage into an explicit fixture table covering:
  normal gear, mounts, trophies, serialized trophies, pets, petsmounts,
  accessible Dofuses, unclassified Dofuses, Prysmaradites, Ochre, Vulbis,
  serialized Ochre, and buff/special-effect items.
- This keeps the hardcoded v0 budget policy reviewable while the full economy
  model remains out of scope.
- Verification passed:
  - `$env:PYTHONPATH='server'; python server\scripts\test_build_discovery_availability_tiers.py`

### 2026-07-10 Prod Iop Level Target Samples

- Used the Windows User `DOFUSLAB_READONLY_DATABASE_URL` with the repo `venv`
  to run bounded readonly prod aggregate target discovery.
- A larger `sampleLimit=500` query hit the configured 5s statement timeout and
  was canceled; follow-up samples used `sampleLimit=50` without raising the
  timeout.
- Added aggregate-only artifacts:
  - `.codex/state/build-discovery-prod-level-target-discovery-iop-1-100.json`
  - `.codex/state/build-discovery-prod-level-target-discovery-iop-101-180.json`
  - `.codex/state/build-discovery-prod-level-target-discovery-iop.json`
  - `.codex/state/build-discovery-prod-level-target-discovery-iop.md`
- Safety scan found only the helper's own safety text mentioning omitted names,
  owners, and custom set IDs; the artifacts do not include raw custom set IDs,
  owner IDs, custom set names, or item lists.
- Planning signal:
  - levels 1-100 sample includes real targets around 7/3/1 at 50, 9/5/0 at
    80, and 10/4/1 at 100
  - levels 101-180 sample includes 11/5/0 and 12/5/1 around 120, 12/5/2
    around 160, and 12/6/2 around 165
  - recent all-level sample is heavily level-200 skewed, with 48/50 rows in
    bucket 181-200
- These are target-selection priors only; they do not prove generated build
  quality.

### 2026-07-10 Prod-Derived Level Sample Target Set

- Added `PROD_LEVEL_SAMPLE_TARGETS` / `--target-set prod-level-sample` as the
  next reviewable regeneration slice after the level-aware base allocation fix.
- The set has 24 rows across levels 1, 20, 40, 50, 60, 80, 100, 120, 130,
  150, 160, 165, 180, and 200.
- It rotates all four Iop elements and all four budget tiers.
- Rows with real zero/negative Range patterns use `rangeTarget=None` so the
  solver is not forced into artificial Range when the product request allows
  any Range.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_targets.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Target Manifest Dry Run

- Added `--target-manifest-json` and `--target-manifest-md` to
  `build_discovery_level_diversity_matrix.py`.
- Manifest mode writes selected target/query/search rows without invoking the
  solver, so target sets can be reviewed even when Docker or DB-backed solver
  runtime is unavailable.
- Generated prod-level sample manifests:
  - `.codex/state/build-discovery-prod-level-sample-target-manifest.json`
  - `.codex/state/build-discovery-prod-level-sample-target-manifest.md`
- The manifest is explicitly labeled as target selection only, not generated
  build evidence or quality proof.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Level 80 Balanced Action Completion Fix

- Fixed the direct completion beam to rank by total remaining AP/MP/Range
  deficit before general score.
- This preserves balanced action-stat completions such as `12/6/6` over
  higher-score but still-incomplete variants like `12/5/6`.
- Added regression coverage:
  - action-completion beam prioritizes balanced AP/MP/Range completion
  - existing action-variant completion tests still pass
- Regenerated focused Docker artifact:
  - `.codex/state/build-discovery-cap4-level80-action-balanced-matrix.json`
  - `.codex/state/build-discovery-cap4-level80-action-balanced-matrix.md`
- Result:
  - level 80 Strength tier 1 `12/6/6`: generated
  - totals: `12/6/6`
  - main stat: Strength `883`
  - Vitality `813`
  - sets: Royal Pippin Blop Set x4, Khardboard Set x3
  - items: Royal Pippin Amublop, Royal Pippin Blop Belt, Khardboard Goultard,
    Bawbawian Shield, Royal Pippin Blop Ring, Treering, Royal Pippin Bloopts,
    Khardboard Gobball Headgear, Khardboard Dazzling Cloak, Golden and Crimson
    Rhineetle, Minor Earth Wrecker, Minor Maniac, Minor Earth Destroyer, Minor
    Goliath, Minor Dynamo, Twitcher
- Runtime:
  - focused matrix miss time was 475838.4ms
  - this is correctness evidence only; performance is still far outside the
    Milestone 2 cache-miss target
- Verification passed:
  - `python scripts\test_build_discovery_prototype.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py scripts\test_build_discovery_prototype.py`
  - `git diff --check`
  - copied changed solver/test files into Docker and ran focused regression
    tests plus `py_compile`

### 2026-07-10 Prod-Level Sample Matrix Completion

- Completed the 24-row `prod-level-sample` generation matrix in Docker and
  copied the full split artifacts plus aggregate reports to `.codex/state`.
- Added `--missing-from-split-dir` support to
  `build_discovery_level_diversity_matrix.py`. Missing-target detection now
  reads one-row split JSON reports instead of trusting `manifest.json`, because
  one-target reruns can legitimately rewrite the manifest for only the selected
  row.
- Reclassified the prod-derived level 20 Intelligence `7/4/1` row from budget
  tier 1 to budget tier 3. Under current v0 assumptions, tier 1/no-exo did not
  generate; tier 3 generates via an MP exo and is the honest label for that
  prod-shaped target.
- Result:
  - targets: `24`
  - generated: `24`
  - no build: `0`
  - invalid: `0`
- Notable rows:
  - level 20 Intelligence tier 3 `7/4/1`: Bearman's package, MP exo on
    Bearman's Necklace, `462` Intelligence, `205` Vitality, `3884.2ms`
  - level 200 Strength tier 4 `12/6/3`: Corruption + Bleeding Heart package,
    `1488` Strength, `3853` Vitality, `166969.8ms`
  - level 200 Agility tier 4 `11/6/5`: Voldelor + Allister package, `1323`
    Agility, `3253` Vitality, `160405.9ms`
- Verification passed:
  - `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-prod-level-sample-matrix.json --target-set prod-level-sample`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_targets.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Prod-Level Sample Review Packet

- Added `.codex/state/build-discovery-prod-level-sample-review.md` to make the
  generated 24-row sample reviewable without opening the full JSON artifact.
- The packet explicitly marks the matrix as review input, not accepted
  benchmark evidence.
- It lists promotion criteria, runtime concerns, overshoot rows, recurring
  package patterns, and the level 20 tier-3 rationale.
- This addresses the evaluator concern that the generated matrix proves
  structural generation only, not the full PRD requirement for reviewed
  benchmark-quality, meaningfully diverse results.

### 2026-07-10 Multi-Candidate Matrix Smoke

- Added an opt-in `--query-limit` matrix override so selected target rows can
  request more than the default top `1` generated build without changing the
  historical target definitions.
- Matrix artifacts now preserve all returned `candidateBuilds`,
  `candidateBuildSummaries`, per-candidate validation errors, and a mechanical
  diversity summary with candidate count, unique item-signature count, and max
  shared items with the best build.
- The matrix checker now validates every recorded candidate build, supports
  target subsets through `--targets`, and remains backward-compatible with
  legacy query payloads that did not record search parameters.
- Generated a cheap 3-row prod-level smoke artifact with `--query-limit 3`:
  - `.codex/state/build-discovery-prod-level-sample-multicandidate-smoke.json`
  - `.codex/state/build-discovery-prod-level-sample-multicandidate-smoke.md`
- Smoke result:
  - level 1 Strength tier 1: `3` candidates, `3` unique item signatures,
    max `7` shared items with best
  - level 20 Intelligence tier 3: `3` candidates, `3` unique item signatures,
    max `9` shared items with best
  - level 40 Chance tier 1: `3` candidates, `3` unique item signatures,
    max `8` shared items with best
- This is still mechanical diversity evidence, not gameplay acceptance. The
  next review step is deciding whether high-overlap variants count as
  meaningful alternatives or whether the solver needs stronger package-level
  diversity.
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-prod-level-sample-matrix.json --target-set prod-level-sample`
  - `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-prod-level-sample-multicandidate-smoke.json --target-set prod-level-sample --targets prod_regen_level_1_strength_6_3_none_budget1,prod_regen_level_20_intelligence_7_4_1_budget3,prod_regen_level_40_chance_7_3_none_budget1`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Full Grid Inventory Refresh

- Added the prod-level sample matrix and the 3-row multi-candidate smoke matrix
  to the default AP/MP/Range grid inventory evidence inputs.
- Regenerated:
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.json`
  - `.codex/state/build-discovery-ap-mp-range-grid-inventory.md`
  - `.codex/state/build-discovery-ap-mp-range-full-grid-inventory.json`
  - `.codex/state/build-discovery-ap-mp-range-full-grid-inventory.md`
- Current all-level Milestone 3 query grid:
  - valid rows: `665088`
  - generated evidence rows: `138`
  - attempted evidence rows: `153`
  - no-build evidence rows: `15`
  - unproven rows: `664950`
- Current representative-level grid:
  - valid rows: `39424`
  - generated evidence rows: `121`
  - attempted evidence rows: `136`
  - no-build evidence rows: `15`
  - unproven rows: `39303`
- The next suggested rows are still dominated by retry cap targets, starting
  with level 1, level 20, and level 80 `12/6/6` cap rows. That is useful
  correctness pressure, but not broad coverage.
- Verification passed:
  - `python server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server\scripts\build_discovery_ap_mp_range_grid_inventory.py server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Target-File Frontier Smoke

- Added target-file support to the matrix checker so inventory-driven frontier
  batches can be validated without adding more static target sets.
- The checker now accepts `--target-file`, `--target-file-limit`, and
  `--target-file-prefix`, matching the generator's target-file loader.
- Generated a tiny level 2 frontier target inventory:
  - `.codex/state/build-discovery-ap-mp-range-frontier-001-targets.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-001-targets.md`
- Generated and validated the first target-file frontier row with
  `--query-limit 3`:
  - `.codex/state/build-discovery-ap-mp-range-frontier-001-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-001-matrix.md`
  - `.codex/state/build-discovery-ap-mp-range-frontier-001/`
- Result:
  - target: level 2 Strength tier 1 `6/3/any`
  - status: generated
  - candidates: `3`, unique item signatures: `3`, max shared items with best:
    `8`
  - best totals: `6/3/0`, Strength `139`, Vitality `138`
  - miss time: `1588.9ms`
- This proves the target-file frontier loop works for a cheap unattempted row.
  The remaining frontier rows in that file include harder cap/MP-heavy shapes
  and should be generated deliberately, not hidden inside this smoke.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-frontier-001-matrix.json --target-file /tmp/build-discovery-ap-mp-range-frontier-001-targets.json --target-file-limit 1 --target-file-prefix grid_frontier_001`

### 2026-07-10 Frontier Selection And Budget Fallback Guardrail

- Added inventory selector filters for `nextUnprovenTargets`:
  - `--next-evidence-statuses`
  - `--next-profile-buckets`
- Added `.codex/state/build-discovery-ap-mp-range-frontier-001-matrix.json`
  and `.codex/state/build-discovery-ap-mp-range-frontier-002-matrix.json` to
  the default inventory evidence inputs.
- Reviewer finding addressed: budget fallback responses no longer count as
  covering the requested budget tier.
  - matrix generation marks fallback-budget rows `invalid`
  - checker rejects stale/generated artifacts with `diagnostics.fallbackBudget`
  - assumption documented in `.codex/state/build-discovery-assumptions.md`
- Generated frontier 002 targets from unattempted, non-cap profiles:
  - `.codex/state/build-discovery-ap-mp-range-frontier-002-targets.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-002-targets.md`
- Generated frontier 002 matrix in Docker with `--query-limit 3`:
  - `.codex/state/build-discovery-ap-mp-range-frontier-002-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-002-matrix.md`
  - `.codex/state/build-discovery-ap-mp-range-frontier-002/`
- Result:
  - targets: `8`
  - generated: `6`
  - no build: `2`
  - invalid: `0`
  - no-build rows: L20 Intelligence tier 4 `6/6/any`, L1 Chance tier 4
    `6/6/any`
- Notable generated rows:
  - L1 Intelligence tier 1 `6/3/any`: `128` Intelligence, `141` Vitality,
    `1570.0ms`
  - L50 Chance tier 4 `6/6/any`: Slump + Khardboard packages, `637` Chance,
    `596` Vitality, `88684.1ms`
  - L80 Agility tier 4 `6/3/6`: Brrrbli + Khardboard packages, `791`
    Agility, `722` Vitality, `226395.9ms`
  - L100 Strength tier 4 `11/3/any`: Royal Rainbow Blop + Khardboard packages,
    `905` Strength, `1430` Vitality, `337096.5ms`
  - L150 Intelligence tier 4 `7/3/0`: Hell Mina + Khardboard + Soft Oak
    packages, `1336` Intelligence, `2251` Vitality, `319179.9ms`
  - L200 Chance tier 1 `7/3/any`: Rhoarim + Queen of Fate + Unsound Mind
    packages, `1458` Chance, `3353` Vitality, `128044.4ms`
- Refreshed inventory counts after frontier 002:
  - representative grid: `39,424` valid rows, `127` generated evidence rows,
    `144` attempted evidence rows, `17` no-build evidence rows, `39,297`
    unproven rows
  - full grid: `665,088` valid rows, `145` generated evidence rows, `162`
    attempted evidence rows, `17` no-build evidence rows, `664,943`
    unproven rows
- The Docker checker passes frontier 002 only with `--allow-no-build`; this is
  honest attempted evidence, not completed coverage for the two no-build rows.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-frontier-002-matrix.json --target-file /tmp/build-discovery-ap-mp-range-frontier-002-targets.json --target-file-limit 8 --target-file-prefix grid_frontier_002 --allow-no-build`
  - `python server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server\scripts\build_discovery_ap_mp_range_grid_inventory.py server\scripts\test_build_discovery_ap_mp_range_grid_inventory.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-10 Low-Level Action Target Recall Fix

- Investigated frontier 002 no-build rows.
- Raw candidate inspection showed:
  - L1 Chance tier 4 `6/6/any`: no level-1 MP items exist in the current
    candidate data, so this remains no-build evidence under current assumptions.
  - L20 Intelligence tier 4 `6/6/any`: Satisfaction Boots + Drhellbert + one
    MP exo can satisfy the target, so the previous no-build was a solver recall
    gap.
- Broadened action-stat witness seeding so it runs for any target above base
  action stats:
  - AP above level base AP
  - MP above base `3`
  - requested positive Range
- Added intermediate matrix search settings for non-base action targets:
  - `topK=50`
  - `beamWidth=150`
  - `perSignatureCap=20`
  - `relevantSetLimit=50`
- Regenerated stale frontier 002 action rows in Docker.
- Updated frontier 002 result:
  - targets: `8`
  - generated: `7`
  - no build: `1`
  - invalid: `0`
  - L20 Intelligence tier 4 `6/6/any` now generates in `4531.6ms`
  - remaining no-build row: L1 Chance tier 4 `6/6/any`
- Refreshed inventory counts after the fix:
  - representative grid: `39,424` valid rows, `128` generated evidence rows,
    `144` attempted evidence rows, `16` no-build evidence rows, `39,296`
    unproven rows
  - full grid: `665,088` valid rows, `146` generated evidence rows, `162`
    attempted evidence rows, `16` no-build evidence rows, `664,942`
    unproven rows
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-frontier-002-matrix.json --target-file /tmp/build-discovery-ap-mp-range-frontier-002-targets.json --target-file-limit 8 --target-file-prefix grid_frontier_002 --allow-no-build`
  - `python -m unittest scripts.test_build_discovery_prototype.BuildDiscoveryPrototypeTest.test_action_stat_witness_seed_runs_for_non_base_action_targets`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-10 Frontier 003 Minimum/Middle Coverage

- Generated frontier 003 targets from unattempted `minimum` and `middle`
  profiles across levels 1, 20, 50, 80, 99, 100, 120, and 150:
  - `.codex/state/build-discovery-ap-mp-range-frontier-003-targets.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-003-targets.md`
- Generated and validated frontier 003 in Docker with `--query-limit 3`:
  - `.codex/state/build-discovery-ap-mp-range-frontier-003-matrix.json`
  - `.codex/state/build-discovery-ap-mp-range-frontier-003-matrix.md`
  - `.codex/state/build-discovery-ap-mp-range-frontier-003/`
- Result:
  - targets: `8`
  - generated: `8`
  - no build: `0`
  - invalid: `0`
- Notable generated rows:
  - L1 Intelligence tier 2 `6/3/any`: `128` Intelligence, `141` Vitality,
    `1574.9ms`
  - L20 Intelligence tier 4 `6/3/0`: Bearman package, `462` Intelligence,
    `205` Vitality, `2652.1ms`
  - L80 Agility tier 4 `6/3/0`: Royal Coco Blop + Khardboard packages, `841`
    Agility, `1042` Vitality, `236030.1ms`
  - L100 Intelligence tier 4 `7/3/0`: Simbadas + Feudala + Khardboard packages,
    `980` Intelligence, `1005` Vitality, `300505.6ms`
  - L120 Chance tier 2 `7/3/any`: Naganita + Cauldini + Ancestral packages,
    `1118` Chance, `1351` Vitality, `222621.9ms`
- Performance note: even non-cap level-diversity rows can take several minutes
  today; frontier 003 is correctness/coverage evidence, not proof of the
  Milestone 2 cache-miss performance target.
- Refreshed inventory counts after frontier 003:
  - representative grid: `39,424` valid rows, `136` generated evidence rows,
    `152` attempted evidence rows, `16` no-build evidence rows, `39,288`
    unproven rows
  - full grid: `665,088` valid rows, `154` generated evidence rows, `170`
    attempted evidence rows, `16` no-build evidence rows, `664,934`
    unproven rows
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-ap-mp-range-frontier-003-matrix.json --target-file /tmp/build-discovery-ap-mp-range-frontier-003-targets.json --target-file-limit 8 --target-file-prefix grid_frontier_003`

### 2026-07-11 CP-SAT Pivot Checkpoint

- Pivoted active work to `codex/build-discovery-cpsat-milestone2`.
- Preserved old beam/frontier work:
  - branch: `archive/build-discovery-beam-frontier`
  - tag: `archive/build-discovery-beam-frontier-20260711`
- Preserved the CP-SAT spike:
  - branch: `codex/build-discovery-cpsat-experiment`
  - tag: `archive/build-discovery-cpsat-spike-20260711`
- Imported the isolated CP-SAT experiment file into this branch:
  - `server/oneoff/build_discovery_cpsat_experiment.py`
- Added `.codex/state/build-discovery-cpsat-pivot.md` to document:
  - rollback paths
  - Milestone 2 target grid
  - QA assets to keep from the old beam loop
  - old beam assets to treat as reference only
  - OR-Tools dependency packaging as a separate risk/checkpoint
- Added a static contract test for the CP-SAT experiment file without requiring
  OR-Tools to be installed in the current environment:
  - `server/scripts/test_build_discovery_cpsat_experiment.py`

### 2026-07-11 CP-SAT Query Adapter

- Kept CP-SAT isolated under `server/oneoff/`.
- Added a query-shaped adapter:
  - `solve_query(query, args)`
  - `query_from_args(args)`
- Added CP-SAT experiment CLI query fields:
  - `--level`
  - `--element`
  - `--target-ap`
  - `--target-mp`
  - `--target-range`
  - `--budget-tier`
  - `--exo-policy`
- Changed model construction so `exoPolicy=none` disables generated exo
  variables.
- Avoided item IDs now flow into candidate loading.
- Still intentionally not done:
  - no product/GraphQL wiring
  - no matrix execution through CP-SAT yet
  - no locked-item constraints
  - no OR-Tools production dependency packaging
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`

### 2026-07-11 CP-SAT Matrix Harness Adapter

- Added an opt-in CP-SAT solver path to the matrix harness:
  - `--solver prototype` remains the default.
  - `--solver cpsat` lazily imports `oneoff.build_discovery_cpsat_experiment`.
  - CP-SAT-specific options are exposed for time limit, workers, attempts,
    candidate limit, summary limit, and objective mode.
- Kept `--use-cache` scoped to the prototype solver; CP-SAT has no matrix cache
  contract yet.
- Added `.codex/state/build-discovery-cpsat-assumptions.md` as the active
  review index for pivot assumptions around scope, target semantics, budgets,
  exos, solver architecture, quality evidence, and performance.
- Added focused tests for CP-SAT matrix argument shaping and the lazy adapter
  without requiring OR-Tools in the host environment.
- Still intentionally not done:
  - no full CP-SAT matrix artifact has been generated yet
  - no OR-Tools production dependency packaging
  - no product/GraphQL wiring
  - no CP-SAT locked-item constraints
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-11 CP-SAT OR-Tools Packaging

- Added server dependency pins:
  - `ortools==9.7.2996`
  - `absl-py==2.3.1`
- Chose OR-Tools 9.7 after Docker Python 3.8 dry-run checks:
  - newer 9.8/9.9 pins attempted to pull pandas/numpy upgrades into the old
    server stack
  - 9.7 reused existing `numpy==1.19.5` and `protobuf==4.24.4`
  - 9.7 only required adding `absl-py`
- Added a CP-SAT contract test asserting the server requirements include the
  OR-Tools pin.
- Installed the selected pins into the running `dofuslab-server-1` container for
  verification only; a future image rebuild still needs to consume
  `server/requirements.txt`.
- Fixed a CP-SAT correctness gap exposed by the first real smoke:
  - the model now encodes simple item stat conditions and `and` condition trees
  - example failure fixed: a selected weapon requiring `VITALITY > 3949` while
    the reconstructed build had only `3945` Vitality
- Addressed reviewer findings in the matrix adapter:
  - CP-SAT split resume/missing detection now rejects existing reports that do
    not record CP-SAT solver provenance
  - CP-SAT top-level solver status, timings, attempts, item counts, candidate
    counts, and objective weights are promoted into row diagnostics
- Generated first Docker CP-SAT matrix smoke artifact:
  - `.codex/state/build-discovery-cpsat-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-smoke-split/`
- Smoke result:
  - target: level 200 Strength Iop tier 1 `7/3/None`
  - status: generated
  - result count: 1
  - validation errors: none
  - totals: `10/5/4`
  - score: `2165.89`
  - elapsed: `13554.0ms`
- Still intentionally not done:
  - no production/product wiring
  - no full Milestone 2 CP-SAT matrix artifact
  - no performance acceptance evidence
- Verification passed:
  - Docker: `python scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile scripts/build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-smoke.json --target-set grid-next-minimum --targets grid_next_min_level_200_strength_7_3_none_budget1`

### 2026-07-11 CP-SAT Level-200 Minimum Element Slice

- Added a target file for a tiny Milestone 2 breadth slice:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-targets.json`
- Generated and validated a 4-row Docker CP-SAT matrix:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-matrix.json`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-matrix.md`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-split/`
- Slice:
  - level 200 Iop
  - budget tier 1
  - target `7/3/None`
  - elements: Strength, Intelligence, Chance, Agility
- Result:
  - targets: `4`
  - generated: `4`
  - no build: `0`
  - invalid: `0`
- Runtime:
  - Strength: `12777.7ms`
  - Intelligence: `11756.2ms`
  - Chance: `11522.2ms`
  - Agility: `11506.1ms`
- This is useful CP-SAT breadth smoke evidence, but it is still not Milestone 2
  performance evidence.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-l200-min-elements.json --target-file /tmp/build-discovery-cpsat-l200-min-elements-targets.json --target-file-prefix cpsat_min`

### 2026-07-11 CP-SAT Model-Size Reduction

- Added a correctness-preserving cache for CP-SAT total-stat linear
  expressions.
- Tightened exact set-count variable domains to achievable upper bounds from
  compatible slots and distinct compatible items.
- Reason:
  - CP-SAT was rebuilding the same full AP/MP/Range/stat expressions for target
    constraints and item conditions.
  - The first 4-row level-200 element slice spent roughly `5.8s-6.1s` per row
    in model construction before solving.
- Generated and validated an updated 4-row Docker slice:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-modelsize-matrix.json`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-modelsize-matrix.md`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-modelsize-split/`
- Before/after timing:
  - Strength: model `5765.8ms -> 1664.0ms`, elapsed `12777.7ms -> 8962.6ms`
  - Intelligence: model `6150.9ms -> 1657.4ms`, elapsed `11756.2ms -> 7310.9ms`
  - Chance: model `5994.1ms -> 1819.1ms`, elapsed `11522.2ms -> 7312.8ms`
  - Agility: model `5949.0ms -> 1625.6ms`, elapsed `11506.1ms -> 7168.4ms`
- The next bottleneck is solver search time, which still hits the configured
  `5s` solve cap for these rows.
- The solver status for these rows is `FEASIBLE`, not `OPTIMAL`; generated
  builds are valid but should not yet be treated as stable best-build evidence.
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-l200-min-elements-setbounds.json --target-file /tmp/build-discovery-cpsat-l200-min-elements-targets.json --target-file-prefix cpsat_min`

### 2026-07-11 CP-SAT Model Diagnostics

- Added per-attempt `modelStats` diagnostics to CP-SAT output:
  - `slotCandidateCounts`
  - `slotVarCount`
  - `uniqueItemCount`
  - `exoVarCount`
  - `exactSetCountVarCount`
  - `conditionConstraintCount`
  - `setCountConstraintCount`
- Docker one-row diagnostic smoke, level 200 Strength tier 1 `7/3/None`, showed:
  - `uniqueItemCount`: `1505`
  - `slotVarCount`: `2944`
  - `exactSetCountVarCount`: `936`
  - `conditionConstraintCount`: `267`
  - `setCountConstraintCount`: `239`
- Main observed model-size issue:
  - Dofus/trophy/prysmaradite candidates are duplicated across six equivalent
    slots: `261` candidates per slot, `1566` slot vars total.
  - This is likely the next correctness-preserving performance target if we
    replace equivalent Dofus slot variables with a cardinality-style selection
    model.
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker diagnostic smoke with `--cpsat-time-limit-seconds 2`

### 2026-07-11 CP-SAT Grouped Dofus Selection

- Replaced six equivalent CP-SAT Dofus/trophy/prysmaradite slot variable sets
  with one grouped selection:
  - one boolean per Dofus/trophy/prysmaradite candidate
  - constraint: choose exactly `6`
  - reconstruction assigns the selected items back to `dofus_1` through
    `dofus_6` for artifact compatibility
- Generated and validated an updated 4-row Docker slice:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-dofusgroup-matrix.json`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-dofusgroup-matrix.md`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-dofusgroup-split/`
- Model-size impact:
  - `slotVarCount`: `2944 -> 1639`
  - Dofus candidates remain `261`, but are modeled once instead of six times.
- Runtime after grouped Dofus selection:
  - Strength: `7300.7ms`
  - Intelligence: `6678.4ms`
  - Chance: `4053.3ms`
  - Agility: `7082.5ms`
- The slice still does not meet p95 `<5s`, but this is the first CP-SAT run
  where one row completed below `5s` with a valid build under the same 5-second
  solve cap.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-l200-min-elements-dofusgroup.json --target-file /tmp/build-discovery-cpsat-l200-min-elements-targets.json --target-file-prefix cpsat_min`

### 2026-07-11 Grouped Dofus Set-Capacity Fix

- Reviewer finding addressed:
  - grouped Dofus selection initially counted the synthetic Dofus group as one
    compatible slot for set-count domains
  - this was latent with current data, but wrong for any future set containing
    multiple Dofus/trophy/prysmaradite items
- Fixed set-count upper bounds to count:
  - normal compatible slots
  - plus up to six grouped Dofus-like items
- This preserves the grouped Dofus speedup while keeping future set semantics
  correct.

### 2026-07-11 CP-SAT Level-200 Minimum Elements/Budgets Slice

- Added target file:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-budgets-targets.json`
- Generated and validated the first 16-row CP-SAT Milestone 2 minimum slice:
  - `.codex/state/build-discovery-cpsat-l200-min-elements-budgets-matrix.json`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-budgets-matrix.md`
  - `.codex/state/build-discovery-cpsat-l200-min-elements-budgets-split/`
- Slice:
  - level 200 Iop
  - all 4 elements
  - all 4 budget tiers
  - target `7/3/None`
- Result:
  - targets: `16`
  - generated: `16`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `15` optimal, `1` feasible
- Runtime:
  - min: `4287.8ms`
  - avg: `5582.8ms`
  - max: `8048.5ms`
  - rows over `5s`: `8/16`
- This is meaningful Milestone 2 breadth evidence, but still not p95
  performance acceptance.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-l200-min-elements-budgets-fixed.json --target-file /tmp/build-discovery-cpsat-l200-min-elements-budgets-targets.json --target-file-prefix cpsat_l200_min_budget`

### 2026-07-11 CP-SAT Semantic Fixture Tests

- Added executable synthetic CP-SAT fixture tests to supplement the older
  source-string contract tests.
- Covered semantics:
  - grouped Dofus/trophy/prysmaradite selection reconstructs six
    `dofus_1..dofus_6` output slots
  - two Dofus-like items from the same set can both be selected and count toward
    set bonuses
  - at most one Prysmaradite can be selected
  - the same ring item cannot fill both ring slots
  - simple `and` item conditions are encoded into the CP-SAT model before
    reconstruction
- Remaining explicit semantic gap:
  - `or` item conditions are still not encoded into CP-SAT and rely on
    post-solve validation.
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`

### 2026-07-11 CP-SAT OR Condition Encoding

- Added direct CP-SAT encoding for simple `or` item conditions when all branches
  can be represented by supported leaf/`and` stat constraints.
- Unsupported condition shapes still fall through to final post-solve
  validation rather than being guessed.
- Added an executable semantic fixture where a high-score weapon has an
  impossible `AP < 1 OR VITALITY > 99999` condition; CP-SAT now selects the
  lower-score valid weapon before reconstruction.
- Docker two-row real-data smoke validated after OR encoding:
  - Strength tier 1 `7/3/None`: generated, feasible, `9198.1ms`
  - Intelligence tier 1 `7/3/None`: generated, feasible, `7289.8ms`
  - condition constraints increased to `375` for these rows
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-or-smoke.json --target-file /tmp/build-discovery-cpsat-l200-min-elements-budgets-targets.json --target-file-prefix cpsat_l200_min_budget --targets cpsat_l200_strength_7_3_none_budget1,cpsat_l200_intelligence_7_3_none_budget1`

### 2026-07-11 First-Class Milestone 2 Grid Harness

- Added a generated `milestone2-level200` target set:
  - level 200 Iop only
  - elements: strength, intelligence, chance, agility
  - budget tiers: 1-4
  - AP targets: 7-12
  - MP targets: 3-6
  - Range targets: none, 0-6
  - total targets: 3,072
- Added matrix/checker filters for AP, MP, and Range targets, including
  `none`/`any`/`null` aliases for optional Range.
- Added harness tests pinning the Milestone 2 grid shape and filter behavior.
- Generated and validated an 8-row Docker CP-SAT smoke slice:
  - `.codex/state/build-discovery-cpsat-m2-l200-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-m2-l200-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-m2-l200-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
- Result:
  - targets: `8`
  - generated: `8`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `4` optimal, `4` feasible
- Runtime:
  - min: `5680.3ms`
  - avg: `6787.6ms`
  - max: `8768.4ms`
  - rows over `5s`: `8/8`
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_targets.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python -m py_compile scripts/build_discovery_level_diversity_targets.py scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-m2-l200-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6`

### 2026-07-11 Milestone 2 Corner Slice and Stronger Checker

- Fetched the current Notion PRD and confirmed the target technical direction:
  CP-SAT callback candidate collection, static solver index, and fast
  reconstruction/reranking. The current local adapter is still short of that
  final architecture.
- Reviewer Rawls found harness risks:
  - checker did not enforce CP-SAT solver provenance
  - `--allow-no-build` could accept CP-SAT `UNKNOWN`/timeout-shaped rows as
    no-build evidence
  - split manifests stored Docker `/tmp` paths
  - the 3,072-row grid is the level-200 single-element AP/MP/Range matrix, not
    proof of product features like playstyle, lock/avoid, API, persistence, or
    UI behavior
- Fixed the checker:
  - added `--expected-solver prototype|cpsat`
  - validates report-level `provenance.solver`
  - validates per-row `diagnostics.solver`
  - requires CP-SAT no-build rows to have `solverStatus == INFEASIBLE` when
    `--allow-no-build --expected-solver cpsat` is used
- Fixed future split manifests to store relative filenames instead of absolute
  Docker paths.
- Generated and validated a 32-row Docker CP-SAT Milestone 2 corner slice:
  - `.codex/state/build-discovery-cpsat-m2-l200-corners-targets.json`
  - `.codex/state/build-discovery-cpsat-m2-l200-corners-targets.md`
  - `.codex/state/build-discovery-cpsat-m2-l200-corners-matrix.json`
  - `.codex/state/build-discovery-cpsat-m2-l200-corners-matrix.md`
  - `.codex/state/build-discovery-cpsat-m2-l200-corners-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7, 12
  - MP: 3, 6
  - Range: none, 6
- Result:
  - targets: `32`
  - generated: `32`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `13` optimal, `19` feasible
- Runtime:
  - min: `5306.4ms`
  - avg: `6892.8ms`
  - max: `8987.8ms`
  - rows over `5s`: `32/32`
- Verification passed:
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\scripts\build_discovery_level_diversity_matrix.py server\scripts\check_build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python -m py_compile scripts/build_discovery_level_diversity_matrix.py scripts/check_build_discovery_level_diversity_matrix.py scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-m2-l200-corners-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-m2-l200-corners-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 CP-SAT Callback Collection Mode

- Added a `callback` collection mode to the isolated CP-SAT adapter.
- Callback mode:
  - builds one CP-SAT model
  - uses `CpSolverSolutionCallback` to collect feasible candidates during the
    optimization solve
  - dedupes valid candidate signatures by item shell plus exo choices
  - reconstructs the final solver assignment after solve completion so the
    final optimal/feasible assignment is represented even when the callback
    buffer filled earlier
  - records per-candidate callback order, wall time, objective, score, item
    IDs, and exo choices
- Kept the previous repeated no-good solve path as `collectionMode=repeated` for
  diagnostics.
- Wired callback mode through the matrix harness:
  - `--cpsat-collection-mode callback|repeated`
  - default is `callback`
  - diagnostics now record `collectionMode`
- Added executable tests:
  - synthetic callback fixture produces at least one valid candidate
  - matrix adapter passes and records callback mode
- Generated and validated a one-row real-data callback smoke:
  - `.codex/state/build-discovery-cpsat-callback-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-callback-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-callback-smoke-split/`
- Smoke query:
  - level 200 Strength Iop
  - budget tier 4
  - AP/MP/Range: `12/6/None`
  - query limit: `3`
  - callback candidate limit: `10`
- Result:
  - generated: `1/1`
  - result count: `3`
  - solver status: `FEASIBLE`
  - callback feasible solution count: `14`
  - valid callback candidate count: `10`
  - final assignment considered/added/represented: `true/true/true`
  - candidate diversity: `3` unique item signatures returned, max shared
    items with best `8`
- Runtime:
  - model: `1526.1ms`
  - solve: `5084.1ms`
  - total elapsed: `8631.0ms`
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\build_discovery_level_diversity_matrix.py server\scripts\test_build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/build_discovery_level_diversity_matrix.py scripts/test_build_discovery_cpsat_experiment.py scripts/test_build_discovery_level_diversity_matrix.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-callback-smoke-matrix.json --target-set milestone2-level200 --elements strength --budget-tiers 4 --ap-targets 12 --mp-targets 6 --range-targets none --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-callback-smoke-matrix.json --target-set milestone2-level200 --elements strength --budget-tiers 4 --ap-targets 12 --mp-targets 6 --range-targets none --expected-solver cpsat`

### 2026-07-11 Per-Profile Item Score Cache

- Added per-active-damage-profile item score caching to cached item records.
- This preserves profile correctness while avoiding full item rescoring on every
  same-process `load_items` call.
- Avoided double-scanning objective stats when computing linearized final-score
  objective weights.
- Added a query contract test proving the same item caches separate strength
  and intelligence scores and restores the correct cached strength score.
- Generated and validated an 8-row Docker CP-SAT score-cache smoke:
  - `.codex/state/build-discovery-cpsat-scorecache-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-scorecache-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-scorecache-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `4` optimal, `4` feasible
- Runtime:
  - elapsed min/avg/max: `5783.4ms / 6853.1ms / 8878.8ms`
  - load min/avg/max: `159.2ms / 418.0ms / 1963.2ms`
  - warm load after first row: roughly `159.2ms-311.1ms`
  - model min/avg/max: `1725.2ms / 1802.7ms / 1902.8ms`
  - solve min/avg/max: `3629.8ms / 4503.1ms / 5070.8ms`
- Interpretation:
  - score caching helps warm load time
  - the p95 target is still blocked by model build and solve time
  - next optimization should move toward static solver/model index structures,
    not more item-score caching
- Verification passed:
  - `python server\scripts\test_build_discovery_query_contract.py`
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_prototype.py server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_query_contract.py`
  - Docker: `python scripts/test_build_discovery_query_contract.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_prototype.py oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_query_contract.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-scorecache-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 CP-SAT Model Metadata Precompute

- Added `ModelMetadata` as a per-query precompute layer for CP-SAT model
  construction.
- Metadata currently contains:
  - candidates by slot
  - item lookup by ID
  - selected set IDs and max set counts
  - normalized set bonuses
  - per-item objective stats including expected item effects
- `build_model` remains compatible with old callers, but `solve_query` now
  builds metadata once and reuses it for objective weights and model creation.
- Removed obsolete repeated scans for selected set IDs, max set counts, set
  bonuses, and objective item stats during model construction.
- Added a synthetic metadata test covering slot candidates, set counts, set
  bonuses, and per-item objective stats.
- Generated and validated an 8-row Docker CP-SAT metadata smoke:
  - `.codex/state/build-discovery-cpsat-metadata-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-metadata-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-metadata-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `4` optimal, `4` feasible
- Runtime:
  - elapsed min/avg/max: `5820.1ms / 6997.9ms / 8765.5ms`
  - load min/avg/max: `158.5ms / 445.0ms / 1925.2ms`
  - model min/avg/max: `1571.4ms / 1744.8ms / 1879.2ms`
  - solve min/avg/max: `3713.0ms / 4679.9ms / 5067.2ms`
- Interpretation:
  - model metadata moved model build modestly in the right direction
  - p95 remains well above `<5s`
  - next work should reduce variable/constraint count or move more of the
    generated model to static indexed arrays
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-metadata-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Skip Useless Singleton Set Counts

- Skipped exact set-count variables for sets where:
  - at most one item can be selected
  - there is no one-item set bonus
- These sets cannot contribute set bonus stats and cannot increase the
  aggregate `SET_BONUS` condition count, so the exact count literals are
  unnecessary.
- Added a synthetic fixture test that keeps a one-item bonus set modeled while
  skipping a no-bonus singleton set.
- Galileo reviewer findings captured for next checkpoints:
  - ring slots can likely be grouped like Dofus to remove duplicate ring vars
  - set-count one-hot encoding should eventually become threshold/delta vars
  - single-slot item presence vars can reuse the slot var
  - `SET_BONUS < n` leaf conditions may be duplicated by the upper-bound path
  - sparse stat coefficient tables should move into static metadata
- Generated and validated an 8-row Docker CP-SAT set-skip smoke:
  - `.codex/state/build-discovery-cpsat-setskip-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-setskip-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-setskip-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `5` optimal, `3` feasible
- Model-size impact:
  - exact set-count vars: `876` per row
  - skipped set-count vars: `60-62` per row
- Runtime:
  - elapsed min/avg/max: `5612.1ms / 6927.2ms / 8603.3ms`
  - load min/avg/max: `172.0ms / 437.6ms / 1827.3ms`
  - model min/avg/max: `1591.0ms / 1768.2ms / 2024.6ms`
  - solve min/avg/max: `3499.0ms / 4579.2ms / 5062.0ms`
- Interpretation:
  - this is a correctness-preserving model-size cleanup
  - timing remains noisy and still above the p95 target
  - next low-risk reduction is reusing existing slot vars for single-slot
    presence constraints
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-setskip-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Reuse Single-Slot Presence Literals

- Reused an item's existing slot variable as its presence literal when the item
  has exactly one modeled slot term.
- Kept the previous explicit `present_<item>` BoolVar/equality fallback for
  multi-slot items, currently mostly duplicated ring candidates.
- Added model diagnostics:
  - `createdPresenceVarCount`
  - `reusedPresenceVarCount`
- Added a synthetic fixture test that exercises both paths:
  - a conditioned hat reuses its slot var
  - a conditioned ring still creates a separate presence var because it can
    appear in `ring_1` or `ring_2`
- Generated and validated an 8-row Docker CP-SAT presence smoke:
  - `.codex/state/build-discovery-cpsat-presence-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-presence-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-presence-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `3` optimal, `5` feasible
- Model-size impact:
  - created presence vars: `2` per row
  - reused presence literals: `215` per row
- Runtime:
  - elapsed min/avg/max: `5530.7ms / 6859.4ms / 8499.2ms`
  - load min/avg/max: `152.4ms / 422.1ms / 1774.8ms`
  - model min/avg/max: `1582.8ms / 1694.7ms / 1867.7ms`
  - solve min/avg/max: `3586.3ms / 4611.7ms / 5081.4ms`
- Interpretation:
  - this removes a large class of unnecessary presence variables/equality
    constraints for condition enforcement
  - model build is modestly lower than the prior metadata/set-skip smokes
  - the p95 target remains unmet; larger reductions likely need ring grouping
    or threshold set-bonus literals
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-presence-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Deduplicate SET_BONUS Upper-Bound Conditions

- Avoided duplicate CP-SAT constraints for `SET_BONUS < n` leaves when the
  separate set-bonus upper-bound fast path already enforces the same bound.
- Preserved OR semantics: set-bonus leaves inside OR conditions are still
  encoded recursively because deriving a hard upper bound from OR would be
  incorrect.
- Added diagnostics:
  - `skippedSetBonusConditionCount`
- Added synthetic fixture tests:
  - AND condition skips the duplicate `SET_BONUS < n` leaf but keeps other
    child constraints
  - OR condition does not skip the `SET_BONUS < n` branch
- Generated and validated an 8-row Docker CP-SAT set-bonus-dedupe smoke:
  - `.codex/state/build-discovery-cpsat-setbonusdedupe-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-setbonusdedupe-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-setbonusdedupe-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `4` optimal, `4` feasible
- Model-size impact:
  - condition constraints: `288` per row
  - skipped duplicate set-bonus condition constraints: `87` per row
- Runtime:
  - elapsed min/avg/max: `5530.6ms / 6797.1ms / 8270.1ms`
  - load min/avg/max: `150.9ms / 426.1ms / 2017.7ms`
  - model min/avg/max: `1359.2ms / 1501.7ms / 1646.6ms`
  - solve min/avg/max: `3704.0ms / 4735.7ms / 5071.6ms`
- Interpretation:
  - this produces a clear model-build reduction
  - solve time still dominates and remains above the p95 target
  - next higher-leverage reductions are ring grouping or set-threshold/delta
    variables
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-setbonusdedupe-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Group No-Exo CP-SAT Ring Slots

- Grouped `ring_1`/`ring_2` into one cardinality-2 CP-SAT slot when exos are
  disabled.
- Preserved explicit ring slots when exos are allowed because exos attach to a
  concrete equipment slot.
- Added a guard rejecting grouped-ring metadata with exo-enabled model builds.
- Updated set-count capacity so grouped rings can still contribute up to two
  items from the same set.
- Reconstructs grouped rings back into normal `ring_1` and `ring_2` output
  slots deterministically.
- Added synthetic fixture coverage for:
  - no-exo grouped ring model shape
  - exo-enabled explicit ring model shape
  - grouped metadata rejected with exos enabled
  - existing ring uniqueness through reconstruction
- Generated and validated an 8-row Docker CP-SAT ring-group smoke:
  - `.codex/state/build-discovery-cpsat-ringgroup-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-ringgroup-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-ringgroup-smoke-split/`
- Slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `6` optimal, `2` feasible
- Model-size impact:
  - no-exo rows: grouped ring slot with `134` ring candidates and `1505`
    slot vars
  - exo-enabled rows: explicit `ring_1`/`ring_2` with `134` candidates each
    and `1838` slot vars
  - no-exo grouped rows created `0` extra presence vars and reused `217`
    presence literals
- Runtime:
  - elapsed min/avg/max: `5739.3ms / 6571.9ms / 8479.0ms`
  - model min/avg/max: `1365.4ms / 1517.4ms / 1734.9ms`
  - solve min/avg/max: `3752.6ms / 4520.7ms / 5054.9ms`
- Interpretation:
  - grouping removes ring symmetry for no-exo rows and shrinks the model there
  - end-to-end p95 is still above the Milestone 2 `<5s` target
  - solve time remains the dominant bottleneck
  - next likely checkpoint is threshold/delta set-count variables or a more
    static per-level solver index
- Review:
  - Carver flagged the initial brittle tests and the grouped-metadata/exo
    footgun. The tests were updated and the model now rejects that mismatch.
  - An accidental smoke without `--solver cpsat` started the prototype path and
    was killed after it ran too long; those temp outputs were discarded.
- Verification passed:
  - `python server\scripts\test_build_discovery_cpsat_experiment.py`
  - `python server\scripts\test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server\oneoff\build_discovery_cpsat_experiment.py server\scripts\test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python -m py_compile oneoff/build_discovery_cpsat_experiment.py scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ringgroup-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 All-Element Ring-Group CP-SAT Smoke

- Expanded the ring-group smoke from strength/chance to all four single
  elements while keeping the same small AP/MP/Range shape.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ringgroup-all-elements-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-ringgroup-all-elements-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-ringgroup-all-elements-smoke-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `16`
  - generated: `16`
  - invalid: `0`
  - solver statuses: `10` optimal, `6` feasible
  - grouped no-exo rows: `8`
- Runtime:
  - elapsed min/avg/max: `5371.6ms / 6726.2ms / 8560.5ms`
  - model min/avg/max: `1327.7ms / 1540.3ms / 1919.1ms`
  - solve min/avg/max: `3511.5ms / 4675.3ms / 5093.8ms`
- Interpretation:
  - all four single-element level-200 Iop rows can generate valid builds on
    this narrow Milestone 2 slice
  - p95 remains above the `<5s` Milestone 2 target
  - CP-SAT callback rows frequently stop at feasible within the 5s solve cap,
    so quality is not yet final-best evidence
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ringgroup-all-elements-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7 --mp-targets 3 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Rejected Threshold Set-Count Experiment

- Tested replacing exact set-count one-hot variables with cumulative
  `set_at_least_n` threshold variables and set-bonus delta terms.
- Added local semantic tests during the experiment for:
  - cumulative 2-piece/3-piece set bonus deltas
  - `SET_BONUS > n` item conditions
  - OR conditions passing through a `SET_BONUS` threshold branch
- Host and Docker focused tests passed during the experiment, but the real-data
  smoke regressed solve behavior.
- Smoke slice:
  - elements: strength, chance
  - budget tiers: 1, 4
  - AP: 7
  - MP: 3
  - Range: none, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- First threshold run:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `1` optimal, `7` feasible
  - elapsed avg/max: `6878.5ms / 8216.0ms`
  - model avg: `1358.0ms`
  - solve avg/max: `4957.5ms / 5069.5ms`
- After removing redundant monotonic constraints:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `8` feasible
  - elapsed avg/max: `6965.1ms / 8178.8ms`
  - model avg: `1351.8ms`
  - solve avg/max: `5058.2ms / 5083.5ms`
- Decision:
  - do not keep this rewrite now
  - exact set-count one-hot variables are uglier but currently solve better on
    the real-data smoke
  - the useful lesson is that reducing Python/model-build time alone is not
    enough; next solver work should target search guidance, candidate packages,
    or static indexed model reuse rather than only variable count

### 2026-07-11 CP-SAT Callback Early-Stop Experiment

- Added an explicit `--stop-after-candidates` / `--cpsat-stop-after-candidates`
  option for callback collection.
- The callback now records `stoppedAfterCandidateLimit` on each callback
  attempt so latency/quality tradeoffs are visible in matrix diagnostics.
- Defaults are unchanged: callback mode still searches until optimal/proven or
  time limit unless the flag is enabled.
- Added focused tests proving:
  - callback can call `StopSearch()` after collecting the requested valid
    candidate count
  - matrix CP-SAT args preserve the early-stop flag
  - diagnostics expose `stopAfterCandidates`
- Candidate limit `5` early-stop smoke:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `8` feasible
  - elapsed min/avg/max: `4718.8ms / 5084.6ms / 6054.4ms`
  - solve min/avg/max: `2804.1ms / 3038.5ms / 3522.7ms`
  - stopped after candidate limit: `8/8`
  - quality was too low on some rows, e.g. strength tier 1 `7/3/any`
    scored `1998.19` versus `2354.87` in the prior ring-group smoke
- Candidate limit `20` early-stop smoke:
  - targets: `8`
  - generated: `8`
  - invalid: `0`
  - solver statuses: `5` optimal, `3` feasible
  - elapsed min/avg/max: `6171.0ms / 6892.5ms / 8403.9ms`
  - solve min/avg/max: `4333.7ms / 4855.8ms / 5105.2ms`
  - stopped after candidate limit: `0/8`
  - quality was broadly comparable or better than the prior smoke, but latency
    stayed above the Milestone 2 target
- Decision:
  - keep the option for experiments and future tuning
  - do not enable it by default for Milestone 2 quality evidence
  - candidate count alone is too crude; a useful stopping policy likely needs
    quality gates, benchmark deltas, or package-seeded candidates

### 2026-07-11 AP12/MP6 All-Element CP-SAT Smoke

- Ran the harder level-200 Iop corner across all four single elements after
  the ring-group checkpoint, using default callback behavior.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap12mp6-all-elements-smoke-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap12mp6-all-elements-smoke-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap12mp6-all-elements-smoke-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 12
  - MP: 6
  - Range: none, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `16`
  - generated: `16`
  - invalid: `0`
  - solver statuses: `6` optimal, `10` feasible
- Runtime:
  - elapsed min/avg/max: `4677.4ms / 6350.0ms / 8179.6ms`
  - model min/avg/max: `1122.2ms / 1291.0ms / 1488.7ms`
  - solve min/avg/max: `2897.7ms / 4558.1ms / 5072.1ms`
- Interpretation:
  - the CP-SAT path can find valid builds for the hardest sampled 12/6
    level-200 Iop single-element corners across budget extremes
  - several rows are still only feasible within the 5s solve cap
  - end-to-end latency still misses the Milestone 2 p95 target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap12mp6-all-elements-smoke-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 12 --mp-targets 6 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Mid-Grid AP10/MP5 All-Budget CP-SAT Smoke

- Ran a mid-grid level-200 Iop slice to cover budget tiers `2` and `3`, AP/MP
  interior values, and explicit mid-range requirements.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-midgrid-ap10mp5-allbudgets-matrix.json`
  - `.codex/state/build-discovery-cpsat-midgrid-ap10mp5-allbudgets-matrix.md`
  - `.codex/state/build-discovery-cpsat-midgrid-ap10mp5-allbudgets-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 2, 3, 4
  - AP: 10
  - MP: 5
  - Range: none, 3
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `32`
  - generated: `32`
  - invalid: `0`
  - solver statuses: `14` optimal, `18` feasible
  - budget coverage: `8` rows for each tier `1-4`
  - element coverage: `8` rows for each element
- Runtime:
  - elapsed min/avg/max: `5233.2ms / 6743.2ms / 8595.5ms`
  - model min/avg/max: `1391.1ms / 1543.1ms / 1809.3ms`
  - solve min/avg/max: `3257.3ms / 4773.8ms / 5079.3ms`
- Interpretation:
  - CP-SAT can generate valid builds for the first committed mid-budget,
    mid-AP/MP, explicit-range slice
  - budget tiers `2` and `3` now have committed level-200 CP-SAT evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-midgrid-ap10mp5-allbudgets-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,2,3,4 --ap-targets 10 --mp-targets 5 --range-targets none,3 --expected-solver cpsat`

### 2026-07-11 Interior AP/MP Range-0 CP-SAT Smoke

- Ran an explicit range-0 interior AP/MP slice to avoid relying on `range none`
  as a proxy for low-range requirements.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-interior-apmp-range0-matrix.json`
  - `.codex/state/build-discovery-cpsat-interior-apmp-range0-matrix.md`
  - `.codex/state/build-discovery-cpsat-interior-apmp-range0-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 8, 11
  - MP: 4, 5
  - Range: 0
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `32`
  - generated: `32`
  - invalid: `0`
  - solver statuses: `15` optimal, `17` feasible
  - AP coverage: `16` rows each for `8` and `11`
  - MP coverage: `16` rows each for `4` and `5`
- Runtime:
  - elapsed min/avg/max: `5370.9ms / 6581.7ms / 8207.1ms`
  - model min/avg/max: `1315.6ms / 1507.7ms / 1713.0ms`
  - solve min/avg/max: `3457.2ms / 4656.7ms / 5074.8ms`
- Interpretation:
  - CP-SAT can generate valid explicit range-0 builds for sampled AP/MP
    interior requirements across all elements and budget extremes
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-interior-apmp-range0-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 8,11 --mp-targets 4,5 --range-targets 0 --expected-solver cpsat`

### 2026-07-11 Cap-Pressure Mid-Budget Range-Gradient CP-SAT Smoke

- Ran a constrained level-200 Iop slice for budget tiers `2` and `3` at the
  12/6 cap with non-6 explicit range targets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-cap-budgets23-range-gradient-matrix.json`
  - `.codex/state/build-discovery-cpsat-cap-budgets23-range-gradient-matrix.md`
  - `.codex/state/build-discovery-cpsat-cap-budgets23-range-gradient-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 12
  - MP: 6
  - Range: 0, 2, 4, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `32`
  - generated: `32`
  - invalid: `0`
  - solver statuses: `3` optimal, `29` feasible
  - range coverage: `8` rows each for `0`, `2`, `4`, and `5`
  - budget coverage: `16` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `6440.4ms / 6785.8ms / 8115.5ms`
  - model min/avg/max: `1151.7ms / 1324.0ms / 1500.7ms`
  - solve min/avg/max: `4742.0ms / 5026.0ms / 5086.2ms`
- Interpretation:
  - CP-SAT can find valid builds for mid-budget 12/6 cap-pressure rows with
    explicit range targets below 6
  - most rows only reach feasible within the 5s cap, so this is coverage
    evidence, not final-best quality evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-cap-budgets23-range-gradient-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 12 --mp-targets 6 --range-targets 0,2,4,5 --expected-solver cpsat`

### 2026-07-11 AP9 Range-1 CP-SAT Smoke

- Ran a focused slice to add the first committed Milestone 2 CP-SAT evidence
  for AP `9` and explicit Range `1`.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-range1-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-range1-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-range1-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 2, 3, 4
  - AP: 9
  - MP: 3, 6
  - Range: 1
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `32`
  - generated: `32`
  - invalid: `0`
  - solver statuses: `19` optimal, `13` feasible
  - budget coverage: `8` rows for each tier `1-4`
  - MP coverage: `16` rows each for `3` and `6`
- Runtime:
  - elapsed min/avg/max: `5129.4ms / 6559.1ms / 8346.8ms`
  - model min/avg/max: `1311.1ms / 1504.2ms / 1663.9ms`
  - solve min/avg/max: `3194.2ms / 4646.5ms / 5072.7ms`
- Interpretation:
  - AP `9` and Range `1` now have committed Milestone 2 CP-SAT evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-range1-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,2,3,4 --ap-targets 9 --mp-targets 3,6 --range-targets 1 --expected-solver cpsat`

### 2026-07-11 AP8/AP11 Range-2/4/5 Mid-Budget CP-SAT Smoke

- Ran a larger Milestone 2 coverage slice targeting thin AP and range buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap8-11-ranges245-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap8-11-ranges245-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap8-11-ranges245-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 8, 11
  - MP: 3, 6
  - Range: 2, 4, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `96`
  - generated: `96`
  - invalid: `0`
  - solver statuses: `31` optimal, `65` feasible
  - AP coverage: `48` rows each for `8` and `11`
  - MP coverage: `48` rows each for `3` and `6`
  - range coverage: `32` rows each for `2`, `4`, and `5`
  - budget coverage: `48` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `4834.4ms / 6688.1ms / 7217.8ms`
  - model min/avg/max: `1312.9ms / 1510.5ms / 1731.2ms`
  - solve min/avg/max: `3120.8ms / 4817.1ms / 5082.2ms`
- Interpretation:
  - CP-SAT can generate valid builds for a larger mid-budget AP/range coverage
    slice
  - feasible-heavy statuses show this remains coverage evidence rather than
    final-best proof
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap8-11-ranges245-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 8,11 --mp-targets 3,6 --range-targets 2,4,5 --expected-solver cpsat`

### 2026-07-11 AP7/MP4 Range-3/6 CP-SAT Smoke

- Ran a focused Milestone 2 slice targeting thin AP, MP, and range buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-mp4-ranges36-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-mp4-ranges36-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-mp4-ranges36-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 2, 3, 4
  - AP: 7
  - MP: 4
  - Range: 3, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `32`
  - generated: `32`
  - invalid: `0`
  - solver statuses: `13` optimal, `19` feasible
  - budget coverage: `8` rows for each tier `1-4`
  - range coverage: `16` rows each for `3` and `6`
- Runtime:
  - elapsed min/avg/max: `5155.0ms / 6655.6ms / 8362.1ms`
  - model min/avg/max: `1326.8ms / 1540.9ms / 1720.2ms`
  - solve min/avg/max: `3283.1ms / 4706.3ms / 5084.1ms`
- Interpretation:
  - MP `4`, AP `7`, Range `3`, and Range `6` have broader committed
    Milestone 2 CP-SAT evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-mp4-ranges36-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,2,3,4 --ap-targets 7 --mp-targets 4 --range-targets 3,6 --expected-solver cpsat`

### 2026-07-11 AP9/AP10 MP4/MP5 Range-1/3 CP-SAT Smoke

- Ran a targeted Milestone 2 slice for the weakest AP/MP/range coverage
  buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-10-mp4-5-ranges13-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp4-5-ranges13-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp4-5-ranges13-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 9, 10
  - MP: 4, 5
  - Range: 1, 3
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `26` optimal, `38` feasible
  - AP coverage: `32` rows each for `9` and `10`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `1` and `3`
- Runtime:
  - elapsed min/avg/max: `5388.2ms / 6595.4ms / 8439.9ms`
  - model min/avg/max: `1331.7ms / 1525.9ms / 1699.7ms`
  - solve min/avg/max: `3620.9ms / 4701.1ms / 5073.1ms`
- Interpretation:
  - AP `9/10`, MP `4/5`, and Range `1/3` have stronger committed CP-SAT
    evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-10-mp4-5-ranges13-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 9,10 --mp-targets 4,5 --range-targets 1,3 --expected-solver cpsat`

### 2026-07-11 AP10 MP4/MP5 Mid-Budget Range Mix CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen AP `10`, MP `4/5`,
  budget tiers `2/3`, and range `none/0/2/6`.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap10-mp45-budgets23-rangesn026-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap10-mp45-budgets23-rangesn026-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap10-mp45-budgets23-rangesn026-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 10
  - MP: 4, 5
  - Range: none, 0, 2, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `28` optimal, `36` feasible
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `16` rows each for `none`, `0`, `2`, and `6`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5380.8ms / 6722.3ms / 8233.3ms`
  - model min/avg/max: `1346.7ms / 1532.2ms / 1746.4ms`
  - solve min/avg/max: `3519.8ms / 4801.8ms / 5088.4ms`
- Interpretation:
  - AP `10`, mid budgets, MP `4/5`, and range `none/0/2/6` have stronger
    committed CP-SAT evidence
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap10-mp45-budgets23-rangesn026-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 10 --mp-targets 4,5 --range-targets none,0,2,6 --expected-solver cpsat`

### 2026-07-11 AP7/AP12 MP4/MP5 Range-4/5 Edge-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen weak AP edge buckets,
  edge budgets, and the weakest exact-range buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-12-mp45-ranges45-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-12-mp45-ranges45-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-12-mp45-ranges45-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7, 12
  - MP: 4, 5
  - Range: 4, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `22` optimal, `42` feasible
  - AP coverage: `32` rows each for `7` and `12`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `4` and `5`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5373.2ms / 6726.7ms / 8621.0ms`
  - model min/avg/max: `1278.7ms / 1515.1ms / 1790.7ms`
  - solve min/avg/max: `3461.7ms / 4819.5ms / 5085.5ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `480 / 3072` targets
    (`15.62%`)
  - Range `4/5`, AP `7/12`, and budget tiers `1/4` have materially better
    committed evidence
  - MP `3` and range `none` remain under-covered; p95 remains above the
    Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-12-mp45-ranges45-budgets14-matrix.json --target-set milestone2-level200 --elements agility,intelligence,strength,chance --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 4,5 --range-targets 4,5 --expected-solver cpsat`

### 2026-07-11 AP8/AP11 MP3/MP6 Range-None/0 Edge-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen under-covered range `none`,
  MP `3`, AP `8/11`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap8-11-mp36-rangesn0-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp36-rangesn0-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp36-rangesn0-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 8, 11
  - MP: 3, 6
  - Range: none, 0
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `37` optimal, `27` feasible
  - AP coverage: `32` rows each for `8` and `11`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `none` and `0`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5008.5ms / 6430.0ms / 8412.2ms`
  - model min/avg/max: `1295.4ms / 1493.0ms / 1790.8ms`
  - solve min/avg/max: `3145.5ms / 4569.6ms / 5073.8ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `544 / 3072` targets
    (`17.71%`)
  - Range `none`, Range `0`, AP `8/11`, MP `3/6`, and edge budgets have
    stronger committed evidence
  - Range `2/3/6`, AP `9`, and mid-budget tiers are now comparatively weaker;
    p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap8-11-mp36-rangesn0-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 8,11 --mp-targets 3,6 --range-targets none,0 --expected-solver cpsat`

### 2026-07-11 AP9/AP12 MP3/MP4 Range-2/3 Mid-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen AP `9`, exact ranges
  `2/3`, MP `3/4`, and mid-budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-12-mp34-ranges23-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-12-mp34-ranges23-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-12-mp34-ranges23-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 9, 12
  - MP: 3, 4
  - Range: 2, 3
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `26` optimal, `38` feasible
  - AP coverage: `32` rows each for `9` and `12`
  - MP coverage: `32` rows each for `3` and `4`
  - range coverage: `32` rows each for `2` and `3`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5264.3ms / 6656.9ms / 7877.6ms`
  - model min/avg/max: `1360.9ms / 1525.3ms / 1711.3ms`
  - solve min/avg/max: `3419.1ms / 4744.8ms / 5082.1ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `608 / 3072` targets
    (`19.79%`)
  - AP `9`, Range `2/3`, MP `3/4`, and mid budgets have stronger committed
    evidence
  - Range `6` and Range `1` are now the lowest coverage buckets; p95 remains
    above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-12-mp34-ranges23-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 9,12 --mp-targets 3,4 --range-targets 2,3 --expected-solver cpsat`

### 2026-07-11 AP7/AP8 MP5/MP6 Range-1/6 Mid-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen the two weakest exact-range
  buckets from the prior coverage summary.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-8-mp56-ranges16-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp56-ranges16-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp56-ranges16-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 7, 8
  - MP: 5, 6
  - Range: 1, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `34` optimal, `30` feasible
  - AP coverage: `32` rows each for `7` and `8`
  - MP coverage: `32` rows each for `5` and `6`
  - range coverage: `32` rows each for `1` and `6`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `4644.8ms / 6562.7ms / 7407.5ms`
  - model min/avg/max: `1378.5ms / 1532.5ms / 1766.6ms`
  - solve min/avg/max: `2964.3ms / 4643.3ms / 5085.5ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `672 / 3072` targets
    (`21.88%`)
  - Range `1/6`, AP `7/8`, MP `5/6`, and mid budgets have stronger committed
    evidence
  - Range `4/5` and range `none` are now the lowest coverage buckets; p95
    remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-8-mp56-ranges16-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 7,8 --mp-targets 5,6 --range-targets 1,6 --expected-solver cpsat`

### 2026-07-11 AP9/AP11 MP4/MP5 Range-None/4 Edge-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `none`, exact range
  `4`, AP `9/11`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-11-mp45-rangesn4-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-11-mp45-rangesn4-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-11-mp45-rangesn4-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 9, 11
  - MP: 4, 5
  - Range: none, 4
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - solver statuses: `32` optimal, `32` feasible
  - AP coverage: `32` rows each for `9` and `11`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `none` and `4`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5264.8ms / 6549.5ms / 8338.8ms`
  - model min/avg/max: `1336.1ms / 1520.1ms / 1785.0ms`
  - solve min/avg/max: `3375.7ms / 4658.7ms / 5084.7ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `736 / 3072` targets
    (`23.96%`)
  - Range `none/4`, AP `9/11`, MP `4/5`, and edge budgets have stronger
    committed evidence
  - Range `5` is now the lowest coverage bucket; p95 remains above the
    Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-11-mp45-rangesn4-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 9,11 --mp-targets 4,5 --range-targets none,4 --expected-solver cpsat`

### 2026-07-11 AP10/AP12 MP3/MP5 Range-0/5 Mid-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `5`, range `0`,
  AP `10`, MP `3`, and mid-budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap10-12-mp35-ranges05-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap10-12-mp35-ranges05-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap10-12-mp35-ranges05-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 10, 12
  - MP: 3, 5
  - Range: 0, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `56`
  - solver statuses: `16` optimal, `48` feasible
  - AP coverage: `32` rows each for `10` and `12`
  - MP coverage: `32` rows each for `3` and `5`
  - range coverage: `32` rows each for `0` and `5`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5239.8ms / 6845.2ms / 7974.5ms`
  - model min/avg/max: `1325.8ms / 1517.5ms / 1810.0ms`
  - solve min/avg/max: `3481.5ms / 4934.0ms / 5082.8ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `792 / 3072` targets
    (`25.78%`)
  - Range `0/5`, AP `10/12`, MP `3/5`, and mid budgets have stronger
    committed evidence
  - Range `2/3/6` are now the lowest coverage buckets; p95 remains above the
    Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap10-12-mp35-ranges05-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 10,12 --mp-targets 3,5 --range-targets 0,5 --expected-solver cpsat`

### 2026-07-11 AP8/AP9 MP3/MP6 Range-2/3 Edge-Budget CP-SAT Smoke

- Ran a reviewer-recommended Milestone 2 slice to strengthen range `2/3`,
  AP `8/9`, MP `3/6`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap8-9-mp36-ranges23-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap8-9-mp36-ranges23-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap8-9-mp36-ranges23-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 8, 9
  - MP: 3, 6
  - Range: 2, 3
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `25` optimal, `39` feasible
  - AP coverage: `32` rows each for `8` and `9`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `2` and `3`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `4992.3ms / 6674.7ms / 8417.1ms`
  - model min/avg/max: `1319.2ms / 1505.3ms / 1726.7ms`
  - solve min/avg/max: `3254.0ms / 4787.8ms / 5089.9ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `856 / 3072` targets
    (`27.86%`)
  - Range `2/3`, AP `8/9`, MP `3/6`, and edge budgets have stronger
    committed evidence
  - Range `6` and Range `1` are now the lowest coverage buckets; p95 remains
    above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap8-9-mp36-ranges23-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 8,9 --mp-targets 3,6 --range-targets 2,3 --expected-solver cpsat`

### 2026-07-11 AP7/AP10 MP3/MP6 Range-1/5 Edge-Budget CP-SAT Smoke

- Ran a reviewer-recommended Milestone 2 slice to strengthen range `1/5`,
  AP `7/10`, MP `3/6`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-10-mp36-ranges15-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-10-mp36-ranges15-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-10-mp36-ranges15-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7, 10
  - MP: 3, 6
  - Range: 1, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `25` optimal, `39` feasible
  - AP coverage: `32` rows each for `7` and `10`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `1` and `5`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5504.1ms / 6702.1ms / 8320.1ms`
  - model min/avg/max: `1269.6ms / 1517.5ms / 1719.4ms`
  - solve min/avg/max: `3705.7ms / 4809.0ms / 5074.3ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `920 / 3072` targets
    (`29.95%`)
  - Range `1/5`, AP `7/10`, MP `3/6`, and edge budgets have stronger
    committed evidence
  - Range `6` is now the lowest coverage bucket; p95 remains above the
    Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-10-mp36-ranges15-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,10 --mp-targets 3,6 --range-targets 1,5 --expected-solver cpsat`

### 2026-07-11 AP11/AP12 MP4/MP5 Range-4/6 Mid-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `6`, range `4`,
  AP `11/12`, MP `4/5`, and mid-budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap11-12-mp45-ranges46-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap11-12-mp45-ranges46-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap11-12-mp45-ranges46-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 11, 12
  - MP: 4, 5
  - Range: 4, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `13` optimal, `51` feasible
  - AP coverage: `32` rows each for `11` and `12`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `4` and `6`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5296.5ms / 6808.3ms / 8406.7ms`
  - model min/avg/max: `1346.5ms / 1532.3ms / 1690.0ms`
  - solve min/avg/max: `3402.2ms / 4897.4ms / 5084.1ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `984 / 3072` targets
    (`32.03%`)
  - Range `4/6`, AP `11/12`, MP `4/5`, and mid budgets have stronger
    committed evidence
  - Range `none/0` and AP `7` are now the clearest coverage gaps; p95 remains
    above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap11-12-mp45-ranges46-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 11,12 --mp-targets 4,5 --range-targets 4,6 --expected-solver cpsat`

### 2026-07-11 AP7/AP8 MP4/MP5 Range-None/0 Mid-Budget CP-SAT Smoke

- Ran a reviewer-recommended Milestone 2 slice to strengthen range `none`,
  range `0`, AP `7/8`, MP `4/5`, and mid-budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn0-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn0-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn0-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 7, 8
  - MP: 4, 5
  - Range: none, 0
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `54` optimal, `10` feasible
  - AP coverage: `32` rows each for `7` and `8`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `none` and `0`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5133.4ms / 6115.2ms / 7123.4ms`
  - model min/avg/max: `1345.5ms / 1527.5ms / 1757.6ms`
  - solve min/avg/max: `3257.1ms / 4206.5ms / 5059.1ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1048 / 3072` targets
    (`34.11%`)
  - Range `none/0`, AP `7/8`, MP `4/5`, and mid budgets have stronger
    committed evidence
  - Range `2/3/6` are now the lowest coverage buckets; p95 remains above the
    Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-8-mp45-rangesn0-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 7,8 --mp-targets 4,5 --range-targets none,0 --expected-solver cpsat`

### 2026-07-11 AP10/AP11 MP3/MP6 Range-2/6 Edge-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `2/6`, AP `10/11`,
  MP `3/6`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap10-11-mp36-ranges26-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap10-11-mp36-ranges26-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap10-11-mp36-ranges26-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 10, 11
  - MP: 3, 6
  - Range: 2, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `23` optimal, `41` feasible
  - AP coverage: `32` rows each for `10` and `11`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `2` and `6`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5412.6ms / 6718.0ms / 8441.5ms`
  - model min/avg/max: `1304.4ms / 1515.9ms / 1815.5ms`
  - solve min/avg/max: `3507.0ms / 4832.5ms / 5081.0ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1112 / 3072` targets
    (`36.2%`)
  - Range `2/6`, AP `10/11`, MP `3/6`, and edge budgets have stronger
    committed evidence
  - Range `3` and Range `1` are now the lowest coverage buckets; p95 remains
    above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap10-11-mp36-ranges26-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 10,11 --mp-targets 3,6 --range-targets 2,6 --expected-solver cpsat`

### 2026-07-11 AP9/AP12 MP4/MP5 Range-1/3 Mid-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `3`, AP `9`, and
  mid-budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-12-mp45-ranges13-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-12-mp45-ranges13-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-12-mp45-ranges13-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 9, 12
  - MP: 4, 5
  - Range: 1, 3
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `48`
  - solver statuses: `30` optimal, `34` feasible
  - AP coverage: `32` rows each for `9` and `12`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `1` and `3`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5335.1ms / 6643.3ms / 7741.9ms`
  - model min/avg/max: `1354.1ms / 1517.5ms / 1713.8ms`
  - solve min/avg/max: `3581.1ms / 4728.0ms / 5084.1ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1160 / 3072` targets
    (`37.76%`)
  - Range `1/3`, AP `9/12`, MP `4/5`, and mid budgets have stronger
    committed evidence
  - This slice overlapped `16` previously generated targets; Range `3/4/5`
    and AP `7/9` are now the clearest coverage gaps
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-12-mp45-ranges13-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 9,12 --mp-targets 4,5 --range-targets 1,3 --expected-solver cpsat`

### 2026-07-11 AP7/AP9 MP3/MP4 Range-3/4 Edge-Budget CP-SAT Smoke

- Ran a targeted Milestone 2 slice to strengthen range `3/4`, AP `7/9`,
  MP `3/4`, and edge budget tiers.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-9-mp34-ranges34-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-9-mp34-ranges34-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-9-mp34-ranges34-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7, 9
  - MP: 3, 4
  - Range: 3, 4
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `24`
  - solver statuses: `26` optimal, `38` feasible
  - AP coverage: `32` rows each for `7` and `9`
  - MP coverage: `32` rows each for `3` and `4`
  - range coverage: `32` rows each for `3` and `4`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5337.0ms / 6628.6ms / 8475.8ms`
  - model min/avg/max: `1342.7ms / 1540.2ms / 1713.4ms`
  - solve min/avg/max: `3501.0ms / 4731.8ms / 5083.4ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1184 / 3072` targets
    (`38.54%`)
  - Budget tiers are now evenly represented at `296` targets each
  - This slice overlapped `40` previously generated targets; future slices
    should favor more explicit intersection-gap selection over single-bucket
    balancing
  - Range `5`, range `none/0/3`, and MP `6` are now the clearest coverage
    gaps; p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-9-mp34-ranges34-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,9 --mp-targets 3,4 --range-targets 3,4 --expected-solver cpsat`

### 2026-07-11 AP8/AP11 MP4/MP5 Range-3/5 Budget-1/2 CP-SAT Smoke

- Switched the next-slice choice from bucket eyeballing to an explicit missing
  target-id scan to reduce overlap with existing split artifacts.
- Ran a 64-target slice selected from the high-yield missing intersections.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets12-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets12-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets12-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 2
  - AP: 8, 11
  - MP: 4, 5
  - Range: 3, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `23` optimal, `41` feasible
  - AP coverage: `32` rows each for `8` and `11`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `3` and `5`
  - budget coverage: `32` rows each for tiers `1` and `2`
- Runtime:
  - elapsed min/avg/max: `5295.3ms / 6645.1ms / 7968.4ms`
  - model min/avg/max: `1316.9ms / 1479.5ms / 1716.7ms`
  - solve min/avg/max: `3447.8ms / 4801.6ms / 5071.9ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1248 / 3072` targets
    (`40.62%`)
  - Range `3/5`, AP `8/11`, MP `4/5`, and budget tiers `1/2` have stronger
    committed evidence
  - Coverage selection should continue using explicit missing-intersection
    scans where possible; p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets12-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,2 --ap-targets 8,11 --mp-targets 4,5 --range-targets 3,5 --expected-solver cpsat`

### 2026-07-11 AP9/AP10 MP3/MP6 Range-None/0 Edge-Budget CP-SAT Smoke

- Selected this slice from an explicit missing-target scan, weighted toward
  weak AP, MP, range, and budget buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn0-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn0-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn0-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 9, 10
  - MP: 3, 6
  - Range: none, 0
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `36` optimal, `28` feasible
  - AP coverage: `32` rows each for `9` and `10`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `none` and `0`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5008.6ms / 6434.2ms / 8327.2ms`
  - model min/avg/max: `1281.6ms / 1493.7ms / 1709.6ms`
  - solve min/avg/max: `3081.2ms / 4558.9ms / 5068.3ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1312 / 3072` targets
    (`42.71%`)
  - Range `none/0`, AP `9/10`, MP `3/6`, and edge budgets have stronger
    committed evidence
  - Continue using explicit missing-intersection scans for slice selection;
    p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-10-mp36-rangesn0-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 9,10 --mp-targets 3,6 --range-targets none,0 --expected-solver cpsat`

### 2026-07-11 AP7/AP9 MP5/MP6 Range-2/4 Mid-Budget CP-SAT Smoke

- Selected this slice from an explicit missing-target scan, weighted toward
  weak AP, MP, range, and budget buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-9-mp56-ranges24-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-9-mp56-ranges24-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-9-mp56-ranges24-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 7, 9
  - MP: 5, 6
  - Range: 2, 4
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `32` optimal, `32` feasible
  - AP coverage: `32` rows each for `7` and `9`
  - MP coverage: `32` rows each for `5` and `6`
  - range coverage: `32` rows each for `2` and `4`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5257.0ms / 6590.1ms / 7825.1ms`
  - model min/avg/max: `1355.9ms / 1523.0ms / 1728.7ms`
  - solve min/avg/max: `3506.1ms / 4685.2ms / 5073.8ms`
- Interpretation:
  - Strict CP-SAT Milestone 2 coverage is now `1376 / 3072` targets
    (`44.79%`)
  - Range `2/4`, AP `7/9`, MP `5/6`, and mid-budget tiers have stronger
    committed evidence
  - Continue using explicit missing-intersection scans for slice selection;
    p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-9-mp56-ranges24-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 7,9 --mp-targets 5,6 --range-targets 2,4 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap7-9-mp56-ranges24-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 7,9 --mp-targets 5,6 --range-targets 2,4 --expected-solver cpsat`

### 2026-07-11 AP11/AP12 MP3/MP6 Range-1/6 Mid-Budget CP-SAT Smoke

- Selected this slice from an explicit missing-target scan, weighted toward
  weak AP, MP, range, and budget buckets.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap11-12-mp36-ranges16-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap11-12-mp36-ranges16-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap11-12-mp36-ranges16-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 11, 12
  - MP: 3, 6
  - Range: 1, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `17` optimal, `47` feasible
  - AP coverage: `32` rows each for `11` and `12`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `1` and `6`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5808.5ms / 6808.7ms / 7673.9ms`
  - model min/avg/max: `1175.4ms / 1502.5ms / 1885.5ms`
  - solve min/avg/max: `4005.8ms / 4919.9ms / 5088.6ms`
- Harness accounting update:
  - tightened coverage summary to run strict current-code build validation
    before counting a split report as generated coverage
  - added explicit duplicate target and excluded split-report telemetry
  - added duplicate result-id checks to the matrix validator
  - current strict CP-SAT Milestone 2 coverage is now `1440 / 3072`
    (`46.88%`)
  - current inventory examined `1622` split reports, excluded `29` outside the
    target set, and detected `96` duplicate target ids / `153` surplus reports
- Assumptions/risk notes:
  - existing older smoke split artifacts still count as QA evidence if they
    match the current Milestone 2 target set and pass strict validation
  - duplicate target evidence is currently resolved by preferring `OPTIMAL`
    over `FEASIBLE`, then lower elapsed time
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap11-12-mp36-ranges16-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 11,12 --mp-targets 3,6 --range-targets 1,6 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap11-12-mp36-ranges16-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 11,12 --mp-targets 3,6 --range-targets 1,6 --expected-solver cpsat`
  - Host: `python -m py_compile server\scripts\summarize_build_discovery_cpsat_coverage.py server\scripts\check_build_discovery_level_diversity_matrix.py`

### 2026-07-11 AP7/AP12 MP3/MP4 Range-0/2 Edge-Budget CP-SAT Smoke

- Selected this slice from the strict coverage inventory after hardening
  duplicate and validation accounting.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-12-mp34-ranges02-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-12-mp34-ranges02-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-12-mp34-ranges02-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7, 12
  - MP: 3, 4
  - Range: 0, 2
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `24` optimal, `40` feasible
  - AP coverage: `32` rows each for `7` and `12`
  - MP coverage: `32` rows each for `3` and `4`
  - range coverage: `32` rows each for `0` and `2`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5281.0ms / 6684.4ms / 8400.6ms`
  - model min/avg/max: `1309.0ms / 1514.7ms / 1721.1ms`
  - solve min/avg/max: `3369.2ms / 4785.2ms / 5071.1ms`
- Interpretation:
  - strict CP-SAT Milestone 2 coverage is now `1504 / 3072`
    (`48.96%`)
  - the lowest coverage buckets after this checkpoint are range `5`, `none`,
    `3`, `4`, `6`, and AP `8`/`10`
  - duplicate target count remains `96` with `153` surplus split reports;
    no strict-validation failures were introduced
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-12-mp34-ranges02-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,4 --range-targets 0,2 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap7-12-mp34-ranges02-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,4 --range-targets 0,2 --expected-solver cpsat`

### 2026-07-11 AP8/AP11 MP4/MP5 Range-3/5 Opti-Budget CP-SAT Smoke

- Selected this slice from the strict coverage inventory, weighted toward
  under-covered range `5`, AP `8`, and budget tiers `3/4`.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets34-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets34-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets34-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 3, 4
  - AP: 8, 11
  - MP: 4, 5
  - Range: 3, 5
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `16` optimal, `48` feasible
  - AP coverage: `32` rows each for `8` and `11`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `3` and `5`
  - budget coverage: `32` rows each for tiers `3` and `4`
- Runtime:
  - elapsed min/avg/max: `5668.1ms / 6823.6ms / 7807.1ms`
  - model min/avg/max: `1450.3ms / 1592.6ms / 1743.9ms`
  - solve min/avg/max: `3636.6ms / 4840.4ms / 5097.4ms`
- Harness accounting update:
  - strict build validation now rejects fractional base allocations
  - strict build validation now requires the item-slot map to match known slots
  - coverage summary now records relative POSIX paths for lower cross-platform
    churn
  - coverage summary now includes bounded exclusion samples per reason
- Interpretation:
  - strict CP-SAT Milestone 2 coverage is now `1568 / 3072`
    (`51.04%`)
  - budget tiers are now balanced at `392` targets each
  - duplicate target count remains `96` with `153` surplus split reports
  - no strict-validation failures were introduced; excluded reports remain
    outside the target set
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap8-11-mp45-ranges35-budgets34-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 3,4 --ap-targets 8,11 --mp-targets 4,5 --range-targets 3,5 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap8-11-mp45-ranges35-budgets34-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 3,4 --ap-targets 8,11 --mp-targets 4,5 --range-targets 3,5 --expected-solver cpsat`
  - Host: `python -m py_compile server\scripts\summarize_build_discovery_cpsat_coverage.py server\scripts\check_build_discovery_level_diversity_matrix.py`

### 2026-07-11 AP9/AP10 MP3/MP6 Range-None/6 Mid-Budget CP-SAT Smoke

- Selected this slice from the strict coverage inventory, weighted toward
  under-covered AP `10`, Range `none`, and Range `6`.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn6-budgets23-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn6-budgets23-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap9-10-mp36-rangesn6-budgets23-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 2, 3
  - AP: 9, 10
  - MP: 3, 6
  - Range: none, 6
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `30` optimal, `34` feasible
  - AP coverage: `32` rows each for `9` and `10`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `none` and `6`
  - budget coverage: `32` rows each for tiers `2` and `3`
- Runtime:
  - elapsed min/avg/max: `5284.5ms / 6611.4ms / 7487.4ms`
  - model min/avg/max: `1342.4ms / 1520.4ms / 1748.6ms`
  - solve min/avg/max: `3544.5ms / 4724.1ms / 5080.5ms`
- Harness accounting update:
  - coverage summary Markdown now includes a reviewable assumptions section
    for target grid, budget-tier semantics, exo semantics, range semantics,
    coverage-counting rules, duplicate tie-breaks, and exclusions
  - duplicate paths now use the same relative POSIX format as selected
    coverage evidence paths
- Interpretation:
  - strict CP-SAT Milestone 2 coverage is now `1632 / 3072`
    (`53.12%`)
  - duplicate target count remains `96` with `153` surplus split reports
  - excluded reports remain outside the target set
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap9-10-mp36-rangesn6-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 9,10 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap9-10-mp36-rangesn6-budgets23-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 2,3 --ap-targets 9,10 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`
  - Host: `python -m py_compile server\scripts\summarize_build_discovery_cpsat_coverage.py server\scripts\check_build_discovery_level_diversity_matrix.py`

### 2026-07-11 AP7/AP8 MP4/MP5 Range-None/1 Edge-Budget CP-SAT Smoke

- Selected this slice from the strict coverage inventory, weighted toward
  under-covered budget tiers `1/4`, AP `8`, Range `none`, and Range `1`.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn1-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn1-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap7-8-mp45-rangesn1-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 7, 8
  - MP: 4, 5
  - Range: none, 1
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `37` optimal, `27` feasible
  - AP coverage: `32` rows each for `7` and `8`
  - MP coverage: `32` rows each for `4` and `5`
  - range coverage: `32` rows each for `none` and `1`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5103.1ms / 6471.0ms / 8446.3ms`
  - model min/avg/max: `1287.0ms / 1503.3ms / 1708.8ms`
  - solve min/avg/max: `3291.5ms / 4585.9ms / 5065.3ms`
- Interpretation:
  - strict CP-SAT Milestone 2 coverage is now `1696 / 3072`
    (`55.21%`)
  - budget tiers are balanced at `424` targets each
  - duplicate target count remains `96` with `153` surplus split reports
  - excluded reports remain outside the target set
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap7-8-mp45-rangesn1-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,8 --mp-targets 4,5 --range-targets none,1 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap7-8-mp45-rangesn1-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 7,8 --mp-targets 4,5 --range-targets none,1 --expected-solver cpsat`

### 2026-07-11 AP10/AP12 MP3/MP6 Range-3/4 Edge-Budget CP-SAT Smoke

- Selected this slice from the strict coverage inventory, weighted toward
  under-covered AP `10`, AP `12`, Range `3`, and Range `4`.
- The shell turn was interrupted while Docker was still running; recovered by
  detecting the live matrix process in the server container, waiting for it to
  exit, then validating the completed `/tmp` artifacts before copying them.
- Generated and validated:
  - `.codex/state/build-discovery-cpsat-ap10-12-mp36-ranges34-budgets14-matrix.json`
  - `.codex/state/build-discovery-cpsat-ap10-12-mp36-ranges34-budgets14-matrix.md`
  - `.codex/state/build-discovery-cpsat-ap10-12-mp36-ranges34-budgets14-split/`
- Slice:
  - elements: strength, chance, intelligence, agility
  - budget tiers: 1, 4
  - AP: 10, 12
  - MP: 3, 6
  - Range: 3, 4
  - solver: CP-SAT callback mode, query limit `1`, candidate limit `5`
- Result:
  - targets: `64`
  - generated: `64`
  - invalid: `0`
  - newly covered targets: `64`
  - solver statuses: `25` optimal, `39` feasible
  - AP coverage: `32` rows each for `10` and `12`
  - MP coverage: `32` rows each for `3` and `6`
  - range coverage: `32` rows each for `3` and `4`
  - budget coverage: `32` rows each for tiers `1` and `4`
- Runtime:
  - elapsed min/avg/max: `5390.3ms / 6642.6ms / 8601.9ms`
  - model min/avg/max: `1173.4ms / 1464.7ms / 1894.7ms`
  - solve min/avg/max: `3498.5ms / 4776.7ms / 5091.7ms`
- Reviewer note:
  - next coverage selection should prioritize cross-tab holes, not just
    marginal buckets
  - worst AP/range holes before this slice included AP `9` / Range `5` and
    AP `10` / Range `4`
  - examples of empty AP/MP/range cells before this slice included
    `9/6/range5`, `9/5/range0`, `9/5/range5`, and `8/4/range4`
- Interpretation:
  - strict CP-SAT Milestone 2 coverage is now `1760 / 3072`
    (`57.29%`)
  - duplicate target count remains `96` with `153` surplus split reports
  - excluded reports remain outside the target set
  - p95 remains above the Milestone 2 `<5s` target
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-cpsat-ap10-12-mp36-ranges34-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 10,12 --mp-targets 3,6 --range-targets 3,4 --expected-solver cpsat`
  - Host: `python server\scripts\check_build_discovery_level_diversity_matrix.py .codex\state\build-discovery-cpsat-ap10-12-mp36-ranges34-budgets14-matrix.json --target-set milestone2-level200 --elements strength,chance,intelligence,agility --budget-tiers 1,4 --ap-targets 10,12 --mp-targets 3,6 --range-targets 3,4 --expected-solver cpsat`

### 2026-07-11 Milestone 2 Damage/Survivability Preset Scope

- Updated the Milestone 2 target model so level-200 Iop coverage includes the
  four product damage/survivability presets:
  - `1`: defensive
  - `2`: balanced
  - `3`: damage
  - `4`: total glass cannon
- `MILESTONE2_LEVEL200_TARGETS` now covers:
  - 4 elements
  - 4 presets
  - 4 budget tiers
  - 6 AP targets
  - 4 MP targets
  - 8 Range targets
  - total: `12288` targets
- Preset is now included in:
  - generated target IDs, for example
    `milestone2_l200_strength_preset4_12_6_none_budget4`
  - target summaries
  - query construction
  - matrix/checker filters via `--damage-survivability-presets`
  - target manifests and generated matrix Markdown tables
  - CP-SAT coverage denominator and per-preset coverage summary
- Compatibility assumption:
  - target files or legacy target rows without `damageSurvivabilityPreset`
    default to preset `3` and keep their old synthesized target IDs
  - generated Milestone 2 targets always include `presetN` in their IDs
- Focused smoke:
  - generated `.codex/state/build-discovery-m2-preset-smoke.json`
  - generated `.codex/state/build-discovery-m2-preset-smoke.md`
  - generated `.codex/state/build-discovery-m2-preset-smoke-manifest.json`
  - generated `.codex/state/build-discovery-m2-preset-smoke-manifest.md`
  - slice: Strength Iop, level 200, budget tier `4`, `12/6/None`,
    presets `1` and `4`
  - result: `2 / 2` generated, both CP-SAT `OPTIMAL`
  - preset `1` produced a defensive Gargandyas/Vampyrina build with
    `5395` Vitality
  - preset `4` produced the glass-cannon Turtelonia build with `4533.2`
    generic damage and `2653` Vitality
- Verification passed:
  - `python server/scripts/test_build_discovery_level_diversity_matrix.py`
  - `python -m py_compile server/scripts/build_discovery_level_diversity_targets.py server/scripts/build_discovery_level_diversity_matrix.py server/scripts/check_build_discovery_level_diversity_matrix.py server/scripts/summarize_build_discovery_cpsat_coverage.py`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m2-preset-smoke.json --target-set milestone2-level200 --elements strength --damage-survivability-presets 1,4 --budget-tiers 4 --ap-targets 12 --mp-targets 6 --range-targets none --expected-solver cpsat`

### 2026-07-11 Preset-Aware Milestone 2 Corner Evidence

- Generated and validated a preset-aware 128-row Docker CP-SAT corner slice:
  - `.codex/state/build-discovery-m2-preset-corners.json`
  - `.codex/state/build-discovery-m2-preset-corners.md`
- Slice:
  - elements: strength, intelligence, chance, agility
  - damage/survivability presets: `1`, `4`
  - budget tiers: `1`, `4`
  - AP: `7`, `12`
  - MP: `3`, `6`
  - Range: `none`, `6`
  - solver: CP-SAT callback mode, candidate limit `5`, 6-second row limit
- Result:
  - targets: `128`
  - generated: `128`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `92` `OPTIMAL`, `36` `FEASIBLE`
- Representative rows:
  - defensive Strength tier 4 `12/6/None`: Gargandyas/Vampyrina package,
    `12/6/6`, `880` Strength, `5395` Vitality, generic damage `2915.14`,
    survivability `191.8`, weakest EHP `6208.88`
  - glass-cannon Strength tier 4 `12/6/None`: Turtelonia/Corruption package,
    `12/6/2`, `1268` Strength, `2653` Vitality, generic damage `4533.2`,
    survivability `82.43`, weakest EHP `2550.96`
  - glass-cannon Agility tier 4 `12/6/None`: Bubotron/Allister/Submerged
    package, `12/6/0`, `1443` Agility, `2603` Vitality, generic damage
    `4655.23`, weakest EHP `2401.3`
  - glass-cannon Chance tier 4 `12/6/6`: Servitude/Gargandyas package,
    `12/6/6`, `900` Chance, `4045` Vitality, generic damage `3696.31`,
    weakest EHP `3658.27`
- Interpretation:
  - This is enough to treat the expanded preset-aware Milestone 2 corners as
    structurally plausible: all selected corners generated valid builds across
    every element, both budget extremes, low/high AP, low/high MP, and
    unrestricted/high Range.
  - It is not proof that each package is human-accepted or final-score optimal.
    `FEASIBLE` rows only prove a valid candidate was found before the time
    limit.
  - Old no-preset coverage percentages are now obsolete for the active M2 grid;
    the active denominator is `12288` rows.
  - Low-target rows often overshoot AP/MP/Range because current semantics treat
    those targets as minimums with small surplus value.
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-m2-preset-corners.json --target-set milestone2-level200 --elements strength,intelligence,chance,agility --damage-survivability-presets 1,4 --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`
  - Host: `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m2-preset-corners.json --target-set milestone2-level200 --elements strength,intelligence,chance,agility --damage-survivability-presets 1,4 --budget-tiers 1,4 --ap-targets 7,12 --mp-targets 3,6 --range-targets none,6 --expected-solver cpsat`

### 2026-07-11 Milestone 3 Prod Sampling and Optional Slot Fixes

- Confirmed the Windows User environment variable
  `DOFUSLAB_READONLY_DATABASE_URL` is visible and can be passed into Docker
  without printing the URL.
- Prod helper preflight passed inside Docker:
  - readonly DB URL present
  - SQLAlchemy available
  - preflight opens no database connection
  - helper output is aggregate-only and omits custom set IDs/names/users
- A global `sample-limit=300` prod read hit the 5s statement timeout, so it was
  abandoned without increasing load.
- Generated bounded aggregate prod artifacts:
  - `.codex/state/build-discovery-prod-level-targets-100-20260711.json`
  - `.codex/state/build-discovery-prod-level-targets-by-bucket-20260711/`
  - `.codex/state/build-discovery-m3-prod-target-plan.md`
- Prod sampling finding:
  - global recent Iop sample is strongly level-200 skewed
  - per-bucket reads give better all-level target shapes
  - prod includes some shapes outside the query contract, such as AP below
    baseline, negative Range, and Range above `6`; these should inform
    `Range=None` and high-range rows, not expand the valid target bounds
- Ran current `prod-level-sample` target set with CP-SAT:
  - before the fix, the checker caught generated sub-200 rows spending the
    level-200 characteristic budget (`992` points)
  - root cause: CP-SAT reconstruction called shared base-allocation helpers
    without an active target-level context, so helpers used `ACTIVE_TARGET_LEVEL`
    (`200`)
- Fixed base allocation:
  - `base_stats_for_primary_allocation`, `state_with_base_allocation`, and
    `optimize_base_allocation` now accept an explicit `target_level`
  - CP-SAT reconstruction passes `target.level`
  - CP-SAT `solve_query` now runs inside `target_level_context(query.level)`
    so model construction, base stats, and reconstruction share the query level
  - prototype behavior remains context-compatible
- Fixed CP-SAT optional slots:
  - grouped Dofus/trophy/prysmaradite slots now require
    `min(6, candidate_count)` instead of exactly `6`, so zero-candidate
    low-level pools are feasible
  - pet is optional
  - low-level ordinary gear and grouped ring slots follow the prototype's
    `optional_slot_choice` rule
  - reconstruction now accepts missing optional slots
- Fixed matrix checker optional-slot validation:
  - missing pet and Dofus slots are allowed
  - missing low-level ordinary slots are allowed when
    `optional_slot_choice(slot, target.level)` is true
- Added focused regression coverage:
  - `test_base_allocation_can_use_explicit_target_level`
  - `test_low_level_model_allows_empty_pet_and_dofus_slots`
  - `test_validate_report_accepts_missing_optional_low_level_slots`
  - patched a stale CLI test fixture to include `damage_survivability_preset`
- Reran the five prior no-build rows:
  - artifact: `.codex/state/build-discovery-m3-prod-level-failures-after-optional.json`
  - generated: `5 / 5`
  - solver statuses: all `OPTIMAL`
- Reran current `prod-level-sample` after the optional-slot fixes:
  - artifact: `.codex/state/build-discovery-m3-prod-level-sample-optional-slots.json`
  - targets: `24`
  - generated: `24`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `21` `OPTIMAL`, `3` `FEASIBLE`
  - Docker checker passed with `--target-set prod-level-sample --expected-solver cpsat`
- Verification passed:
  - `python server/scripts/test_build_discovery_query_contract.py`
  - `python server/scripts/test_build_discovery_cpsat_experiment.py`
  - `python server/scripts/test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server/oneoff/build_discovery_prototype.py server/oneoff/build_discovery_cpsat_experiment.py server/scripts/check_build_discovery_level_diversity_matrix.py server/scripts/test_build_discovery_query_contract.py server/scripts/test_build_discovery_cpsat_experiment.py server/scripts/test_build_discovery_level_diversity_matrix_check.py`
  - Docker: `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_level_diversity_matrix_check.py`

### 2026-07-11 Level-Aware Wisdom Scoring

- Updated Wisdom scoring for level diversity:
  - levels `1-199`: Wisdom keeps the same modest direct utility weight
    (`0.15`) because it increases experience gained
  - level `200`: Wisdom has `0` direct utility weight
  - AP/MP reduction and parry value at level 200 should come from explicit
    AP/MP reduction/parry stats, not double-counting Wisdom itself
- Implementation:
  - added `wisdom_weight_for_level`
  - added level-aware `active_stat_weights`
  - `score_stats` and CP-SAT `stat-linear` objective mode now use active
    level-aware weights
  - `final_utility_score` now uses level-aware utility weights
- Updated local PRD and assumptions files with the flat `1-199`, zero-at-200
  Wisdom rule.
- Reran the M3 boundary sample after the corrected Wisdom rule:
  - artifact: `.codex/state/build-discovery-m3-boundary-wisdom-flat.json`
  - targets: `10`
  - generated: `10`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `10` `OPTIMAL`
  - Docker checker passed with `--target-set boundary --expected-solver cpsat`
- Verification passed:
  - `python server/scripts/test_build_discovery_query_contract.py`
  - `python server/scripts/test_build_discovery_cpsat_experiment.py`
  - `python server/scripts/test_build_discovery_level_diversity_matrix_check.py`
  - `python -m py_compile server/oneoff/build_discovery_prototype.py server/oneoff/build_discovery_cpsat_experiment.py server/scripts/test_build_discovery_query_contract.py`

### 2026-07-11 M3 Boundary and Coverage Evidence

- Generated and validated the M3 boundary target set after level-aware Wisdom
  scoring:
  - `.codex/state/build-discovery-m3-boundary-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-boundary-wisdom-flat.md`
  - targets: `10`
  - generated: `10`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `10` `OPTIMAL`
- Generated and validated the M3 AP/MP/Range coverage target set:
  - `.codex/state/build-discovery-m3-coverage-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-coverage-wisdom-flat.md`
  - targets: `12`
  - generated: `12`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `12` `OPTIMAL`
- Coverage examples:
  - level `1` Strength minimum: `6/3/0`, sparse 9-item build
  - level `99` Strength cap: `12/6/6`
  - level `100` Intelligence minimum: generated `9/6/3`, proving surplus
    action stats remain allowed
  - level `199` Chance mid: `11/6/4`
  - level `200` Agility cap: `12/6/6`
- Verification passed:
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-m3-boundary-wisdom-flat.json --target-set boundary --expected-solver cpsat`
  - Docker: `python scripts/check_build_discovery_level_diversity_matrix.py /tmp/build-discovery-m3-coverage-wisdom-flat.json --target-set coverage --expected-solver cpsat`

### 2026-07-11 M3 Harsh Cap Evidence

- Generated and validated the M3 `grid-next-cap` target set with no-builds
  allowed only when CP-SAT proves infeasibility:
  - `.codex/state/build-discovery-m3-grid-next-cap-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-grid-next-cap-wisdom-flat.md`
  - targets: `12`
  - generated: `10`
  - no build: `2`
  - invalid: `0`
  - solver statuses: `10` `OPTIMAL`, `2` `INFEASIBLE`
- The infeasible rows are both low-level cap targets:
  - level `1` Strength `12/6/6` budget tier `4`
  - level `20` Strength `12/6/6` budget tier `4`
- Every sampled level from `50` through `200` generated a valid `12/6/6`
  Strength Iop build.
- Interpretation: M3 should distinguish impossible syntactic requests from
  failed search. Current CP-SAT evidence can support a structured `no_build`
  response with diagnostics for impossible AP/MP/range caps.
- Verification passed:
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-grid-next-cap-wisdom-flat.json --target-set grid-next-cap --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 All-Level Inventory And Next Sample

- Re-read the Notion PRD. Current Notion numbering now treats:
  - Milestone 2: level-200 Iop single-element matrix
  - Milestone 3: level-200 all-class expansion
  - Milestone 4: all-level Iop expansion
- The active loop request still calls the all-level Iop expansion `M3`; current
  local artifacts keep the existing `m3` filename convention while documenting
  that this maps to the Notion all-level Iop gate.
- Updated the AP/MP/Range grid inventory defaults so current M3 evidence is
  counted by default:
  - `.codex/state/build-discovery-m3-boundary-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-coverage-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-grid-next-cap-wisdom-flat.json`
  - `.codex/state/build-discovery-m3-next-level-sample-20260711.json`
  - `.codex/state/build-discovery-m3-prod-level-sample-optional-slots.json`
- Added resolved-evidence accounting to the inventory:
  - `generatedEvidenceCount`: generated valid build rows only
  - `noBuildEvidenceCount`: explicit no-build rows
  - `resolvedEvidenceCount`: generated rows plus no-build rows, for milestone
    accounting where solver-proven infeasibility is a valid outcome
  - `unresolvedCount`: valid query rows without generated or no-build evidence
- Refreshed the all-level Iop inventory:
  - artifact: `.codex/state/build-discovery-m3-all-level-inventory-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-all-level-inventory-20260711.md`
  - valid query rows: `665088`
  - generated evidence rows: `160`
  - no-build evidence rows: `22`
  - resolved evidence rows: `180`
  - attempted evidence rows: `180`
  - unresolved rows: `664908`
- Generated a targeted 12-row next-level sample from inventory suggestions:
  - target file: `.codex/state/build-discovery-m3-next-level-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-next-level-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-next-level-sample-20260711.md`
  - generated: `6 / 12`
  - no build: `6 / 12`
  - invalid: `0`
  - solver statuses: `6` `OPTIMAL`, `6` `INFEASIBLE`
- Sample highlights:
  - level `80` Strength tier `2` generated `12/6/6`
  - level `200` Strength tier `2` generated `12/6/6`
  - levels `5`, `6`, and `7` tier `1` minimum rows generated sparse low-level
    builds
  - tiny-level MP-heavy, range-heavy, and cap stress rows correctly returned
    solver-proven `INFEASIBLE`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-next-level-targets-20260711.json --output-json /tmp/build-discovery-m3-next-level-sample-20260711.json --output-md /tmp/build-discovery-m3-next-level-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-next-level-sample-20260711.json --target-file .codex/state/build-discovery-m3-next-level-targets-20260711.json --expected-solver cpsat --allow-no-build`
  - `python server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python server/scripts/test_build_discovery_level_diversity_matrix_check.py`
  - Docker: `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_ap_mp_range_grid_inventory.py`

### 2026-07-11 M3/M4 Inventory Resolved Semantics

- Tightened all-level inventory accounting:
  - `noBuildEvidenceCount` now counts only no-build rows whose diagnostics
    report `solverStatus=INFEASIBLE`
  - unknown/timeout-shaped no-build rows remain unresolved
  - inventory JSON now includes `unresolvedExamples`
  - rendered next rows now use `nextUnresolvedTargets`, so solver-proven
    infeasible rows are not repeatedly suggested for future solver slices
- Refreshed the all-level Iop inventory under the stricter semantics:
  - valid query rows: `665088`
  - generated evidence rows: `172`
  - attempted evidence rows: `192`
  - proven no-build evidence rows: `8`
  - resolved evidence rows: `180`
  - unresolved rows: `664908`
- Interpretation: earlier loose reporting counted every no-build attempt as
  no-build evidence. The stricter report preserves only proven infeasibility as
  resolved milestone evidence.
- Verification passed:
  - `python server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server/scripts/build_discovery_ap_mp_range_grid_inventory.py server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`

### 2026-07-11 M3/M4 Thin-Bucket Sample

- Generated and validated a 12-row sample focused on the thinnest evidence
  buckets: non-Strength `range_heavy` and `mp_heavy` all-level Iop targets.
  - target file: `.codex/state/build-discovery-m3-thin-bucket-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-thin-bucket-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-thin-bucket-sample-20260711.md`
  - generated: `11 / 12`
  - no build: `1 / 12`
  - invalid: `0`
  - solver statuses: `11` `OPTIMAL`, `1` `INFEASIBLE`
- Sample highlights:
  - level `25` Intelligence tier `2` generated `6/3/6`
  - level `35` Agility tier `2` generated `7/6/any`
  - level `55` Chance tier `1` generated `7/4/6`
  - level `95` Agility tier `3` generated `10/5/6`
  - level `199` Agility tier `4` generated `12/5/6`
  - level `20` Chance tier `2` `6/6/any` returned solver-proven
    `INFEASIBLE`
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `188`
  - attempted evidence rows: `210`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `202`
  - unresolved rows: `664886`
  - `range_heavy` improved from `6` to `12` resolved rows
  - `mp_heavy` improved from `18` to `24` resolved rows
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-thin-bucket-targets-20260711.json --output-json /tmp/build-discovery-m3-thin-bucket-sample-20260711.json --output-md /tmp/build-discovery-m3-thin-bucket-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-thin-bucket-sample-20260711.json --target-file .codex/state/build-discovery-m3-thin-bucket-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Level-Coverage Sample

- Generated and validated a 12-row sample focused on previously zero-resolved
  levels across the progression:
  - target file: `.codex/state/build-discovery-m3-level-coverage-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-level-coverage-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-level-coverage-sample-20260711.md`
  - generated: `12 / 12`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `12` `OPTIMAL`
- Covered levels: `11`, `22`, `33`, `44`, `56`, `67`, `78`, `89`, `102`,
  `123`, `157`, `193`.
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `200`
  - attempted evidence rows: `222`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `214`
  - unresolved rows: `664874`
  - zero-resolved levels: `139`, down from `151`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-level-coverage-targets-20260711.json --output-json /tmp/build-discovery-m3-level-coverage-sample-20260711.json --output-md /tmp/build-discovery-m3-level-coverage-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-level-coverage-sample-20260711.json --target-file .codex/state/build-discovery-m3-level-coverage-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Level-Coverage Sample 2

- Generated and validated a second 12-row sample focused on previously
  zero-resolved levels, biased toward post-100 progression:
  - target file: `.codex/state/build-discovery-m3-level-coverage-2-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-level-coverage-2-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-level-coverage-2-sample-20260711.md`
  - generated: `12 / 12`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `12` `OPTIMAL`
- Covered levels: `12`, `24`, `48`, `72`, `104`, `116`, `128`, `140`,
  `152`, `164`, `176`, `188`.
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `212`
  - attempted evidence rows: `234`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `226`
  - unresolved rows: `664862`
  - zero-resolved levels: `127`, down from `139`
- Performance observation: level `104`, `116`, and `128` rows were all above
  `8s`, so the all-level correctness evidence continues to expose optimization
  work.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-level-coverage-2-targets-20260711.json --output-json /tmp/build-discovery-m3-level-coverage-2-sample-20260711.json --output-md /tmp/build-discovery-m3-level-coverage-2-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-level-coverage-2-sample-20260711.json --target-file .codex/state/build-discovery-m3-level-coverage-2-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Level-Coverage Sample 3

- Generated and validated a third 12-row sample focused on low-level
  zero-resolved rows:
  - target file: `.codex/state/build-discovery-m3-level-coverage-3-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-level-coverage-3-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-level-coverage-3-sample-20260711.md`
  - generated: `12 / 12`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `12` `OPTIMAL`
- Covered levels: `14`, `15`, `16`, `17`, `21`, `23`, `26`, `27`, `28`,
  `29`, `30`, `31`.
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `224`
  - attempted evidence rows: `246`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `238`
  - unresolved rows: `664850`
  - zero-resolved levels: `115`, down from `127`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-level-coverage-3-targets-20260711.json --output-json /tmp/build-discovery-m3-level-coverage-3-sample-20260711.json --output-md /tmp/build-discovery-m3-level-coverage-3-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-level-coverage-3-sample-20260711.json --target-file .codex/state/build-discovery-m3-level-coverage-3-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Zero-Level Selector And Sample 4

- Added `nextZeroResolvedLevelTargets` to the AP/MP/Range inventory report.
  This selector picks one plausible minimum-style target for each level with no
  resolved evidence, cycling elements across suggested levels.
- Generated and validated the first selector-driven 16-row sample:
  - target file: `.codex/state/build-discovery-m3-level-coverage-4-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-level-coverage-4-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-level-coverage-4-sample-20260711.md`
  - generated: `16 / 16`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `16` `OPTIMAL`
- Covered levels: `32`, `34`, `36`, `38`, `39`, `41`, `43`, `45`, `46`,
  `47`, `49`, `51`, `52`, `53`, `54`, `57`.
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `240`
  - attempted evidence rows: `262`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `254`
  - unresolved rows: `664834`
  - zero-resolved levels: `99`, down from `115`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-level-coverage-4-targets-20260711.json --output-json /tmp/build-discovery-m3-level-coverage-4-sample-20260711.json --output-md /tmp/build-discovery-m3-level-coverage-4-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-level-coverage-4-sample-20260711.json --target-file .codex/state/build-discovery-m3-level-coverage-4-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Next Unresolved Sample

- Generated and validated a 10-row sample from the stricter
  `nextUnresolvedTargets` inventory suggestions:
  - target file: `.codex/state/build-discovery-m3-unresolved-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-unresolved-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-unresolved-sample-20260711.md`
  - generated: `5 / 10`
  - no build: `5 / 10`
  - invalid: `0`
  - solver statuses: `5` `OPTIMAL`, `5` `INFEASIBLE`
- Sample highlights:
  - level `80` Strength tier `1` generated `12/6/6`
  - level `200` Strength tier `1` generated `12/6/6`
  - level `1`, `5`, and `6` minimum rows generated
  - tiny-level cap/MP/range stress rows returned solver-proven `INFEASIBLE`
- Refreshed all-level inventory after adding this sample:
  - valid query rows: `665088`
  - generated evidence rows: `177`
  - attempted evidence rows: `198`
  - proven no-build evidence rows: `13`
  - resolved evidence rows: `190`
  - unresolved rows: `664898`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-unresolved-targets-20260711.json --output-json /tmp/build-discovery-m3-unresolved-sample-20260711.json --output-md /tmp/build-discovery-m3-unresolved-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-unresolved-sample-20260711.json --target-file .codex/state/build-discovery-m3-unresolved-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3/M4 Inventory Review Summaries

- Added inventory review summaries by:
  - element
  - budget tier
  - profile bucket: `minimum`, `cap`, `mp_heavy`, `range_heavy`,
    `ap_heavy`, `middle`
- Refreshed the all-level inventory with these summaries. Current generated
  evidence is intentionally sampled and skewed:
  - generated evidence rows: `177`
  - attempted evidence rows: `198`
  - proven no-build evidence rows: `13`
  - resolved evidence rows: `190`
  - unresolved rows: `664898`
  - Strength: `73` generated rows
  - Intelligence: `38` generated rows
  - Chance: `33` generated rows
  - Agility: `33` generated rows
  - `range_heavy`: only `3` generated rows and `6` resolved rows
  - `mp_heavy`: only `15` generated rows and `18` resolved rows
- Interpretation: the next high-signal samples should favor non-Strength
  elements plus `range_heavy` and `mp_heavy` profile buckets rather than adding
  more Strength cap/minimum evidence.
- Verification passed:
  - `python server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`
  - `python -m py_compile server/scripts/build_discovery_ap_mp_range_grid_inventory.py server/scripts/test_build_discovery_ap_mp_range_grid_inventory.py`

### 2026-07-11 M3/M4 Between-Boundary Level Sample

- Generated and validated a targeted between-boundary level sample to avoid
  proving only the familiar bucket edges:
  - target file: `.codex/state/build-discovery-m3-between-boundary-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-between-boundary-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-between-boundary-sample-20260711.md`
  - levels: `13`, `18`, `37`, `42`, `75`, `98`, `101`, `111`, `137`,
    `141`, `171`, `187`
  - elements: Strength, Intelligence, Chance, Agility
  - generated: `12 / 12`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `12` `OPTIMAL`
- Refreshed the all-level Iop inventory again after adding this sample to the
  default artifact set. These were historical loose no-build totals from this
  checkpoint; the stricter canonical inventory totals are recorded in the later
  Inventory Review Summaries section:
  - valid query rows: `665088`
  - generated evidence rows: `172`
  - no-build evidence rows: `22`
  - resolved evidence rows: `192`
  - attempted evidence rows: `192`
  - unresolved rows: `664896`
- Performance observation: the level `111` Agility row took about `14.7s` and
  the level `137` Strength row took about `11.0s`, so correctness sampling is
  improving faster than the `<5s` cache-miss target.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-between-boundary-targets-20260711.json --output-json /tmp/build-discovery-m3-between-boundary-sample-20260711.json --output-md /tmp/build-discovery-m3-between-boundary-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-between-boundary-sample-20260711.json --target-file .codex/state/build-discovery-m3-between-boundary-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Unsupported Condition Exclusion and Level-Coverage Sample 5

- Fixed a CP-SAT correctness gap exposed by level `74` Strength tier `1`
  `6/3/None`: unsupported item conditions such as `ALIGNMENT_LEVEL > 10`
  were not encoded in the model, so the solver could optimize toward an item
  that reconstruction later rejected. Items with unsupported conditions are now
  explicitly excluded from the CP-SAT candidate model and counted in
  `unsupportedConditionItemCount`.
- Added a semantic regression where a high-scoring unsupported-condition weapon
  must lose to a lower-scoring legal fallback before reconstruction.
- Generated and validated the fifth level-coverage sample:
  - target file: `.codex/state/build-discovery-m3-level-coverage-5-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-level-coverage-5-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-level-coverage-5-sample-20260711.md`
  - levels: `58`, `59`, `61`, `62`, `63`, `64`, `65`, `66`, `68`, `69`,
    `71`, `73`, `74`, `76`, `77`, `79`
  - generated: `16 / 16`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `16` `OPTIMAL`
- Refreshed the all-level inventory after adding this sample to the default
  artifact set:
  - valid query rows: `665088`
  - generated evidence rows: `256`
  - attempted evidence rows: `278`
  - proven no-build evidence rows: `14`
  - resolved evidence rows: `270`
  - unresolved rows: `664818`
  - zero-resolved levels computed from `byLevel`: `83`
- Reviewer note: `nextZeroResolvedLevelTargets` has done its smoke-coverage
  job for this slice, but it still mostly proposes easy minimum rows. Future
  high-signal samples should favor non-minimum unresolved rows, especially
  `mp_heavy` and `range_heavy` buckets and non-Strength elements.
- Verification passed:
  - `python server/scripts/test_build_discovery_cpsat_experiment.py`
  - Docker: `PYTHONPATH=/home/dofuslab python scripts/test_build_discovery_cpsat_experiment.py`
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-level-coverage-5-targets-20260711.json --output-json /tmp/build-discovery-m3-level-coverage-5-sample-20260711.json --output-md /tmp/build-discovery-m3-level-coverage-5-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-level-coverage-5-sample-20260711.json --target-file .codex/state/build-discovery-m3-level-coverage-5-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Profile-Stress Slice 1

- Generated and validated a non-minimum unresolved slice after the reviewer
  flagged that zero-level targets were mostly easy minimum rows:
  - target file: `.codex/state/build-discovery-m3-profile-stress-1-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-profile-stress-1-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-profile-stress-1-sample-20260711.md`
  - generated: `1 / 12`
  - no build: `11 / 12`
  - invalid: `0`
  - solver statuses: `1` `OPTIMAL`, `11` `INFEASIBLE`
- Useful generated edge proof:
  - level `99` Intelligence tier `2` `12/6/6`
  - items include Simbadas Set x3, Khardboard Set x3, Gelano, Orchid
    Rhineetle, and low-level trophies.
- The infeasible rows cleanly resolve several low-level cap, MP-heavy, and
  range-heavy stress targets instead of leaving them as retry candidates.
- Refreshed all-level inventory after adding the profile-stress artifact:
  - valid query rows: `665088`
  - generated evidence rows: `257`
  - attempted evidence rows: `285`
  - proven no-build evidence rows: `25`
  - resolved evidence rows: `282`
  - unresolved rows: `664806`
  - zero-resolved levels computed from `byLevel`: `83`
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-profile-stress-1-targets-20260711.json --output-json /tmp/build-discovery-m3-profile-stress-1-sample-20260711.json --output-md /tmp/build-discovery-m3-profile-stress-1-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-profile-stress-1-sample-20260711.json --target-file .codex/state/build-discovery-m3-profile-stress-1-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Profile-Stress Slice 2

- Generated and validated a second profile-stress slice balancing unresolved
  retries, mid/high-level cap/MP/range rows, and a small zero-level smoke pass:
  - target file: `.codex/state/build-discovery-m3-profile-stress-2-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-profile-stress-2-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-profile-stress-2-sample-20260711.md`
  - generated: `14 / 16`
  - no build: `2 / 16`
  - invalid: `0`
  - solver statuses: `14` `OPTIMAL`, `2` `INFEASIBLE`
- Useful generated rows include:
  - level `199` Agility tier `2` `12/6/6`
  - level `101` Chance tier `2` `12/6/6`
  - level `120` Chance tier `2` `12/6/6`
  - level `150` Chance tier `2` `12/6/6`
  - level `180` Agility tier `3` `12/5/6`
- Clean infeasible proofs:
  - level `20` Chance tier `2` `12/6/6`
  - level `1` Chance tier `4` `6/6/Any`
- Quality caveat: minimum target rows can heavily oversatisfy AP/MP/Range
  because current semantics treat those as minimums with low marginal action
  stat weight. For example level `81` Strength tier `1` `6/3/Any` generated
  `9/6/5`. This is valid but needs human quality review so minimum rows do not
  become weird action-stat builds.
- Refreshed all-level inventory after adding the profile-stress-2 artifact:
  - valid query rows: `665088`
  - generated evidence rows: `271`
  - attempted evidence rows: `298`
  - proven no-build evidence rows: `27`
  - resolved evidence rows: `298`
  - unresolved rows: `664790`
  - zero-resolved levels computed from `byLevel`: `79`
  - `mp_heavy` generated evidence: `27`
  - `range_heavy` generated evidence: `11`
- Reviewer guidance after this slice: continue with plausible transition rows
  around levels `50`, `60`, `75`, `80`, `98-101`, `120`, `137`, `140`,
  `150`, `160`, `180`, and `199`, mostly tier `2` with selective tier `3`.
  Avoid letting fast tiny-level infeasibility inflate `resolvedEvidenceCount`
  without improving generated quality.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-profile-stress-2-targets-20260711.json --output-json /tmp/build-discovery-m3-profile-stress-2-sample-20260711.json --output-md /tmp/build-discovery-m3-profile-stress-2-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-profile-stress-2-sample-20260711.json --target-file .codex/state/build-discovery-m3-profile-stress-2-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Profile-Stress Slice 3

- Generated and validated the reviewer-recommended plausible transition slice:
  - target file: `.codex/state/build-discovery-m3-profile-stress-3-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-profile-stress-3-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-profile-stress-3-sample-20260711.md`
  - generated: `17 / 17`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `17` `OPTIMAL`
- This slice is stronger M3 evidence than the tiny-level stress rows because it
  targets plausible non-Strength leveling builds around real transition levels:
  `50`, `60`, `75`, `80`, `98`, `99`, `100`, `101`, `120`, `137`, `140`,
  `150`, `160`, `180`, and `199`.
- Useful generated examples:
  - level `50` Intelligence tier `2` `7/5/1` generated `7/5/3`
  - level `98` Agility tier `2` `11/6/3` generated `11/6/4`
  - level `99` Chance tier `2` `12/6/6` generated `12/6/6`
  - level `160` Agility tier `2` `12/6/3` generated `12/6/3`
  - level `199` Intelligence tier `2` `12/6/5` generated `12/6/6`
- Refreshed all-level inventory after adding the profile-stress-3 artifact:
  - valid query rows: `665088`
  - generated evidence rows: `288`
  - attempted evidence rows: `315`
  - proven no-build evidence rows: `27`
  - resolved evidence rows: `315`
  - unresolved rows: `664773`
  - zero-resolved levels computed from `byLevel`: `79`
  - `mp_heavy` generated evidence: `32`
  - `range_heavy` generated evidence: `13`
- Quality caveat: Khardboard pieces still appear frequently across mid-level
  builds. That may be legitimate under v0 availability and set/package scoring,
  but it should be reviewed as a possible scorer/package bias before claiming
  the builds are human-plausible.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-profile-stress-3-targets-20260711.json --output-json /tmp/build-discovery-m3-profile-stress-3-sample-20260711.json --output-md /tmp/build-discovery-m3-profile-stress-3-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-profile-stress-3-sample-20260711.json --target-file .codex/state/build-discovery-m3-profile-stress-3-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Prod-Shaped Slice 1

- Queried readonly prod for aggregate-only Iop AP/MP/Range shape frequencies:
  - JSON: `.codex/state/build-discovery-prod-iop-ap-mp-range-aggregate-20260711.json`
  - markdown: `.codex/state/build-discovery-prod-iop-ap-mp-range-aggregate-20260711.md`
  - scope: latest `2000` Iop custom sets modified in the last `2 years`
  - privacy: aggregate only; no custom set IDs, names, owners, or item lists
  - generated rows could not be excluded because prod does not yet have the
    local `generation_request` table
  - the full 2-year aggregate hit the `15s` timeout, so the final query used a
    bounded latest-2000 sample and completed in about `6.7s`
- Generated and validated a prod-shaped target slice based on bracket-level
  popular AP/MP/Range shapes, with tier `3`/`4` overlays for budget coverage:
  - target file: `.codex/state/build-discovery-m3-prod-shaped-1-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-prod-shaped-1-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-prod-shaped-1-sample-20260711.md`
  - generated: `18 / 18`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `18` `OPTIMAL`
- Useful generated rows include:
  - level `30` Intelligence tier `2` `7/4/1` generated exact `7/4/1`
  - level `40` Chance tier `2` `8/3/0` generated exact `8/3/0`
  - level `125` Chance tier `2` `11/6/1` generated `11/6/2`
  - level `160` Chance tier `3` `10/6/3` generated `10/6/5`
  - level `200` Agility tier `4` `10/6/4` generated exact `10/6/4`
- Refreshed all-level inventory after adding the prod-shaped artifact:
  - valid query rows: `665088`
  - generated evidence rows: `306`
  - attempted evidence rows: `333`
  - proven no-build evidence rows: `27`
  - resolved evidence rows: `333`
  - unresolved rows: `664755`
  - tier `3` generated evidence: `54`
  - tier `4` generated evidence: `48`
  - `mp_heavy` generated evidence: `37`
  - `range_heavy` generated evidence: `13`
- Reviewer guidance: this is a good M3 slice, but prod AP/MP/Range shapes are
  bracket-level popularity signals, not element- or budget-specific proof.
  Tier `3`/`4` rows here are coverage overlays, not prod-derived budget labels.
  Future rare-shape rows should prefer higher-count prod shapes unless they are
  intentionally testing edge diversity.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-prod-shaped-1-targets-20260711.json --output-json /tmp/build-discovery-m3-prod-shaped-1-sample-20260711.json --output-md /tmp/build-discovery-m3-prod-shaped-1-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-prod-shaped-1-sample-20260711.json --target-file .codex/state/build-discovery-m3-prod-shaped-1-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Range-Heavy Slice 1

- Generated and validated an explicit Range 6 corner-case slice because
  prod-shaped rows under-cover Range 6:
  - target file: `.codex/state/build-discovery-m3-range-heavy-1-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-range-heavy-1-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-range-heavy-1-sample-20260711.md`
  - generated: `18 / 18`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `18` `OPTIMAL`
- This slice covers Range 6 across all elements, levels `40-200`, and budgets
  `2-4`, with a small mix of MP+Range and cap rows:
  - level `40` Intelligence tier `2` `7/3/6` generated exact `7/3/6`
  - level `50` Chance tier `2` `8/4/6` generated exact `8/4/6`
  - level `99` Agility tier `2` `11/5/6` generated exact `11/5/6`
  - level `140` Strength tier `2` `11/4/6` generated exact `11/4/6`
  - level `199` Intelligence tier `3` `12/6/6` generated exact `12/6/6`
  - level `200` Chance tier `4` `10/6/6` generated exact `10/6/6`
- Refreshed all-level inventory after adding the Range-heavy artifact:
  - valid query rows: `665088`
  - generated evidence rows: `324`
  - attempted evidence rows: `351`
  - proven no-build evidence rows: `27`
  - resolved evidence rows: `351`
  - unresolved rows: `664737`
  - `range_heavy` generated evidence: `28`, up from `13`
  - `mp_heavy` generated evidence: `39`
- Performance caveat: hard Range 6 rows are slower than prod-shaped rows. The
  level `140` Strength row took about `14.1s`, and the level `200` Chance row
  took about `15.4s`, so the later performance milestone still has real work.
- Reviewer guidance for the next Range pass: prefer level `80+` rows with more
  tier `1` and tier `4` budget coverage, avoid low-level impossible Range spam,
  and keep most rows Range 6 without making them full cap rows.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-range-heavy-1-targets-20260711.json --output-json /tmp/build-discovery-m3-range-heavy-1-sample-20260711.json --output-md /tmp/build-discovery-m3-range-heavy-1-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-range-heavy-1-sample-20260711.json --target-file .codex/state/build-discovery-m3-range-heavy-1-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 M3 Range-Heavy Slice 2

- Generated and validated the reviewer-guided Range 6 follow-up slice focused
  on level `80+` and budget tier `1`/`4` gaps:
  - target file: `.codex/state/build-discovery-m3-range-heavy-2-targets-20260711.json`
  - result artifact: `.codex/state/build-discovery-m3-range-heavy-2-sample-20260711.json`
  - markdown: `.codex/state/build-discovery-m3-range-heavy-2-sample-20260711.md`
  - generated: `20 / 20`
  - no build: `0`
  - invalid: `0`
  - solver statuses: `20` `OPTIMAL`
- Useful generated rows include:
  - level `80` Intelligence tier `1` `9/4/6` generated `9/6/6`
  - level `100` Chance tier `1` `8/4/6` generated `9/6/6`
  - level `120` Strength tier `1` `10/4/6` generated `11/6/6`
  - level `180` Intelligence tier `1` `10/5/6` generated exact `10/5/6`
  - level `199` Agility tier `4` `11/5/6` generated exact `11/5/6`
  - level `200` Agility tier `4` `11/6/6` generated exact `11/6/6`
- Refreshed all-level inventory after adding the Range-heavy-2 artifact:
  - valid query rows: `665088`
  - generated evidence rows: `344`
  - attempted evidence rows: `371`
  - proven no-build evidence rows: `27`
  - resolved evidence rows: `371`
  - unresolved rows: `664717`
  - `range_heavy` generated evidence: `43`, up from `28`
  - tier `1` generated evidence: `106`
  - tier `4` generated evidence: `53`
- Quality caveat: many Range 6 rows oversatisfy MP to `6` even when the target
  asks for `4` or `5`; this remains valid under minimum-target semantics but
  needs human review for budget/plausibility.
- Wisdom scoring check: the Range-heavy-2 artifact keeps direct Wisdom objective
  weight at `0.15` for levels `80-199`; level `200` rows omit direct Wisdom
  objective weight, matching the rule that Wisdom should not be double-counted
  at cap when AP/MP reduction and parry are explicit stats.
- Performance caveat: several Range 6 rows took more than `10s` in Docker
  generation, including level `200` Chance and Agility rows over `15s`.
- Reviewer guidance for a future Range pass: tier `4` is still clustered near
  `199/200`; consider replacing lower-value tier `2` repeats with tier `4`
  Chance/Intelligence rows around `150-180`.
- Verification passed:
  - Docker generation:
    `python scripts/build_discovery_level_diversity_matrix.py --solver cpsat --target-file /tmp/build-discovery-m3-range-heavy-2-targets-20260711.json --output-json /tmp/build-discovery-m3-range-heavy-2-sample-20260711.json --output-md /tmp/build-discovery-m3-range-heavy-2-sample-20260711.md`
  - `python server/scripts/check_build_discovery_level_diversity_matrix.py .codex/state/build-discovery-m3-range-heavy-2-sample-20260711.json --target-file .codex/state/build-discovery-m3-range-heavy-2-targets-20260711.json --expected-solver cpsat --allow-no-build`

### 2026-07-11 Explicit Combat Range Axis

- Restored combat range preference as a first-class PRD/query axis with
  supported values `melee`, `mixed`, and `ranged`.
- Clarified that combat range preference is separate from numeric Range target:
  numeric Range is an AP/MP/Range build constraint, while combat range controls
  melee/ranged damage valuation, weapon assumptions, and survivability context.
- Product/API may infer a default, but defaults should be computed from bounded
  readonly prod aggregate evidence by `(class, element)`. Heuristic fallbacks
  are allowed only when prod evidence is unavailable or sparse, and diagnostics
  should label the default source.
- The resolved combat range preference must still be stored explicitly in the
  request, cache key, diagnostics, and generated-build provenance.
- Milestone 2 now explicitly requires level 200 Iop coverage across combat
  range preference, not only melee Strength scoring. `mixed` and `ranged` need
  benchmark rows before they can be marked trusted.

### 2026-07-11 Combat Range Classifier Plan

- Added a PRD plan to classify complete level `200` prod builds as `ranged`,
  `melee`, `mixed`, or `unknown` before deriving `(class, element)` defaults.
- Scope is intentionally narrow: complete level `200` builds only, all required
  slots equipped, generated rows excluded when provenance exists.
- Added element classification as a prerequisite for combat range defaults:
  classify complete builds as `strength`, `intelligence`, `chance`, `agility`,
  `multi`, `omni`, or `unknown`.
- v1 default derivation should skip `multi`, `omni`, and `unknown` element rows
  while reporting their counts; only clean single-element rows feed
  `(class, element)` combat range defaults.
- Signal precedence:
  1. explicit tag
  2. `% Ranged Damage` / `% Melee Damage`
  3. positive `Range`
  4. ranged weapon family (`Wand`, `Bow`) vs melee weapon family
  5. weapon/spell damage context: for ranged weapons, both `% Weapon Damage`
     and `% Spell Damage` strengthen ranged classification; for melee weapons,
     `% Weapon Damage` strengthens melee classification
- Default selection should aggregate classified rows by `(class, dominant
  element)`, choose a prod-derived default only with enough samples and a clear
  winner, use `mixed` for ambiguous majorities, and label sparse fallbacks as
  `heuristic_fallback`.
- Implementation should start as a bounded readonly report with unit-tested
  classifier behavior before wiring defaults into generation.
- Added +Range correlation reporting to the plan: the prod classifier report
  should show Range distributions by `(class, element, combatRange)` and how
  +Range correlates with combat range classification, ranged/melee damage,
  weapon family, weapon/spell damage, AP, and MP.
- Product hypothesis to test: many users may not have a strict hard Range
  requirement, and may instead expect Range to be evaluated as a useful stat
  tradeoff. Keep explicit hard Range targets, but use prod evidence before
  making hard Range the default interaction model.

### 2026-07-11 Prod Combat Range 20-Row Smoke

- Ran a bounded readonly prod smoke over `20` complete level `200` builds
  modified since `2025-07-11`.
- Artifacts:
  - `.codex/state/build-discovery-prod-combat-range-small-sample-20260711.json`
  - `.codex/state/build-discovery-prod-combat-range-small-sample-20260711.md`
- Privacy: custom set IDs, owner IDs, and custom set names are omitted.
- Caveat: prod does not yet have `generation_request`, so generated rows cannot
  be excluded by provenance.
- Summary from the tiny sample:
  - element classes: `chance=3`, `intelligence=2`, `strength=3`, `multi=8`,
    `omni=4`
  - combat range classes: `ranged=13`, `mixed=5`, `melee=2`
  - Range by combat range: melee avg `1.0`, mixed avg `3.6`, ranged avg `4.85`
  - weapon families: `Bow=6`, `Wand=5`, `Hammer=4`, `Dagger=3`, `Sword=2`
- Early caveats for implementation:
  - no sampled rows had useful explicit tags, so stat/weapon inference did all
    classification work
  - many sampled rows had unknown default class, so class/element defaults need
    class presence diagnostics
  - the simplistic smoke classifier can let +Range dominate melee weapon
    signals; the real classifier needs reviewed thresholds before defaults are
    trusted

### 2026-07-11 Prod Combat Range 100-Row Known-Class Sample

- Ran a bounded readonly prod sample over `100` complete level `200` builds
  modified since `2025-07-11`, requiring a known/default class.
- Query was split into a recent complete-build ID read plus scoped stat,
  weapon, and tag reads for those IDs to stay light on prod.
- Artifacts:
  - `.codex/state/build-discovery-prod-combat-range-known-class-100-20260711.json`
  - `.codex/state/build-discovery-prod-combat-range-known-class-100-20260711.md`
- Class distribution includes `Cra=21`, `Enutrof=13`, `Iop=10`, `Feca=8`,
  `Sram=7`, `Foggernaut=6`, `Pandawa=6`, plus smaller samples from other
  classes.
- Element classifier distribution: `multi=38`, `omni=24`, `intelligence=14`,
  `chance=10`, `agility=8`, `strength=6`.
- Combat range classifier distribution with +Range intentionally weak:
  `melee=58`, `ranged=42`.
- +Range does not strongly separate inferred combat range in this sample:
  melee avg Range `3.17`, ranged avg Range `2.98`; both groups include
  high-Range and low/negative-Range rows.
- Caveat: prod does not yet have `generation_request`, so generated rows cannot
  be excluded by provenance.

### 2026-07-11 Combat Range Classifier Revision

- Updated the Notion PRD and local assumptions so unsupported +Range cannot
  classify a build as `ranged` by itself.
- Revised signal precedence: explicit tag, then class/element spell archetype,
  then ranged/melee damage stats, then weapon family, then weapon/spell damage
  context, then +Range as a weak utility/tradeoff signal.
- Added spell-archetype evidence as a requirement before wiring defaults:
  important spell range buckets, modifiable-range support, line-of-sight
  constraints, cooldown/cast limits, and whether +Range helps the main damage
  pattern.
- Working rule: a 5 Range build with no ranged tag, no ranged-damage stats, no
  ranged weapon context, and no ranged/modifiable spell archetype should be
  `mixed` or `melee`, not `ranged`.

### 2026-07-11 Combat Range Weapon Context Guardrails

- Updated the Notion PRD and local assumptions so weapon family is supporting
  context, not unconditional combat-range intent.
- Cra is treated as an archer archetype: Cra with Sword should not become pure
  `melee` by weapon alone; it should generally be `mixed` unless other melee
  evidence is overwhelming.
- Melee-leaning class/build examples such as Iop with Bow, Enutrof with
  Daggers, and Intelligence Sacrier with Wand should be allowed to remain
  `mixed` or `melee` when the weapon looks like a stat-stick or utility choice.
- Added required guardrail fixtures for these cases before wiring prod-derived
  combat range defaults into generation.

### 2026-07-11 Prod Combat Range 200-Row Reclass Sample

- Ran a bounded readonly prod sample over `200` complete level `200` builds
  modified since `2025-07-11`, requiring known/default class.
- Query was split into scoped ID, stat, weapon, and tag reads to avoid heavy
  prod joins; then the same rows were locally reclassified with stricter v4
  weapon/archetype guardrails.
- Artifacts:
  - `.codex/state/build-discovery-prod-combat-range-known-class-200-20260711.json`
  - `.codex/state/build-discovery-prod-combat-range-known-class-200-20260711.md`
  - `.codex/state/build-discovery-prod-combat-range-known-class-200-v4-20260711.json`
  - `.codex/state/build-discovery-prod-combat-range-known-class-200-v4-20260711.md`
- v4 classifier distribution: `mixed=147`, `melee=32`, `ranged=21`.
- Useful reviewed examples:
  - Cra with Sword/Hammer/Dagger and no strong melee stats now becomes `mixed`,
    not pure melee or pure ranged from weapon/archetype alone.
  - Iop with Bow and no ranged damage context becomes `mixed`, not ranged.
  - Enutrof with Dagger/Sword and no strong melee damage context becomes
    `mixed`.
  - Intelligence Sacrier with Wand and no ranged damage context remains
    `melee`.
  - Strong ranged stat context can still override archetype, e.g. Strength Iop
    with Wand plus `% Ranged Damage` and `% Spell Damage` classifies `ranged`.
- Caveat: v4 still uses rough class priors. The planned spell-archetype report
  should replace these priors before defaults are wired into generation.

### 2026-07-11 Combat Posture Simplification

- Updated the Notion PRD and local assumptions with the current working
  hypothesis that item selection differs materially for `melee` vs `non_melee`,
  but often not much between `mixed` and `ranged`.
- Mixed-vs-ranged should primarily affect spell evaluation, score explanation,
  and +Range valuation unless prod/spell evidence shows a real gear-shell
  difference.
- Default derivation should first choose `melee` vs `non_melee`; split
  `non_melee` into `mixed` vs `ranged` only when spell archetype, tags, or
  strong damage-specialization stats make the distinction clear.
- Added a required itemization-difference report before using mixed and ranged
  as separate generation matrix axes.

### 2026-07-11 Ranged/Melee Damage Item Check

- Ran a bounded readonly prod item-stat query for `PCT_RANGED_DAMAGE` and
  `PCT_MELEE_DAMAGE`.
- Result: `% Ranged Damage` appears on only `9` items, mostly the level 120
  elemental Katanas with negative ranged damage, Musamune with negative ranged
  damage, and the level 150 trophy `Impetuous`.
- Result: `% Melee Damage` appears on only `4` items: `Helsephine's Love`,
  `Pugilist`, and two level 150 trophies with negative melee damage
  (`Audacious`, `Cautious`).
- Updated the Notion PRD and local assumptions: ranged-vs-mixed should not
  become a major item-search axis unless later itemization-overlap evidence
  proves it matters.
- New emphasis: derive "how important is +Range to this build?" mostly from
  spell data: key damaging spells, max range, modifiable-range support,
  minimum range constraints, line-of-sight constraints, practical rotation
  share, and whether extra Range changes reachable targets.

### 2026-07-11 Impetuous Overvaluation Fix

- Investigated why `Impetuous` appeared in top generated Strength Iop builds.
- Found a concrete scorer bug: `damage_calculator.average_line_damage` always
  used the `"ranged"` damage branch for every modeled damage line, so
  `% Ranged Damage` applied to generic spell/weapon damage even when action
  distance was unknown.
- Fixed damage lines to default to neutral distance. `% Ranged Damage` and
  `% Melee Damage` now apply only when a `DamageLine` explicitly declares
  `distance="ranged"` or `distance="melee"`.
- Set unconditional `% Ranged Damage` and `% Melee Damage` stat weights to
  zero in the prototype until spell-derived distance context is available.
- Added a focused unittest covering neutral, ranged, and melee distance
  behavior.
- Verification: `python -m unittest oneoff.test_damage_calculator` passed
  inside the Docker server container.
- Caveat: a full `12/6/any` Strength Iop generation smoke timed out after about
  two minutes, so the updated top-build artifact still needs to be regenerated
  with the faster CP-SAT path or a narrower harness command.

### 2026-07-11 Class/Element Stat Valuation Direction

- Updated the Notion PRD and local assumptions: each class/element should have
  a stat valuation profile derived from spell mechanics, not one global stat
  weight table.
- Range importance is one of the most class-specific values and should be
  derived from spell plans before it becomes a major scoring/defaulting lever.
- Example direction: Strength Iop has high-base-damage spells such as
  Accumulation and Iop's Wrath, so Strength should generally be valued more
  than Earth Damage while both remain useful; +Range is nearly useless for many
  Iop spell plans.
- Example direction: +Range can be vital for Enutrof and Cra profiles because
  their important spell plans depend much more on modifiable range and distance
  control.
- Required report: classify +Range usefulness by `(class, element)` as
  `vital`, `useful`, `marginal`, or `nearly useless`, with spell evidence.

### 2026-07-11 Spell-Derived +Range Usefulness v1

- Derived first-pass +Range usefulness classifications for `76`
  `(class, element)` profiles from local spell tables.
- Artifacts:
  - `.codex/state/build-discovery-spell-range-usefulness-20260711.json`
  - `.codex/state/build-discovery-spell-range-usefulness-20260711.md`
- Method:
  - use highest local `spell_stats` row per spell
  - identify damaging spells by elemental damage/steal effects
  - weight spells heuristically by average base damage per AP, casts per turn,
    cooldown penalty, and a penalty for best-element-only damage
  - classify +Range usefulness from weighted modifiable-range share,
    weighted high-range modifiable share, and short-range locked share
- Distribution: `vital=21`, `useful=13`, `marginal=10`,
  `nearly useless=32`.
- Sanity-check examples:
  - Cra all four single elements classify `vital`.
  - Enutrof is `vital` for Intelligence/Chance/Agility and `useful` for
    Strength.
  - Iop is `nearly useless` for Strength/Chance/Agility and `marginal` for
    Intelligence.
  - Sacrier all four single elements classify `nearly useless`.
- Caveats:
  - local spell data may be outdated
  - exact rotations, buffs, AoE value, mobility, erosion, variant exclusivity,
    and utility are not modeled
  - some profiles may be polluted by generic/best-element lines and need class
    review before becoming production weights

### 2026-07-11 Spell Damage Profiles v0

- Derived first-pass spell damage profiles for `76` `(class, element)` pairs.
- Artifacts:
  - `.codex/state/build-discovery-spell-damage-profiles-v0-20260711.json`
  - `.codex/state/build-discovery-spell-damage-profiles-v0-20260711.md`
- Method:
  - use highest local `spell_stats` row per spell
  - identify damaging spells by elemental damage/steal effects
  - weight spells by average base damage per AP, casts per turn, cooldown
    penalty, and a best-element penalty
  - compute rough sensitivity to `+100 primary`, `+100 Power`, `+10 flat
    elemental damage`, and `+10% Spell Damage`
- Current confidence: `high=1`, `medium=75`. Only Strength Iop is marked high
  because it already has the most reviewed local spell scoring path.
- Sanity-check examples:
  - Strength Iop: `+100 Strength ~= 6.52%`, `+10 flat ~= 1.53%`, top spells
    include Concentration, Accumulation, and Sword of Iop.
  - Cra profiles have `mod-range share=1.0` and strong primary-stat
    sensitivity.
  - Enutrof profiles have meaningful modifiable-range shares, matching the
    +Range usefulness report.
- Caveat: this is rotation-lite, not a true rotation model. It does not model
  summons, turrets, portals, bombs, AoE value, utility, class states, setup
  turns, or variant exclusivity. Some classes show suspicious huge base-damage
  rows and need class review before production scoring uses these weights.

### 2026-07-11 All-Class Pre-Optimization Smoke Plan

- Added a concrete smoke matrix for expanding Milestone 2 from Iop-only to all
  level-200 class/element pairs before optimization work.
- Artifacts:
  - `.codex/state/build-discovery-all-class-preopt-smoke-plan-20260711.json`
  - `.codex/state/build-discovery-all-class-preopt-smoke-plan-20260711.md`
- Coverage: `76` class/element profiles across `19` classes.
- Fully expanded row count: `674` solver rows if every listed
  damage/survivability preset is run.
- Current blocker: the solver is not truly all-class yet. `BuildDiscoveryQuery`
  still rejects non-Iop classes, and CP-SAT currently configures damage by
  element through the Iop-era profile path.
- Next implementation step: wire class/element spell profiles into scoring,
  cache/provenance identity, diagnostics, and +Range soft valuation before any
  non-Iop generation result can be considered product evidence.

### 2026-07-11 Class-Aware Spell Profile Wiring Slice

- Removed the Iop-only query validation guard for known Dofus classes in the
  prototype and CP-SAT experiment.
- Generalized spell-candidate loading to key by `(className, element, level)`
  instead of a hidden Iop class constant.
- Preserved the reviewed Strength Iop rotation path for Iop-specific mechanics
  such as Wrath and Accumulation.
- Routed non-reviewed class/element profiles through
  `spell_profile_v0_weighted_candidates` instead of the Iop turn planner.
- Added response diagnostics:
  - `profile.className`
  - `profile.confidence`
  - `profile.rotationModel`
  - `profile.spellCandidateCount`
- Added a warning for non-reviewed class/element scoring so non-Iop output is
  clearly marked as rotation-lite.
- Validation:
  - `python -m py_compile server/oneoff/build_discovery_prototype.py server/oneoff/build_discovery_cpsat_experiment.py`
  - `python -m unittest scripts.test_build_discovery_prototype` passed
    (`136` tests).
  - `git diff --check` passed.
  - Docker server container accepted `BuildDiscoveryQuery(class_name="Cra")`
    after copying touched server files into `/home/dofuslab`.
  - Docker mocked response smoke returned `Cra`,
    `spell_profile_v0_weighted_candidates`, `medium`.
- Remaining gap: +Range soft valuation is still not wired into objective
  weights; this slice only makes class/element spell damage profile selection
  explicit and safe enough for the next milestone step.

### 2026-07-11 Spell-Derived +Range Soft Valuation Slice

- Replaced the single global soft `Range` score with an active class/element
  soft weight derived from spell candidate range evidence.
- Explicit `rangeTarget` remains a hard target. When `rangeTarget=None`,
  `Range` is now treated as a class/element-dependent soft stat.
- Added range metadata to `SpellDamageCandidate`:
  - `min_range`
  - `max_range`
  - `has_modifiable_range`
- Weight bands:
  - `8.0` for vital high-modifiable-range profiles
  - `5.0` for useful profiles
  - `2.0` for marginal/fallback profiles
  - `0.5` for nearly-useless short locked-range profiles
- Response diagnostics now include `scoring.rangeSoftWeight`.
- Validation:
  - `python -m py_compile server/oneoff/build_discovery_prototype.py server/oneoff/build_discovery_cpsat_experiment.py`
  - `python -m unittest scripts.test_build_discovery_prototype` passed
    (`137` tests).
  - `python -m unittest scripts.test_damage_calculator` passed (`6` tests).
  - `git diff --check` passed.
  - Docker mocked response smoke returned `Cra`,
    `spell_profile_v0_weighted_candidates`, and `rangeSoftWeight=8.0` for
    range-heavy spell evidence.
