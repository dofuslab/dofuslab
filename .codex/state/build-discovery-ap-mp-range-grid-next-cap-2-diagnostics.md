# Build Discovery Action-Stat Diagnostics

This diagnostic is an optimistic AP/MP/Range item-stat check.
It sums the best independent item stat per slot and optional exos, but does not include set bonuses.
If the item-stat-only upper bound is below target, the no-build row has strong catalog evidence but is not fully proven infeasible until set bonuses are considered.
If the upper bound reaches target, no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question.

Diagnostics: `2`
Item-stat upper-bound below target: `2`
Not proven infeasible: `0`
Action-stat witnesses found: `0`

| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Witness search | Witness AP/MP/Range | Reasons |
|---|---|---|---|---|---|---|
| L1 intelligence 12/6/6 tier 4 | no_build | item_stat_upper_bound_below_target | 7/4/1 | not run |  | AP optimistic upper bound 7 is below target 12; MP optimistic upper bound 4 is below target 6; Range optimistic upper bound 1 is below target 6 |
| L20 chance 12/6/6 tier 4 | no_build | item_stat_upper_bound_below_target | 10/6/4 | not run |  | AP optimistic upper bound 10 is below target 12; Range optimistic upper bound 4 is below target 6 |
