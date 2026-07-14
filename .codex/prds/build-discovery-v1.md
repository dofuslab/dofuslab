# DofusLab Build Discovery v1

Source: https://app.notion.com/p/395c1a10243880f28008dbeb61b2949c

## Product Goal

Build Discovery v1 generates plausible, explainable DofusLab builds from structured inputs: class, element, level, AP/MP targets, an optional minimum Range target, damage-vs-survivability preference, budget tolerance, and optional lock/avoid controls.

The v1 goal is not perfect optimization, PvP meta modeling, a chatbot, or LLM-driven item selection. It is a deterministic, debuggable, bounded build generator that can ship on current DofusLab infrastructure.

## Initial Scope

- PvM, one element per request, across all classes and levels 1-200.
- `level` belongs in the query/API/cache/provenance contract and controls candidate loading, base AP, characteristics, spell selection, Wisdom value, and availability.
- The product should handle any valid AP/MP/Range target within caps, not only benchmark defaults such as 11/6/0 or 12/6/0.
- Character baseline AP is 6 from levels 1-99 and 7 from level 100 onward. Valid target bounds are AP `6-12` below level 100, AP `7-12` from level 100 onward, MP `3-6`, and Range `0-6`.
- Product intent controls are damage-vs-survivability preset, budget tier, exo policy, weapon policy, locked items, and avoided items.
- 11/6 and 12/6 variants are benchmark/regression rows, not the full Milestone 1 scope.
- AP, MP, and Range are minimum targets with caps: AP 12, MP 6, Range 6. Surplus AP/MP/range is valid and usually useful, but should only receive a small marginal score.
- Do not expose a separate melee/mixed/ranged control in v1. The usefulness of
  Range is derived from synchronized spell data for the selected `(class,
  element)`, including spell range, modifiability, damage, and AP cost. Users
  may still request a hard minimum Range; otherwise Range is a soft tradeoff.
- Item conditions must be evaluated on the backend.
- Set-aware generation and Dofus/trophy/package diversity are required.
- Candidate item horizons should include the target level bucket plus the immediately previous bucket for normal gear and set packages.
- Budget/availability and exo policy are first-class product controls.
- Results request up to 3-5 meaningfully different builds with score
  breakdowns, warnings, assumptions, and deterministic explanations. The
  solver may return fewer when it cannot find enough valid alternatives within
  the synchronous time budget.

## Major Milestones

These milestones supersede the earlier implementation-order plan. The product
should advance by proving correctness over a bounded surface and remembering the
best builds found at each step. Performance, API, UI, and polish come after the
correctness surface is trustworthy. The next correctness expansion after level
200 Iop is level diversity for Iop, not all classes.

Current confidence boundary:

- Availability v0 is considered done as hardcoded rules for now.
- The strongest human-reviewed scoring path is level 200 Strength Iop.
- All class/element profiles are generated from synchronized game data and have
  smoke coverage, but remain medium confidence until representative human or
  production benchmarks are reviewed. Feasibility is not evidence of optimality.

1. Availability v0.
   - Keep rule-based availability tiers hardcoded.
   - Maintain tests for tier assignments and budget enablers.
   - Do not spend more effort on market/production-derived availability until
     core build quality is stable.
2. Level 200 Iop correctness surface.
   - Support all combinations of supported Iop elements, AP/MP/Range targets, budget tiers,
     exo policy, locked items, and avoided items.
   - Include damage/survivability weighting as part of the Milestone 2 query
     matrix. Support exactly four presets:
     - `1`: defensive. Prefer survivability strongly while still producing a
       functional damage build.
     - `2`: balanced. Trade damage and survivability for general PvM use.
     - `3`: damage. Preserve the current trusted damage-leaning Strength Iop
       behavior.
     - `4`: total glass cannon. Maximize modeled damage with only light
       survivability pressure.
   - Negative resistance is reported as a diagnostic, not separately penalized
     in the score; survivability impact should flow through the EHP model.
   - Start from the trusted Strength Iop scoring model and use spell-derived
     class/element profiles for damage rotations and soft Range value.
   - Add/keep expensive no-cache regressions for the best known builds found.
   - For every supported query family, remember the top scoring generated build
     and any better human benchmark build.
3. Level diversity for Iop.
   - Keep class scope to Iop while proving that the solver can adapt to
     different item pools, AP baselines, trophy availability, budget
     assumptions, and survivability expectations across levels.
   - Score Wisdom as level-dependent utility: keep Wisdom at the same modest
     general utility weight for levels `1-199` because it increases experience
     gained, but do not inflate it above the normal stat utility just because
     the character is leveling. At level `200`, Wisdom is worth `0` as direct
     Wisdom utility; its AP/MP reduction/parry implications should be captured
     by explicit AP/MP reduction/parry stats rather than double-counted through
     Wisdom itself.
   - Start with sampled level brackets rather than every possible query
     combination.
   - Use readonly prod aggregate discovery to find common AP/MP/Range targets
     by level bucket before choosing sample rows. Do not guess target defaults
     when prod data is available.
   - Regenerate class/element spell and Range-utility profiles during class-data
     synchronization. Production builds can inform quality benchmarks, but do
     not define a melee/mixed/ranged product default.
   - Generate and remember a diverse set of benchmark builds around roughly
     20-level intervals, with heavier attention at transition levels where the
     rules change: level 60, 100, 150, 180, and 200.
   - Treat level-specific AP/MP/Range targets as realistic defaults, not a
     direct copy of level 200 targets. Characters start at 6 AP through level
     99 and 7 AP from level 100 onward.
   - For level 200 Iop, avoid using low AP/MP targets as quality benchmarks;
     `10/5/0`, `11/6/0`, and `12/6/0` are the useful reference rows.
   - Remember top generated builds and any better human benchmark builds per
     sampled level/element/budget row.
4. Extend to all classes at level 200.
   - Add class-specific scoring defaults and damage baselines before enabling
     each class.
   - Generate spell rotations and Range-utility profiles per `(class, element)`
     from synchronized game data before enabling each class broadly.
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
   - Remember top scoring builds per class/element/level bracket.
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

## Shareable Generated Build Proposal

Build Discovery needs a way to publish generated builds as normal DofusLab view
URLs so humans can review them, compare alternatives, and give gameplay
feedback. Do not implement this before reviewing the persistence/API/deployment
plan; it writes production data and needs clean provenance.

Existing implementation pieces:

- `EquipMultipleItems` can bulk-equip item UUIDs on a custom set.
- `ImportGeneratedCustomSet` can create a custom set, equip items/exos, and
  write a linked `generation_request` row.
- `generation_request` already stores `custom_set_id`, `source`,
  `dataset_version`, `solver_version`, `request_payload`, and creation time.
- `CustomSet.generation_request` makes generated custom sets distinguishable
  from hand-authored sets without adding a separate generated-only list filter.

Proposed product path:

- Use `ImportGeneratedCustomSet` as the canonical publish path for Build
  Discovery outputs instead of plain bulk equip, because it already creates
  provenance.
- Set `source="build_discovery"` for all generated builds.
- Require `request_payload` to include:
  - normalized query inputs: class, level, element, AP, MP, optional Range,
    budget tier, exo policy, weapon policy, damage/survivability preset,
    locked/avoided items, result limit, and diversity setting
  - solver diagnostics: score, rank, search limits, matrix target name when
    applicable, warnings, and fallback budget if used
  - reproducibility identifiers: `datasetVersion`, `solverVersion`, index
    version, and generated-at timestamp
- Name generated sets with an obvious prefix, for example
  `Generated Build Discovery: L60 Agility Iop 9/3/any`, so shared URLs are
  understandable even outside admin/debug views.
- Any production analysis must be able to separate generated sets through the
  linked `generation_request`, not by name parsing. Generated sets need not be
  hidden from their creator's ordinary build list.
- Prefer a dedicated review owner/user or internal generation account if we bulk
  publish benchmark matrices, so generated review artifacts do not appear as a
  real user's personal builds.
- Add a review status before public surfacing: `generated`, `needs_review`,
  `accepted`, `rejected`, or equivalent. This likely belongs on
  `generation_request` or a child review table rather than on `custom_set`
  itself.
- Keep generated build deletion/cleanup straightforward: deleting a generated
  custom set should cascade to the generation request; bulk cleanup should be
  possible by `source`, `solverVersion`, dataset version, or review batch.

Open questions before implementation:

- Should generated review builds be private/unlisted by default, or publicly
  accessible to anyone with the URL?
- Should `generation_request` gain explicit `review_status`, `review_batch`,
  and `notes` columns, or should those live in a separate review table?
- Should generated review builds count in public popularity/recent-build
  surfaces? Default answer should be no unless explicitly opted in.
- Should every generated candidate be persisted, or only selected top builds
  from accepted matrix rows?
- What is the retention policy for failed/obsolete generated review batches?

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

## Superseded Combat Range Research

This section records an earlier production-data experiment and is not an active
v1 product or implementation requirement. The experiment showed that equipment
alone does not reliably distinguish melee, mixed, and ranged intent: many class
and element pairs share the same strong item packages, weapon choice is often a
stat-stick decision, and raw +Range is weak evidence. The accepted direction is
to derive Range utility from synchronized spell data per `(class, element)` and
to keep only the optional numeric Range minimum in the public query.

Historical purpose: derive the default `combatRange` value from prod
saved builds by `(class, element)`, while keeping user-selected combat range
explicit in the query contract. This requires classifying each prod build's
element first; Build Discovery v1 only consumes clean single-element rows.

Scope for v0 classification:

- Use only complete level `200` saved builds.
- A build is complete only when all required equipment slots are occupied:
  amulet, belt, boots, cloak, hat, shield, weapon, both rings, all six
  Dofus/trophy slots, and either pet, mount, or petsmount according to the
  current custom set model.
- Tagged and untagged builds are both allowed, but generated Build Discovery
  rows must be excluded once prod provenance exists.
- Do not use incomplete, lower-level, or partially imported sets to infer
  defaults; they are too noisy for combat range classification.

Classifier output:

Element classifier output:

- `strength`
- `intelligence`
- `chance`
- `agility`
- `multi`
- `omni`
- `unknown`

Element classification plan:

- Use base/scrolled characteristic points, item elemental stats, Power, and
  elemental damage lines to identify the build's intended element.
- A clean single-element build has one elemental stat family clearly ahead of
  the others by a documented threshold.
- `multi` means two or three elemental families are materially represented.
- `omni` means all four elemental families are materially represented, or the
  build is primarily Power/flat-damage driven without a clear single element.
- `unknown` means the build has too little signal after completeness filtering.
- For v1 default derivation, skip `multi`, `omni`, and `unknown` rows. Report
  their counts so we know how much prod evidence is being ignored.

Combat range classifier output:

- `ranged`
- `melee`
- `mixed`
- `unknown` for rows that pass completeness filters but have insufficient
  signals; exclude `unknown` from default selection but report its count.

Signal precedence:

1. Explicit build tag wins when present and unambiguous.
   - Ranged tags classify as `ranged`.
   - Melee tags classify as `melee`.
   - Mixed/hybrid tags classify as `mixed`.
   - Conflicting tags classify as `mixed` unless one tag family is clearly a
     DofusLab system tag with higher trust.
2. Stat specialization.
   - `% Ranged Damage` is a strong ranged signal.
   - `% Melee Damage` is a strong melee signal.
   - If both are present at meaningful values, classify as `mixed` unless one
     side dominates by a documented ratio.
3. Range investment.
   - Positive item/exo/set `Range` is a ranged signal, but weaker than tags and
     `% Ranged Damage`.
   - High Range without ranged damage should usually push an otherwise
     ambiguous build to `mixed`, not automatically to `ranged`.
   - Report +Range as its own distribution and correlation feature, not only as
     a classifier input. The product hypothesis to test is that many users do
     not have a strict Range target; they may expect Build Discovery to evaluate
     Range as a useful stat with tradeoffs against damage, survivability, AP/MP,
     and budget.
4. Weapon type.
   - Ranged weapons are `Wand` and `Bow`.
   - Melee weapons are the other weapon families currently equipped through the
     weapon slot: Sword, Hammer, Staff, Dagger, Axe, Shovel, Lance, and Scythe.
   - A ranged weapon is a ranged signal; a melee weapon is a melee signal.
5. Weapon-vs-spell damage context.
   - For a ranged weapon build, both `% Weapon Damage` and `% Spell Damage`
     strengthen the ranged classification.
   - For a melee weapon build, `% Weapon Damage` strengthens the melee
     classification.
   - `% Spell Damage` without range/melee specialization should not by itself
     classify the build.

Aggregation and defaults:

- Classify each complete level `200` prod build independently.
- First classify its element. Use only `strength`, `intelligence`, `chance`,
  and `agility` rows for v1 default derivation; skip `multi`, `omni`, and
  `unknown` rows from default selection.
- Then classify its combat range.
- Aggregate counts by `(class, element)`.
- Choose the default combat range for a `(class, element)` only if:
  - the classified sample count clears a minimum threshold, and
  - the top class has a clear majority over the runner-up.
- If the top class does not clearly win, default to `mixed` and report the
  ambiguity.
- If sample count is too low, use a labeled heuristic fallback rather than a
  prod-derived default.
- Store diagnostics for each aggregate: complete sample count, single-element
  classified count, skipped `multi`/`omni`/`unknown` counts, combat range
  classified counts, combat range unknown count, tag count, top stat signals,
  common weapon families, chosen default, and default source (`prod_aggregate`
  or `heuristic_fallback`).
- Store +Range diagnostics alongside combat range defaults:
  - distribution of final Range totals by `(class, element, combatRange)`
  - distribution of item/exo/set +Range sources
  - correlation between +Range and `ranged`/`mixed`/`melee` classification
  - correlation between +Range and `% Ranged Damage`, `% Melee Damage`, weapon
    family, `% Weapon Damage`, `% Spell Damage`, AP, MP, and score-like stat
    packages where available
  - representative examples where high +Range appears on `mixed` or `melee`
    builds, and where `ranged` builds choose low +Range
- Use this evidence before deciding whether the product should expose Range as
  a hard minimum target, a soft preference/slider, or both. Until reviewed,
  keep supporting explicit hard Range targets but avoid assuming every user
  wants a strict Range floor by default.

Implementation shape:

- Add a bounded readonly helper that extends the existing prod benchmark
  discovery path rather than issuing broad exploratory queries.
- Keep the query sample-limited and statement-timeout bounded.
- Join only the fields needed for classification: level, default class, tags,
  equipped slot coverage, item/set/exo stat totals for Range and damage
  specialization, weapon item type, and characteristic/item elemental stats.
- Unit-test the classifier with synthetic rows before running against prod:
  clean single-element classification, multi/omni skip behavior, tag
  precedence, ranged/melee stat precedence, mixed conflict cases, ranged weapon
  with weapon damage, melee weapon with weapon damage, high Range without ranged
  damage, incomplete-slot exclusion, and low-sample fallback.
- The first prod run should produce a JSON/Markdown report only; do not wire
  defaults into generation until the aggregate output has been reviewed.

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
- Range utility is derived from synchronized spell data per `(class, element)`
  and used in both cheap search guidance and rich final ranking.
- An omitted Range target remains distinct from a zero minimum and lets the
  scorer evaluate Range as a soft tradeoff.
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
- Milestone 2 is not complete if the generator only handles Strength Iop or
  hard-coded 11/6 and 12/6 benchmark profiles; it must support level 200 Iop
  generation across the supported Iop element, AP/MP/Range, budget, exo, and
  intent query combinations.
- Non-200 level generation belongs to the Level Diversity for Iop milestone.
- Optimization is not complete until cache-miss / fresh-generation p95 is under 5s for the representative level 200 Iop and accepted level-diversity query matrices. Async miss handling is useful fallback infrastructure, but does not by itself satisfy the optimization success goal.

## Current Implementation Facts To Verify In Code

- OR-Tools CP-SAT is the current item-selection engine.
- A generated, versioned game-data index supplies normalized item, set, and
  spell-profile data.
- A cheap linear objective guides CP-SAT; complete candidates are rescored with
  the richer damage and survivability model.
- Availability tiers and exo policy are first-class query constraints.
- The synchronous product path uses a bounded solve budget, application cache,
  and one global Redis-backed solve-capacity lock for the 2-vCPU deployment.
- The 19-row all-class quality matrix is a regression gate, not proof of global
  representativeness; benchmark coverage must continue to grow with tester data.
- Historical beam-search work remains available on
  `archive/build-discovery-beam-frontier`, but is not shipped in the current stack.
