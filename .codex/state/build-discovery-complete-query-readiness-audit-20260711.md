# Build Discovery Complete-Query Readiness Audit - 2026-07-11

Purpose: audit the current branch against the active goal before claiming the pre-optimization query path is complete.

## Verdict

Status: **not complete yet, but close for path/constraint coverage**.

The current branch has strong sampled evidence that CP-SAT can generate mechanically valid builds across class, element, budget, level, AP/MP, and Range boundaries. A first prod-backed benchmark discovery checkpoint has now run against representative complete level-200 class slices. It supports the current query envelope for common positive-range prod shapes, and negative-range prod shapes are now mapped to omitted/soft Range queries instead of unsupported hard Range targets.

## Requirement Audit

### Multi-Agent Loop

Requirement: use worker/reviewer/planner style and commit reviewable checkpoints.

Evidence:
- Subagent reviewer identified the CP-SAT `Range=8.0` objective leak.
- Subagent reviewer proposed the 19-row all-class smoke matrix.
- Checkpoint commits are stacked and reviewable:
  - `d392033c Wire class-aware spell scoring profiles`
  - `b8e57e0b Derive soft range value from spell profiles`
  - `50278fcc Add all-class CP-SAT smoke harness`
  - `e5941ee4 Expand all-class CP-SAT smoke coverage`
  - `052f7460 Add level-diversity CP-SAT smoke coverage`

Status: **satisfied for current milestone work**.

### Any Class

Requirement: query any class.

Evidence:
- `BuildDiscoveryQuery.validate()` now accepts the 19 supported classes.
- `.codex/state/build-discovery-all-class-cpsat-smoke-20260711.json` has `classCount=19`, `passed=19`, `failed=0`.
- Each all-class smoke row validates condition-valid builds, AP/MP/Range caps, matching `objectiveWeights.Range` and `scoring.rangeSoftWeight`, and non-Iop spell candidates.

Status: **sampled path coverage satisfied**.

Residual risk:
- Non-Iop scoring remains `spell_profile_v0_weighted_candidates` with `medium` confidence, not reviewed full rotations.

### Any Single Element

Requirement: query any single element.

Evidence:
- `BuildDiscoveryQuery.primary_element` still intentionally rejects multi-element queries.
- All-class and level-diversity smoke artifacts cover `strength`, `intelligence`, `chance`, and `agility`.
- CP-SAT summaries now include non-zero primary and elemental damage stats instead of hardcoding Strength/Earth.

Status: **single-element path coverage satisfied**.

Residual risk:
- Multi/omni is out of scope for this milestone.

### Any Budget

Requirement: query budget tiers `1-4`, with lower tiers able to use previous-bucket items.

Evidence:
- `BuildDiscoveryQuery.validate()` accepts budget tiers `1-4`.
- All-class smoke covers budget tiers `1`, `2`, `3`, and `4`.
- Level-diversity smoke covers budget tiers `1`, `2`, `3`, and `4`.
- Budget tier item filtering uses `availability_tier_for_item(item) <= budget_tier`.

Status: **sampled path coverage satisfied**.

Residual risk:
- v0 availability is still hardcoded. Budget quality/accessibility requires prod/human feedback later.

### Valid AP/MP/Range Targets

Requirement: valid AP/MP/Range from `6/3/None`, or `7/3/None` for level `100+`, up to `12/6/6`.

Evidence:
- `BuildTarget.__post_init__()` enforces AP/MP/Range lower and upper bounds.
- `base_ap_for_level(level)` drives target minimum AP: `6` before level `100`, `7` for level `100+`.
- All-class smoke covers `rangeTarget=None`, `0`, `3`, `5`, and `6`.
- Level-diversity smoke covers `rangeTarget=None`, `0`, `1`, `2`, `3`, and `6`.
- Level-diversity smoke includes:
  - level `1` Iop `6/3/Any`, passed
  - level `99` Enutrof `12/6/6`, passed
  - level `100` Xelor `7/3/Any`, passed
  - level `180` Rogue `12/6/6`, passed
  - level `200` Feca tier `1` realistic floor `10/5/Any`, passed

Status: **sampled boundary/corner coverage satisfied**.

Residual risk:
- This is not exhaustive across every valid target. The goal explicitly allows corner-case sampling, so this is acceptable path evidence, not mathematical proof.

### Range Semantics

Requirement: explicit Range is hard; omitted Range is a soft stat/tradeoff.

Evidence:
- `BuildTarget.range_required` is false when `range_target=None`.
- CP-SAT smoke validates `objectiveWeights.Range == scoring.rangeSoftWeight`.
- Corrected examples:
  - Cra Strength soft Range: `rangeSoftWeight=8.0`
  - Sacrier Intelligence no-range: `rangeSoftWeight=0.5`
  - Xelor Agility validity edge: `rangeSoftWeight=0.5`
- CP-SAT `final-linear` no longer overwrites `Range` with raw `STAT_WEIGHTS`.

Status: **satisfied for current CP-SAT path**.

### Level Diversity

Requirement: extend beyond level 200 enough to support complete-query confidence.

Evidence:
- `.codex/state/build-discovery-level-diversity-cpsat-smoke-20260711.json` has `targetCount=12`, `passed=12`, `failed=0`.
- It covers levels `1`, `20`, `50`, `80`, `99`, `100`, `120`, `150`, `179`, `180`, `199`, and `200`.
- Max observed `totalSearchMs=3290.8` with a `5s` per-row time cap.

Status: **sampled path coverage satisfied**.

Residual risk:
- Some generated rows use exos at lower levels or repeated Khardboard-style packages. That is acceptable for smoke validity, but should be reviewed before benchmark acceptance.

### Assumptions List

Requirement: list assumptions so they are easy to review.

Evidence:
- `.codex/state/build-discovery-assumptions.md` contains product, solver, budget, Range, level, scoring, instrumentation, and benchmark assumptions.
- New assumptions were added for all-class smoke evidence, level-diversity smoke evidence, and `active_stat_weights()` requirements.

Status: **satisfied, ongoing**.

### Prod Benchmarks

Requirement: if we think we are done, use prod to find builds people are using and use these as benchmarks.

Evidence:
- Existing prod benchmark discovery scripts/artifacts exist, but no new all-class/level-diversity CP-SAT prod benchmark comparison has been run after the class-aware pivot.

Status: **partially satisfied**.

Evidence:
- `.codex/state/build-discovery-prod-benchmark-discovery-representative-20260711.md` summarizes six bounded class-specific complete-build slices.
- JSON artifacts exist for Iop, Cra, Enutrof, Sacrier, Feca, and Xelor.
- Queries were aggregate-only, class-specific, `sampleLimit=40`, `topItems=6`, `statementTimeoutMs=5000`, and filtered to at least 16 distinct equipped slots.
- Common supported prod shapes include Cra Intelligence `12/6/6`, Cra Strength `12/6/6`, Enutrof Chance `12/6/6`, Enutrof Chance `12/6/5`, Feca Chance `12/6/5`, Feca Strength `12/6/6`, and Feca Chance `12/6/6`.

Follow-up evidence:
- `.codex/state/build-discovery-prod-candidate-generated-results-representative-20260711.md` records CP-SAT generation against supported candidates from the six representative prod slices.
- 11 supported prod-shaped candidates generated one feasible build each using balanced `damageSurvivabilityPreset=2`, `budgetTier=4`, and `exoPolicy=opti`.
- The only skipped profile was Enutrof Chance `12/6/7`, which is outside the current hard Range cap.
- Max observed `totalSearchMs` in this checkpoint was 3696.5ms.

Residual risk:
- This proves sampled query feasibility, not build quality. Several generated builds have low vitality or odd item packages, so non-Iop scoring/optimization should not be treated as accepted.

## Current Conclusion

The branch is ready for a prod-benchmark checkpoint. If that produces plausible benchmark comparisons without exposing a major correctness bug, the pre-optimization complete-query path can likely be considered complete enough under the user's corner-case standard.
