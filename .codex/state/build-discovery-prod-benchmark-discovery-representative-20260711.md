# Representative Prod Benchmark Discovery - 2026-07-11

Purpose: ground the pre-optimization complete-query audit in recent production build shapes without exposing custom set IDs, names, owners, or singleton build details.

## Safety

- Source: readonly prod database via `DOFUSLAB_READONLY_DATABASE_URL`.
- Runtime: `dofuslab-server-1` Docker server container.
- Query mode: aggregate-only; artifact rows omit custom set IDs, custom set names, and owner identifiers.
- Bounds: class-specific slices, `sampleLimit=40`, `topItems=6`, `statementTimeoutMs=5000`.
- Completeness filter: only custom sets with at least 16 distinct equipped slots are sampled.
- The broad all-class aggregate query timed out under the 5s statement timeout, so benchmark discovery now uses bounded per-class slices.

## Representative Slices

| Class | Sample rows | Profiles surfaced | Supported profiles | Notes |
| --- | ---: | ---: | ---: | --- |
| Iop | 40 | 1 | 1 | Recent complete Iop sample clustered weakly; only Agility `12/5/6` met the 3-build profile threshold. |
| Cra | 40 | 2 | 2 | Recent complete builds strongly support high-range `12/6/6` Cra profiles. |
| Enutrof | 40 | 4 | 3 | Common Chance profiles include `12/6/6`, `12/6/5`, and `12/5/6`; `12/6/7` exceeds the current explicit Range cap. |
| Sacrier | 40 | 2 | 2 | Common Agility `12/5/-2` profile is mapped to `rangeTarget=None`, matching the omitted/soft Range query semantics. |
| Feca | 40 | 3 | 3 | Chance and Strength high-AP/MP profiles are covered by the current query envelope. |
| Xelor | 40 | 0 | 0 | No profile reached the 3-build threshold in this bounded complete-build slice. |

## Interesting Prod Shapes

- Cra Intelligence `12/6/6`, 9 samples: common items include Ice Dofus, Turquoise Dofus, Ochre Dofus, Cloudy Dofus.
- Cra Strength `12/6/6`, 3 samples: common items include Ochre Dofus, Vulbis Dofus, Turquoise Dofus, Ice Dofus.
- Enutrof Chance `12/6/6`, 8 samples: common items include Ochre Dofus, Major Shackler, Vulbis Dofus, Ice Dofus.
- Enutrof Chance `12/6/5`, 8 samples: common items include Crimson Dofus, Spryritual, Ice Knight's Frozen Gauntlet, Ice Knight's Frigid Pavise.
- Feca Chance `12/6/5`, 4 samples: common items include Crimson Dofus, Ice Dofus, Turquoise Dofus, Ochre Dofus.
- Feca Strength `12/6/6`, 3 samples: common items include Turquoise Dofus, Crimson Dofus, Ochre Dofus, Sylvan Dofus.
- Sacrier Agility `12/5/-2`, 10 samples: mapped to `rangeTarget=None` because negative prod Range means this should benchmark “any Range is OK,” not a hard negative target.

## Complete-Query Implications

- The current all-class CP-SAT query envelope covers the common positive-range level-200 prod shapes surfaced here: `12/6/6`, `12/6/5`, `12/5/6`, and `12/5/2`.
- Prod confirms that high-range archetypes matter outside Iop, especially Cra and Enutrof.
- Prod also confirms that hard explicit Range is not enough: negative-range melee-ish builds exist and are now mapped to omitted Range, where Range is only a soft tradeoff.
- Sparse or fragmented class slices, like Xelor in this sample, need broader or different benchmark discovery before becoming quality gates.

## Artifacts

- `.codex/state/build-discovery-prod-benchmark-discovery-iop-20260711.json`
- `.codex/state/build-discovery-prod-benchmark-discovery-cra-20260711.json`
- `.codex/state/build-discovery-prod-benchmark-discovery-enutrof-20260711.json`
- `.codex/state/build-discovery-prod-benchmark-discovery-sacrier-20260711.json`
- `.codex/state/build-discovery-prod-benchmark-discovery-feca-20260711.json`
- `.codex/state/build-discovery-prod-benchmark-discovery-xelor-20260711.json`
