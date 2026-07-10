# Build Discovery Milestone 3 Assumptions Register

Generated: 2026-07-10

This register tracks assumptions currently baked into the milestone 3 all-level Iop work. It is intentionally review-oriented: every assumption should either become product policy, be replaced with data, or be removed.

## Scope Assumptions

- Class scope is Iop only until this milestone is complete.
- Element scope is one main element per query: Strength, Intelligence, Chance, or Agility.
- Multi-element builds are out of scope for milestone 3.
- Level scope is eventually every Iop level from 1 through 200.
- Current sampled matrix uses representative levels first: 1, 20, 50, 80, 99, 100, 120, 150, 179, 180, 199, and 200.
- Playstyle/intent scoring is still primarily calibrated against melee level 200 Strength Iop.

## Target Semantics

- AP, MP, and Range targets are minimum requirements with hard caps, not exact equality.
- Hard caps are AP <= 12, MP <= 6, Range <= 6.
- Extra AP/MP/Range inside the cap is allowed but should not dominate scoring.
- Range `None` means no minimum range requirement, not exactly 0 Range.
- Minimum AP is level-specific:
  - levels 1 through 99 start at 6 AP
  - levels 100 through 200 start at 7 AP
- Minimum MP is 3 for all levels.
- Level 200 targets below 10/5 are considered unrealistic for useful benchmark coverage, even though the general API can represent lower valid targets.

## Budget And Availability

- Availability v0 is hardcoded policy, not market-data driven.
- Budget tiers are cumulative: higher tiers include all lower-tier items.
- Tier 1 includes normal items, mounts, trophies, and generated item candidates that do not require a higher policy tier.
- Tier 2 adds pets, petsmounts, and accessible Dofuses.
- Accessible Dofuses currently include Crimson, Emerald, Turquoise, Ice, and Dolmanax.
- Tier 3 adds exos and Prysmaradites.
- Tier 4 adds Ochre, Vulbis, and legendary/very-opti assumptions.
- Budget tiers are not yet validated against current in-game economy or DofusLab usage data.
- Budget tier 1/2 uses no exos even if the query says exos are allowed.

## Dofus, Trophy, And Slot Assumptions

- Dofus/trophy/prysmaradite slots are modeled as six unique item slots.
- Duplicate item IDs are not allowed, including duplicate trophies.
- The solver currently treats item uniqueness globally, not just per slot family.
- Trophies are treated as tier 1 availability.
- Dofus/trophy package precomputation is expected to be useful, but has not yet been made a correctness-preserving production path.
- Generated DofusLab display builds may eventually need a `GenerationRequest`-like model so generated data is visibly separate from user-created clean data.

## Search Assumptions

- The production-ish prototype uses heuristic search, not exhaustive search.
- A `no_build` result is not proof of infeasibility unless a separate feasibility diagnostic supports it.
- Search recall is currently improved through general classes of seeds:
  - set package seeds
  - AP/MP/Range action set package seeds
  - AP strategy seeds
  - budget trophy/gear action seeds
  - direct completion seeds
- Recent changes are intended to preserve classes of builds, not named item-by-item target builds.
- The search file is too large and should be split before being treated as production-ready.
- The action feasibility diagnostic intentionally ignores final score quality; it only asks whether AP/MP/Range can be assembled under bounded constraints.
- If the action feasibility diagnostic hits its state cap, the result should be treated as unknown, not impossible.

## Scoring Assumptions

- The most trusted scoring profile is level 200 melee Strength Iop.
- Other elements reuse the same framework but need benchmark validation.
- Final score combines utility stats, normalized Iop damage, survivability, and base stat allocation.
- Damage profiles are simplified and may not fully reflect all modern spell rotations.
- Weapon damage is included, but weapon policy and realistic weapon use need more review.
- Survivability scoring uses a generic incoming-damage model, not content-specific encounter data.

## Level Diversity Assumptions

- Sampled target matrices are stepping stones toward full level coverage, not the final milestone.
- Common AP/MP/range targets per level should eventually be informed by production DofusLab builds.
- Until prod usage data is integrated, sampled targets are manually chosen and may include unrealistic edge cases.
- Extreme low/mid-level `12/6/6` targets may be infeasible or pathological under no-exo budgets and must be classified by diagnostics, not assumed solver bugs.

## Data And Runtime Assumptions

- Real solver behavior should be run inside the Docker server container.
- Host Python may compile scripts but does not necessarily have server dependencies.
- Production database access is read-only and must be queried sparingly.
- Prod usage benchmarks should be used only after generated target coverage is strong enough to compare against real user behavior.
- Current PR creation is blocked by GitHub permission errors, so stackable local commits are the review mechanism.

## Current Open Questions

- Which AP/MP/range targets should be considered realistic per level band?
- Should impossible targets return a classified infeasible result instead of "no build"?
- Should generated candidate builds be persisted as `custom_set` records, a new generated-build model, or only ephemeral responses?
- How much exact item matching should benchmark tests require versus score/stat thresholds?
- Which Dofus/trophy combinations are game-realistic versus merely catalog-valid?
- When should optimization/performance work resume after correctness and coverage improve?
