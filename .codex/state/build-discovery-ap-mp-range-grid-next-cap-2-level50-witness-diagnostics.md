# Build Discovery Action-Stat Diagnostics

This diagnostic is an optimistic AP/MP/Range item-stat check.
It sums the best independent item stat per slot and optional exos, but does not include set bonuses.
If the item-stat-only upper bound is below target, the no-build row has strong catalog evidence but is not fully proven infeasible until set bonuses are considered.
If the upper bound reaches target, no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question.

Diagnostics: `1`
Item-stat upper-bound below target: `0`
Not proven infeasible: `0`
Action-stat witnesses found: `1`

| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Witness search | Witness AP/MP/Range | Reasons |
|---|---|---|---|---|---|---|
| L50 agility 12/6/6 tier 4 | no_build | action_stat_witness_found | 13/8/26 | found, state cap hit | 12/6/6 | Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question. |
