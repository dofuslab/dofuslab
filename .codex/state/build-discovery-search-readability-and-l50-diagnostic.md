# Build Discovery Search Audit and L50 Cap Diagnostic

Generated: 2026-07-10

## Scope

This checkpoint records the current readability/architecture audit and the latest evidence for the level 50 Agility Iop `12/6/6` budget tier 2 cap target.

The intent is to keep the milestone 3 loop honest: avoid item-by-item bandaids, distinguish solver misses from infeasible targets, and leave enough evidence for review before the next search patch.

## Architecture Read

Scoring is still comparatively coherent. The final ranking path is centralized around:

- weighted non-damage utility stats
- normalized Iop rotation damage
- survivability/effective HP
- base characteristic allocation optimization

The STR melee Iop profile is the best validated profile because it has been manually steered and compared against known strong builds. Other elements reuse the same machinery but have weaker benchmark coverage.

Search is the risky area. The current prototype is not hardcoding desired builds, but it has accumulated several recall-oriented heuristics in one large file:

- relevant set selection
- set package seeding
- AP/MP/Range action set package seeding
- AP strategy validation
- budget/no-exo action trophy and gear seeds
- action-stat witness seeds
- direct gear completion
- Dofus/trophy combination completion
- multiple beam trimming modes

These are mostly principled classes of fixes, not one-off item allowlists. The implementation is nevertheless getting hard to audit because the search phases, diagnostics, and scoring all share the same prototype module.

## Cleanup Direction

Before broadening much further, the solver should be split into modules:

- `availability`: budget tiers, exo policy, generated/legacy item rules
- `targets`: AP/MP/range semantics, caps, level-specific base AP
- `scoring`: item score, final utility, damage, survivability, base allocation
- `candidate_pools`: slot pools, dominance pruning, required/uncommon action sources
- `packages`: set package and action set package generation
- `completion`: direct completion, Dofus/trophy completion, AP strategy checks
- `diagnostics`: no-build explanation, witness searches, feasibility probes

The most important behavioral invariant to add is a feasibility diagnostic that is separate from ranking. A no-build result should eventually be classified as one of:

- `generated`: solver found a valid build
- `likely_infeasible`: bounded feasibility search failed with clear catalog evidence
- `solver_miss_suspected`: catalog evidence suggests feasibility, but ranked search missed it

## L50 Agility 12/6/6 Tier 2 Evidence

Target:

- Level: 50
- Element: Agility
- Budget tier: 2
- Exo policy: none
- Required AP/MP/Range: 12/6/6
- Base AP/MP at level 50: 6/3
- Required deltas: +6 AP, +3 MP, +6 Range

Current focused solver run:

- Artifact: `.codex/state/build-discovery-cap4-level50-current-matrix.md`
- Status: `no_build`
- Runtime: 311677.7 ms

The first diagnostic pass confirmed the solver's level context is correct when entered through `target_level_context`: level 50 uses base AP 6. A debug snippet outside that context reported AP 7, but that was a diagnostic mistake, not evidence that the solver target itself is wrong.

Action-stat source summary from the solver's own slot pools:

- AP gear exists in amulet, ring, hat, cloak, and pet slots.
- MP gear exists in boots, cloak, and pet slots.
- Range gear exists across amulet, belt, weapon, rings, boots, hat, cloak, pet, and range trophies.
- Range trophies available at level 50/tier 2 are Observer (+2 Range) and Twitcher (+1 Range). The solver treats item IDs as unique, so it cannot use duplicate Observers.
- Key action set bonuses available in the candidate pools include:
  - Khardboard Set, 2 pieces: +1 AP, +1 MP, +1 Range
  - Akwadala Set, 8 pieces: +1 AP, +1 MP, +1 Range
  - Wind Kwak Set, 7 pieces: +1 AP, +1 MP, +1 Range
  - Tofu Set, 7 pieces: +2 MP
  - White Scaraleaf Set, 4 pieces: +1 MP, +1 Range
  - Coco Blop Set, 4 pieces: +1 AP

Interpretation:

The target is not obviously impossible from independent source lists, but it is highly slot-conflicted:

- +6 AP from level 50 base AP requires almost every available AP source category.
- +3 MP competes for cloak and pet slots, which are also important AP/range sources.
- +6 Range can use Observer/Twitcher for +3 total, but still needs +3 from gear or set bonuses.
- Set bonuses can help, but large low-level sets consume the same slots needed by AP/MP/range singleton items.

Current status:

- `no_build` is not yet proven infeasible.
- The next diagnostic should run a bounded feasibility search over action-relevant gear and Dofus/trophy choices, with ranking disabled.
- If that feasibility probe finds a build, classify the current solver result as `solver_miss_suspected`.
- If it fails with strong conflict evidence, classify this sampled target as `likely_infeasible` and stop treating it as a search bug.

## Runtime Note

A first feasibility DP probe was attempted in Docker but timed out after 304 seconds without flushed output. Immediately afterward, Docker started returning internal API errors even for `docker ps`, so no further Docker-based validation was possible in this checkpoint.

No solver code was changed in this checkpoint.
