# Representative Prod Candidate Generation - 2026-07-11

Purpose: run CP-SAT against supported aggregate prod-shaped benchmark targets discovered from recent complete level-200 production builds.

## Summary

- Source discovery artifacts: six class-specific complete-build prod slices.
- Solver: `oneoff.build_discovery_cpsat_experiment`, `objectiveMode=final-linear`.
- Candidate limit: 4 per class slice.
- Time limit: 5s per candidate.
- Generated candidates: 11.
- Skipped candidates: 1, Enutrof Chance `12/6/7`, because explicit hard Range targets are capped at 6.
- All generated candidates returned one feasible build.
- Max observed `totalSearchMs`: 3587.0ms.

This is evidence that the current query path can produce builds for representative prod-shaped class/element/AP/MP/Range requests. It is not quality acceptance: several generated builds still look optimization-light or odd, especially where the class spell profile is unreviewed.

## Generated Rows

| Prod-shaped target | Result | Search ms | Important generated totals | First generated items |
| --- | --- | ---: | --- | --- |
| Cra Intelligence `12/6/6` | FEASIBLE | 2550.5 | 12 AP, 6 MP, 6 Range, 1703 Vit, 568 Int | Boy's Own Chain; Khardboard Moowolf Belt; Meno Boots; Cape of the Sharp Eye; Ochre Dofus; Sprynt |
| Cra Strength `12/6/6` | FEASIBLE | 2693.0 | 12 AP, 6 MP, 6 Range, 1252 Vit, 638 Str | Khardboard Celestial Brooch; Celestial Bearbarian Belt; Celestial Bearbarian Boots; Cape Tivate; Ochre Dofus; Sprynt |
| Enutrof Chance `12/6/6` | FEASIBLE | 2452.0 | 12 AP, 6 MP, 6 Range, 1552 Vit, 688 Cha | Boy's Own Chain; Khardboard Moowolf Belt; Lethaline's Boots; Pirate Bhey Sail; Cawwot Dofus; Sprynt |
| Enutrof Chance `12/6/5` | FEASIBLE | 2641.4 | 12 AP, 6 MP, 5 Range, 1653 Vit, 1048 Cha | Hel Munster's Amulet; Khardboard Moowolf Belt; Odourless Boots; Cape Tivate; Ochre Dofus; Vulbis Dofus |
| Enutrof Chance `12/5/6` | FEASIBLE | 3503.5 | 12 AP, 5 MP, 6 Range, 3373 Vit, 658 Cha | Treadfast Amulet; Treadfast Belt; Lethaline's Boots; Lethaline's Cloak; Aiwuztheya Dofus; Ochre Dofus |
| Feca Chance `12/6/5` | FEASIBLE | 2628.3 | 12 AP, 6 MP, 5 Range, 1653 Vit, 1048 Cha | Hel Munster's Amulet; Khardboard Moowolf Belt; Odourless Boots; Cape Tivate; Ochre Dofus; Vulbis Dofus |
| Feca Strength `12/6/6` | FEASIBLE | 2737.5 | 12 AP, 6 MP, 6 Range, 1552 Vit, 728 Str | Khardboard Celestial Brooch; Belt of the Salvatory Spirit; Boots of the Salvatory Spirit; Cape Tivate; Ochre Dofus; Sprynt |
| Feca Chance `12/6/6` | FEASIBLE | 2605.3 | 12 AP, 6 MP, 6 Range, 1552 Vit, 688 Cha | Boy's Own Chain; Khardboard Moowolf Belt; Lethaline's Boots; Pirate Bhey Sail; Cawwot Dofus; Sprynt |
| Iop Agility `12/5/6` | FEASIBLE | 3445.9 | 12 AP, 5 MP, 6 Range, 1853 Vit, 658 Agi | Khardboard Celestial Brooch; Orfan Belt; Lunar Boots; Cape Tivate; Cawwot Dofus; Ochre Dofus |
| Sacrier Agility `12/5/Any` from prod `12/5/-2` | FEASIBLE | 3144.4 | 12 AP, 5 MP, 3 Range, 1082 Vit, 668 Agi | Nevark's Amulet; Khardboard Moowolf Belt; Minotot Sandals; Nevark's Cape; Ochre Dofus; Major Goliath |
| Sacrier Agility `12/5/2` | FEASIBLE | 3587.0 | 12 AP, 6 MP, 6 Range, 2923 Vit, 758 Agi | Khardboard Celestial Brooch; Khardboard Moowolf Belt; Boots of the Salvatory Spirit; Whailtail; Aiwuztheya Dofus; Emerald Dofus |

## Interpretation

- Query completeness: pass for these sampled prod-shaped cases. CP-SAT generated builds for every supported candidate surfaced by the representative class slices.
- Range semantics: pass. Negative prod Range is converted to `rangeTarget=None`; generated Sacrier output is allowed to land at positive Range because omitted Range is a soft tradeoff.
- Performance as a smoke signal: pass for this small checkpoint. Observed search times stayed below 5s, though this is not a p95 perf claim.
- Quality: not accepted. Some outputs have low vitality or strange repeated packages. This is expected before optimization/scoring review for non-Iop classes and should not be interpreted as “best build” quality.

## Artifacts

- `.codex/state/build-discovery-prod-candidate-generated-results-iop-20260711.json`
- `.codex/state/build-discovery-prod-candidate-generated-results-cra-20260711.json`
- `.codex/state/build-discovery-prod-candidate-generated-results-enutrof-20260711.json`
- `.codex/state/build-discovery-prod-candidate-generated-results-sacrier-20260711.json`
- `.codex/state/build-discovery-prod-candidate-generated-results-feca-20260711.json`
- `.codex/state/build-discovery-prod-candidate-generated-results-xelor-20260711.json`
