import { StatGroup } from './types';
import { Stat } from '__generated__/globalTypes';

export const BREAKPOINTS = [600, 900, 1200, 1600, 2000, 2400];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

export const STAT_GROUPS: ReadonlyArray<StatGroup> = [
  [
    {
      stat: 'HP',
      customCalculateValue: (statsFromCustomSet, customSet) =>
        50 + customSet.level * 5 + statsFromCustomSet[Stat.VITALITY],
    },
    {
      stat: Stat.AP,
      customCalculateValue: (statsFromCustomSet, customSet) =>
        (customSet.level >= 100 ? 7 : 6) + statsFromCustomSet[Stat.AP],
    },
    {
      stat: Stat.MP,
      customCalculateValue: statsFromCustomSet =>
        3 + statsFromCustomSet[Stat.MP],
    },
    {
      stat: Stat.RANGE,
    },
    {
      stat: Stat.INITIATIVE,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet[Stat.STRENGTH] +
        statsFromCustomSet[Stat.INTELLIGENCE] +
        statsFromCustomSet[Stat.CHANCE] +
        statsFromCustomSet[Stat.AGILITY] +
        statsFromCustomSet[Stat.INITIATIVE],
    },
    {
      stat: Stat.CRITICAL,
    },
    {
      stat: Stat.SUMMON,
      customCalculateValue: statsFromCustomSet =>
        1 + statsFromCustomSet[Stat.SUMMON],
    },
    {
      stat: Stat.HEALS,
    },
    {
      stat: Stat.PROSPECTING,
      customCalculateValue: statsFromCustomSet =>
        100 +
        Math.floor(statsFromCustomSet[Stat.CHANCE] / 10) +
        statsFromCustomSet[Stat.PROSPECTING],
    },
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
    {
      stat: Stat.DODGE,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.AGILITY] / 10) +
        statsFromCustomSet[Stat.DODGE],
    },
    {
      stat: Stat.LOCK,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.AGILITY] / 10) +
        statsFromCustomSet[Stat.LOCK],
    },
    {
      stat: Stat.AP_PARRY,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
        statsFromCustomSet[Stat.AP_PARRY],
    },
    {
      stat: Stat.AP_REDUCTION,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
        statsFromCustomSet[Stat.AP_REDUCTION],
    },
    {
      stat: Stat.MP_PARRY,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
        statsFromCustomSet[Stat.MP_PARRY],
    },
    {
      stat: Stat.MP_REDUCTION,
      customCalculateValue: statsFromCustomSet =>
        Math.floor(statsFromCustomSet[Stat.WISDOM] / 10) +
        statsFromCustomSet[Stat.MP_REDUCTION],
    },
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
];
