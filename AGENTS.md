# Codex Project Guidance

## Build Discovery Harness

For Build Discovery v1 work, use the project-scoped harness under `.codex/`.

- Start with `.codex/prompts/build-discovery-initial-evaluation.md` when entering an existing worktree or branch with unknown progress.
- Use `.codex/prompts/build-discovery-cycle.md` for iterative implementation cycles.
- Treat `.codex/prds/build-discovery-v1.md` as the local PRD summary and the linked Notion page as the source of truth.
- Keep `.codex/state/build-discovery-progress.md` and `.codex/state/build-discovery-decisions.md` current after each material cycle.
- Prefer small, reviewable slices. Each new reviewable slice should become its own stacked PR.
- Do not mix solver, API, sync, and UI changes in one implementation pass unless the user explicitly asks.
- Treat the existing oversized prototype branch as the baseline until it is committed or otherwise parked. Future work should stack on top of that baseline instead of growing the same giant diff.

The evaluator/reviewer role should review before the worker implements when existing work is present.
