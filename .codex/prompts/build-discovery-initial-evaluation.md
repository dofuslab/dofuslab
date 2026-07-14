# Build Discovery Initial Evaluation

Use the `build-discovery-evaluator` agent first.

Goal: review all existing Build Discovery v1 work before planning or implementing more.

Instructions for the evaluator:

1. Read `.codex/prds/build-discovery-v1.md`.
2. Read `.codex/state/build-discovery-decisions.md`.
3. Inspect git status, branch, recent commits, remotes, worktrees, and local branches.
4. Search for build discovery files and related code:
   - `build_discovery`
   - `BuildDiscovery`
   - `availability`
   - `budgetTier`
   - `exoPolicy`
   - `datasetVersion`
   - `solverVersion`
   - `cpsat`
   - `benchmark`
   - `sync_game_data`
5. If the implementation exists, review it against the PRD acceptance criteria.
6. Use the archive branches only when historical comparison is relevant.

Output:

- Findings ordered by severity.
- Evidence for what code exists or is missing.
- PRD coverage matrix.
- Tests/benchmarks found and missing.
- Recommended next step.

Do not implement changes during this pass.
