# Build Discovery Prod Level Target Discovery - Iop

Generated from bounded readonly prod aggregate queries.

Safety:

- Source: recent `custom_set` rows from readonly prod.
- Output is aggregate-only.
- Custom set IDs, owner IDs, set names, and singleton item lists are omitted.
- Larger `sampleLimit=500` query hit the 5s statement timeout and was canceled.
- Committed samples use `sampleLimit=50`, `topTargets=8`, `statementTimeoutMs=5000`.

Artifacts:

- `build-discovery-prod-level-target-discovery-iop-1-100.json`
- `build-discovery-prod-level-target-discovery-iop-101-180.json`
- `build-discovery-prod-level-target-discovery-iop.json`

## Iop Levels 1-100

Rows: `50`

| Bucket | Representative level | Sample count | Notable targets |
|---|---:|---:|---|
| 1-20 | 1 | 4 | 6/3/0, 7/3/0, 6/3/1, 7/4/1 |
| 21-40 | 40 | 2 | 6/3/0, 7/3/0 |
| 41-60 | 50 | 18 | 7/3/1, 6/3/0, 8/4/1, 10/4/2, 10/4/3 |
| 61-80 | 80 | 14 | 9/5/0, 9/4/1, 10/5/1, 9/5/2, 10/4/-1 |
| 81-100 | 100 | 12 | 10/4/1, 10/4/2, 12/5/0, 9/4/3, 11/5/3 |

## Iop Levels 101-180

Rows: `50`

| Bucket | Representative level | Sample count | Notable targets |
|---|---:|---:|---|
| 101-120 | 120 | 12 | 7/3/0, 11/5/0, 12/5/1, 11/4/1, 11/6/1 |
| 121-140 | 130 | 3 | 12/5/1, 11/4/2, 10/4/1 |
| 141-160 | 160 | 25 | 12/5/2, 10/4/0, 12/5/3, 12/4/2, 12/5/-1 |
| 161-180 | 165 | 10 | 12/5/1, 12/5/4, 10/5/4, 12/5/5, 12/6/2 |

## Recent Iop All Levels

Rows: `50`

This sample is dominated by level 200 rows: `48` of `50` rows are in bucket
181-200. It is useful for endgame target priors, but not sufficient by itself
for level-diversity planning.

| Bucket | Representative level | Sample count | Notable targets |
|---|---:|---:|---|
| 81-100 | 83 | 1 | 10/4/2 |
| 141-160 | 150 | 1 | 9/4/2 |
| 181-200 | 200 | 48 | 7/3/0, 12/6/3, 12/6/4, 12/5/6, 11/6/5 |

## Planning Notes

- Prod rows support using bracket-specific target samples instead of only
  synthetic min/cap targets.
- `rangeTarget=None` remains important because real saved builds can have
  negative Range totals.
- The samples are recent-row aggregates, not popularity-weighted usage.
- These targets are planning inputs; generated builds still need current-code
  solver artifacts and benchmark-quality review.

## Added Target Set

The code target set `prod-level-sample` now captures 24 reviewable regeneration
rows derived from these aggregate shapes:

- L1 Strength tier 1 6/3/any
- L20 Intelligence tier 1 7/4/1
- L40 Chance tier 1 7/3/any
- L50 Agility tier 1 7/3/1
- L50 Strength tier 2 8/4/1
- L60 Intelligence tier 2 10/4/2
- L80 Strength tier 2 9/5/any
- L80 Chance tier 2 10/5/1
- L80 Agility tier 2 10/4/any
- L100 Intelligence tier 2 10/4/1
- L100 Agility tier 3 12/5/0
- L120 Chance tier 2 11/5/any
- L120 Strength tier 3 12/5/1
- L130 Agility tier 3 12/5/1
- L150 Strength tier 1 9/4/2
- L160 Strength tier 3 12/5/2
- L160 Intelligence tier 3 12/5/any
- L160 Chance tier 2 10/4/0
- L165 Intelligence tier 3 12/6/2
- L180 Agility tier 4 12/5/5
- L200 Strength tier 4 12/6/3
- L200 Intelligence tier 4 12/6/4
- L200 Chance tier 4 12/5/6
- L200 Agility tier 4 11/6/5
