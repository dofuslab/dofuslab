# Build Discovery Implementation Cycle

Goal: make one reviewable stacked-PR step toward DofusLab Build Discovery v1.

Stacking rule:

- Treat the current dirty prototype work as a baseline until the user commits, stashes, or parks it.
- Once a baseline exists, each cycle should produce one stacked PR-sized change.
- A cycle should have one clear parent branch, one focused commit range, and one PR description.
- Do not keep appending unrelated work to an already oversized diff.

Use this agent sequence:

1. Spawn `build-discovery-planner`.
2. If the planner says existing implementation needs review first, spawn `build-discovery-evaluator` and stop after reporting.
3. Otherwise choose one small slice from the planner output.
4. Spawn `build-discovery-worker` to implement only that slice.
5. Spawn `build-discovery-evaluator` to review the resulting diff.
6. Apply required fixes only if they are narrow and clearly within the selected slice.
7. Run focused tests.
8. Update `.codex/state/build-discovery-progress.md` and `.codex/state/build-discovery-decisions.md`.
9. Summarize the intended stacked PR boundary: parent branch, changed files, tests, and review focus.

Stop and ask the user if:

- The build discovery prototype files are missing.
- The correct branch/worktree is ambiguous.
- A migration, destructive command, or broad data regeneration is required.
- The implementation would span more than one PRD milestone.
- The current branch has uncommitted baseline work and the next slice would be hard to review without committing, stashing, or creating a new worktree first.
- Fresh generation performance requires choosing sync vs async product behavior.
- Reviewer findings require architectural decisions not already settled by the PRD.

Each cycle output should include:

- Slice implemented or reason no implementation was done.
- Files changed.
- Tests run.
- Reviewer findings.
- Stacked PR boundary and suggested PR title.
- Remaining PRD gap.
- Recommended next cycle prompt.
