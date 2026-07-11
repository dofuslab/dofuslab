# All-Class Pre-Optimization Smoke Plan - 2026-07-11

Purpose: make Milestone 2 executable for every level-200 class/element pair before optimization work. This is a smoke matrix, not a generated-build result matrix.

## Summary

```json
{
  "reportVersion": "build-discovery-all-class-preopt-smoke-plan-v1",
  "generatedAt": "2026-07-11",
  "purpose": "Concrete smoke matrix for expanding Milestone 2 from Iop-only to all level-200 class/element pairs before optimization work.",
  "profileCount": 76,
  "classCount": 19,
  "rangeUsefulnessCounts": {
    "vital": 21,
    "marginal": 10,
    "useful": 13,
    "nearly useless": 32
  },
  "damageProfileConfidenceCounts": {
    "medium": 75,
    "high": 1
  },
  "queryRowsIfAllPresetsExpanded": 674
}
```

## Current Blockers

- BuildDiscoveryQuery currently rejects class_name != Iop, so all-class generation is not wired through yet.
- CP-SAT solve path configures damage only by element; it imports the Iop-era query/profile machinery and does not consume class-specific spell profiles.
- The existing score path still uses ACTIVE_DAMAGE_PROFILE and generic spell damage fallbacks; non-Iop output would be misleading until class/element profiles drive objective weights.
- Profile confidence must be surfaced in generated result diagnostics so medium-confidence class profiles are reviewable, not silently authoritative.
- +Range should become a soft class/element-specific stat value when rangeTarget is None; hard rangeTarget should remain a constraint only when the user explicitly asks for it.
- The class name, spell profile version, range usefulness version, budget policy version, and scoring preset must be part of cache/provenance identity.

## Acceptance Gates

- Every planned query either returns a condition-valid build or an explicit infeasible/unsupported reason.
- No non-Iop query may silently fall back to Iop spell scoring.
- Budget tier, exo policy, AP cap, MP cap, and hard range semantics are enforced before a row is marked passing.
- Generated diagnostics include className, element, damage profile confidence, top spell evidence, +Range usefulness, and damage/survivability preset.
- At least one reviewed row per class is plausible before broad cache generation begins.

## Query Policy

- Baseline opti row: `level=200`, `budgetTier=4`, `exoPolicy=opti`, `12/6/Any`, presets `1-4`.
- Budget row: `level=200`, `budgetTier=1`, `exoPolicy=none`, `11/6/Any`, presets `2-3`.
- Validity edge row: `level=200`, `budgetTier=2`, `exoPolicy=allow`, `7/3/Any`, preset `2`; this should warn that it is not a realistic level-200 player target.
- Range stress row is class/element-specific: `6` for vital profiles, `5` for useful, `3` for marginal, `0` for nearly-useless.

## Profiles

### Cra strength

- Primary stat: `Strength`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.283%`, +10 flat `1.832%`, +10% spell `10.0%`, high-base share `0.47`, mod-range share `1.0`
- Top spell evidence: Arrow of Judgement, Lashing Arrow, Covering Fire, Barricade Shot
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Cra intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.321%`, +10 flat `0.482%`, +10% spell `10.0%`, high-base share `0.748`, mod-range share `1.0`
- Top spell evidence: Fulminating Arrow, Exploding Arrow, Explosive Arrow, Tyrannical Arrow
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Cra chance

- Primary stat: `Chance`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.277%`, +10 flat `1.84%`, +10% spell `10.0%`, high-base share `0.56`, mod-range share `1.0`
- Top spell evidence: Redemption Arrow, Frozen Arrow, Persecuting Arrow, Atonement Arrow
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Cra agility

- Primary stat: `Agility`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.367%`, +10 flat `0.423%`, +10% spell `10.0%`, high-base share `0.825`, mod-range share `1.0`
- Top spell evidence: Devouring Arrow, Piercing Shot, Tormenting Arrow, Optical Arrow
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Ecaflip strength

- Primary stat: `Strength`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.199%`, +10 flat `0.641%`, +10% spell `10.0%`, high-base share `0.798`, mod-range share `0.604`
- Top spell evidence: Trickery, Rekop, Misadventure, Heads or Tails
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Ecaflip intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.262%`, +10 flat `0.559%`, +10% spell `10.0%`, high-base share `0.712`, mod-range share `0.857`
- Top spell evidence: Trickery, Rekop, Topkaj, Meowch
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Ecaflip chance

- Primary stat: `Chance`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.235%`, +10 flat `0.594%`, +10% spell `10.0%`, high-base share `0.782`, mod-range share `0.694`
- Top spell evidence: Trickery, Rekop, All or Nothing, Misfortune
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Ecaflip agility

- Primary stat: `Agility`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.264%`, +10 flat `0.557%`, +10% spell `10.0%`, high-base share `0.752`, mod-range share `0.72`
- Top spell evidence: Trickery, Rekop, Balling Up, Nerve
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Eliotrope strength

- Primary stat: `Strength`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `5.918%`, +10 flat `2.307%`, +10% spell `10.0%`, high-base share `0.0`, mod-range share `0.582`
- Top spell evidence: Persiflage, Sarcasm, Snub, Therapy
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Eliotrope intelligence

- Primary stat: `Intelligence`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.628%`, +10 flat `1.384%`, +10% spell `10.0%`, high-base share `0.582`, mod-range share `0.183`
- Top spell evidence: Parasite, Lazybeam, Offence, Wakfu Ray
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Eliotrope chance

- Primary stat: `Chance`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.35%`, +10 flat `1.745%`, +10% spell `10.0%`, high-base share `0.332`, mod-range share `0.364`
- Top spell evidence: Audacious, Insolence, Composure, Lightning Fist
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Eliotrope agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.018%`, +10 flat `2.176%`, +10% spell `10.0%`, high-base share `0.23`, mod-range share `0.0`
- Top spell evidence: Sermon, Ridicule, Insult, Contempt
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Eniripsa strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.422%`, +10 flat `1.652%`, +10% spell `10.0%`, high-base share `0.45`, mod-range share `0.0`
- Top spell evidence: War Cry, Ancestral Ointment, Profanity, Tribal Paintbrush
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Eniripsa intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.242%`, +10 flat `1.885%`, +10% spell `10.0%`, high-base share `0.408`, mod-range share `0.781`
- Top spell evidence: Deafening Cry, Raucous Word, Pilfering, Scalpel
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Eniripsa chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.253%`, +10 flat `1.871%`, +10% spell `10.0%`, high-base share `0.369`, mod-range share `0.0`
- Top spell evidence: Vampiric Word, Bloodless Word, Sobs, Scalpel
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Eniripsa agility

- Primary stat: `Agility`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.142%`, +10 flat `0.715%`, +10% spell `10.0%`, high-base share `0.557`, mod-range share `0.932`
- Top spell evidence: Secret Word, Malicious Word, Mischievous Word, Flowery Word
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Enutrof strength

- Primary stat: `Strength`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.27%`, +10 flat `1.848%`, +10% spell `10.0%`, high-base share `0.29`, mod-range share `0.426`
- Top spell evidence: Collapse, Prime of Life, Shovel Throwing, Mound
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Enutrof intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.908%`, +10 flat `1.019%`, +10% spell `10.0%`, high-base share `0.513`, mod-range share `0.824`
- Top spell evidence: Unsummoning, Mine Fire, Shovel Kiss, Ghostly Shovel
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Enutrof chance

- Primary stat: `Chance`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.206%`, +10 flat `1.932%`, +10% spell `10.0%`, high-base share `0.379`, mod-range share `0.783`
- Top spell evidence: Obsolescence, Placer Mining, Auriferous Shovel, Shovel of the Ancients
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Enutrof agility

- Primary stat: `Agility`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.168%`, +10 flat `1.982%`, +10% spell `10.0%`, high-base share `0.49`, mod-range share `0.561`
- Top spell evidence: Hard Cash, Bankruptcy, Opportuneness, Loafylactic
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Feca strength

- Primary stat: `Strength`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.798%`, +10 flat `1.162%`, +10% spell `10.0%`, high-base share `0.636`, mod-range share `0.368`
- Top spell evidence: Distrust, Barrier, Backlash, Tetany
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Feca intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.776%`, +10 flat `1.191%`, +10% spell `10.0%`, high-base share `0.571`, mod-range share `0.797`
- Top spell evidence: Distrust, Barrier, Lethargy, Languor
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Feca chance

- Primary stat: `Chance`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.778%`, +10 flat `1.188%`, +10% spell `10.0%`, high-base share `0.578`, mod-range share `0.849`
- Top spell evidence: Distrust, Barrier, Getaway, Bubble
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Feca agility

- Primary stat: `Agility`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.813%`, +10 flat `1.143%`, +10% spell `10.0%`, high-base share `0.582`, mod-range share `0.376`
- Top spell evidence: Distrust, Barrier, Gust, Typhoon
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Foggernaut strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.565%`, +10 flat `0.165%`, +10% spell `10.0%`, high-base share `0.868`, mod-range share `0.082`
- Top spell evidence: Drill, Harpooner, Mooring, Backwash
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Foggernaut intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.571%`, +10 flat `0.158%`, +10% spell `10.0%`, high-base share `0.898`, mod-range share `0.011`
- Top spell evidence: Drill, Harpooner, Valve, Hoofbeat
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Foggernaut chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.559%`, +10 flat `0.173%`, +10% spell `10.0%`, high-base share `0.91`, mod-range share `0.146`
- Top spell evidence: Drill, Harpooner, Torrent, Periscope
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Foggernaut agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.562%`, +10 flat `0.17%`, +10% spell `10.0%`, high-base share `0.864`, mod-range share `0.1`
- Top spell evidence: Drill, Harpooner, Pilfer, Corrosion
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Forgelance strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.018%`, +10 flat `2.176%`, +10% spell `10.0%`, high-base share `0.084`, mod-range share `0.0`
- Top spell evidence: Upheaval, Slingshot, Earthen Weakness, Middle Earth
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Forgelance intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `5.923%`, +10 flat `2.3%`, +10% spell `10.0%`, high-base share `0.087`, mod-range share `0.0`
- Top spell evidence: Burning Estoc, Fire Lance, Hot Iron, Maelstrom
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Forgelance chance

- Primary stat: `Chance`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.012%`, +10 flat `2.185%`, +10% spell `10.0%`, high-base share `0.082`, mod-range share `0.585`
- Top spell evidence: Octave, Lance of the Lake, Biting Trident, Elding
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Forgelance agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.059%`, +10 flat `2.123%`, +10% spell `10.0%`, high-base share `0.091`, mod-range share `0.0`
- Top spell evidence: No Myr Javelin, Brass Volley, Cyclone Lancer, Windmill
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Huppermage strength

- Primary stat: `Strength`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.36%`, +10 flat `0.433%`, +10% spell `10.0%`, high-base share `0.909`, mod-range share `0.235`
- Top spell evidence: Morph, Arcane Torrent, Elemental Drain, Manifestation
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Huppermage intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.357%`, +10 flat `0.435%`, +10% spell `10.0%`, high-base share `0.932`, mod-range share `0.121`
- Top spell evidence: Morph, Arcane Torrent, Elemental Drain, Manifestation
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Huppermage chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.354%`, +10 flat `0.439%`, +10% spell `10.0%`, high-base share `0.887`, mod-range share `0.091`
- Top spell evidence: Morph, Arcane Torrent, Elemental Drain, Manifestation
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Huppermage agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.361%`, +10 flat `0.43%`, +10% spell `10.0%`, high-base share `0.893`, mod-range share `0.146`
- Top spell evidence: Morph, Arcane Torrent, Elemental Drain, Manifestation
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Iop strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `high`
- Sensitivity: +100 primary `6.519%`, +10 flat `1.525%`, +10% spell `10.0%`, high-base share `0.605`, mod-range share `0.0`
- Top spell evidence: Concentration, Accumulation, Sword of Iop, Pressure
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Iop intelligence

- Primary stat: `Intelligence`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.438%`, +10 flat `0.331%`, +10% spell `10.0%`, high-base share `0.899`, mod-range share `0.191`
- Top spell evidence: Tumult, Strengthstorm, Sentence, Destructive Sword
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Iop chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.418%`, +10 flat `1.657%`, +10% spell `10.0%`, high-base share `0.488`, mod-range share `0.0`
- Top spell evidence: Endurance, Outpouring, Threat, Fervour
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Iop agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.194%`, +10 flat `1.948%`, +10% spell `10.0%`, high-base share `0.229`, mod-range share `0.159`
- Top spell evidence: Celestial Sword, Divine Sword, Destructive Ring, Fracture
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Masqueraider strength

- Primary stat: `Strength`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.471%`, +10 flat `1.587%`, +10% spell `10.0%`, high-base share `0.515`, mod-range share `0.242`
- Top spell evidence: Furia, Carnavalo, Catalepsy, Martelo
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Masqueraider intelligence

- Primary stat: `Intelligence`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.364%`, +10 flat `1.726%`, +10% spell `10.0%`, high-base share `0.326`, mod-range share `0.322`
- Top spell evidence: Inferno, Apostasy, Decoy, Brincaderia
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Masqueraider chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.237%`, +10 flat `1.892%`, +10% spell `10.0%`, high-base share `0.13`, mod-range share `0.0`
- Top spell evidence: Boliche, Bocciara, Ponteira, Carnavalo
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Masqueraider agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.429%`, +10 flat `1.642%`, +10% spell `10.0%`, high-base share `0.312`, mod-range share `0.172`
- Top spell evidence: Cavalcade, Retention, Picada, Capering
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Osamodas strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.131%`, +10 flat `2.029%`, +10% spell `10.0%`, high-base share `0.359`, mod-range share `0.0`
- Top spell evidence: Sedimentation, Woolly Sledgehammer, Constriction, Crackler Punch
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Osamodas intelligence

- Primary stat: `Intelligence`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `5.966%`, +10 flat `2.245%`, +10% spell `10.0%`, high-base share `0.166`, mod-range share `0.495`
- Top spell evidence: Sparkmeleon, Dragon's Breath, Cross Scale, Dragonic
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Osamodas chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.045%`, +10 flat `2.142%`, +10% spell `10.0%`, high-base share `0.159`, mod-range share `0.0`
- Top spell evidence: Aquatic Wave, Geyser, Batra, Whirlwind
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Osamodas agility

- Primary stat: `Agility`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `5.808%`, +10 flat `2.45%`, +10% spell `10.0%`, high-base share `0.088`, mod-range share `0.548`
- Top spell evidence: Canine, Gambol, Plucking, Repulsive Fang
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Ouginak strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.306%`, +10 flat `1.802%`, +10% spell `10.0%`, high-base share `0.625`, mod-range share `0.0`
- Top spell evidence: Mastiff, Humerus, Watchdog, Amarok
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Ouginak intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.629%`, +10 flat `1.382%`, +10% spell `10.0%`, high-base share `0.449`, mod-range share `0.0`
- Top spell evidence: Hunt, Woof, Tally Ho, Tracking
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Ouginak chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `5.979%`, +10 flat `2.227%`, +10% spell `10.0%`, high-base share `0.162`, mod-range share `0.0`
- Top spell evidence: Ulna, Radius, Calcaneus, Marrow Bone
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Ouginak agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.479%`, +10 flat `0.278%`, +10% spell `10.0%`, high-base share `0.714`, mod-range share `0.0`
- Top spell evidence: Stripping, Muzzle, Carrion, Bloodhound
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Pandawa strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.735%`, +10 flat `1.245%`, +10% spell `10.0%`, high-base share `0.518`, mod-range share `0.0`
- Top spell evidence: Pandatak, Filthipint, Debauchery, Hangover
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Pandawa intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.301%`, +10 flat `1.809%`, +10% spell `10.0%`, high-base share `0.315`, mod-range share `0.0`
- Top spell evidence: Pandilongation, Absinthe, Explosive Flask, Explosive Palm
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Pandawa chance

- Primary stat: `Chance`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.694%`, +10 flat `1.298%`, +10% spell `10.0%`, high-base share `0.464`, mod-range share `0.312`
- Top spell evidence: Melancholy, Brandy, Tipple, Alcoshu
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Pandawa agility

- Primary stat: `Agility`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.452%`, +10 flat `1.613%`, +10% spell `10.0%`, high-base share `0.801`, mod-range share `0.406`
- Top spell evidence: Liqueur, Nausea, Propulsion, Alcoholic Breath
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Rogue strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.491%`, +10 flat `0.261%`, +10% spell `10.0%`, high-base share `0.785`, mod-range share `0.045`
- Top spell evidence: Obliteration, Musket, Arquebus, Bombard
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Rogue intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.294%`, +10 flat `1.817%`, +10% spell `10.0%`, high-base share `0.502`, mod-range share `0.609`
- Top spell evidence: Extraction, Shot Pellets, Weigh Down, Pulsar
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Rogue chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.006%`, +10 flat `2.192%`, +10% spell `10.0%`, high-base share `0.345`, mod-range share `0.118`
- Top spell evidence: Stolen Goods, Shrapnel, Blunderbuss, Deception
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Rogue agility

- Primary stat: `Agility`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.087%`, +10 flat `2.087%`, +10% spell `10.0%`, high-base share `0.272`, mod-range share `0.668`
- Top spell evidence: Cadence, Machine Gun, Boomerang Daggers, Carbine
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Sacrier strength

- Primary stat: `Strength`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.473%`, +10 flat `0.285%`, +10% spell `10.0%`, high-base share `0.819`, mod-range share `0.0`
- Top spell evidence: Decimation, Gash, Torture, Ravages
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Sacrier intelligence

- Primary stat: `Intelligence`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.438%`, +10 flat `0.331%`, +10% spell `10.0%`, high-base share `0.756`, mod-range share `0.0`
- Top spell evidence: Excruciating Pain, Hostility, Absorption, Immolation
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Sacrier chance

- Primary stat: `Chance`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.448%`, +10 flat `0.318%`, +10% spell `10.0%`, high-base share `0.763`, mod-range share `0.0`
- Top spell evidence: Nervousness, Stase, Clobbering, Projection
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Sacrier agility

- Primary stat: `Agility`
- Range usefulness: `nearly useless`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.493%`, +10 flat `0.26%`, +10% spell `10.0%`, high-base share `0.834`, mod-range share `0.0`
- Top spell evidence: Fury, Hemorrhage, Assault, Carnage
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useless-check`: level 200, tier 3, allow, 12/6/0, presets 2,3 - guard against forcing or over-scoring +Range for profiles where spells do not use it

### Sadida strength

- Primary stat: `Strength`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.472%`, +10 flat `0.286%`, +10% spell `10.0%`, high-base share `0.786`, mod-range share `0.273`
- Top spell evidence: Force of Nature, Bramble, Aggressive Bramble, Poisoned Undergrowth
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Sadida intelligence

- Primary stat: `Intelligence`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.077%`, +10 flat `2.1%`, +10% spell `10.0%`, high-base share `0.155`, mod-range share `0.572`
- Top spell evidence: Plaguing Bramble, Bush Fire, Prickly Embers, Voodoo Curse
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Sadida chance

- Primary stat: `Chance`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.713%`, +10 flat `1.273%`, +10% spell `10.0%`, high-base share `0.747`, mod-range share `0.453`
- Top spell evidence: Bane, Mangrove, Dolly Sacrifice, Bush Fire
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Sadida agility

- Primary stat: `Agility`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `6.487%`, +10 flat `1.567%`, +10% spell `10.0%`, high-base share `0.533`, mod-range share `0.507`
- Top spell evidence: Inoculation, Paralysing Bramble, Contagion, Shake
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Sram strength

- Primary stat: `Strength`
- Range usefulness: `vital`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.651%`, +10 flat `0.053%`, +10% spell `10.0%`, high-base share `0.959`, mod-range share `0.762`
- Top spell evidence: Malevolent Trap, Pitfall, Lethal Attack, Lethal Trap
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-vital-stress`: level 200, tier 4, opti, 12/6/6, presets 2,3 - +Range-heavy stress because spell profile depends strongly on modifiable range

### Sram intelligence

- Primary stat: `Intelligence`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.185%`, +10 flat `0.66%`, +10% spell `10.0%`, high-base share `0.579`, mod-range share `0.215`
- Top spell evidence: Plotter, Fragmentation Trap, Deviousness, Cut-Throat
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Sram chance

- Primary stat: `Chance`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.194%`, +10 flat `0.647%`, +10% spell `10.0%`, high-base share `0.62`, mod-range share `0.419`
- Top spell evidence: Plotter, Waylaying, Miry Trap, Raiding
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Sram agility

- Primary stat: `Agility`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.27%`, +10 flat `0.55%`, +10% spell `10.0%`, high-base share `0.624`, mod-range share `0.407`
- Top spell evidence: Toxines, Plotter, Con, Epidemic
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Xelor strength

- Primary stat: `Strength`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.351%`, +10 flat `0.444%`, +10% spell `10.0%`, high-base share `0.616`, mod-range share `0.188`
- Top spell evidence: Knell, Dark Ray, Shadowy Beam, Souvenir
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Xelor intelligence

- Primary stat: `Intelligence`
- Range usefulness: `useful`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.388%`, +10 flat `0.395%`, +10% spell `10.0%`, high-base share `0.663`, mod-range share `0.408`
- Top spell evidence: Knell, Temporal Dust, Temporal Suspension, Xelor's Sandglass
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-useful-stress`: level 200, tier 3, allow, 11/6/5, presets 2,3 - +Range tradeoff row; range should matter but not dominate damage/survivability

### Xelor chance

- Primary stat: `Chance`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.384%`, +10 flat `0.4%`, +10% spell `10.0%`, high-base share `0.705`, mod-range share `0.224`
- Top spell evidence: Knell, Time Theft, Clock, Petrification
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

### Xelor agility

- Primary stat: `Agility`
- Range usefulness: `marginal`
- Damage profile confidence: `medium`
- Sensitivity: +100 primary `7.365%`, +10 flat `0.426%`, +10% spell `10.0%`, high-base share `0.943`, mod-range share `0.248`
- Top spell evidence: Knell, Drying Up, Shrivelling, Pendulum
- Corner queries:
  - `opti-baseline`: level 200, tier 4, opti, 12/6/Any, presets 1,2,3,4 - primary level-200 all-class quality row across the four damage/survivability presets
  - `budget-baseline`: level 200, tier 1, none, 11/6/Any, presets 2,3 - budget accessibility row; should allow cumulative prior-tier items and trophies
  - `low-action-validity-edge`: level 200, tier 2, allow, 7/3/Any, presets 2 - validity edge only; level-200 player-realism warning expected below 10/5
  - `range-marginal-check`: level 200, tier 3, allow, 11/6/3, presets 2 - guard against overvaluing +Range for profiles where it is only situational

