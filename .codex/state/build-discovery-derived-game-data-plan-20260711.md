# Build Discovery Derived Game Data - 2026-07-11

## Implemented Slice

Class spell sync now refreshes Build Discovery derived class/element spell data by regenerating the DB-backed Build Discovery index after `sync_class` finishes writing classes, spells, and buffs.

The generated index now includes `spellProfiles`:

- version: `build-discovery-class-element-spell-profiles-v1`
- levels: `99`, `149`, `179`, `200`
- rows: one profile per supported class, single element, and profile level
- count in current Docker DB smoke: `304` profiles

Each profile records:

- `spellProfile`: stateless DB-derived selected spells, variant-pair selection, AP cost, range, cast limits, expected damage/AP at reference stats, and confidence
- `rangeProfile`: range soft weight, range importance bucket, high-modifiable share, short-locked share, and total range evidence

DB smoke examples:

- Cra Strength level 200: `rangeImportance=vital`, `rangeSoftWeight=60.0`, selected spells start with Arrow of Judgement, Covering Fire, Barricade Shot.
- Iop Strength level 200: `rangeImportance=low`, `rangeSoftWeight=0.5`, selected spells include Iop's Wrath, Concentration, Sword of Iop.
- Enutrof Chance level 200: `rangeImportance=vital`, `rangeSoftWeight=60.0`, selected spells start with Shovel of the Ancients, Obsolescence, Auriferous Shovel.

Current limitation: runtime scoring still computes spell candidates directly from DB. This slice makes the generated profiles reproducible and inspectable, but does not yet switch CP-SAT/prototype scoring to read from the generated index.

## Other Data To Derive From Game Data

1. **Spell profile quality warnings**
   - unsupported spell effects, summons, traps, delayed damage, stack mechanics, target-count assumptions, cooldown-heavy spells, self-buffs, and stateful class mechanics
   - why: lets us lower confidence or exclude misleading stateless spell candidates

2. **Class/element default playstyle**
   - ranged, melee, or mixed default by class/element/level
   - inputs: spell ranges, modifiable range, minimum range, weapon type signals from prod, tags where present
   - why: user should choose or inherit a sane playstyle instead of a global default

3. **Class/element stat preference profile**
   - primary stat vs elemental damage vs power vs crit vs fixed damage vs final damage
   - inputs: spell base damage/AP, line count, crit chance, damage-increase mechanics, reviewed overrides
   - why: Iop-style high-base spells value Strength differently than low-base/multi-line profiles value fixed damage

4. **Action-stat feasibility and uncommon AP/MP sources**
   - AP/MP/Range source catalog by level, slot, budget tier, exo policy, and condition support
   - why: solver needs to know realistic paths like Shaker, Nomad, Gelano, Ochre, Vulbis, mounts, and exos without overfitting individual builds

5. **Item availability tiers**
   - generated first pass from item type, rarity category, prod usage, recipe/source if available, and hand-reviewed overrides
   - why: current v0 tiers are hardcoded and useful, but not grounded enough for broad class/level coverage

6. **Condition support classification**
   - item/spell condition parseability and solver support status
   - why: CP-SAT currently excludes unsupported item conditions conservatively; we need visibility into what that costs

7. **Weapon role profiles**
   - stat stick, melee weapon damage, ranged weapon damage, healing/support weapon, condition-heavy weapon
   - inputs: weapon type, AP cost, damage lines, range, crit, stats, class/element spell profile
   - why: weapon-vs-spell scoring should know when a weapon is an actual attack plan vs just good stats

8. **Set/package profiles**
   - strong reusable item packages by level/budget/element/action stats
   - inputs: set bonuses, slot conflicts, common prod co-occurrence, condition support
   - why: can speed search without sacrificing correctness if packages remain optional candidates, not forced assumptions

9. **Dofus/trophy/prysmaradite package profiles**
   - viable combinations by action target, budget tier, element, survivability/damage preset
   - why: these slots are heavily reused and combinatorially important

10. **Level-bracket defaults**
    - realistic AP/MP floors, target menus, survivability baselines, and budget expectations by level bracket
    - inputs: game base AP, prod AP/MP distributions, item availability, user expectations
    - why: level 200 `10/5` floor logic should not be reused blindly at lower levels

11. **Benchmark seeds**
    - representative prod aggregate profiles plus accepted human-reviewed builds
    - why: lets us detect scoring regressions without requiring exact item-by-item equality for every query
