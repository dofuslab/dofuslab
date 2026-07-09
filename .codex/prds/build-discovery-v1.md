# DofusLab Build Discovery v1

Source: https://app.notion.com/p/395c1a10243880f28008dbeb61b2949c

## Product Goal

Build Discovery v1 generates plausible, explainable DofusLab builds from structured inputs: class, element, level, AP/MP/range targets, damage-vs-survivability preference, budget tolerance, and optional lock/avoid controls.

The v1 goal is not perfect optimization, PvP meta modeling, a chatbot, or LLM-driven item selection. It is a deterministic, debuggable, bounded build generator that can ship on current DofusLab infrastructure.

## Initial Scope

- Level 200 PvM first.
- Iop first, single element first.
- First benchmark path: Strength, Intelligence, Chance, and Agility Iop at level 200.
- 11/6 and 12/6 variants.
- AP, MP, and Range are minimum targets with caps: AP 12, MP 6, Range 6. Surplus AP/MP/range is valid and usually useful, but should only receive a small marginal score.
- Item conditions must be evaluated on the backend.
- Set-aware generation and Dofus/trophy/package diversity are required.
- Budget/availability and exo policy are first-class product controls.
- Results return 3-5 meaningfully different builds with score breakdowns, warnings, assumptions, and deterministic explanations.

## Major Milestones

1. Productize current prototype inputs.
2. Availability v0.
3. Performance v1.
4. Build quality benchmarks.
5. Minimal UI.
6. Expand beyond Strength Iop.

## Acceptance Criteria

- Generated builds are valid for supported class/element/level combinations.
- No condition-invalid builds are shown.
- AP/MP/range targets are met or exceeded without exceeding caps, and surplus AP/MP/range is only lightly rewarded.
- At least 3 meaningfully different builds are shown for common queries where possible.
- Budget tier 1 sticks to mounts and normal equipment not assigned to higher availability tiers.
- Budget tier 2 can use pets, petsmounts, common trophies, and accessible Dofuses such as Crimson, Turquoise, Ice, and likely Dolmanax.
- Budget tier 3 can use exos and Prysmaradites when allowed by exo policy, with warnings or penalties where appropriate.
- Budget tier 4 can use Ochre, Vulbis, legendary items, and other opti assumptions.
- Crimson, Turquoise, and Ice Dofus are not incorrectly treated as opti-only.
- Shaker, Nomad, Jackanapes, and Voyager are considered budget enablers.
- Cached result returns under 500ms.
- Fresh result returns under 5s or uses async job flow.
- Every generation logs timing breakdowns.
- UI exposes structured controls, not numeric stat weights.
- Results are labeled by role and include item list, stats, score breakdown, warnings, and explanations.

## Current PRD Facts To Verify In Code

- Existing prototype reportedly generates valid, plausible Strength Iop builds.
- Data loading is reportedly sub-second after a generated build discovery index.
- Normal 11/6/0 Strength Iop generation reportedly improved from about 84s to about 24s.
- Beam search reportedly remains the bottleneck.
- Budget mode is reportedly diagnostic, not first-class product behavior.
- Safe optimizations include normalized item/set stat precomputation and cheap final prefiltering.
- Rejected optimization: ranked Dofus slot combinations that dropped a valid/diverse build.

If those facts are not visible in the current worktree, the evaluator must report the missing branch/files before planning implementation.
