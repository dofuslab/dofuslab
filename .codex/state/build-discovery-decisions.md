# Build Discovery Decisions

## Harness Decisions

- Use the main Codex thread as orchestrator.
- Use the evaluator before implementation when existing work is present.
- Keep planner read-heavy and implementation-free.
- Keep evaluator read-only by default.
- Keep worker scoped to one accepted slice at a time.
- Record decisions and progress in `.codex/state/`.
- Each new reviewable implementation step should be a stacked PR.
- The current oversized prototype branch should be committed, stashed, or parked as a baseline before starting clean child PRs.
- Future stacked PRs should avoid mixing solver, API, sync, UI, and incidental layout changes unless the user explicitly accepts that scope.

## 2026-07-12 Production Performance Decisions

- Production CP-SAT uses exactly two internal search workers on the 2-vCPU droplet.
- A Redis-backed global lock limits the deployment to one active CP-SAT solve. Cache hits do not acquire the solve lock.
- Only uncached single-build queries are eligible for synchronous solving. Multi-build requests with diversity constraints remain asynchronous because repeated exact diversity solves cannot satisfy the five-second request budget.
- Performance changes must preserve the 19-row all-class quality matrix; reducing the solver timeout to 2.4 seconds was rejected after quality fell to 15/19.
- OR-Tools 9.12 is required for the launch latency target. OR-Tools 9.8 retained 19/19 quality but missed the warm-search target at 4278.5 ms p95.
- Generated indexes must contain complete spell damage profiles. Database fallback is a development compatibility path, not an acceptable production scoring dependency.
- Keep exact candidate sets for v1. Do not use objective-ranked pet/Dofus top-N pruning to meet latency, because it removes feasible solutions and benchmark paths.

## Product Decisions From PRD

- v1 uses structured controls, not chat.
- Solver is deterministic and owns item selection.
- AP/MP/range are minimum constraints with hard caps, not ordinary heavily weighted stats. Extra AP/MP/range is valid and usually good, but should receive only a small marginal score.
- Budget means availability/accessibility, not exact kama price.
- Initial budget/availability priors use 4 coarse tiers: tier 1 mounts/trophies and normal equipment not assigned higher; tier 2 pets/petsmounts/accessibile Dofuses; tier 3 exos and Prysmaradites; tier 4 Ochre, Vulbis, legendary items, and opti assumptions.
- Exos are a separate user-facing policy where possible.
- Async job flow is acceptable if fresh generation remains above 5s.
- OR-Tools is out of scope as the primary solver.
- Persisted builds created from Build Discovery must be distinguishable from ordinary user-authored builds. Short term: generated imports should carry an explicit generated name. Longer term: if generated custom sets remain persisted artifacts, add a durable generation/source model such as `GenerationRequest` linked to created `custom_set` rows so cleanup, analytics, and provenance do not depend on display copy.
