# Codex Project Guidance

## Build Discovery Harness

For Build Discovery v1 work, use the project-scoped harness under `.codex/`.

- Start with `.codex/prompts/build-discovery-initial-evaluation.md` when entering an existing worktree or branch with unknown progress.
- Use `.codex/prompts/build-discovery-cycle.md` for iterative implementation cycles.
- Treat `.codex/prds/build-discovery-v1.md` as the local PRD summary and the linked Notion page as the source of truth.
- Keep `.codex/state/build-discovery-decisions.md` current after each material cycle.
- Prefer small, reviewable slices. Each new reviewable slice should become its own stacked commit or PR.
- Do not mix solver, API, sync, and UI changes in one implementation pass unless the user explicitly asks.
- Current product work uses CP-SAT. Beam-search experiments are preserved on
  `archive/build-discovery-beam-frontier`; the complete historical worktree is
  preserved on `archive/build-discovery-full-history-20260713`.
- Do not copy historical experiment code into the current stack unless a current
  requirement needs it. Preserve recoverability through Git, not dead production code.

The evaluator/reviewer role should review before the worker implements when existing work is present.
