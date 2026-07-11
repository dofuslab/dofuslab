# Build Discovery M3 Prod Target Plan

Generated: 2026-07-11

## Inputs

- Global recent-Iop aggregate:
  `.codex/state/build-discovery-prod-level-targets-100-20260711.json`
- Per-bucket recent-Iop aggregates:
  `.codex/state/build-discovery-prod-level-targets-by-bucket-20260711/`
- Solver smoke after level-aware base allocation and optional-slot fixes:
  `.codex/state/build-discovery-m3-prod-level-sample-optional-slots.json`

All prod reads were aggregate-only, read-only, omitted custom set IDs/names/users,
and used `statement_timeout=5000ms`.

## Prod Shape

The global 100-row recent sample is heavily level-200 skewed:

- `81-100`: `10/4/2` x1
- `101-120`: `11/5/1`, `11/5/0`, `11/6/1`, `12/5/1` x1 each
- `141-160`: `9/4/2`, `10/4/0`, `12/5/3` x1 each
- `161-180`: `12/5/4`, `10/5/4`, `12/5/5` x1 each
- `181-200`: mostly `7/3/0`, `12/6/1-5`, and `12/5/6`

The per-bucket samples give better all-level signal:

| Level bucket | Rows | Top shapes |
|---|---:|---|
| 1-20 | 25 | `6/3/0`, `7/3/0`, `6/3/1` |
| 21-40 | 25 | `7/3/0`, `6/3/0`, `5/5/0` |
| 41-60 | 25 | `7/3/1`, `6/3/0`, `7/5/1`, `7/4/1`, `8/4/1` |
| 61-80 | 25 | `10/5/1`, `9/5/0`, `9/4/1`, `9/5/2` |
| 81-100 | 25 | `7/3/0`, `10/5/1`, `10/4/1` |
| 101-120 | 25 | `7/3/0`, `12/5/1`, `11/5/0`, `11/4/1`, `11/6/0` |
| 121-140 | 25 | `12/5/1`, `11/5/4`, `12/6/1`, `11/6/2`, `11/6/1` |
| 141-160 | 25 | `12/5/2`, `10/4/0`, `12/5/3`, `12/4/2`, `12/5/1` |
| 161-180 | 25 | `12/5/1`, `12/5/0`, `12/6/2`, `11/5/3`, `11/6/2` |
| 181-200 | 25 | `7/3/0`, `12/6/1`, `11/6/5`, `12/6/5`, `11/3/6` |

## Normalization Rules

- Drop prod shapes below the valid AP floor: AP `6` below level 100, AP `7`
  from level 100 onward.
- Clamp/replace prod Range above `6` with a valid high-range row such as
  Range `6`; do not add Range `7` to the query contract.
- Keep negative prod Range as evidence that `Range=None` matters, not as a
  numeric target.
- Treat `7/3/0` at high levels as a prod artifact or incomplete set shape, not
  a quality benchmark for level 200.

## Current M3 Smoke

The existing `prod-level-sample` target set was rerun after fixing base
allocation and optional CP-SAT slot semantics:

- targets: `24`
- generated: `24`
- no build: `0`
- invalid: `0`
- solver statuses: `21` `OPTIMAL`, `3` `FEASIBLE`

The base-allocation bug is fixed: generated sub-200 rows now use level-legal
base points instead of spending the level-200 `992` point budget. The previous
five no-build rows now generate after allowing missing optional pet/Dofus slots
and low-level sparse gear choices.

## Next Targets

For the next M3 checkpoint, prefer a small target file rather than the full
existing `prod-level-sample` set:

- low-level minimums: `1/20/40` with `6/3/None` or `6/3/0`
- low-level prod AP bumps: `20/40/50` with `7/3/0`, `7/4/1`, `8/4/1`
- midgame transition: `60/80/100` with `10/5/1`, `10/4/1`, `12/5/0`
- post-100 trophy rows: `120/140` with `11/5/0`, `11/6/0`, `12/5/1`
- high-level rows: `160/180/200` with `12/5/2`, `12/6/2`, `12/6/6`

Focus next on broader M3 corner checks outside the current prod-level sample:
minimum targets, cap targets, and a small custom target file from the per-bucket
prod shapes above.
