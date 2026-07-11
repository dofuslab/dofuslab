# Build Discovery CP-SAT Coverage

Target set: `milestone2-level200`
Generated CP-SAT targets: `1632` / `3072`
Coverage: `53.12%`
Examined split reports: `1814`
Excluded split reports: `29`
Duplicate targets: `96` (`153` surplus reports)

## Review Assumptions

- Target grid: `Iop` `PvM`, level `200`, elements `strength, intelligence, chance, agility`, budget tiers `1, 2, 3, 4`, AP `7-12`, MP `3-6`, Range `none, 0, 1, 2, 3, 4, 5, 6`.
- Target count formula: `4 elements * 4 budget tiers * 6 AP targets * 4 MP targets * 8 range targets`.
- Budget tier 1: baseline items, trophies, mounts.
- Budget tier 2: tier 1 plus accessible Dofus, pets, and petsmounts.
- Budget tier 3: tier 2 plus other Dofus and prysmaradites; generated exos may be used.
- Budget tier 4: tier 3 plus opti-only Dofus and buffed/opti items.
- Exos: effective exo policy is none for tiers `1/2`; exo policy is allow for tiers `3/4`; at most one missing AP, MP, or Range exo per stat is applied by the current generator.
- Range: `none` means unconstrained lower bound; not equivalent to 0; numeric range means minimum requested Range, capped at 6.
- Coverage counting: generated CP-SAT split report, current target id, no budget fallback, strict current-code build validation passes.
- Duplicate evidence: presence coverage picks OPTIMAL over FEASIBLE, then lower elapsedMs.
- Exclusions: outside-target, invalid, non-CP-SAT, non-generated, unreadable, or strict-validation-failed reports do not count.

## Element

| Value | Count |
|---|---:|
| agility | 404 |
| chance | 412 |
| intelligence | 404 |
| strength | 412 |

## Budget Tier

| Value | Count |
|---|---:|
| 1 | 392 |
| 2 | 424 |
| 3 | 424 |
| 4 | 392 |

## AP

| Value | Count |
|---|---:|
| 7 | 264 |
| 8 | 256 |
| 9 | 288 |
| 10 | 264 |
| 11 | 288 |
| 12 | 272 |

## MP

| Value | Count |
|---|---:|
| 3 | 432 |
| 4 | 384 |
| 5 | 408 |
| 6 | 408 |

## Range

| Value | Count |
|---|---:|
| 0 | 208 |
| 1 | 192 |
| 2 | 216 |
| 3 | 208 |
| 4 | 184 |
| 5 | 200 |
| 6 | 216 |
| none | 208 |

## Solver Status

| Value | Count |
|---|---:|
| FEASIBLE | 941 |
| OPTIMAL | 691 |

## Excluded Split Reports

| Reason | Count |
|---|---:|
| outside_target_set | 29 |
