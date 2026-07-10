# Build Discovery Action-Stat Diagnostics

This diagnostic is an optimistic AP/MP/Range item-stat check.
It sums the best independent item stat per slot and optional exos, but does not include set bonuses.
If the item-stat-only upper bound is below target, the no-build row has strong catalog evidence but is not fully proven infeasible until set bonuses are considered.
If the upper bound reaches target, no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question.

Diagnostics: `4`
Item-stat upper-bound below target: `0`
Not proven infeasible: `1`
Witness searches run: `4`
Action-stat witnesses found: `3` of `4` searched

| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Witness search | Witness AP/MP/Range | Reasons |
|---|---|---|---|---|---|---|
| L80 strength 12/6/6 tier 1 | no_build | not_proven_infeasible | 13/8/26 | not found, state cap hit |  | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L99 intelligence 12/6/6 tier 2 | no_build | action_stat_witness_found | 13/9/28 | found, state cap hit | 12/6/6 | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L199 agility 12/6/6 tier 2 | no_build | action_stat_witness_found | 19/18/30 | found, state cap hit | 12/6/6 | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
| L200 strength 12/6/6 tier 1 | no_build | action_stat_witness_found | 21/20/30 | found, state cap hit | 12/6/6 | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
