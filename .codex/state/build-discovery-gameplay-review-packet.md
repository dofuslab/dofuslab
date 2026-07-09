# Build Discovery Gameplay Review Packet

Last updated: 2026-07-09

This is the short review packet for the assumptions that most need gameplay or
product judgment. Use it to mark each item as accepted, changed, or deferred.

## Scope

- v1 supports level 200 PvM Iop only.
- v1 supports one element at a time: Strength, Intelligence, Chance, or Agility.
- Non-Iop prompts such as `200 glass cannon int Cra` and `150 balanced str ecaflip`
  are benchmark-discovery targets, not supported generated queries yet.

Review question: Is Iop-only acceptable for the first shippable query, or should
another class be modeled before release?

## Budget Tiers

Current working model:

| Tier | Meaning |
| --- | --- |
| 1 | Mounts and normal equipment not assigned to higher tiers |
| 2 | Pets, petsmounts, common trophies, and accessible Dofuses |
| 3 | Exos, Prysmaradites, unclassified Dofuses |
| 4 | Ochre, Vulbis, legendary/special-effect items, opti assumptions |

Review questions:

- Should Dolmanax, Ice, Crimson, and Turquoise remain tier 2?
- Should Prysmaradites be tier 3 by default?
- Should any special-effect/legendary items be tier 3 instead of tier 4?
- Should `exoPolicy=opti` differ from `allow` before release?

## AP / MP / Range

Current working model:

- AP, MP, and Range are minimum targets, not exact targets.
- Hard caps are 12 AP, 6 MP, and 6 Range.
- Surplus AP/MP/Range is valid up to caps and lightly rewarded.
- Temporary AP does not satisfy static AP target requirements.

Review questions:

- Is surplus Range usually valuable enough to keep as a light positive, or should
  it be closer to neutral once target is met?
- Should 12/6/6 be treated as strictly better than 12/6/0 for every Iop element,
  or only as a small utility gain?

## Iop Damage Modeling

Current working model:

- Strength Iop has the most specific modeling.
- Intelligence, Chance, and Agility Iop currently reuse broader Iop/scoring logic
  and need review.
- Iop's Wrath is modeled with setup/cooldown semantics over a 7-turn window.
- Accumulation setup behavior is included where relevant.

Review questions:

- Are the non-Strength Iop profiles good enough for first release?
- Should any Iop element prefer ranged or weapon damage differently?
- Are any key Iop spells, cooldowns, or practical rotation assumptions missing?

## Special Items And Effects

Current working model:

- Cloudy Dofus uses a conservative expected final-damage value.
- Vulbis has low generic Iop PvM uptime.
- Ochre temporary AP contributes value but does not satisfy static AP targets.
- Conditional legendary/item text effects are approximate.

Review questions:

- Are Cloudy, Vulbis, and Ochre assumptions reasonable enough for first release?
- Which special-effect items are too mis-modeled to include in generated builds?
- Should special-effect items be hidden unless budget tier 4 is selected?

## Survivability And Utility

Current working model:

- Survivability uses weakest-element effective HP as the main risk signal.
- Vitality, percent resistances, fixed resistances, critical resistance, and
  pushback resistance contribute.
- Utility is intentionally small; Dodge is worth more than Lock for generic PvM.

Review questions:

- Is weakest-element EHP the right generic PvM survivability model?
- Is utility too low, too high, or acceptable for v1?
- Should glass-cannon and balanced presets move survivability weights more
  aggressively?

## Benchmark Selection

Current accepted local benchmark coverage:

- Five Strength Iop DofusLab human references.
- Generated comparison currently beats three and trails two under current scoring.
- Local validation covers Iop Strength, Intelligence, Chance, and Agility over
  11/6/0 and 12/6/0.

Review questions:

- Are the current Strength Iop references representative?
- Which generated builds look obviously bad or surprisingly good?
- Which non-Strength Iop benchmark references should be added before release?
- Once prod access is available, which aggregate prod profiles should become
  review benchmarks?

## Review Output

Suggested review format:

```text
Scope: accept/change/defer - notes
Budget tiers: accept/change/defer - notes
AP/MP/Range: accept/change/defer - notes
Iop damage: accept/change/defer - notes
Special items: accept/change/defer - notes
Survivability/utility: accept/change/defer - notes
Benchmarks: accept/change/defer - notes
```
