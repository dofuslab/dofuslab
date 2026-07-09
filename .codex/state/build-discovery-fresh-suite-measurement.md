# Build Discovery Fresh Suite Measurement

Last updated: 2026-07-09

This records the latest local fresh-query measurement against the Docker DB generated index. It is evidence for the product decision to use async jobs for app-cache misses.

## Command

```powershell
docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.generate_build_discovery_index --output /tmp/build_discovery_index_current.json --source db
docker exec -w /home/dofuslab dofuslab-server-1 python -m oneoff.build_discovery_query_perf --index-path /tmp/build_discovery_index_current.json --validate-local-suite --runs 1 --no-cache --output /tmp/build_discovery_fresh_suite_report.json --fixture-output /tmp/build_discovery_fresh_suite_fixture.json
```

The validation command exits nonzero when any row exceeds the 5000ms p95 threshold. It still writes the report artifacts.

## Result

- Overall status: `fail`
- Threshold: `p95Ms <= 5000`
- Runs per row: `1`
- Index source: Docker local DB generated JSON index, 3753 items and 519 sets

## Row Timings

| Profile | Element | p95 ms | Result count | Failures |
| --- | ---: | ---: | ---: | --- |
| 11/6/0 | strength | 5752.9 | 3 | `p95_threshold_exceeded` |
| 11/6/0 | intelligence | 6171.0 | 3 | `p95_threshold_exceeded` |
| 11/6/0 | chance | 4488.6 | 1 | none |
| 11/6/0 | agility | 5121.6 | 2 | `p95_threshold_exceeded` |
| 12/6/0 | strength | 5189.1 | 2 | `p95_threshold_exceeded` |
| 12/6/0 | intelligence | 12558.5 | 3 | `p95_threshold_exceeded` |
| 12/6/0 | chance | 10082.9 | 1 | `p95_threshold_exceeded` |
| 12/6/0 | agility | 8871.7 | 2 | `p95_threshold_exceeded` |

## Interpretation

- Fresh synchronous query serving is not currently within the 5s p95 target for the supported Iop element matrix.
- App-cache misses should stay on the async job path.
- Result shape is still useful: every measured row returned at least one build.
- The next performance work should either reduce the slow rows substantially or focus on prewarming/cache strategy rather than pretending fresh sync is shippable.
