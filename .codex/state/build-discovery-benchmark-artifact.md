# Build Discovery Benchmark Artifact

Last updated: 2026-07-09

This is the compact accepted output from the current local Docker benchmark report.
It records the human-reference scoring baseline without committing the full live
DofusLab view payloads.

## Command

Run inside the server container after the generated local DB index exists:

```bash
python -m oneoff.build_discovery_benchmark_report \
  --allow-errors \
  --output /tmp/build_discovery_benchmark_report_current.json
```

## Environment

- Runtime: `dofuslab-server-1`
- Working directory: `/home/dofuslab`
- Local migration head: `395c1a10243a`
- Report version: current `oneoff.build_discovery_benchmark_report.REPORT_VERSION`
- Source URLs: public DofusLab view URLs listed in the benchmark catalog

## Summary

- Benchmarks: 5
- Errors: 0
- Generated comparison: not compared in this artifact
- Scoring base: `normalizedPrototypeBase`

| Benchmark | Label | Target AP | Target MP | Target Range | Score | Result AP | Result MP | Result Range |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `saone_budget_11_6_strength_iop` | Saone budget 11/6 Strength Iop | 11 | 6 | 0 | 2015.98 | 11 | 6 | 2 |
| `strong_11_6_strength_iop` | Strong 11/6 Strength Iop reference | 11 | 6 | 0 | 2338.25 | 12 | 6 | 6 |
| `strong_12_ap_high_damage_strength_iop` | Strong 12 AP / high-damage Strength Iop reference | 12 | 6 | 0 | 2248.87 | 12 | 6 | 3 |
| `strong_12_ap_strength_iop` | Strong 12 AP Strength Iop reference | 12 | 6 | 0 | 2369.07 | 12 | 6 | 2 |
| `additional_working_strength_iop` | Additional working Strength Iop reference | 12 | 6 | 0 | 2086.25 | 12 | 6 | 2 |

## Interpretation

The current human-reference benchmark scorer should treat AP, MP, and Range as
minimum targets subject to the solver's hard caps, not as exact equip caps.
Several accepted references have surplus AP or Range; rejecting those builds
would make the benchmark catalog unusable and would contradict the current
product assumption that surplus action stats are useful but should not dominate
ranking.

This artifact is evidence that the scorer can ingest the current five Strength
Iop references. It is not yet the final regression fixture because it does not
include generated build outputs for side-by-side comparison.
