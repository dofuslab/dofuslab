# Build Discovery Assumptions To Review

Last updated: 2026-07-10

This file lists the working assumptions embedded in the Build Discovery PRD, prototype, benchmark tooling, and harness. Treat it as a review checklist, not settled truth.

## Product Scope Assumptions

- v1 is a structured build generator, not a chatbot.
- v1 item selection is deterministic solver logic, not LLM selection.
- v1 started with level 200 PvM; the active expansion target is any level Iop.
- v1 starts with Iop.
- v1 starts with single-element builds.
- v1 should support Iop Strength, Intelligence, Chance, and Agility before expanding further.
- Multi-element and omni builds are out of scope until single-element quality is stable.
- PvP modeling is out of scope.
- Full class spell rotation optimization is out of scope.
- Globally optimal builds are not required; plausible, explainable, bounded search is enough.

## Query Contract Assumptions

- Query inputs should include class, level, elements, mode, AP target, MP target, Range target, damage/survivability preset, budget tier, exo policy, weapon policy, locked items, and avoided items.
- `className=Iop`, `level=1-200`, `mode=pvm`, and one single element are the intended Milestone 3 product-shaped query values.
- `level` belongs in the query/API/cache/provenance contract. Validation now
  accepts levels 1-200 for Iop.
- Characteristic points are modeled as `5 * (level - 1)`.
- Base AP is level-aware: 6 for levels 1-99 and 7 for levels 100-200.
- The current level model assumes fully scrolled base stats (`100`) at every
  level; this is reviewable and may be too generous for low-budget/low-level
  builds.
- Solver quality is not considered proven for non-200 levels until level-aware
  generated artifacts are regenerated and reviewed against benchmark rows.
- Milestone 1 support means all supported Iop single elements: Strength, Intelligence, Chance, and Agility.
- Milestone 1 support means any valid AP/MP/Range target within hard caps, not only 11/6/0 and 12/6/0 benchmark rows.
- Milestone 1 support means product intent controls should affect generation: damage/survivability preset, budget tier, exo policy, weapon policy, locked items, and avoided items.
- Locked items are final-result requirements. If the solver cannot find builds containing all locked items, result count can fall.
- Avoided items are excluded from candidate loading.
- Locked and avoided item IDs cannot overlap.
- `datasetVersion`, `solverVersion`, and query inputs belong in cache keys.
- The oneoff query wrapper remains the solver core, but there is now a GraphQL product path for app use.
- `buildDiscovery` remains only as a deprecated legacy/dev direct query path.
- `startBuildDiscovery` is the product run path for the page and returns a persisted job contract.
- `buildDiscoveryJob(id)` is the product polling path for persisted jobs.
- Successful generated imports should keep enough request/build provenance to explain where generated custom sets came from.

## AP / MP / Range Assumptions

- AP, MP, and Range are minimum targets with hard caps, not exact targets.
- Hard caps are AP 12, MP 6, Range 6.
- AP minimum is level-dependent: 6 for levels 1-99 and 7 for levels 100-200.
- Below target is invalid or heavily rejected.
- At target is valid.
- Above target and at/below cap is valid.
- Above cap is invalid.
- `rangeTarget=None` means no explicit Range requirement in the product goal;
  the current contract accepts it but normalizes to `0` internally until the
  solver can safely allow negative Range final totals.
- Extra AP, MP, and Range are usually good, but only lightly rewarded.
- The solver should not choose a much weaker or less available build just because it has surplus Range or unnecessary surplus movement.
- Temporary AP from special effects does not satisfy static AP targets.

## Budget / Availability Assumptions

- Budget means availability/accessibility, not exact kama price.
- Initial budget tiers are coarse and based on current working assumptions, not fresh market data.
- Tier 1: mounts, trophies, and normal equipment not assigned to higher tiers.
- Tier 2: pets, petsmounts, and accessible Dofuses.
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
- Trophies are tier 1 by default because they are budget enablers.
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
- Queries like "200 glass cannon int Cra" and "150 balanced str ecaflip" are target benchmark prompts for later expansion, not supported v1 generation queries yet.
- Non-Iop benchmark discovery can still inspect existing user builds, but generated comparisons require class support before they are product-valid.

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
- Normal gear and set package candidates should come from the target level bucket plus the immediately previous bucket.
- Strict target-bucket-only filtering is too narrow because players commonly dip into the previous bracket for still-efficient pieces.
- Dofus/trophy/Prysmaradite candidates can come from lower/equal level buckets.
- Pets, petsmounts, mounts, and evergreen IDs bypass ordinary level-bucket pruning.
- Evergreen item IDs are a curated workaround for useful low-level items.

## Performance And Cache Assumptions

- Performance is not the next correctness milestone. The next expansion is level diversity for Iop; optimization comes after accepted level-diversity rows exist.
- Data loading should be sub-second when the generated index exists.
- Beam search and final scoring are the main bottlenecks.
- Optimization success target: cached query p95 under 500ms.
- Optimization success target: cache-miss / fresh-generation p95 under 5s for the representative level 200 Iop and accepted level-diversity query matrices.
- Async job flow remains useful fallback/resilience infrastructure, but async alone does not satisfy optimization unless the product target is explicitly revised.
- Current local fresh p95 exceeds 5s for most supported rows, so optimization remains incomplete.
- Cache keys must include query inputs, dataset version, and solver version.
- Cache should include budget tier, exo policy, locked items, avoided items, and damage/survivability preset.
- App-level cache storage is dogpile/Redis through `cache_region`.
- The prototype process-memory cache is still available inside oneoff code, but app cache misses bypass it for fresh measurement/execution.
- `startBuildDiscovery` should check app cache first; cache hits can return succeeded jobs immediately.
- App-cache misses should create queued jobs and be handled by the RQ worker path.
- Worker-computed results should populate app cache using the same query/dataset/solver key.
- Local Docker/Compose needs a worker service to consume queued Build Discovery jobs.

## Async Job Assumptions

- A Build Discovery job row is the durable user-facing generation request state.
- Job statuses currently expected by the client are `queued`, `running`, `succeeded`, and `failed`.
- Queued/running jobs may have no result payload yet.
- Failed jobs must expose `errorPayload.message`; failures should not look like empty result sets.
- Enqueue failures must be written back to the job row and returned to the client as failed jobs.
- Worker failures should persist `errorPayload` and transition jobs to `failed`.
- Job result payloads may be full solver responses; request payloads should remain compact and replayable.
- `requestPayload.queryIdentity` is the canonical replay/cache identity for workers.
- `requestPayload.query` is the compact display/provenance query shape.
- Job rows may link to a `GenerationRequest` later when a generated build is imported.
- The existing default RQ queue also handles non-Build-Discovery jobs such as email, so local workers are shared infrastructure.

## Benchmark Assumptions

- The next benchmark expansion is level diversity for Iop, using readonly prod aggregate AP/MP/Range distributions by level bucket to choose sample targets.
- Milestone 1 owns the broad Iop query surface; 11/6/0 and 12/6/0 Iop profiles are regression rows, not the whole Milestone 1 scope.
- Class expansion starts after the level 200 Iop and sampled Iop level-diversity surfaces are in good shape.
- Broad non-200 generation is the active Milestone 3 target for Iop.
- Level Diversity should use prod-derived AP/MP/Range distributions plus generated index level buckets as starting boundaries: 1-99, 100-149, 150-179, and 180-200.
- The current Level Diversity generated matrix is a sampled correctness surface,
  not proof that every valid level/AP/MP/Range combination is high quality.
- The current Level Diversity generated matrix records current best solver
  outputs for review; human/gameplay acceptance is still separate.
- Rows that over-satisfy AP, MP, or Range are valid under current product
  semantics, but reviewers should flag cases where surplus action stats appear
  to crowd out better damage, survivability, or availability.
- A generated build passing condition and target checks does not prove the build
  is desirable for real play at that level.
- Some syntactically valid AP/MP/Range targets can be catalog-infeasible at a
  given level and budget. For example, level 20 tier 1 currently has only
  mutually exclusive +Range amulet options, so `Range=6` is not a realistic
  generated-build target at that level.
- Pre-100 cap targets can require higher-budget assumptions. For example,
  level 99 `12/6/6` currently needs tier 3 exo support in the coverage matrix;
  tier 2 no-exo did not produce a valid build in wide search.
- Level Diversity needs bracket-specific AP/MP/Range defaults, budget assumptions, survivability baselines, and benchmark fixtures before enabling each bracket broadly.
- Benchmark reports should include raw page stats, normalized mages, base allocation, AP/MP/Range, damage, survivability, utility, availability assumptions, and why generated builds win/lose.
- DofusLab benchmark URLs can be scored from embedded page data when network and local item data are available.
- Fashionista links are currently manual comparison references, not automatically parsed/scored.
- A benchmark report with per-benchmark errors is still useful if it exposes environment/data setup gaps.
- Accepted benchmark outputs should become regression fixtures.
- The current committed local query fixture proves importable result shape for Iop element profiles, but it intentionally records fresh p95 threshold failures where observed.
- Prod benchmark discovery must remain bounded, aggregate-first, and read-only.
- Prod benchmark discovery should not expose custom set names, owner IDs, or singleton-identifying build details.

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
