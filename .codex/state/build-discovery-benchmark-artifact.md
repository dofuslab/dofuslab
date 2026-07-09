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

## Human-Reference Summary

- Benchmarks: 5
- Errors: 0
- Scoring base: `normalizedPrototypeBase`

| Benchmark | Label | Target AP | Target MP | Target Range | Score | Result AP | Result MP | Result Range |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `saone_budget_11_6_strength_iop` | Saone budget 11/6 Strength Iop | 11 | 6 | 0 | 2015.98 | 11 | 6 | 2 |
| `strong_11_6_strength_iop` | Strong 11/6 Strength Iop reference | 11 | 6 | 0 | 2338.25 | 12 | 6 | 6 |
| `strong_12_ap_high_damage_strength_iop` | Strong 12 AP / high-damage Strength Iop reference | 12 | 6 | 0 | 2248.87 | 12 | 6 | 3 |
| `strong_12_ap_strength_iop` | Strong 12 AP Strength Iop reference | 12 | 6 | 0 | 2369.07 | 12 | 6 | 2 |
| `additional_working_strength_iop` | Additional working Strength Iop reference | 12 | 6 | 0 | 2086.25 | 12 | 6 | 2 |

## Generated Comparison Summary

Generated results were produced with:

```bash
python scripts/build_discovery_benchmark_generated_results.py \
  --output /tmp/build_discovery_benchmark_generated_results.json
```

The comparison report was then produced with:

```bash
python -m oneoff.build_discovery_benchmark_report \
  --generated-results /tmp/build_discovery_benchmark_generated_results.json \
  --allow-errors \
  --output /tmp/build_discovery_benchmark_comparison_report.json
```

- Benchmarks: 5
- Errors: 0
- Generated query: Strength Iop, target-matched AP/MP/Range, budget tier 4, `exoPolicy=opti`
- Generated result count: 3 builds per target query
- Unique generated misses: 2 target queries; repeated benchmark target queries were process-cache hits

| Benchmark | Status | Generated Score | Benchmark Score | Delta |
| --- | --- | ---: | ---: | ---: |
| `saone_budget_11_6_strength_iop` | generated meets or beats benchmark | 2279.35 | 2015.98 | 263.37 |
| `strong_11_6_strength_iop` | benchmark scores higher | 2279.35 | 2338.25 | -58.90 |
| `strong_12_ap_high_damage_strength_iop` | generated meets or beats benchmark | 2320.43 | 2248.87 | 71.56 |
| `strong_12_ap_strength_iop` | benchmark scores higher | 2320.43 | 2369.07 | -48.64 |
| `additional_working_strength_iop` | generated meets or beats benchmark | 2320.43 | 2086.25 | 234.18 |

## Interpretation

The current human-reference benchmark scorer should treat AP, MP, and Range as
minimum targets subject to the solver's hard caps, not as exact equip caps.
Several accepted references have surplus AP or Range; rejecting those builds
would make the benchmark catalog unusable and would contradict the current
product assumption that surplus action stats are useful but should not dominate
ranking.

This artifact is evidence that the scorer can ingest the current five Strength
Iop references and compare them against target-matched generated outputs. It is
not yet a strict regression fixture because the generated-output JSON is still a
runtime artifact rather than a checked-in compact fixture with drift thresholds.
