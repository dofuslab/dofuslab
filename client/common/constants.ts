import { StatGroup } from './types';
import { Stat } from '__generated__/globalTypes';
import {
  customSet,
  customSet_stats,
} from 'graphql/fragments/__generated__/customSet';

export const BREAKPOINTS = [600, 900, 1200, 1600, 2000, 2400];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

export const CUSTOM_STAT = 'custom';

const getBaseStat = (stats: customSet_stats, stat: Stat) => {
  switch (stat) {
    case Stat.VITALITY:
      return stats.baseVitality;
    case Stat.WISDOM:
      return stats.baseWisdom;
    case Stat.STRENGTH:
      return stats.baseStrength;
    case Stat.INTELLIGENCE:
      return stats.baseIntelligence;
    case Stat.CHANCE:
      return stats.baseChance;
    case Stat.AGILITY:
      return stats.baseAgility;
    default:
      throw new Error(`${stat} is not a base stat!`);
  }
};

const getScrolledStat = (stats: customSet_stats, stat: Stat) => {
  switch (stat) {
    case Stat.VITALITY:
      return stats.scrolledVitality;
    case Stat.WISDOM:
      return stats.scrolledWisdom;
    case Stat.STRENGTH:
      return stats.scrolledStrength;
    case Stat.INTELLIGENCE:
      return stats.scrolledIntelligence;
    case Stat.CHANCE:
      return stats.scrolledChance;
    case Stat.AGILITY:
      return stats.scrolledAgility;
    default:
      throw new Error(`${stat} is not a base stat!`);
  }
};

export const sumStatsFromCustomSet = (customSet: customSet, stat: string) =>
  customSet.equippedItems.reduce((acc, curr) => {
    const statValue = (curr.item?.stats ?? []).find(
      statLine => statLine.stat === stat,
    );
    return acc + (statValue?.maxValue ?? 0);
  }, 0);

const statCalcGenerator = (stat: Stat) => (customSet: customSet) =>
  getBaseStat(customSet.stats, stat) +
  getScrolledStat(customSet.stats, stat) +
  sumStatsFromCustomSet(customSet, stat);

export const STAT_GROUPS: ReadonlyArray<StatGroup> = [
  [
    {
      stat: 'HP',
      customCalculateValue: (customSet: customSet) =>
        50 + customSet.level * 5 + statCalcGenerator(Stat.VITALITY)(customSet),
    },
    {
      stat: Stat.AP,
      customCalculateValue: (customSet: customSet) =>
        (customSet.level >= 100 ? 7 : 6) +
        sumStatsFromCustomSet(customSet, Stat.AP),
    },
    {
      stat: Stat.MP,
      customCalculateValue: (customSet: customSet) =>
        3 + sumStatsFromCustomSet(customSet, Stat.MP),
    },
    {
      stat: Stat.RANGE,
    },
    {
      stat: Stat.INITIATIVE,
      customCalculateValue: (customSet: customSet) =>
        statCalcGenerator(Stat.STRENGTH)(customSet) +
        statCalcGenerator(Stat.INTELLIGENCE)(customSet) +
        statCalcGenerator(Stat.CHANCE)(customSet) +
        statCalcGenerator(Stat.AGILITY)(customSet) +
        sumStatsFromCustomSet(customSet, Stat.INITIATIVE),
    },
    {
      stat: Stat.CRITICAL,
    },
    {
      stat: Stat.SUMMON,
      customCalculateValue: (customSet: customSet) =>
        1 + sumStatsFromCustomSet(customSet, Stat.SUMMON),
    },
    {
      stat: Stat.HEALS,
    },
    {
      stat: Stat.PROSPECTING,
      customCalculateValue: (customSet: customSet) =>
        100 +
        Math.floor(statCalcGenerator(Stat.CHANCE)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.PROSPECTING),
    },
    {
      stat: Stat.VITALITY,
      customCalculateValue: statCalcGenerator(Stat.VITALITY),
    },
    {
      stat: Stat.WISDOM,
      customCalculateValue: statCalcGenerator(Stat.WISDOM),
    },
    {
      stat: Stat.STRENGTH,
      customCalculateValue: statCalcGenerator(Stat.STRENGTH),
    },
    {
      stat: Stat.INTELLIGENCE,
      customCalculateValue: statCalcGenerator(Stat.INTELLIGENCE),
    },
    {
      stat: Stat.CHANCE,
      customCalculateValue: statCalcGenerator(Stat.CHANCE),
    },
    {
      stat: Stat.AGILITY,
      customCalculateValue: statCalcGenerator(Stat.AGILITY),
    },
    {
      stat: Stat.POWER,
    },
    {
      stat: Stat.DODGE,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.AGILITY)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.DODGE),
    },
    {
      stat: Stat.LOCK,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.AGILITY)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.LOCK),
    },
    {
      stat: Stat.AP_PARRY,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.WISDOM)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.AP_PARRY),
    },
    {
      stat: Stat.AP_REDUCTION,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.WISDOM)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.AP_REDUCTION),
    },
    {
      stat: Stat.MP_PARRY,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.WISDOM)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.MP_PARRY),
    },
    {
      stat: Stat.MP_REDUCTION,
      customCalculateValue: customSet =>
        Math.floor(statCalcGenerator(Stat.WISDOM)(customSet) / 10) +
        sumStatsFromCustomSet(customSet, Stat.MP_REDUCTION),
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
