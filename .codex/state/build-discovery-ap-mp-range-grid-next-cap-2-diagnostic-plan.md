# Build Discovery Cap 2 Diagnostic Plan

Created: 2026-07-10

This plan records the next diagnostic checkpoint for
`.codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json`.

## Why This Exists

The full cap-2 witness diagnostic was attempted as a single five-row batch:

```bash
python scripts/build_discovery_action_stat_diagnostics.py \
  /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json \
  --statuses no_build \
  --witness-search \
  --witness-max-states-per-slot 20000 \
  --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json \
  --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md
```

It hit the 30-minute command timeout. Immediately afterward Docker Desktop
started returning engine API errors for `docker version` and `docker ps`, so no
new diagnostic artifact was committed.

## Docker Recovery Check

Before running diagnostics again:

```powershell
docker version
docker ps --format "table {{.Names}}\t{{.Status}}"
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/test_build_discovery_action_stat_diagnostics.py"
```

## Fast Upper-Bound Pass

Run this first, without witness search. It should classify item-stat-only upper
bounds quickly for all cap-2 no-build rows:

```powershell
docker cp .codex\state\build-discovery-ap-mp-range-grid-next-cap-2-matrix.json dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --statuses no_build --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md"
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json .codex\state\build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.json
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md .codex\state\build-discovery-ap-mp-range-grid-next-cap-2-diagnostics.md
```

## Per-Row Witness Search

Preferred path: use split-output mode so each selected target writes its JSON
and Markdown artifact as soon as it completes. If a later row is slow or times
out, earlier row artifacts remain available to copy back and commit.

```powershell
docker exec dofuslab-server-1 sh -lc "rm -rf /tmp/build-discovery-ap-mp-range-grid-next-cap-2-split-witness && cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --statuses no_build --witness-search --witness-max-states-per-slot 20000 --split-output-dir /tmp/build-discovery-ap-mp-range-grid-next-cap-2-split-witness"
docker cp dofuslab-server-1:/tmp/build-discovery-ap-mp-range-grid-next-cap-2-split-witness .codex\state\build-discovery-ap-mp-range-grid-next-cap-2-split-witness
```

Fallback path: run witness search one target at a time. Commit any completed
rows as their own artifact checkpoint if later rows are slow.

```powershell
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --targets grid_next_cap2_level_1_intelligence_12_6_6_budget4 --witness-search --witness-max-states-per-slot 20000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level1-witness-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level1-witness-diagnostics.md"
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --targets grid_next_cap2_level_20_chance_12_6_6_budget4 --witness-search --witness-max-states-per-slot 20000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level20-witness-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level20-witness-diagnostics.md"
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --targets grid_next_cap2_level_50_agility_12_6_6_budget4 --witness-search --witness-max-states-per-slot 20000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level50-witness-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level50-witness-diagnostics.md"
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --targets grid_next_cap2_level_80_strength_12_6_6_budget3 --witness-search --witness-max-states-per-slot 20000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level80-witness-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level80-witness-diagnostics.md"
docker exec dofuslab-server-1 sh -lc "cd /home/dofuslab && python scripts/build_discovery_action_stat_diagnostics.py /tmp/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json --targets grid_next_cap2_level_99_intelligence_12_6_6_budget4 --witness-search --witness-max-states-per-slot 20000 --output-json /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level99-witness-diagnostics.json --output-md /tmp/build-discovery-ap-mp-range-grid-next-cap-2-level99-witness-diagnostics.md"
```

## Interpretation Rules

- `item_stat_upper_bound_below_target` is strong item-stat-only evidence, not
  full infeasibility proof.
- `not_proven_infeasible` means the row needs witness search, recall tuning, or
  stronger set-aware diagnostics.
- `action_stat_witness_found` means the solver should eventually be able to
  generate at least an action-stat-valid build, so treat the matrix no-build as
  a recall/search gap.
- `stateLimitHit=true` means bounded/inconclusive, not proof of no witness.
