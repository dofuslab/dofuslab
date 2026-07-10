# Build Discovery Prod Level Targets, Iop

This is the first bounded readonly aggregate sample from prod for choosing Iop
level-diversity targets. It uses recent `custom_set` rows only and emits no set
IDs, owner data, names, or URLs.

- Source artifact: `.codex/state/build-discovery-prod-level-targets-iop.json`
- Helper: `python -m oneoff.build_discovery_prod_level_target_discovery`
- Parameters: `sampleLimit=300`, `topTargets=8`, `className=Iop`,
  `bucketSize=20`, `statementTimeoutMs=10000`
- Result count: 300 aggregate input rows

The sample is intentionally small to avoid prod load. A `sampleLimit=2500` run
reached prod but exceeded the 10s statement timeout, so use `300` as the safe
default and only increase it deliberately.

## Bucket Summary

- `1-20`: representative `1`, `n=1`, top `6/3/0`.
- `21-40`: representative `40`, `n=2`, top `6/3/0`, `7/3/0`.
- `41-60`: representative `60`, `n=10`, top `7/3/1`, `10/4/2`,
  `10/4/3`, `9/3/2`.
- `61-80`: representative `80`, `n=5`, top `9/4/1`, `10/5/1`,
  `9/5/2`, `7/3/0`.
- `81-100`: representative `95`, `n=4`, top `10/4/1`, `12/5/0`,
  `9/4/3`.
- `101-120`: representative `120`, `n=6`, top `11/4/1`, `11/5/1`,
  `11/5/0`, `11/6/1`.
- `121-140`: representative `130`, `n=2`, top `12/5/1`, `11/4/2`.
- `141-160`: representative `160`, `n=13`, top `12/5/2`, `12/5/3`,
  `9/4/2`, `10/4/0`.
- `161-180`: representative `165`, `n=6`, top `12/5/4`, `10/5/4`,
  `12/5/5`, `12/5/1`.
- `181-200`: representative `200`, `n=251`, top `7/3/0`, `12/6/5`,
  `12/6/3`, `12/5/6`.

## Recommended Sample Targets

Treat these as generation/review targets, not as final truth. The low `7/3/0`
level-200 shape is likely incomplete or low-effort saved sets and should not be
used as a benchmark target.

- Level `50`: `7/3/1`, `7/4/0`, `7/5/1`.
- Level `60`: `10/4/2`, `10/4/3`, `9/3/2`, `9/3/0`.
- Level `80`: `10/5/1`, `9/5/2`.
- Level `100`: `12/5/0`.
- Level `120`: `11/5/1`, `12/5/1`, `11/4/1`.
- Level `150`: `9/4/2`, `12/5/2`, `12/4/2`, `11/5/2`.
- Level `160`: `12/5/3`, `12/5/2`, `11/6/-2`, `12/6/3`.
- Level `180`: `12/5/3`.
- Level `199`: `12/6/2`, `12/5/2`, `10/6/3`, `10/5/2`, `12/6/5`.
- Level `200`: keep accepted milestone-1 calibration rows and filter below
  `10/5`; useful prod shapes cluster around `12/5` and `12/6` with varying
  Range.
