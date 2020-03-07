import {
  customSet_stats,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';
import { StatsFromCustomSet } from './types';

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

export const getStatsFromCustomSet = (customSet?: customSet | null) => {
  if (!customSet) {
    return null;
  }
  const statsFromCustomSet: StatsFromCustomSet = customSet.equippedItems.reduce(
    (acc, { item }) => {
      const accCopy = { ...acc };
      item?.stats.forEach(statLine => {
        if (!statLine.stat || !statLine.maxValue) {
          return;
        }
        if (accCopy[statLine.stat]) {
          accCopy[statLine.stat] += statLine.maxValue;
        } else {
          accCopy[statLine.stat] = statLine.maxValue;
        }
      });
      return accCopy;
    },
    {} as { [key in keyof typeof Stat]: number },
  );

  [
    Stat.VITALITY,
    Stat.WISDOM,
    Stat.STRENGTH,
    Stat.INTELLIGENCE,
    Stat.CHANCE,
    Stat.AGILITY,
  ].forEach(primaryStat => {
    const baseStats =
      getBaseStat(customSet.stats, primaryStat) +
      getScrolledStat(customSet.stats, primaryStat);
    if (statsFromCustomSet[primaryStat]) {
      statsFromCustomSet[primaryStat] += baseStats;
    } else {
      statsFromCustomSet[primaryStat] = baseStats;
    }
  });

  return statsFromCustomSet;
};
