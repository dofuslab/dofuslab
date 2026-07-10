# DofusLab Build Discovery v1

Source: https://app.notion.com/p/395c1a10243880f28008dbeb61b2949c

## Product Goal

Build Discovery v1 generates plausible, explainable DofusLab builds from structured inputs: class, element, level, AP/MP/range targets, damage-vs-survivability preference, budget tolerance, and optional lock/avoid controls.

The v1 goal is not perfect optimization, PvP meta modeling, a chatbot, or LLM-driven item selection. It is a deterministic, debuggable, bounded build generator that can ship on current DofusLab infrastructure.

## Initial Scope

- Level 200 PvM first; Milestone 3 expands the Iop surface to levels 1-200.
- Iop first, single element first.
- Milestone 1 product surface: level 200 PvM Iop across Strength, Intelligence, Chance, and Agility.
- `level` belongs in the query/API/cache/provenance contract. Milestone 3 should support Iop levels 1-200 after level-specific candidate loading, base stats, spell selection, and benchmark rows are validated.
- Milestone 1 should handle any valid AP/MP/Range target within caps, not only benchmark defaults such as 11/6/0 or 12/6/0.
- Character baseline AP is 6 from levels 1-99 and 7 from level 100 onward. Valid target bounds are AP `6-12` below level 100, AP `7-12` from level 100 onward, MP `3-6`, and Range `0-6`.
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
correctness surface is trustworthy. The next correctness expansion after level
200 Iop is level diversity for Iop, not all classes.

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
3. Level diversity for Iop.
   - Keep class scope to Iop while proving that the solver can adapt to
     different item pools, AP baselines, trophy availability, budget
     assumptions, and survivability expectations across levels.
   - Start with sampled level brackets rather than every possible query
     combination.
   - Use readonly prod aggregate discovery to find common AP/MP/Range targets
     by level bucket before choosing sample rows. Do not guess target defaults
     when prod data is available.
   - Generate and remember a diverse set of benchmark builds around roughly
     20-level intervals, with heavier attention at transition levels where the
     rules change: level 60, 100, 150, 180, and 200.
   - Treat level-specific AP/MP/Range targets as realistic defaults, not a
     direct copy of level 200 targets. Characters start at 6 AP through level
     99 and 7 AP from level 100 onward.
   - For level 200 Iop, avoid using low AP/MP targets as quality benchmarks;
     `10/5/0`, `11/6/0`, and `12/6/0` are the useful reference rows.
   - Remember top generated builds and any better human benchmark builds per
     sampled level/element/budget/playstyle row.
4. Extend to all classes at level 200.
   - Add class-specific scoring defaults and damage baselines before enabling
     each class.
   - Establish at least one trusted benchmark path per class before broad query
     support.
   - Continue remembering top scoring generated and human benchmark builds at
     each expansion step.
5. Broad level support.
   - Expand from sampled Iop level diversity to supported level brackets only
     after the sampled rows produce plausible builds and reviewed benchmark
     fixtures.
   - Define bracket-specific AP/MP/Range defaults, budget assumptions,
     survivability baselines, trophy/Dofus availability, and benchmark
     fixtures.
   - Remember top scoring builds per class/element/playstyle/level bracket.
6. Optimization.
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
7. Product/API/UI.
   - Productize API, persistence, generated build provenance, and UI after core
     quality is defensible.
   - Async/cache can exist as infrastructure, but should not distract from
     benchmark-led correctness.

## Level Diversity Sampling Plan

Do not try to prove every level and every query combination in the first level
expansion pass. Start with a deliberately broad but bounded Iop sample that
exercises item-pool transitions, AP-baseline transitions, trophy availability,
and endgame/opti assumptions.

Before finalizing the sampled targets, run the readonly aggregate helper:

```sh
python -m oneoff.build_discovery_prod_level_target_discovery \
  --sample-limit 300 \
  --top-targets 8 \
  --class-name Iop \
  --bucket-size 20
```

Use the helper output to choose the AP/MP/Range targets for each level bucket.
The helper reports aggregate recent `custom_set` rows only; it omits custom set
IDs, names, owners, and URLs. AP includes level baseline AP, item AP, exos, and
active set bonus AP. MP includes base 3 MP, item MP, exos, and active set bonus
MP. Range includes item Range, exos, and active set bonus Range. The sample is
recency-based, not popularity-weighted. The initial default is intentionally
small to avoid prod load; increase it only as an opt-in investigation if the
bounded sample is too sparse.

Representative levels to inspect:

- `20`: early build, no trophies/Dofuses expected, simple AP/MP target.
- `40`: first meaningful low-level set comparisons.
- `60`: Dragoturkey/mount era, first major mobility/accessibility shift.
- `80`: late pre-100 build, still 6 base AP.
- `100`: base AP becomes 7 and major trophies such as Shaker become available.
- `120`: early post-100 trophy-driven builds.
- `140`: midgame set and trophy diversity.
- `160`: late-midgame build quality starts resembling endgame structure.
- `180`: high-level pre-200 item pool, Ice Dofus-level assumptions start to
  matter.
- `200`: already covered by Milestone 1, remains the calibration anchor.

Initial build rows should be selected from the prod target distribution, not
hardcoded upfront. The intended shape is:

- At least one Strength Iop row before level 100.
- At least one non-Strength row before level 100.
- At least one row at the level 100 AP-baseline/trophy transition.
- At least one row in each of the 120, 140, 160, and 180 buckets.
- At least one budget tier 1 row, one tier 2 row, and one tier 3 row outside
  level 200.
- Level 200 remains represented by accepted `10/5/0`, `11/6/0`, and `12/6/0`
  reference rows rather than low AP/MP targets.

First bounded prod sample, `sampleLimit=300`, produced useful starting shapes
but is sparse below level 180 and heavily skewed toward level 200. Treat these
as sample targets to generate and review, not as proof that the listed target is
optimal or even common globally:

- Level `50`: `7/3/1`, `7/4/0`, and `7/5/1`.
- Level `60`: `10/4/2`, `10/4/3`, `9/3/2`, and `9/3/0`.
- Level `80`: `10/5/1` and `9/5/2`; ignore the low-effort `7/3/0` row for
  benchmark quality.
- Level `100`: `12/5/0`.
- Level `120`: `11/5/1`, `12/5/1`, and `11/4/1`.
- Level `150`: `9/4/2`, `12/5/2`, `12/4/2`, and `11/5/2`.
- Level `160`: `12/5/3`, `12/5/2`, `11/6/-2`, and `12/6/3`.
- Level `180`: `12/5/3`.
- Level `199`: `12/6/2`, `12/5/2`, `10/6/3`, `10/5/2`, and `12/6/5`.
- Level `200`: keep accepted milestone-1 calibration rows and filter out
  unrealistic saved-set targets below `10/5`; the bounded prod sample's useful
  shapes cluster around `12/5` and `12/6` with varying Range.

For level `180+`, sample planning should filter saved-set targets below `10/5`
because those rows are not realistic benchmark goals for high-level Iop builds.

After the first sample is reviewed:

- Add one high-confidence generated build per accepted sampled row to a matrix
  artifact.
- Promote reviewed rows into expensive item-by-item regressions.
- Add human/prod benchmark rows where saved builds can be mapped to clean query
  assumptions.
- Add rows for elements/level bands that failed review or looked obviously
  underfit.

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
- Cache miss / fresh generation p95 returns under 5s for the representative level 200 Iop and accepted level-diversity query matrices once Optimization is active.
- Every generation logs timing breakdowns.
- UI exposes structured controls, not numeric stat weights.
- Results are labeled by role and include item list, stats, score breakdown, warnings, and explanations.
- Milestone 1 is not complete if the generator only handles Strength Iop or only hard-coded 11/6 and 12/6 benchmark profiles; it must support level 200 Iop generation across the supported Iop element, AP/MP/Range, budget, exo, and playstyle/intent query combinations.
- Non-200 level generation belongs to the Level Diversity for Iop milestone.
- Optimization is not complete until cache-miss / fresh-generation p95 is under 5s for the representative level 200 Iop and accepted level-diversity query matrices. Async miss handling is useful fallback infrastructure, but does not by itself satisfy the optimization success goal.

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
