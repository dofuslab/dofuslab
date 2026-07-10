# Build Discovery Assumptions Review Index

Last updated: 2026-07-10

This is the short review index for the highest-risk Build Discovery assumptions.
Use it with:

- `.codex/state/build-discovery-assumptions.md`
- `.codex/state/build-discovery-gameplay-review-packet.md`
- `.codex/state/build-discovery-readiness-checklist.md`

## Release Blockers

These need gameplay or product review before calling the feature shippable.

1. Budget tier boundaries
   - Confirm Dolmanax, Ice, Crimson, and Turquoise in tier 2.
   - Confirm Prysmaradites in tier 3.
   - Confirm Ochre, Vulbis, legendary items, and strong special-effect items in tier 4.
   - Decide whether any special-effect items should be tier 3 instead of tier 4.

2. Exo policy semantics
   - Decide whether `exoPolicy=opti` must differ from `allow` before release.
   - Confirm AP/MP/Range exos stay separate from budget tier in user-facing controls.
   - Confirm generated exos are acceptable as +1 AP/MP/Range only.

3. AP/MP/Range target semantics
   - AP, MP, and Range are minimum targets with hard caps, not exact targets.
   - Surplus AP/MP/Range is allowed but should be lightly weighted.
   - Confirm surplus Range should not dominate damage, survivability, or availability.

4. Iop element quality
   - Strength Iop has the most benchmark support.
   - Intelligence, Chance, and Agility Iop use the broader Iop scoring method and need gameplay review.
   - Confirm whether non-Strength Iop is good enough for first release.

5. Special-effect modeling
   - Cloudy, Vulbis, Ochre, Prysmaradites, and legendary effects are approximate.
   - Confirm which effects are too mis-modeled to expose.
   - Confirm special-effect items should remain gated behind high budget or explicit opti intent.

6. Benchmark representativeness
   - Confirm the current Strength Iop DofusLab references are representative.
   - Identify missing non-Strength Iop references before expanding release confidence.
   - Treat non-Iop prod references as discovery targets only until class modeling expands.

7. Level-diversity matrix quality
   - Review `.codex/state/build-discovery-level-diversity-matrix.md`.
   - Review `.codex/state/build-discovery-level-boundary-matrix.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-coverage-matrix.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-grid-next-minimum-matrix.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-grid-next-cap-diagnostics.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-grid-next-cap-level50-witness-diagnostics.md`.
   - Review `.codex/state/build-discovery-ap-mp-range-grid-inventory.md`.
   - The current matrix has 27 sampled Iop targets, all generated with at least one build.
   - The current boundary matrix has 10 transition-level targets, all generated with at least one build.
   - The current AP/MP/Range coverage matrix has 12 edge/corner targets, all generated with at least one build.
   - The current selector-derived minimum matrix has 12 representative-level
     minimum targets, all generated with at least one build.
   - The current selector-derived cap matrix has 12 representative-level
     `12/6/6` tier 4 targets: 9 generated and 3 no-build rows at levels 1, 20,
     and 50.
   - The current cap diagnostics show levels 1 and 20 are below target under
     an optimistic item-stat-only independent-slot upper bound. Because set
     bonuses are not included yet, this is strong evidence but not a full
     catalog-infeasibility proof.
   - Level 50 is not proven infeasible by that diagnostic and remains a solver
     recall, set-bonus, uniqueness, condition, or deeper interaction question.
   - The level 50 witness diagnostic found a valid `12/6/6` action-stat item
     placement, so the current cap no-build row is a solver recall/search gap
     for that target.
   - The current grid inventory has 39,424 representative valid query rows and
     58 exact generated-evidence rows; it is a gap map, not build proof.
   - Confirm the sampled rows are useful representatives before promoting them to accepted benchmarks.
   - Flag rows where surplus AP/MP/Range, budget assumptions, or old lower-bucket gear look suspicious.
   - Treat this as generated solver evidence, not gameplay acceptance.

## Shippability Watch Items

These do not necessarily block a constrained v1, but they should stay visible.

1. Fresh synchronous performance
   - Fresh local p95 is still above 5s for many supported rows.
   - Accepted product path is async-first cache misses plus synchronous cache hits.
   - Warmed cache p95 is currently well under the 500ms readiness target in Docker runs.

2. Generated data cleanliness
   - Generated imports create `GenerationRequest` provenance.
   - Generated custom sets are user-owned saved builds after import, not disposable job artifacts.
   - Legacy generated-looking rows without provenance should remain audit-visible.

3. Scope boundary
   - v1 product generation supports Iop only.
   - Queries like `200 glass cannon int Cra` and `150 balanced str ecaflip` are future benchmark prompts, not supported generated queries yet.
   - Unsupported class, level, mode, and multi-element inputs should reject clearly.

4. Prod benchmark path
   - Prod discovery must remain bounded, aggregate-first, and read-only.
   - Prod discovery should not expose custom set names, owner IDs, or singleton-identifying build details.
   - `DOFUSLAB_READONLY_DATABASE_URL` is stored in the Windows user environment
     and must be passed explicitly into Docker with `docker exec -e`.

## Suggested Review Output

Use this compact format when reviewing:

```text
Budget tiers:
- approve / change:

Exo policy:
- approve / change:

AP/MP/Range surplus:
- approve / change:

Iop element release scope:
- approve / change:

Special effects:
- approve / change:

Benchmarks:
- approve / change:

Level-diversity matrix:
- approve / change:
```
