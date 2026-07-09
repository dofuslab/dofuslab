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
