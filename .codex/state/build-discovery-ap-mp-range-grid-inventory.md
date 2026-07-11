# Build Discovery AP/MP/Range Grid Inventory

This inventory enumerates valid Iop query-grid targets for representative levels, elements, and budgets.
It is not generated-build proof; it shows how much of the grid currently has generated artifact evidence.

Level scope: `selected_levels` (`12` levels)
Element count: `4`
Budget tier count: `4`
Valid query rows: `39424`
Generated evidence rows: `127`
Attempted evidence rows: `144`
No-build evidence rows: `17`
Unproven rows: `39297`
Unattempted rows: `39280`

| Level | Valid rows | Generated evidence | Unproven |
|---:|---:|---:|---:|
| 1 | 3584 | 5 | 3579 |
| 20 | 3584 | 6 | 3578 |
| 50 | 3584 | 13 | 3571 |
| 80 | 3584 | 12 | 3572 |
| 99 | 3584 | 8 | 3576 |
| 100 | 3072 | 13 | 3059 |
| 120 | 3072 | 13 | 3059 |
| 150 | 3072 | 14 | 3058 |
| 179 | 3072 | 9 | 3063 |
| 180 | 3072 | 10 | 3062 |
| 199 | 3072 | 12 | 3060 |
| 200 | 3072 | 12 | 3060 |

## Unproven Examples

- L1 strength tier 1 6/3/0
- L1 strength tier 1 6/3/1
- L1 strength tier 1 6/3/2
- L1 strength tier 1 6/3/3
- L1 strength tier 1 6/3/4
- L1 strength tier 1 6/3/5
- L1 strength tier 1 6/3/6
- L1 strength tier 1 6/4/any
- L1 strength tier 1 6/4/0
- L1 strength tier 1 6/4/1
- L1 strength tier 1 6/4/2
- L1 strength tier 1 6/4/3
- L1 strength tier 1 6/4/4
- L1 strength tier 1 6/4/5
- L1 strength tier 1 6/4/6
- L1 strength tier 1 6/5/any
- L1 strength tier 1 6/5/0
- L1 strength tier 1 6/5/1
- L1 strength tier 1 6/5/2
- L1 strength tier 1 6/5/3
- L1 strength tier 1 6/5/4
- L1 strength tier 1 6/5/5
- L1 strength tier 1 6/5/6
- L1 strength tier 1 6/6/any
- L1 strength tier 1 6/6/0
- L1 strength tier 1 6/6/1
- L1 strength tier 1 6/6/2
- L1 strength tier 1 6/6/3
- L1 strength tier 1 6/6/4
- L1 strength tier 1 6/6/5
- L1 strength tier 1 6/6/6
- L1 strength tier 1 7/3/any
- L1 strength tier 1 7/3/0
- L1 strength tier 1 7/3/1
- L1 strength tier 1 7/3/2
- L1 strength tier 1 7/3/3
- L1 strength tier 1 7/3/4
- L1 strength tier 1 7/3/5
- L1 strength tier 1 7/3/6
- L1 strength tier 1 7/4/any

## Suggested Next Generated Rows

- L1 strength tier 4 12/6/6 `cap` `retry`
- L20 strength tier 4 12/6/6 `cap` `retry`
- L80 strength tier 2 12/6/6 `cap` `retry`
- L200 strength tier 2 12/6/6 `cap` `retry`
- L80 strength tier 1 12/6/6 `cap` `retry`
- L200 strength tier 1 12/6/6 `cap` `retry`
- L1 intelligence tier 2 6/3/any `minimum` `unattempted`
- L20 intelligence tier 4 12/6/6 `cap` `unattempted`
- L50 chance tier 4 6/6/0 `mp_heavy` `unattempted`
- L80 agility tier 4 6/4/6 `range_heavy` `unattempted`
- L99 strength tier 4 11/3/any `ap_heavy` `unattempted`
- L100 intelligence tier 4 7/3/0 `middle` `unattempted`
- L120 chance tier 2 7/3/any `minimum` `unattempted`
- L150 agility tier 4 12/6/6 `cap` `unattempted`
- L179 strength tier 4 7/6/any `mp_heavy` `unattempted`
- L180 intelligence tier 4 7/3/6 `range_heavy` `unattempted`
- L199 chance tier 4 11/3/any `ap_heavy` `unattempted`
- L200 agility tier 4 7/3/0 `middle` `unattempted`
- L1 intelligence tier 4 12/6/6 `cap` `retry`
- L20 chance tier 4 12/6/6 `cap` `retry`
- L50 agility tier 2 12/6/6 `cap` `retry`
- L80 intelligence tier 4 12/6/6 `cap` `unattempted`
- L99 intelligence tier 2 12/6/6 `cap` `retry`
- L100 chance tier 1 12/6/6 `cap` `unattempted`
