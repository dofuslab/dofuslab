import { StatGroup } from './types';
import { Stat } from '__generated__/globalTypes';

export const DEBOUNCE_INTERVAL = 300;

export const BREAKPOINTS = [600, 900, 1200, 1450, 1650, 1900, 2100];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

export const STAT_GROUPS: ReadonlyArray<ReadonlyArray<StatGroup>> = [
  [
    [
      {
        stat: 'HP',
        customCalculateValue: (statsFromCustomSet, customSet) =>
          50 +
          (customSet?.level ?? 200) * 5 +
          (statsFromCustomSet ? statsFromCustomSet[Stat.VITALITY] || 0 : 0),
      },
      {
        stat: Stat.AP,
        customCalculateValue: (statsFromCustomSet, customSet) =>
          ((customSet?.level ?? 200) >= 100 ? 7 : 6) +
          (statsFromCustomSet ? statsFromCustomSet[Stat.AP] || 0 : 0),
      },
      {
        stat: Stat.MP,
        customCalculateValue: statsFromCustomSet =>
          3 + (statsFromCustomSet ? statsFromCustomSet[Stat.MP] || 0 : 0),
      },
      {
        stat: Stat.RANGE,
      },
    ],
    [
      {
        stat: Stat.INITIATIVE,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? statsFromCustomSet[Stat.STRENGTH] +
                statsFromCustomSet[Stat.INTELLIGENCE] +
                statsFromCustomSet[Stat.CHANCE] +
                statsFromCustomSet[Stat.AGILITY] +
                statsFromCustomSet[Stat.INITIATIVE] || 0
            : 0,
      },
      {
        stat: Stat.CRITICAL,
      },
      {
        stat: Stat.SUMMON,
        customCalculateValue: statsFromCustomSet =>
          1 + (statsFromCustomSet ? statsFromCustomSet[Stat.SUMMON] || 0 : 0),
      },
      {
        stat: Stat.HEALS,
      },
      {
        stat: Stat.PROSPECTING,
        customCalculateValue: statsFromCustomSet =>
          100 +
          (statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.CHANCE] / 10) +
                statsFromCustomSet[Stat.PROSPECTING] || 0
            : 0),
      },
    ],
    [
      {
        stat: Stat.VITALITY,
      },
      {
        stat: Stat.WISDOM,
      },
      {
        stat: Stat.STRENGTH,
      },
      {
        stat: Stat.INTELLIGENCE,
      },
      {
        stat: Stat.CHANCE,
      },
      {
        stat: Stat.AGILITY,
      },
      {
        stat: Stat.POWER,
      },
    ],
    [
      {
        stat: Stat.DODGE,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.AGILITY] / 10) +
                statsFromCustomSet[Stat.DODGE] || 0
            : 0,
      },
      {
        stat: Stat.LOCK,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.AGILITY] / 10) +
                statsFromCustomSet[Stat.LOCK] || 0
            : 0,
      },
      {
        stat: Stat.AP_PARRY,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
                statsFromCustomSet[Stat.AP_PARRY] || 0
            : 0,
      },
      {
        stat: Stat.AP_REDUCTION,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
                statsFromCustomSet[Stat.AP_REDUCTION] || 0
            : 0,
      },
      {
        stat: Stat.MP_PARRY,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
                statsFromCustomSet[Stat.MP_PARRY] || 0
            : 0,
      },
      {
        stat: Stat.MP_REDUCTION,
        customCalculateValue: statsFromCustomSet =>
          statsFromCustomSet
            ? Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
                statsFromCustomSet[Stat.MP_REDUCTION] || 0
            : 0,
      },
    ],
    [
      {
        stat: Stat.TRAP_DAMAGE,
      },
      {
        stat: Stat.TRAP_POWER,
      },
      {
        stat: Stat.REFLECT,
      },
    ],
  ],
  [
    [
      {
        stat: Stat.NEUTRAL_DAMAGE,
      },
      {
        stat: Stat.EARTH_DAMAGE,
      },
      {
        stat: Stat.FIRE_DAMAGE,
      },
      {
        stat: Stat.WATER_DAMAGE,
      },
      {
        stat: Stat.AIR_DAMAGE,
      },
    ],
    [
      {
        stat: Stat.PCT_MELEE_DAMAGE,
      },
      {
        stat: Stat.PCT_RANGED_DAMAGE,
      },
      {
        stat: Stat.PCT_WEAPON_DAMAGE,
      },
      {
        stat: Stat.PCT_SPELL_DAMAGE,
      },
      {
        stat: Stat.CRITICAL_DAMAGE,
      },
      {
        stat: Stat.PUSHBACK_DAMAGE,
      },
    ],
    [
      {
        stat: Stat.NEUTRAL_RES,
      },
      {
        stat: Stat.EARTH_RES,
      },
      {
        stat: Stat.FIRE_RES,
      },
      {
        stat: Stat.WATER_RES,
      },
      {
        stat: Stat.AIR_RES,
      },
      {
        stat: Stat.PCT_NEUTRAL_RES,
      },
      {
        stat: Stat.PCT_EARTH_RES,
      },
      {
        stat: Stat.PCT_FIRE_RES,
      },
      {
        stat: Stat.PCT_WATER_RES,
      },
      {
        stat: Stat.PCT_AIR_RES,
      },
    ],
    [
      {
        stat: Stat.PCT_MELEE_RES,
      },
      {
        stat: Stat.PCT_RANGED_RES,
      },
      {
        stat: Stat.CRITICAL_RES,
      },
      {
        stat: Stat.PUSHBACK_RES,
      },
    ],
  ],
];
