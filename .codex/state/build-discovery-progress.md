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
