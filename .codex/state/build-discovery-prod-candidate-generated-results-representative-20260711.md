# Representative Prod Candidate Generation - 2026-07-11

Purpose: run CP-SAT against supported aggregate prod-shaped benchmark targets discovered from recent complete level-200 production builds.

## Summary

- Source discovery artifacts: six class-specific complete-build prod slices.
- Solver: `oneoff.build_discovery_cpsat_experiment`, `objectiveMode=final-linear`.
- Query preset: `damageSurvivabilityPreset=2`, `budgetTier=4`, `exoPolicy=opti`.
- Candidate limit: 4 per class slice.
- Time limit: 5s per candidate.
- Generated candidates: 11.
- Skipped candidates: 1, Enutrof Chance `12/6/7`, because explicit hard Range targets are capped at 6.
- All generated candidates returned one feasible build.
- Max observed `totalSearchMs`: 3696.5ms.

This is evidence that the current query path can produce builds for representative prod-shaped class/element/AP/MP/Range requests. It is not quality acceptance: several generated builds still look optimization-light or odd, especially where the class spell profile is unreviewed.

## Generated Rows

| Prod-shaped target | Result | Search ms | Important generated totals | First generated items |
| --- | --- | ---: | --- | --- |
| Cra Intelligence `12/6/6` | FEASIBLE | 2565.7 | 12 AP, 6 MP, 6 Range, 1102 Vit, 708 Int | Khardboard Celestial Brooch; Henual's Belt; Odourless Boots; Little Red Waddling Cape; Ochre Dofus; Prynyang |
| Cra Strength `12/6/6` | FEASIBLE | 2672.1 | 12 AP, 6 MP, 6 Range, 1152 Vit, 848 Str | Jahn Locket; Khardboard Moowolf Belt; Benj Boots; Fuji Snowfoux Cloak; Ochre Dofus; Jackanapes |
| Enutrof Chance `12/6/6` | FEASIBLE | 2619.9 | 12 AP, 6 MP, 6 Range, 1202 Vit, 658 Cha | Powa Drhell Amulet; Khardboard Moowolf Belt; Micrab Slippers; Cape Tivate; Cawwot Dofus; Ochre Dofus |
| Enutrof Chance `12/6/5` | FEASIBLE | 2727.8 | 12 AP, 6 MP, 6 Range, 2773 Vit, 598 Cha | Missix Amulet; Father Whupper Belt; Father Whupper Boots; Celestial Swashbuckler Cloak; Emerald Dofus; Ochre Dofus |
| Enutrof Chance `12/5/6` | FEASIBLE | 3443.3 | 12 AP, 5 MP, 6 Range, 1402 Vit, 738 Cha | Khardboard Celestial Brooch; KOs' Belt; KOs' Boots; Cape Tivate; Ochre Dofus; Pryssure-O-Mat |
| Feca Chance `12/6/5` | FEASIBLE | 2598.6 | 12 AP, 6 MP, 5 Range, 1302 Vit, 498 Cha | Khardboard Celestial Brooch; Sylargh's Strap; Boots of the Salvatory Spirit; Sylargh's Cloak; Ochre Dofus; Pryssure-O-Mat |
| Feca Strength `12/6/6` | FEASIBLE | 2734.0 | 12 AP, 6 MP, 6 Range, 1703 Vit, 988 Str | Guten Tak's Amulet; Khardboard Moowolf Belt; Meriana's Clairvoyance; Cape Tivate; Ochre Dofus; Sylvan Dofus |
| Feca Chance `12/6/6` | FEASIBLE | 2685.8 | 12 AP, 6 MP, 6 Range, 3423 Vit, 868 Cha | Khardboard Celestial Brooch; Khardboard Moowolf Belt; Boots of the Salvatory Spirit; Anerice Cloak; Aiwuztheya Dofus; Emerald Dofus |
| Iop Agility `12/5/6` | FEASIBLE | 3696.5 | 12 AP, 5 MP, 6 Range, 2853 Vit, 1108 Agi | Khardboard Celestial Brooch; Belteen; Baleenaboots; Mopy King Sovereign Cape; Emerald Dofus; Sylvan Dofus |
| Sacrier Agility `12/5/Any` from prod `12/5/-2` | FEASIBLE | 3220.3 | 12 AP, 5 MP, 2 Range, 1272 Vit, 608 Agi | Boy's Own Chain; Sawya Sash; Benj Boots; Fuji Snowfoux Cloak; Aiwuztheya Dofus; Cawwot Dofus |
| Sacrier Agility `12/5/2` | FEASIBLE | 3557.4 | 12 AP, 5 MP, 4 Range, 2683 Vit, 1238 Agi | Khardboard Celestial Brooch; Belteen; Tritun Palms; Mopy King Sovereign Cape; Dolmanax; Emerald Dofus |

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
