# Prod Iop AP/MP/Range Target Sample

Source: `.codex/state/build-discovery-prod-level-targets-iop-sample100.json`

Bounded read-only aggregate query against recent prod `custom_set` rows.

Rows: `100`
Sample limit: `100`
Statement timeout: `5000 ms`

## Caveats

- AP includes level baseline AP, equipped item AP, exos, and exact active set bonus AP.
- MP includes base 3 MP, equipped item MP, exos, and exact active set bonus MP.
- Range includes equipped item Range, exos, and exact active set bonus Range.
- Rows are recent custom_set records, not popularity-weighted usage.
- Report output is aggregate-only and intentionally omits custom set IDs, names, and owners.
- Recent rows are not necessarily good builds or complete builds.
- The level 181-200 bucket includes many `7/3/0` rows, which likely represent incomplete/default custom sets and should not become benchmark targets without filtering.

## Bucket Targets

| Bucket | Representative level | Samples | Top AP/MP/Range counts |
|---|---:|---:|---|
| 81-100 | 83 | 1 | 10/4/2 (1) |
| 101-120 | 120 | 4 | 11/5/1 (1), 11/5/0 (1), 11/6/1 (1), 12/5/1 (1) |
| 141-160 | 160 | 6 | 12/5/2 (3), 9/4/2 (1), 10/4/0 (1), 12/5/3 (1) |
| 161-180 | 170 | 3 | 12/5/4 (1), 10/5/4 (1), 12/5/5 (1) |
| 181-200 | 200 | 86 | 7/3/0 (15), 12/6/5 (5), 12/6/3 (5), 12/6/4 (5), 12/5/6 (5) |

## Initial Interpretation

- Mid-level real saved Iop rows cluster around 10/4, 11/5, 11/6, and 12/5 rather than always 12/6/6.
- Level 200 real saved Iop rows commonly include 12/6 with range 3-5 and 12/5/6 in this small sample.
- Full milestone coverage still requires valid target support across the whole AP/MP/Range domain; prod data should guide benchmark prioritization, not narrow the API scope.
