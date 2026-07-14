# Build Discovery Decisions

## Harness Decisions

- Use the main Codex thread as orchestrator.
- Use the evaluator before implementation when existing work is present.
- Keep planner read-heavy and implementation-free.
- Keep evaluator read-only by default.
- Keep worker scoped to one accepted slice at a time.
- Record durable decisions in `.codex/state/`.
- Each new reviewable implementation step should be a stacked commit or PR.
- The complete original history is preserved at
  `archive/build-discovery-full-history-20260713`; the last beam-search frontier
  is preserved at `archive/build-discovery-beam-frontier`.
- Current implementation work starts from `master` and contains only the CP-SAT
  direction. Historical approaches remain recoverable through Git.
- Future stacked PRs should avoid mixing solver, API, sync, UI, and incidental layout changes unless the user explicitly accepts that scope.

## 2026-07-12 Production Performance Decisions

- Production CP-SAT uses exactly two internal search workers on the 2-vCPU droplet.
- A Redis-backed global lock limits the deployment to one active CP-SAT solve. Cache hits do not acquire the solve lock.
- v1 generation is synchronous. A Redis-backed capacity lock rejects excess
  cache-miss work promptly rather than queueing jobs in the web process.
- Performance changes must preserve the 19-row all-class quality matrix; reducing the solver timeout to 2.4 seconds was rejected after quality fell to 15/19.
- OR-Tools 9.12 is required for the launch latency target. OR-Tools 9.8 retained 19/19 quality but missed the warm-search target at 4278.5 ms p95.
- Use a 3.2-second production solve budget. Lower budgets were flaky on hard
  Range targets; two complete constrained HTTP gates at 3.2 seconds stayed
  below both the 4-second warm-miss and 5-second HTTP targets.
- Compact the product/cache response by removing duplicate top-build and
  solver-only callback diagnostics. Direct solver and regression tooling retain
  full diagnostics.
- Generated indexes must contain complete spell damage profiles. Database fallback is a development compatibility path, not an acceptable production scoring dependency.
- Keep exact candidate sets for v1. Do not use objective-ranked pet/Dofus top-N pruning to meet latency, because it removes feasible solutions and benchmark paths.

## 2026-07-14 Gated Beta Quality Decision

- Do not upgrade production hardware before tester demand demonstrates that the
  feature is useful despite cold-generation latency.
- Prioritize candidate quality for the gated beta by running the normal
  crit-aware and crit-neutral CP-SAT objectives sequentially with up to 12
  seconds per lane, then merge and rich-rerank their candidates.
- Keep the release synchronous and cache-backed. Initial beta gates allow cold
  p95 under 45 seconds and warm-process cache-miss p95 under 30 seconds; cache
  hits must remain under 100ms.
- The beta allowance does not replace the Optimization milestone's eventual
  cache-miss p95 target of under 5 seconds.
- Reconsider a 4-vCPU deployment only after observing meaningful tester use or
  demand constrained by generation latency.

## Product Decisions From PRD

- v1 uses structured controls, not chat.
- Solver is deterministic and owns item selection.
- AP/MP/range are minimum constraints with hard caps, not ordinary heavily weighted stats. Extra AP/MP/range is valid and usually good, but should receive only a small marginal score.
- Budget means availability/accessibility, not exact kama price.
- Initial budget/availability priors use 4 coarse tiers: tier 1 mounts/trophies and normal equipment not assigned higher; tier 2 pets/petsmounts/accessibile Dofuses; tier 3 exos and Prysmaradites; tier 4 Ochre, Vulbis, legendary items, and opti assumptions.
- Exos are a separate user-facing policy where possible.
- The v1 API is synchronous; polling/job persistence is not part of the current contract.
- OR-Tools CP-SAT is the primary v1 solver. Beam search remains archived research.
- Persisted builds created from Build Discovery must be distinguishable from ordinary user-authored builds. Short term: generated imports should carry an explicit generated name. Longer term: if generated custom sets remain persisted artifacts, add a durable generation/source model such as `GenerationRequest` linked to created `custom_set` rows so cleanup, analytics, and provenance do not depend on display copy.
