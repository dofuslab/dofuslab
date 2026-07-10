# Build Discovery Cap 3 Diagnostic Plan

This plan continues diagnostics for
`.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json`.

## Current Matrix Summary

- Target set: `grid-next-cap-3`
- Targets: 12
- Generated: 8
- No build: 4
- Invalid: 0

## No-Build Classification

Use these labels when reporting cap-3 no-build rows:

- `item-stat-only below target`: the optimistic independent slot upper bound is
  below the target, but set bonuses are not included, so this is not full
  infeasibility proof.
- `solver gap`: a bounded witness or other diagnostic finds an AP/MP/Range
  skeleton that should be searchable by the solver.
- `bounded witness miss`: witness search ran, did not find a witness, and the
  state cap/time limit must be reported with the result.
- `set-bonus-aware infeasible`: only use this after a diagnostic includes set
  bonuses and proves the target cannot be reached.

Do not collapse any of these labels into plain `infeasible`.

## Current Fast Diagnostic Result

Artifact:
`.codex/state/build-discovery-ap-mp-range-grid-next-cap-3-diagnostics.md`

- Level 1 Intelligence tier 3 `12/6/6`: `item-stat-only below target`
  with upper bound `7/4/1`.
- Level 20 Chance tier 3 `12/6/6`: `item-stat-only below target`
  with upper bound `10/6/4`.
- Level 80 Strength tier 2 `12/6/6`: `not_proven_infeasible`
  with upper bound `13/8/26`.
- Level 200 Strength tier 2 `12/6/6`: `not_proven_infeasible`
  with upper bound `21/20/30`.

The fast diagnostic did not run witness search. Its
`Action-stat witnesses found: 0` means no witness search evidence exists in
that artifact, not that no witnesses exist.

## Next Witness Commands

Run inside the Docker server container when Docker is healthy.

```powershell
docker cp .codex\state\build-discovery-ap-mp-range-grid-next-cap-3-matrix.json dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json

docker exec dofuslab-server-1 sh -lc 'cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json --targets grid_next_cap3_level_80_strength_12_6_6_budget2 --witness-search --witness-max-states-per-slot 2000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.md'

docker exec dofuslab-server-1 sh -lc 'cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json --targets grid_next_cap3_level_200_strength_12_6_6_budget2 --witness-search --witness-max-states-per-slot 2000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.md'
```

Copy results back only after each command succeeds:

```powershell
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.json .codex\state\build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.json
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.md .codex\state\build-discovery-ap-mp-range-grid-next-cap-3-level80-witness-2k-diagnostics.md
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.json .codex\state\build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.json
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.md .codex\state\build-discovery-ap-mp-range-grid-next-cap-3-level200-witness-2k-diagnostics.md
```

## Observed Run Notes

- A level 80 witness search with the default `20000` state cap did not finish
  within a 10-minute command timeout.
- Docker Desktop later returned an engine API internal server error before the
  smaller `2000` state-cap commands could be run.
- The diagnostic CLI now fails when filters match zero matrix rows, so missing
  target artifacts should no longer be silently confused with successful empty
  diagnostics.
