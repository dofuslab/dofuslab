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
- Expensive full-grid runs should be split, resumable, and checkpointed.
- Prod database reads are only for bounded benchmark discovery and must stay
  read-only with small samples and query timeouts.
