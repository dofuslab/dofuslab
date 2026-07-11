# Build Discovery CP-SAT Assumptions

Last updated: 2026-07-11

This file tracks assumptions that are active for the CP-SAT rewrite. Older
beam/frontier assumptions remain useful archaeology, but these are the ones to
review before accepting Milestone 2 evidence.

## Product Scope

- Current solver scope is Iop only.
- Current Milestone 2 scope is level 200, single-element Iop builds.
- Milestone 2 target grid is 3,072 rows:
  - 4 elements
  - 4 budget tiers
  - AP 7-12
  - MP 3-6
  - Range `None` plus 0-6
- Milestone 3, per the user-facing goal for this loop, expands Iop to all valid
  levels after the level-200 Iop matrix is structurally reliable.
- Other classes stay out of the active implementation until the Iop grid has
  solver quality evidence.

## Target Semantics

- AP and MP targets are minimum required totals, capped at 12 AP and 6 MP.
- Range `None` means any range total is acceptable, including negative or zero
  if the underlying stats allow it.
- Numeric Range targets are minimum required totals, capped at 6 Range.
- More AP, MP, or Range can be good, but action-stat surplus should not dominate
  element damage, survivability, and build quality.
- Level baseline AP is 6 for levels 1-99 and 7 for levels 100+.
- Base MP is assumed to be 3.
- Current valid all-level Iop grid starts from `6/3/None` below level 100 and
  `7/3/None` at level 100+.

## Budget And Availability

- Availability v0 is hardcoded and intentionally coarse.
- Budget tiers are cumulative: tier 2 can use tier 1 items, tier 3 can use
  tiers 1-2, and tier 4 can use all previous tiers.
- Tier 1 allows normal items, mounts, and trophies under current assumptions.
- Tier 2 includes pets, petsmounts, and accessible Dofuses such as Turquoise,
  Crimson, Ice, Dolmanax, and Emerald.
- Tier 3 includes exos and prysmaradites.
- Tier 4 includes Ochre, Vulbis, legendary items, and top-end opti access.
- Budget fallback does not count as coverage for the requested tier.

## Exos

- `exoPolicy=none` forbids generated AP/MP/Range exos.
- In the current CP-SAT adapter, `exoPolicy=allow` and `exoPolicy=opti` are not
  distinct yet.
- Current generated exo variables allow at most one exo per item slot and at
  most one exo per stat.
- CP-SAT currently models generated AP and MP exos, plus generated Range exos
  only when the query has a positive numeric Range target.
- Locked-item constraints are not yet modeled in CP-SAT.
- CP-SAT encodes leaf, `and`, and simple `or` item conditions when every branch
  is representable as supported stat constraints. Unsupported condition shapes
  still rely on final post-solve validation.

## Solver Architecture

- CP-SAT is still isolated under `server/oneoff/`.
- The matrix harness can now call CP-SAT with `--solver cpsat`, but this is an
  artifact-generation path, not product wiring.
- The Notion PRD now prefers CP-SAT callback candidate collection plus a static
  solver index and fast reconstruction/reranking. The current main-repo adapter
  has started callback candidate collection, but has not yet reached the full
  static-index/fast-rerank architecture.
- CP-SAT `collectionMode=callback` collects feasible candidates during one
  optimization solve and then reconstructs the final solver assignment. This is
  intended to replace repeated no-good solves for product alternatives.
- The older repeated no-good collection mode remains available for diagnostics.
- The old beam solver remains reference material only.
- Matrix artifacts and checkers remain useful QA evidence if they validate the
  serialized build, target, and query payload independent of solver internals.
- OR-Tools is pinned in server requirements as `ortools==9.7.2996`.
- The selected OR-Tools pin was chosen because Docker dry-run resolution on
  Python 3.8 showed it can reuse the existing `numpy==1.19.5` and
  `protobuf==4.24.4` pins.
- `absl-py==2.3.1` is the only newly pinned dependency required by that
  OR-Tools dry run.

## Quality Evidence

- Previous generated matrices are evidence that target rows and validators work;
  they are not proof that CP-SAT currently finds best builds.
- Milestone 2 now has a first-class level-200 Iop grid in the harness:
  4 elements x 4 budget tiers x AP 7-12 x MP 3-6 x Range none/0-6 =
  3,072 targets.
- This grid is the level-200 single-element AP/MP/Range matrix. It is not yet
  proof of the full product contract for playstyle, locked items, avoided
  items, weapon preference, API, persistence, or UI behavior.
- Milestone 2 matrix/checker runs can be filtered by element, budget tier,
  AP target, MP target, and Range target, including `none` Range targets.
- The matrix checker can require solver provenance with `--expected-solver`.
  CP-SAT no-build rows only count as allowed no-build evidence when the solver
  reports `INFEASIBLE`, not `UNKNOWN` or a timeout-shaped status.
- Previous expensive regression and benchmark fixtures are comparison anchors,
  not exact item-lock requirements unless explicitly promoted.
- Exact item-by-item regression should be reserved for accepted benchmark builds
  where preserving the known package is the goal.
- General quality regression should compare score/build quality against accepted
  benchmarks so equivalent or better builds can pass.

## Performance

- Milestone 2 success target remains p95 cache-miss time under 5 seconds for the
  accepted target suite.
- Current CP-SAT work has not proven the p95 target.
- First Docker CP-SAT smoke row took `13554.0ms`, so performance is not yet
  Milestone 2 acceptable.
- First 4-row level-200 all-element `7/3/None` slice took roughly
  `11.5s-12.8s` per row, confirming the next CP-SAT work needs performance and
  model-size attention before full Milestone 2 generation.
- After total-stat expression caching and set-count domain tightening, the same
  slice took roughly `7.2s-9.0s` per row. This is better but still above the
  p95 `<5s` target.
- Current timed CP-SAT slice rows are `FEASIBLE`, not `OPTIMAL`; they prove
  valid generation but not stable best-build quality.
- Current CP-SAT model treats the six Dofus/trophy/prysmaradite slots as one
  grouped cardinality selection and reconstructs the six output slots afterward.
  This assumes those slots are order-equivalent for scoring, conditions, and
  validation.
- Set-count capacity for grouped Dofus selection counts up to six Dofus-like
  items, not just the single synthetic group, so future set-linked Dofus-like
  items can still be represented correctly.
- Grouped Dofus reconstruction, same-set Dofus counting, one-Prysmaradite
  selection, ring item uniqueness, and simple `and` condition encoding are now
  covered by executable synthetic CP-SAT fixture tests.
- The first 16-row level-200 all-element/all-budget `7/3/None` slice generated
  all rows, but p95 remains above `5s`; only `8/16` rows were under `5s`.
- First first-class Milestone 2 selector smoke generated 8/8 rows for
  strength/chance, budget tiers 1/4, AP `7`, MP `3`, Range `none/6`;
  elapsed times were `5680.3ms-8768.4ms`, so all rows remain above `5s`.
- First 32-row Milestone 2 corner slice generated 32/32 rows for
  strength/chance, budget tiers 1/4, AP `7/12`, MP `3/6`, Range `none/6`;
  elapsed times were `5306.4ms-8987.8ms`, so all rows remain above `5s`.
- First real-data callback smoke for strength tier 4 `12/6/None` collected
  10 valid callback candidates from 14 feasible callbacks, represented the
  final solver assignment, returned 3 builds, and took `8631.0ms` total.
  Callback collection is architecturally aligned
  with the PRD, but still needs static-index/fast-rerank performance work.
- Item scores are cached per active damage profile on cached item records. This
  reduces repeated same-process item scoring during matrix slices without
  reusing a strength score for intelligence/chance/agility rows.
- An 8-row score-cache smoke had warm load times around `159.2ms-311.1ms`
  after the first cold row, but model build (`1725.2ms-1902.8ms`) and solve
  (`3629.8ms-5070.8ms`) remain the main bottlenecks.
- CP-SAT model construction now uses per-query `ModelMetadata` for slot
  candidates, item lookup, set bonuses, selected set IDs, set counts, and
  item objective stats. This reduces repeated Python-side scans and prepares
  the path toward a static solver index, but model creation still averages
  around `1744.8ms` on the 8-row smoke.
- CP-SAT skips exact set-count variables for sets that can select at most one
  item and have no one-item bonus. These sets cannot affect set bonus stats or
  the aggregate `SET_BONUS` condition count. The 8-row set-skip smoke reduced
  exact set-count variables to `876` per row and skipped `60-62` variables per
  row.
- CP-SAT reuses an item's existing slot variable as its presence literal when
  the item can only occupy one modeled slot. On the 8-row presence smoke this
  reused `215` presence literals per row and created only `2` extra presence
  variables for multi-slot items such as rings.
- Expensive full-grid runs should be split, resumable, and checkpointed.
- Prod database reads are only for bounded benchmark discovery and must stay
  read-only with small samples and query timeouts.
