# L50 Agility 12/6/6 Tier 2 Feasibility Frontier

Generated: 2026-07-10

## Target

- Target id: `grid_next_cap4_level_50_agility_12_6_6_budget2`
- Level: 50
- Element: Agility
- Budget tier: 2
- Exo policy: none
- Required AP/MP/Range: 12/6/6
- Base AP/MP/Range: 6/3/0

## Current Evidence

Solver matrix result:

- `.codex/state/build-discovery-cap4-level50-current-matrix.md`
- Status: `no_build`
- Cache miss runtime: 311677.7 ms

Action feasibility diagnostics:

- `.codex/state/build-discovery-l50-action-feasibility-cap5k.md`
- `.codex/state/build-discovery-l50-action-feasibility-cap10k.md`
- `.codex/state/build-discovery-l50-natural-gear-proof-cap10k.md`

The first bounded diagnostic runs hit the state cap while preserving frontiers around `11/5/6`.

After prioritizing AP/MP-capable slots and compressing harmless same-action item variants, the 10k diagnostic still hits the state cap but preserves a frontier at `11/6/6`.

The first natural-gear proof-mode run also hits the same 10k state cap and preserves the same `11/6/6` frontier. It proves that the natural-gear path still needs a sharper representation; it does not yet prove infeasibility.

## Interpretation

The diagnostic has not proven infeasibility. Its status remains `unknown_state_cap_hit`.

However, the current frontier is informative:

- The target needs +6 AP, +3 MP, and +6 Range from level 50 base stats.
- The best bounded action frontier reaches 11 AP, 6 MP, and 6 Range before Dofus/trophy completion.
- The available level-50 tier-2 action Dofus/trophies in the diagnostic are Observer (+2 Range) and Twitcher (+1 Range).
- No AP or MP Dofus/trophy source appears available for this target/budget.

That means the remaining missing AP must come from gear or set bonuses. A generic state cap increase is unlikely to be the cleanest next step; the better next diagnostic is a targeted natural-gear proof:

- prove whether any non-Dofus gear/set combination can naturally reach 12/6/6 under tier-2/no-exo constraints, or
- find and print such a witness if it exists.

## Next Diagnostic Direction

Build a smaller exact action proof that tracks:

- occupied slots
- used ring item ids
- set counts
- AP/MP/Range totals
- condition-bearing item ids

It should ignore final score and most non-action stat variants, but it must keep enough identity to enforce duplicate rings, set bonuses, and final item conditions.

If that proof also cannot reach 12/6/6 without state caps, this target can be classified as likely infeasible rather than a solver recall bug.
