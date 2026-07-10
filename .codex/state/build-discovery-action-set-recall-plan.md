# Build Discovery Action-Set Recall Plan

## Problem

Cap-4 witness diagnostics show several valid AP/MP/Range skeletons where
individual witness items are absent from the solver candidate pools.

Corrected examples after the level-base witness diagnostic fix:

- Level 199 Agility tier 2 `12/6/6`: missing `Bzzegg Supervisor's Fist` and
  `Golden Dragoone`.
- Level 200 Strength tier 1 `12/6/6`: missing `Khardboard Moowolf Belt` and
  `Plum and Almond Dragoturkey`.

Level 50 Agility tier 2 was previously listed here, but its witness disappeared
after fixing witness search to use the level-99-and-below base AP of 6.

These are not singleton item exceptions. The common shape is that an item can
be individually low-score but useful as part of an AP/MP/Range set or package.

## Do Not Do

Do not add the named missing items to a permanent allowlist as the primary fix.
That would overfit the current artifacts.

Do not include every available AP/MP/Range-bonus set in normal candidate pools.
A quick measurement showed the broad action-set universe is too large:

- Level 50 tier 2: 76 available action-bonus sets, 50 outside the current
  relevant-set limit.
- Level 199 tier 2: 129 available action-bonus sets, 89 outside the current
  relevant-set limit.
- Level 200 tier 1: 223 available action-bonus sets, 184 outside the current
  relevant-set limit.

## Candidate Fix Direction

Add a bounded action-set package stage:

1. Score sets/packages by AP/MP/Range contribution first, then by normal build
   score.
2. Keep only a small number of action packages per target level/budget/element.
3. Generate package seeds from enough pieces to activate the relevant action
   bonus, not from isolated low-score pieces.
4. Preserve normal set/package, locked-item, and fallback search paths.
5. Add diagnostics showing which action package admitted each otherwise-missing
   item.

## Correctness Guardrails

- The package stage must honor budget tier, exo policy, item conditions,
  target level, locked items, and avoided items.
- Package inclusion is a seed/recall mechanism, not proof that the final build
  is high quality.
- Every new recall improvement must be checked against witness-backed rows and
  should not turn item-stat-only below-target rows into overclaimed successes.

## Next Probe

Implemented in the 2026-07-10 action-package diagnostic checkpoint:

- identifies each missing witness item
- reports its set/package
- reports the smallest AP/MP/Range bonus threshold that explains why the item
  matters
- reports whether the item's set is inside the current relevant-set selection

Only after that diagnostic is reviewable should the solver start consuming the
package stage.

Current corrected witness-backed examples:

- Level 199 Agility tier 2 `12/6/6`: missing `Bzzegg Supervisor's Fist`
  from Bzzegg Supervisor Set, whose 3-piece bonus gives AP; and
  `Golden Dragoone` from Hax Or Set, whose 5-piece bonus gives MP.
- Level 200 Strength tier 1 `12/6/6`: missing `Khardboard Moowolf Belt`
  from Khardboard Set, whose 2-piece bonus gives AP, MP, and Range; and
  `Plum and Almond Dragoturkey`, a non-set mount.
