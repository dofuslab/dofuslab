# DofusLab Build Discovery v1

Source: https://app.notion.com/p/395c1a10243880f28008dbeb61b2949c

## Product Goal

Build Discovery v1 generates plausible, explainable DofusLab builds from structured inputs: class, element, level, AP/MP/range targets, damage-vs-survivability preference, budget tolerance, and optional lock/avoid controls.

The v1 goal is not perfect optimization, PvP meta modeling, a chatbot, or LLM-driven item selection. It is a deterministic, debuggable, bounded build generator that can ship on current DofusLab infrastructure.

## Initial Scope

- Level 200 PvM first.
- Iop first, single element first.
- Milestone 1 product surface: level 200 PvM Iop across Strength, Intelligence, Chance, and Agility.
- `level` belongs in the query/API/cache/provenance contract in Milestone 1, but level 200 is the only supported generation value. Non-200 generation should return a clear unsupported-input error until the future Level Bracket Expansion milestone unless product priority explicitly pulls it forward.
- Milestone 1 should handle any valid AP/MP/Range target within caps, not only benchmark defaults such as 11/6/0 or 12/6/0.
- Milestone 1 should handle product intent controls for Iop: damage-vs-survivability/playstyle preset, budget tier, exo policy, weapon policy, locked items, and avoided items.
- 11/6 and 12/6 variants are benchmark/regression rows, not the full Milestone 1 scope.
- AP, MP, and Range are minimum targets with caps: AP 12, MP 6, Range 6. Surplus AP/MP/range is valid and usually useful, but should only receive a small marginal score.
- Item conditions must be evaluated on the backend.
- Set-aware generation and Dofus/trophy/package diversity are required.
- Candidate item horizons should include the target level bucket plus the immediately previous bucket for normal gear and set packages.
- Budget/availability and exo policy are first-class product controls.
- Results return 3-5 meaningfully different builds with score breakdowns, warnings, assumptions, and deterministic explanations.

## Major Milestones

These milestones supersede the earlier implementation-order plan. The product
should advance by proving correctness over a bounded surface and remembering the
best builds found at each step. Performance, API, UI, and polish come after the
correctness surface is trustworthy.

Current confidence boundary:

- Availability v0 is considered done as hardcoded rules for now.
- The only scoring model currently trusted is the steered level 200 melee
  Strength Iop scoring path.
- Other elements/classes/levels are untrusted until they have benchmark fixtures
  and review.

1. Availability v0.
   - Keep rule-based availability tiers hardcoded.
   - Maintain tests for tier assignments and budget enablers.
   - Do not spend more effort on market/production-derived availability until
     core build quality is stable.
2. Level 200 Iop correctness surface.
   - Support all combinations of supported Iop elements, playstyle/range
     preference, AP/MP/Range targets, budget tiers, exo policy, locked items,
     and avoided items.
   - Start from the trusted melee Strength Iop scoring model.
   - Add/keep expensive no-cache regressions for the best known builds found.
   - For every supported query family, remember the top scoring generated build
     and any better human benchmark build.
3. Extend to all classes at level 200.
   - Add class-specific scoring defaults and damage baselines before enabling
     each class.
   - Establish at least one trusted benchmark path per class before broad query
     support.
   - Continue remembering top scoring generated and human benchmark builds at
     each expansion step.
4. Extend to all supported levels.
   - Add level brackets only after level 200 class quality is understood.
   - Define bracket-specific AP/MP/Range defaults, budget assumptions,
     survivability baselines, and benchmark fixtures.
   - Remember top scoring builds per class/element/playstyle/level bracket.
5. Optimization.
   - Only after correctness milestones are stable, optimize cache misses and
     beam/search paths.
   - Preserve expensive correctness regressions while optimizing.
   - Precompute reusable set package indexes, including strong cross-set
     package pairs/triples such as Corruption + Bleeding Heart. Keep
     correctness by using these packages as seeds/shortcuts, not exclusive
     replacements for single-set packages, partial-set packages, locked-item
     seeds, and fallback search. A build that uses Corruption without Bleeding
     Heart must still be discoverable.
   - Precompute Dofus/trophy/prysmaradite combination packages by level,
     budget tier, exo policy, and broad element/scoring profile. There are far
     fewer viable combinations than gear combinations, and these items are
     reused across many high-scoring builds. Preserve correctness by including
     core staples, action-point enablers, special-effect Dofuses, and
     benchmark-required combinations even when cheap pre-score ranks them low.
   - Cache package indexes with `datasetVersion` and `solverVersion`, and make
     pruning auditable: every dropped benchmark path should have a diagnostic
     reason.
6. Product/API/UI.
   - Productize API, persistence, generated build provenance, and UI after core
     quality is defensible.
   - Async/cache can exist as infrastructure, but should not distract from
     benchmark-led correctness.

## Regression Test Tiers

- Tier 0: cheap unit tests for availability tiers, action stat scoring, item
  condition helpers, package scoring helpers, and Dofus/trophy combo selection.
  Run on every solver edit.
- Tier 1: focused expensive no-cache benchmark tests for the query family being
  touched, for example only STR opti 11/6 and 12/6 when changing opti STR
  search. Run before committing search/scoring changes.
- Tier 2: full expensive regression suite across remembered best builds. Run
  before pushing larger solver checkpoints, after broad pruning changes, and
  occasionally as a guardrail during long loops.
- Tier 3: full representative matrix generation. Run only at milestone
  checkpoints or when explicitly updating generated benchmark artifacts.

The full expensive suite should remain available, but the loop should not spend
most of its time running every benchmark after every small change. Use focused
tests while iterating, then run the broader tiers when the change is ready to
checkpoint.

## Acceptance Criteria

- Generated builds are valid for supported class/element/level combinations.
- No condition-invalid builds are shown.
- AP/MP/range targets are met or exceeded without exceeding caps, and surplus AP/MP/range is only lightly rewarded.
- At least 3 meaningfully different builds are shown for common queries where possible.
- Budget tier 1 can use mounts, trophies, and normal equipment not assigned to higher availability tiers.
- Budget tier 2 can use pets, petsmounts, and accessible Dofuses such as Crimson, Turquoise, Ice, and likely Dolmanax.
- Budget tier 3 can use exos and Prysmaradites when allowed by exo policy, with warnings or penalties where appropriate.
- Budget tier 4 can use Ochre, Vulbis, legendary items, and other opti assumptions.
- Crimson, Turquoise, and Ice Dofus are not incorrectly treated as opti-only.
- Shaker, Nomad, Jackanapes, and Voyager are considered budget enablers.
- Cached result p95 returns under 500ms.
- Cache miss / fresh generation p95 returns under 5s for the representative Milestone 1 level 200 Iop query matrix.
- Every generation logs timing breakdowns.
- UI exposes structured controls, not numeric stat weights.
- Results are labeled by role and include item list, stats, score breakdown, warnings, and explanations.
- Milestone 1 is not complete if the generator only handles Strength Iop or only hard-coded 11/6 and 12/6 benchmark profiles; it must support level 200 Iop generation across the supported Iop element, AP/MP/Range, budget, exo, and playstyle/intent query combinations.
- Non-200 level generation belongs to a future Level Bracket Expansion milestone unless product priority explicitly pulls it forward.
- Milestone 2 is not complete until cache-miss / fresh-generation p95 is under 5s for the representative Milestone 1 level 200 Iop query matrix. Async miss handling is useful fallback infrastructure, but does not by itself satisfy the Milestone 2 success goal.

## Current PRD Facts To Verify In Code

- Existing prototype reportedly generates valid, plausible Strength Iop builds.
- Current trusted scoring is limited to steered melee level 200 Strength Iop.
- Other element/class/level scoring should be treated as untrusted until
  benchmarked.
- Data loading is reportedly sub-second after a generated build discovery index.
- Normal 11/6/0 Strength Iop generation reportedly improved from about 84s to about 24s.
- Beam search reportedly remains the bottleneck.
- Budget mode is reportedly diagnostic, not first-class product behavior.
- Safe optimizations include normalized item/set stat precomputation and cheap final prefiltering.
- Rejected optimization: ranked Dofus slot combinations that dropped a valid/diverse build.

If those facts are not visible in the current worktree, the evaluator must report the missing branch/files before planning implementation.
