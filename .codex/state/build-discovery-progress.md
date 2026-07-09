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
