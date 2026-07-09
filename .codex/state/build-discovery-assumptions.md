# Build Discovery Assumptions To Review

Last updated: 2026-07-08

This file lists the working assumptions embedded in the Build Discovery PRD, prototype, benchmark tooling, and harness. Treat it as a review checklist, not settled truth.

## Product Scope Assumptions

- v1 is a structured build generator, not a chatbot.
- v1 item selection is deterministic solver logic, not LLM selection.
- v1 starts with level 200 PvM.
- v1 starts with Iop.
- v1 starts with single-element builds.
- v1 should support Iop Strength, Intelligence, Chance, and Agility before expanding further.
- Multi-element and omni builds are out of scope until single-element quality is stable.
- PvP modeling is out of scope.
- Full class spell rotation optimization is out of scope.
- Globally optimal builds are not required; plausible, explainable, bounded search is enough.

## Query Contract Assumptions

- Query inputs should include class, level, elements, mode, AP target, MP target, Range target, damage/survivability preset, budget tier, exo policy, weapon policy, locked items, and avoided items.
- `className=Iop`, `level=200`, `mode=pvm`, and one element are the only supported product-shaped query values for now.
- Locked items are final-result requirements. If the solver cannot find builds containing all locked items, result count can fall.
- Avoided items are excluded from candidate loading.
- Locked and avoided item IDs cannot overlap.
- `datasetVersion`, `solverVersion`, and query inputs belong in cache keys.
- The current oneoff query wrapper is a prototype contract, not yet the final backend API.

## AP / MP / Range Assumptions

- AP, MP, and Range are minimum targets with hard caps, not exact targets.
- Hard caps are AP 12, MP 6, Range 6.
- Below target is invalid or heavily rejected.
- At target is valid.
- Above target and at/below cap is valid.
- Above cap is invalid.
- Extra AP, MP, and Range are usually good, but only lightly rewarded.
- The solver should not choose a much weaker or less available build just because it has surplus Range or unnecessary surplus movement.
- Temporary AP from special effects does not satisfy static AP targets.

## Budget / Availability Assumptions

- Budget means availability/accessibility, not exact kama price.
- Initial budget tiers are coarse and based on current working assumptions, not fresh market data.
- Tier 1: mounts and normal equipment not assigned to higher tiers.
- Tier 2: pets, petsmounts, common trophies, and accessible Dofuses.
- Tier 3: exos and Prysmaradites.
- Tier 4: Ochre, Vulbis, legendary/special-effect items, and opti assumptions.
- Exos should remain a user-facing policy separate from budget if possible.
- `exoPolicy=none` means the solver should not add generated AP/MP/Range exos to fill missing targets.
- `exoPolicy=allow` means the solver may add at most one AP, one MP, and one Range exo when needed.
- `exoPolicy=opti` is currently accepted by the query contract but does not yet differ materially from `allow`.
- Budget tier filtering currently removes candidates above the selected tier before search.

## Item Availability Assumptions

- Crimson Dofus is accessible, not opti-only.
- Turquoise Dofus is accessible, not opti-only.
- Ice Dofus is accessible, not opti-only.
- Dolmanax is likely accessible enough for tier 2.
- Ochre Dofus is opti-tier.
- Vulbis Dofus is opti-tier.
- Prysmaradites are tier 3 by default.
- Unclassified Dofuses are tier 3 by default.
- Trophies are tier 2 by default.
- Pets and petsmounts are tier 2 by default.
- Mounts are tier 1 by default.
- Normal equipment is tier 1 by default unless it has special-effect `buffs`.
- Items with special-effect `buffs` are tier 4 by default.
- Legendary/special-effect item detection is currently approximate and based on item buffs.
- Shaker, Nomad, Jackanapes, and Voyager are budget enablers and must remain easy for the solver to consider.
- Some low-level items remain useful at level 200 and need explicit evergreen treatment.

## Exo Assumptions

- At most one AP exo can be applied.
- At most one MP exo can be applied.
- At most one Range exo can be applied.
- Exos can only be applied to eligible item types: hat, cloak, amulet, ring, belt, boots, weapon, shield.
- An item cannot receive an exo for a stat it already gives.
- Multiple missing action stats cannot be stacked onto one item.
- Generated exos are modeled as +1 AP/MP/Range only.
- Exo market cost/availability is represented by budget/exo policy, not by exact prices.

## Class And Element Assumptions

- Iop defaults to melee.
- Cra should eventually default to ranged and should not be encouraged into melee weapon reliance.
- Class defaults should be class-first, then element-specific when data or player feedback justifies it.
- Strength Iop uses old/local spell data where available.
- Strength Iop should model spell selection instead of generic made-up spell lines where possible.
- Strength Iop includes Accumulation setup behavior when relevant.
- Iop's Wrath is modeled over a 7-turn window with setup/cooldown semantics.
- Intelligence, Chance, and Agility Iop currently reuse the broader Iop/scoring methodology and need more validation.
- Non-Iop classes are not yet product-supported.

## Damage Scoring Assumptions

- Damage should be a component score, not one huge user-facing stat table.
- Damage should normalize against a class/element baseline.
- Reference damage profile currently assumes roughly:
  - 1000 primary stat
  - 200 power
  - 100 elemental damage
  - 50 crit
  - 100 crit damage
- `% Final Damage` is included when enough context exists.
- `% Spell Damage` applies to spell damage lines.
- `% Weapon Damage` applies to weapon damage lines.
- `% Melee Damage` and `% Ranged Damage` should apply only when melee/ranged context is reliable.
- Weapon damage is an uplift only when it beats spell rotation alternatives.
- Weak weapons should not make stat-stick weapons look unfairly bad.
- Weapon suitability should depend on damage range preference.

## Special Effect Assumptions

- Cloudy Dofus uses a conservative expected value around +5.5% final damage.
- A 7-turn Cloudy window overstates value because it ends on an extra +20% turn.
- Vulbis Dofus uptime is low for generic Iop PvM, currently assumed around 10%.
- Ochre temporary AP is damage/utility value and does not satisfy static AP targets.
- AP Prysmaradite static AP and temporary AP/final-damage tradeoff must be modeled separately.
- Conditional legendary/item text effects are not fully modeled.
- Effects that depend on being hit, movement, turn parity, or uptime are approximate.

## Survivability Assumptions

- Survivability uses effective-HP style scoring.
- Vitality, percent resistances, fixed resistances, critical resistance, and pushback resistance matter.
- Percent resistances cap at 50.
- Enemies tend to hit weak elements, so weakest-element EHP matters most.
- Sorted elemental EHP weights are approximately:
  - weakest: 40%
  - second weakest: 25%
  - middle: 15%
  - second strongest: 10%
  - strongest: 10%
- Pushback resistance has very low generic PvM value.
- Damage and survivability should be roughly comparable for balanced PvM after normalization.

## Utility Assumptions

- Utility should remain a small v1 component.
- Dodge is worth more than Lock for generic PvM.
- Initiative has low value.
- Prospecting has very low value.
- AP Parry and MP Parry have some value.
- Summons matter only when class/use-case needs them.
- Utility should not be exposed as a confusing third user-facing axis in v1.

## Solver/Search Assumptions

- Set-aware beam/package search is the preferred current direction.
- Full catalog exhaustive search is too expensive.
- OR-Tools is not the primary v1 solver.
- Package seeding should include relevant 2-piece and 3-piece set packages.
- AP set-bonus approaches must be preserved.
- No-set-bonus AP approaches must be preserved.
- Ochre/Vulbis approaches must be preserved when budget allows.
- Budget/no-exo approaches must be preserved.
- Dofus/trophy diversity is part of quality.
- Showing five near-identical builds is not useful.
- Diversity filtering by item overlap and approach is required.
- Cheap final prefiltering is acceptable only if benchmark reports prove it does not drop important valid/diverse builds.
- Ranked Dofus slot filling was previously rejected because it dropped a valid/diverse build.

## Generated Index Assumptions

- Generated JSON indexes are the fast-read path.
- The generated index lives at `server/app/database/data/build_discovery_index.json`.
- The generated index is ignored by git.
- Index schema version is currently `1`.
- Runtime should reject unsupported index schema versions.
- `datasetVersion` currently derives from generated index metadata.
- Level buckets are:
  - 1-99
  - 100-149
  - 150-179
  - 180-200
- Normal gear currently comes from the target level bucket.
- Dofus/trophy/Prysmaradite candidates can come from lower/equal level buckets.
- Pets, petsmounts, mounts, and evergreen IDs bypass ordinary level-bucket pruning.
- Evergreen item IDs are a curated workaround for useful low-level items.

## Performance And Cache Assumptions

- Data loading should be sub-second when the generated index exists.
- Beam search and final scoring are the main bottlenecks.
- Shippable target: cached query under 500ms.
- Shippable target: fresh query p95 under 5s if served synchronously.
- If fresh p95 stays above 5s, product should use async job flow with progress.
- Cache keys must include query inputs, dataset version, and solver version.
- Cache should include budget tier, exo policy, locked items, avoided items, and damage/survivability preset.
- Current cache-key support does not yet choose final cache storage.
- Storage could eventually be in-memory, Redis, database, or generated precompute artifacts.

## Benchmark Assumptions

- Milestone 4 starts with Strength Iop 11/6 and 12/6 human references.
- Benchmark reports should include raw page stats, normalized mages, base allocation, AP/MP/Range, damage, survivability, utility, availability assumptions, and why generated builds win/lose.
- DofusLab benchmark URLs can be scored from embedded page data when network and local item data are available.
- Fashionista links are currently manual comparison references, not automatically parsed/scored.
- A benchmark report with per-benchmark errors is still useful if it exposes environment/data setup gaps.
- Accepted benchmark outputs should become regression fixtures.

## Instrumentation Assumptions

- Track query inputs.
- Track generated build IDs/items.
- Track builds shown.
- Track build opened.
- Track build copied/saved.
- Track build edited.
- Track item locked.
- Track item avoided.
- Track too-expensive feedback.
- Track slider changes after generation.
- Track abandoned generation.
- Track runtime timings.
- Track solver version.
- Track dataset version.
- Availability learning must use rates with smoothing, not raw complaint counts.
- `0 complaints` is not evidence that an item is accessible unless exposure is high.
