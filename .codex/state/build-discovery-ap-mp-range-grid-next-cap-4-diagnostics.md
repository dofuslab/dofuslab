# Build Discovery Action-Stat Diagnostics

This diagnostic is an optimistic AP/MP/Range item-stat check.
It sums the best independent item stat per slot and optional exos, but does not include set bonuses.
If the item-stat-only upper bound is below target, the no-build row has strong catalog evidence but is not fully proven infeasible until set bonuses are considered.
If the upper bound reaches target, no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question.

Diagnostics: `7`
Item-stat upper-bound below target: `2`
Not proven infeasible: `5`
Witness searches run: `0`
Action-stat witnesses found: `0` of `0` searched

| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Witness search | Witness AP/MP/Range | Reasons |
|---|---|---|---|---|---|---|
| L1 intelligence 12/6/6 tier 2 | no_build | item_stat_upper_bound_below_target | 6/3/0 | not run |  | AP optimistic upper bound 6 is below target 12; MP optimistic upper bound 3 is below target 6; Range optimistic upper bound 0 is below target 6 |
| L20 chance 12/6/6 tier 2 | no_build | item_stat_upper_bound_below_target | 9/5/3 | not run |  | AP optimistic upper bound 9 is below target 12; MP optimistic upper bound 5 is below target 6; Range optimistic upper bound 3 is below target 6 |
| L50 agility 12/6/6 tier 2 | no_build | not_proven_infeasible | 12/7/25 | not run |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L80 strength 12/6/6 tier 1 | no_build | not_proven_infeasible | 13/8/26 | not run |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L99 intelligence 12/6/6 tier 2 | no_build | not_proven_infeasible | 13/9/28 | not run |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L199 agility 12/6/6 tier 2 | no_build | not_proven_infeasible | 19/18/30 | not run |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L200 strength 12/6/6 tier 1 | no_build | not_proven_infeasible | 21/20/30 | not run |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
