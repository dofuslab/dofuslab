import {
  customSet_stats,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';
import { StatsFromCustomSet, SetCounter } from './types';
import { item_itemType } from 'graphql/fragments/__generated__/item';

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
    {} as StatsFromCustomSet,
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

  const sets = getBonusesFromCustomSet(customSet);

  const statsFromSetBonuses = mergeStatObjs(
    ...Object.values(sets).map(({ count, set: { bonuses } }) =>
      mergeStatObjs(
        ...bonuses
          .filter(bonus => bonus.numItems === count)
          .map(({ stat, value }) => ({ [stat]: value })),
      ),
    ),
  );

  return mergeStatObjs(statsFromSetBonuses, statsFromCustomSet);
};

const mergeStatObjs = (...statObjs: ReadonlyArray<{ [key: string]: number }>) =>
  statObjs.reduce((acc, statObj) => {
    Object.entries(statObj).forEach(([stat, value]) => {
      const asStat = stat as Stat;
      if (!asStat) {
        throw new Error(`${stat} is not a valid stat!`);
      }
      if (acc[asStat]) {
        acc[asStat] += value;
      } else {
        acc[asStat] = value;
      }
    });
    return acc;
  }, {} as StatsFromCustomSet);

export const getBonusesFromCustomSet = (customSet: customSet) => {
  const sets: SetCounter = {};

  for (const equippedItem of customSet.equippedItems) {
    const { item } = equippedItem;
    if (!item) continue;

    const { set } = item;
    if (set) {
      const setObj = sets[set.id];
      sets[set.id] = setObj
        ? { ...setObj, count: setObj.count + 1 }
        : { set, count: 1 };
    }
  }

  const filteredSets = Object.entries(sets)
    .filter(([_, setObj]) => {
      return !!setObj.set.bonuses.filter(
        ({ numItems }) => numItems === setObj.count,
      ).length;
    })
    .reduce((obj, [setId, setWithCount]) => {
      obj[setId] = setWithCount;
      return obj;
    }, {} as SetCounter);

  return filteredSets;
};

export const findEmptyOrOnlySlotId = (
  itemType: item_itemType,
  customSet?: customSet | null,
) => {
  if (!customSet || itemType.eligibleItemSlots.length === 1)
    return itemType.eligibleItemSlots[0].id;
  const occupiedSlotsSet = customSet.equippedItems.reduce((set, curr) => {
    set.add(curr.slot.id);
    return set;
  }, new Set<string>());

  for (const slot of itemType.eligibleItemSlots) {
    if (!occupiedSlotsSet.has(slot.id)) {
      return slot.id;
    }
  }

  return null;
};
