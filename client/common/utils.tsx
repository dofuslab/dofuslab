import React, { useCallback } from 'react';
import {
  useMutation,
  useApolloClient,
  useQuery,
  ApolloClient,
  ApolloError,
} from '@apollo/client';
import { useRouter, NextRouter } from 'next/router';

import { notification } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import { TFunction } from 'next-i18next';
import CustomSetFragment from 'graphql/fragments/customSet.graphql';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import Lockr from 'lockr';

import {
  Stat,
  WeaponEffectType,
  SpellEffectType,
  WeaponElementMage,
} from '__generated__/globalTypes';
import {
  updateCustomSetItem,
  updateCustomSetItemVariables,
} from 'graphql/mutations/__generated__/updateCustomSetItem';
import UpdateCustomSetItemMutation from 'graphql/mutations/updateCustomSetItem.graphql';
import EquipSetMutation from 'graphql/mutations/equipSet.graphql';
import {
  deleteCustomSetItem,
  deleteCustomSetItemVariables,
} from 'graphql/mutations/__generated__/deleteCustomSetItem';
import DeleteCustomSetItemMutation from 'graphql/mutations/deleteCustomSetItem.graphql';
import {
  currentUser,
  currentUser as CurrentUserQueryType,
} from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { useTranslation, Trans } from 'i18n';
import {
  equipSet,
  equipSetVariables,
} from 'graphql/mutations/__generated__/equipSet';
import { itemSlots as ItemSlotsQueryType } from 'graphql/queries/__generated__/itemSlots';
import {
  equipItems,
  equipItemsVariables,
} from 'graphql/mutations/__generated__/equipItems';
import EquipItemsMutation from 'graphql/mutations/equipItems.graphql';
import { sessionSettings } from 'graphql/queries/__generated__/sessionSettings';
import sessionSettingsQuery from 'graphql/queries/sessionSettings.graphql';
import {
  changeClassic,
  changeClassicVariables,
} from 'graphql/mutations/__generated__/changeClassic';
import changeClassicMutation from 'graphql/mutations/changeClassic.graphql';
import {
  copyCustomSet,
  copyCustomSetVariables,
} from 'graphql/mutations/__generated__/copyCustomSet';
import copyCustomSetMutation from 'graphql/mutations/copyCustomSet.graphql';
import {
  toggleFavoriteItem,
  toggleFavoriteItemVariables,
} from 'graphql/mutations/__generated__/toggleFavoriteItem';
import toggleFavoriteItemMutation from 'graphql/mutations/toggleFavoriteItem.graphql';
import { ParsedUrlQuery } from 'querystring';
import { classes as classesQueryType } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import {
  StatsFromCustomSet,
  SetCounter,
  OriginalStatLine,
  ExoStatLine,
  CalcDamageInput,
  TSimpleEffect,
  TCondition,
  TConditionObj,
  StatCalculator,
  BaseStatKey,
  WeaponEffect,
  ConditionalSpellEffect,
  UnconditionalSpellEffect,
  AppliedBuff,
  AppliedBuffAction,
  AppliedBuffActionType,
  StatsFromAppliedBuffs,
} from './types';
import { META_DESCRIPTION, IS_CLASSIC_STORAGE_KEY } from './constants';
import {
  CustomSet,
  Stats,
  ItemSet,
  Item,
  ItemSlot,
  ItemTypeWithSlots,
  EquippedItem,
  Class,
} from './type-aliases';

export const getImageUrl = (suffix: string) =>
  `https://d2iuiayak06k8j.cloudfront.net/${suffix}`;

export const navigateToNewCustomSet = (
  router: NextRouter,
  customSetId: string,
) => {
  if (customSetId !== router.query.customSetId) {
    router.replace(
      {
        pathname: '/',
        query: { customSetId },
      },
      `/build/${customSetId}`,
      {
        shallow: true,
      },
    );
  }
};

const getBaseStat = (stats: Stats, stat: Stat) => {
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

const getScrolledStat = (stats: Stats, stat: Stat) => {
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

export const getStatsMaps = (
  originalStats: ReadonlyArray<OriginalStatLine>,
  exos: ReadonlyArray<ExoStatLine>,
) => {
  const statsMap: {
    [key: string]: { value: number; maged: boolean };
  } = originalStats.reduce(
    (acc, { stat, maxValue }) =>
      stat ? { ...acc, [stat]: { value: maxValue, maged: false } } : acc,
    {},
  );

  const originalStatsMap = cloneDeep(statsMap);

  let exoStatsMap: { [key: string]: number } = {};

  if (exos) {
    exoStatsMap = exos.reduce(
      (acc, { stat, value }) => ({ ...acc, [stat]: value }),
      {},
    );

    Object.entries(exoStatsMap).forEach(([stat, value]) => {
      if (statsMap[stat]) {
        statsMap[stat].value += value;
        statsMap[stat].maged = true;
        delete exoStatsMap[stat];
      }
    });
  }

  return { statsMap, exoStatsMap, originalStatsMap };
};

export const getBonusesFromCustomSet = (customSet: CustomSet) => {
  const sets: SetCounter = {};

  customSet.equippedItems.forEach((equippedItem) => {
    const { item } = equippedItem;
    if (!item) return;

    const { set } = item;
    if (set) {
      const setObj = sets[set.id];
      sets[set.id] = setObj
        ? {
            ...setObj,
            count: setObj.count + 1,
            equippedItems: [...setObj.equippedItems, equippedItem],
          }
        : { set, count: 1, equippedItems: [equippedItem] };
    }
  });

  const filteredSets = Object.entries(sets).filter(
    ([, setObj]) => setObj.count > 1,
  );

  const result = filteredSets.reduce((obj, [setId, setWithCount]) => {
    // eslint-disable-next-line no-param-reassign
    obj[setId] = setWithCount;
    return obj;
  }, {} as SetCounter);

  return result;
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

export const getStatsFromCustomSet = (customSet?: CustomSet | null) => {
  if (!customSet) {
    return null;
  }

  const statsFromCustomSet: StatsFromCustomSet = customSet.equippedItems.reduce(
    (acc, { item: i, exos }) => {
      const accCopy = { ...acc };
      // eslint-disable-next-line no-unused-expressions
      i?.stats.forEach((statLine) => {
        if (!statLine.stat || !statLine.maxValue) {
          return;
        }
        if (accCopy[statLine.stat]) {
          accCopy[statLine.stat] += statLine.maxValue;
        } else {
          accCopy[statLine.stat] = statLine.maxValue;
        }
      });
      exos.forEach((statLine) => {
        if (accCopy[statLine.stat]) {
          accCopy[statLine.stat] += statLine.value;
        } else {
          accCopy[statLine.stat] = statLine.value;
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
  ].forEach((primaryStat) => {
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
          .filter(
            (bonus) =>
              bonus.numItems === count && !!bonus.stat && !!bonus.value,
          )
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map(({ stat, value }) => ({ [stat!]: value! })),
      ),
    ),
  );

  return mergeStatObjs(statsFromSetBonuses, statsFromCustomSet);
};

export const findNextEmptySlotIds = (
  itemType: ItemTypeWithSlots,
  currentSlotId: string,
  customSet?: CustomSet | null,
) => {
  const eligibleItemSlots = [...itemType.eligibleItemSlots].sort(
    (i, j) => i.order - j.order,
  );
  if (!customSet) {
    return eligibleItemSlots
      .filter((slot) => slot.id !== currentSlotId)
      .map((slot) => slot.id);
  }
  const occupiedSlotsSet = customSet.equippedItems.reduce((set, curr) => {
    set.add(curr.slot.id);
    return set;
  }, new Set<string>());
  const foundSlotIds = eligibleItemSlots
    .filter(
      (slot) => !occupiedSlotsSet.has(slot.id) && slot.id !== currentSlotId,
    )
    .map((slot) => slot.id);

  return foundSlotIds;
};

export const findEmptySlotId = (
  itemType: ItemTypeWithSlots,
  customSet?: CustomSet | null,
) => {
  const eligibleItemSlots = [...itemType.eligibleItemSlots].sort(
    (i, j) => i.order - j.order,
  );
  if (!customSet) {
    return eligibleItemSlots[0].id;
  }
  const occupiedSlotsSet = customSet.equippedItems.reduce((set, curr) => {
    set.add(curr.slot.id);
    return set;
  }, new Set<string>());

  const foundSlot = eligibleItemSlots.find(
    (slot) => !occupiedSlotsSet.has(slot.id),
  );
  return foundSlot?.id ?? null;
};

export const findEmptyOrOnlySlotId = (
  itemType: ItemTypeWithSlots,
  customSet?: CustomSet | null,
) => {
  const eligibleItemSlots = [...itemType.eligibleItemSlots].sort(
    (i, j) => i.order - j.order,
  );
  if (eligibleItemSlots.length === 1) return eligibleItemSlots[0].id;
  return findEmptySlotId(itemType, customSet);
};

export const checkAuthentication = async (
  client: ApolloClient<object>,
  t: TFunction,
  customSet?: CustomSet | null,
) => {
  const { data } = await client.query<currentUser>({ query: currentUserQuery });
  if (
    !customSet ||
    !customSet.owner ||
    customSet.owner.id === data?.currentUser?.id
  ) {
    return true;
  }
  notification.error({
    message: t('ERROR'),
    description: t('NO_PERMISSION'),
    style: { fontSize: '0.75rem' },
  });
  return false;
};

export const getCustomSet = (
  client: ApolloClient<object>,
  customSetId: string,
) => {
  const customSet = client.readFragment<CustomSet>(
    {
      id: `CustomSet:${customSetId}`,
      fragment: CustomSetFragment,
      fragmentName: 'customSet',
    },
    true,
  );

  if (!customSet) {
    throw new Error(`Could not find custom set with id ${customSetId}`);
  }

  return customSet;
};

export const useEquipItemMutation = (item: Item) => {
  const router = useRouter();
  const { customSetId: routerCustomSetId } = router.query;

  const customSetId: string | null = routerCustomSetId
    ? String(routerCustomSetId)
    : null;

  const client = useApolloClient();

  const { data: itemSlotsData } = useQuery<ItemSlotsQueryType>(ItemSlotsQuery);

  const [updateCustomSetItemMutate] = useMutation<
    updateCustomSetItem,
    updateCustomSetItemVariables
  >(UpdateCustomSetItemMutation, {
    refetchQueries: () => ['myCustomSets'],
    optimisticResponse:
      customSetId && itemSlotsData
        ? ({ itemSlotId }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const customSet = getCustomSet(client, customSetId)!;

            const { equippedItems: oldEquippedItems } = customSet;

            const equippedItems = [...oldEquippedItems];

            const oldEquippedItemIdx = oldEquippedItems.findIndex(
              (equippedItem) => equippedItem.slot.id === itemSlotId,
            );

            const slot = itemSlotsData.itemSlots.find(
              (s) => s.id === itemSlotId,
            ) as ItemSlot;

            if (oldEquippedItemIdx > -1) {
              const oldEquippedItem = equippedItems[oldEquippedItemIdx];

              equippedItems.splice(oldEquippedItemIdx, 1, {
                ...oldEquippedItem,
                item,
              });
            } else {
              equippedItems.push({
                id: `equipped-item-${slot.id}`,
                exos: [],
                slot,
                item,
                weaponElementMage: null,
                __typename: 'EquippedItem',
              });
            }

            return {
              updateCustomSetItem: {
                customSet: {
                  ...customSet,
                  equippedItems,
                },
                __typename: 'UpdateCustomSetItem',
              },
            };
          }
        : undefined,
  });

  const { t } = useTranslation('common');

  const onClick = useCallback(
    async (itemSlotId?: string) => {
      if (!itemSlotId) return;
      const customSet = customSetId ? getCustomSet(client, customSetId) : null;
      const ok = await checkAuthentication(client, t, customSet);
      if (!ok) return;
      const { data } = await updateCustomSetItemMutate({
        variables: {
          customSetId,
          itemId: item.id,
          itemSlotId,
        },
      });

      if (data?.updateCustomSetItem) {
        navigateToNewCustomSet(router, data.updateCustomSetItem.customSet.id);
      }
    },
    [updateCustomSetItemMutate, customSetId, item],
  );

  return onClick;
};

export const useEquipItemsMutation = (
  itemIds: Array<string>,
  customSet?: CustomSet | null,
): [
  () => Promise<void>,
  { data?: equipItems | null; loading: boolean; error?: ApolloError },
] => {
  const router = useRouter();
  const { customSetId: routerSetId } = router.query;

  const [equipItemsMutate, { data, loading, error }] = useMutation<
    equipItems,
    equipItemsVariables
  >(EquipItemsMutation, {
    variables: {
      itemIds,
      customSetId: customSet?.id,
    },
    refetchQueries: () => ['myCustomSets'],
  });

  const client = useApolloClient();

  const { t } = useTranslation('common');

  const onClick = useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return;
    const { data: resultData } = await equipItemsMutate();

    if (resultData?.equipMultipleItems?.customSet) {
      navigateToNewCustomSet(
        router,
        resultData.equipMultipleItems.customSet.id,
      );
    }
  }, [equipItemsMutate, routerSetId, router]);

  return [onClick, { data, loading, error }];
};

export const useEquipSetMutation = (
  setId: string,
  customSet?: CustomSet | null,
): [
  () => Promise<void>,
  { data?: equipSet | null; loading: boolean; error?: ApolloError },
] => {
  const router = useRouter();
  const { customSetId: routerSetId } = router.query;

  const [equipSetMutate, { data, loading, error }] = useMutation<
    equipSet,
    equipSetVariables
  >(EquipSetMutation, {
    variables: {
      setId,
      customSetId: customSet?.id,
    },
    refetchQueries: () => ['myCustomSets'],
  });

  const client = useApolloClient();

  const { t } = useTranslation('common');

  const onClick = useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return;
    const { data: resultData } = await equipSetMutate();

    if (resultData?.equipSet) {
      navigateToNewCustomSet(router, resultData.equipSet.customSet.id);
    }
  }, [equipSetMutate, routerSetId, router]);

  return [onClick, { data, loading, error }];
};

export const useDeleteItemMutation = (
  itemSlotId: string,
  customSet: CustomSet,
) => {
  const [mutate] = useMutation<
    deleteCustomSetItem,
    deleteCustomSetItemVariables
  >(DeleteCustomSetItemMutation, {
    variables: { itemSlotId, customSetId: customSet.id },
    optimisticResponse: ({ itemSlotId: slotId }) => ({
      deleteCustomSetItem: {
        customSet: {
          id: customSet.id,
          lastModified: Date.now(),
          equippedItems: [
            ...customSet.equippedItems
              .filter((equippedItem) => equippedItem.slot.id !== slotId)
              .map(({ id }) => ({
                id,
                __typename: 'EquippedItem' as 'EquippedItem',
              })),
          ],
          __typename: 'CustomSet',
        },
        __typename: 'DeleteCustomSetItem',
      },
    }),
  });

  const client = useApolloClient();
  const { t } = useTranslation('common');

  const onDelete = useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return null;
    return mutate();
  }, [mutate, customSet]);
  return onDelete;
};

export const useCustomSet = (customSetId: string | null) => {
  const client = useApolloClient();
  if (!customSetId) return null;
  return getCustomSet(client, customSetId);
};

export const useSetModal = () => {
  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<ItemSet | null>(null);

  const openSetModal = React.useCallback(
    (set: ItemSet) => {
      setSelectedSet(set);
      setSetModalVisible(true);
    },
    [setSelectedSet, setSetModalVisible],
  );

  const closeSetModal = React.useCallback(() => {
    setSetModalVisible(false);
  }, [setSetModalVisible]);

  return { setModalVisible, selectedSet, openSetModal, closeSetModal };
};

export const getStatWithDefault = (
  statsFromCustomSet: StatsFromCustomSet | null,
  stat: Stat,
) => (statsFromCustomSet ? statsFromCustomSet[stat] || 0 : 0);

const getCorrespondingDamage = (stat: Stat) => {
  switch (stat) {
    case Stat.STRENGTH:
      return Stat.EARTH_DAMAGE;
    case Stat.INTELLIGENCE:
      return Stat.FIRE_DAMAGE;
    case Stat.CHANCE:
      return Stat.WATER_DAMAGE;
    case Stat.AGILITY:
      return Stat.AIR_DAMAGE;
    default:
      throw new Error('Invalid best element');
  }
};

const getDamageObjectFromElement = (stat: Stat) => {
  switch (stat) {
    case Stat.STRENGTH:
      return { multiplier: Stat.STRENGTH, damage: Stat.EARTH_DAMAGE };
    case Stat.INTELLIGENCE:
      return { multiplier: Stat.INTELLIGENCE, damage: Stat.FIRE_DAMAGE };
    case Stat.CHANCE:
      return { multiplier: Stat.CHANCE, damage: Stat.WATER_DAMAGE };
    case Stat.AGILITY:
      return { multiplier: Stat.AGILITY, damage: Stat.AIR_DAMAGE };
    default:
      throw new Error('Invalid best element');
  }
};

const getBestStat = (statsFromCustomSet: StatsFromCustomSet | null) =>
  [Stat.STRENGTH, Stat.INTELLIGENCE, Stat.CHANCE, Stat.AGILITY]
    .map((s) => ({
      value: getStatWithDefault(statsFromCustomSet, s),
      stat: s,
    }))
    .reduce((currMax, curr) => {
      if (!currMax) {
        return curr;
      }
      if (curr.value > currMax.value) {
        return curr;
      }
      if (curr.value === currMax.value) {
        // if main stat (STR/INT/CHA/AGI) values are the same,
        // use damage as tiebreaker
        if (
          getStatWithDefault(
            statsFromCustomSet,
            getCorrespondingDamage(curr.stat),
          ) >
          getStatWithDefault(
            statsFromCustomSet,
            getCorrespondingDamage(currMax.stat),
          )
        ) {
          return curr;
        }
      }
      return currMax;
    }, null as { value: number; stat: Stat } | null)?.stat ?? Stat.STRENGTH;

export const calcEffectType = (
  effectType: SpellEffectType | WeaponEffectType,
  statsFromCustomSet: StatsFromCustomSet | null,
) => {
  if (
    effectType !== SpellEffectType.BEST_ELEMENT_DAMAGE &&
    effectType !== SpellEffectType.BEST_ELEMENT_STEAL
  ) {
    return effectType;
  }
  const bestStat = getBestStat(statsFromCustomSet);
  switch (bestStat) {
    case Stat.STRENGTH:
      return effectType === SpellEffectType.BEST_ELEMENT_DAMAGE
        ? SpellEffectType.EARTH_DAMAGE
        : SpellEffectType.EARTH_STEAL;
    case Stat.INTELLIGENCE:
      return effectType === SpellEffectType.BEST_ELEMENT_DAMAGE
        ? SpellEffectType.FIRE_DAMAGE
        : SpellEffectType.FIRE_STEAL;
    case Stat.CHANCE:
      return effectType === SpellEffectType.BEST_ELEMENT_DAMAGE
        ? SpellEffectType.WATER_DAMAGE
        : SpellEffectType.WATER_STEAL;
    case Stat.AGILITY:
      return effectType === SpellEffectType.BEST_ELEMENT_DAMAGE
        ? SpellEffectType.AIR_DAMAGE
        : SpellEffectType.AIR_STEAL;
    default:
      throw new Error('Invalid best stat');
  }
};

const getStats = (
  effectType: WeaponEffectType | SpellEffectType,
  statsFromCustomSet: StatsFromCustomSet | null,
) => {
  switch (effectType) {
    case SpellEffectType.BEST_ELEMENT_DAMAGE:
    case SpellEffectType.BEST_ELEMENT_STEAL:
      return getDamageObjectFromElement(getBestStat(statsFromCustomSet));
    case WeaponEffectType.AIR_DAMAGE:
    case WeaponEffectType.AIR_STEAL:
    case SpellEffectType.AIR_DAMAGE:
    case SpellEffectType.AIR_STEAL:
      return { multiplier: Stat.AGILITY, damage: Stat.AIR_DAMAGE };
    case WeaponEffectType.EARTH_DAMAGE:
    case WeaponEffectType.EARTH_STEAL:
    case SpellEffectType.EARTH_DAMAGE:
    case SpellEffectType.EARTH_STEAL:
      return { multiplier: Stat.STRENGTH, damage: Stat.EARTH_DAMAGE };
    case WeaponEffectType.FIRE_DAMAGE:
    case WeaponEffectType.FIRE_STEAL:
    case SpellEffectType.FIRE_DAMAGE:
    case SpellEffectType.FIRE_STEAL:
      return { multiplier: Stat.INTELLIGENCE, damage: Stat.FIRE_DAMAGE };
    case WeaponEffectType.NEUTRAL_DAMAGE:
    case WeaponEffectType.NEUTRAL_STEAL:
    case SpellEffectType.NEUTRAL_DAMAGE:
    case SpellEffectType.NEUTRAL_STEAL:
      return { multiplier: Stat.STRENGTH, damage: Stat.NEUTRAL_DAMAGE };
    case WeaponEffectType.WATER_DAMAGE:
    case WeaponEffectType.WATER_STEAL:
    case SpellEffectType.WATER_DAMAGE:
    case SpellEffectType.WATER_STEAL:
      return { multiplier: Stat.CHANCE, damage: Stat.WATER_DAMAGE };
    default:
      throw new Error('Improper effectType passed to getStats');
  }
};

export const calcDamage = (
  baseDamage: number,
  effectType: WeaponEffectType | SpellEffectType,
  stats: StatsFromCustomSet | null,
  damageTypeInput: CalcDamageInput,
  weaponSkillPower?: number,
) => {
  const statTypes = getStats(effectType, stats);
  const { multiplier: multiplierType, damage: damageType } = statTypes;
  let multiplierValue =
    getStatWithDefault(stats, multiplierType) +
    getStatWithDefault(stats, Stat.POWER);
  let damageValue =
    getStatWithDefault(stats, damageType) +
    getStatWithDefault(stats, Stat.DAMAGE);
  if (damageTypeInput.isTrap) {
    multiplierValue += getStatWithDefault(stats, Stat.TRAP_POWER);
    damageValue += getStatWithDefault(stats, Stat.TRAP_DAMAGE);
  }
  if (damageTypeInput.isCrit) {
    damageValue += getStatWithDefault(stats, Stat.CRITICAL_DAMAGE);
  }
  if (damageTypeInput.isWeapon) {
    multiplierValue += weaponSkillPower || 0;
  }
  const calculatedDamage = Math.floor(
    baseDamage * (1 + multiplierValue / 100) + damageValue,
  );

  let finalDamageMod =
    1 + getStatWithDefault(stats, Stat.PCT_FINAL_DAMAGE) / 100;
  if (damageTypeInput.isWeapon) {
    finalDamageMod *=
      1 + getStatWithDefault(stats, Stat.PCT_WEAPON_DAMAGE) / 100;
  } else {
    finalDamageMod *=
      1 + getStatWithDefault(stats, Stat.PCT_SPELL_DAMAGE) / 100;
  }

  return {
    melee: Math.floor(
      calculatedDamage *
        (finalDamageMod *
          (1 + getStatWithDefault(stats, Stat.PCT_MELEE_DAMAGE) / 100)),
    ),
    ranged: Math.floor(
      calculatedDamage *
        (finalDamageMod *
          (1 + getStatWithDefault(stats, Stat.PCT_RANGED_DAMAGE) / 100)),
    ),
  };
};

export const calcPushbackDamage = (
  numSquaresPushed: number,
  level: number,
  stats: StatsFromCustomSet | null,
) =>
  Math.floor(
    (level / 2 + (getStatWithDefault(stats, Stat.PUSHBACK_DAMAGE) + 32)) *
      (numSquaresPushed / 4),
  );

export const calcHeal = (
  baseHeal: number,
  stats: StatsFromCustomSet | null,
  weaponSkillPower?: number,
) => {
  const multiplierValue =
    getStatWithDefault(stats, Stat.INTELLIGENCE) + (weaponSkillPower || 0);
  const flatBonus = getStatWithDefault(stats, Stat.HEALS);
  return Math.floor(baseHeal * (1 + multiplierValue / 100) + flatBonus);
};

export const calcShield = (baseShield: number, level: number) => {
  return Math.floor((baseShield / 100) * level);
};

export const effectToIconUrl = (effect: WeaponEffectType | SpellEffectType) => {
  switch (effect) {
    case WeaponEffectType.AIR_DAMAGE:
    case WeaponEffectType.AIR_STEAL:
    case SpellEffectType.AIR_DAMAGE:
    case SpellEffectType.AIR_STEAL:
      return 'icon/Agility.svg';
    case WeaponEffectType.EARTH_DAMAGE:
    case WeaponEffectType.EARTH_STEAL:
    case SpellEffectType.EARTH_DAMAGE:
    case SpellEffectType.EARTH_STEAL:
      return 'icon/Strength.svg';
    case WeaponEffectType.FIRE_DAMAGE:
    case WeaponEffectType.FIRE_STEAL:
    case SpellEffectType.FIRE_DAMAGE:
    case SpellEffectType.FIRE_STEAL:
      return 'icon/Intelligence.svg';
    case WeaponEffectType.NEUTRAL_DAMAGE:
    case WeaponEffectType.NEUTRAL_STEAL:
    case SpellEffectType.NEUTRAL_DAMAGE:
    case SpellEffectType.NEUTRAL_STEAL:
      return 'icon/Neutral.svg';
    case WeaponEffectType.WATER_DAMAGE:
    case WeaponEffectType.WATER_STEAL:
    case SpellEffectType.WATER_DAMAGE:
    case SpellEffectType.WATER_STEAL:
      return 'icon/Chance.svg';
    case WeaponEffectType.AP:
    case SpellEffectType.AP:
      return 'icon/Action_Point.svg';
    case WeaponEffectType.MP:
    case SpellEffectType.MP:
      return 'icon/Movement_Point.svg';
    case WeaponEffectType.HP_RESTORED:
    case SpellEffectType.HP_RESTORED:
      return 'icon/Health_Point.svg';
    case SpellEffectType.SHIELD:
      return 'icon/Shield_Point.svg';
    case SpellEffectType.PUSHBACK_DAMAGE:
      return 'icon/Pushback_Damage.svg';
    default:
      throw new Error('Unknown SpellEffectType');
  }
};

export const getSimpleEffect: (
  effectType: WeaponEffectType | SpellEffectType,
) => TSimpleEffect = (effectType) => {
  switch (effectType) {
    case WeaponEffectType.AIR_DAMAGE:
    case WeaponEffectType.AIR_STEAL:
    case WeaponEffectType.EARTH_DAMAGE:
    case WeaponEffectType.EARTH_STEAL:
    case WeaponEffectType.FIRE_DAMAGE:
    case WeaponEffectType.FIRE_STEAL:
    case WeaponEffectType.WATER_DAMAGE:
    case WeaponEffectType.WATER_STEAL:
    case WeaponEffectType.NEUTRAL_DAMAGE:
    case WeaponEffectType.NEUTRAL_STEAL:
    case SpellEffectType.AIR_DAMAGE:
    case SpellEffectType.AIR_STEAL:
    case SpellEffectType.EARTH_DAMAGE:
    case SpellEffectType.EARTH_STEAL:
    case SpellEffectType.FIRE_DAMAGE:
    case SpellEffectType.FIRE_STEAL:
    case SpellEffectType.WATER_DAMAGE:
    case SpellEffectType.WATER_STEAL:
    case SpellEffectType.NEUTRAL_DAMAGE:
    case SpellEffectType.NEUTRAL_STEAL:
    case SpellEffectType.BEST_ELEMENT_DAMAGE:
    case SpellEffectType.BEST_ELEMENT_STEAL:
      return 'damage';
    case WeaponEffectType.HP_RESTORED:
    case SpellEffectType.HP_RESTORED:
      return 'heal';
    case SpellEffectType.PUSHBACK_DAMAGE:
      return 'pushback_damage';
    case SpellEffectType.SHIELD:
      return 'shield';
    case WeaponEffectType.AP:
    case SpellEffectType.AP:
      return 'ap';
    case WeaponEffectType.MP:
    case SpellEffectType.MP:
      return 'mp';
    default:
      throw new Error('Unknown SimpleEffect');
  }
};

export const calcEffect = (
  baseDamage: number,
  effectType: WeaponEffectType | SpellEffectType,
  level: number,
  stats: StatsFromCustomSet | null,
  damageTypeInput: CalcDamageInput,
  damageTypeKey: 'melee' | 'ranged',
  weaponSkillPower?: number,
) => {
  const simpleEffect = getSimpleEffect(effectType);

  if (simpleEffect === 'heal') {
    return calcHeal(baseDamage, stats, weaponSkillPower);
  }
  if (simpleEffect === 'pushback_damage') {
    return calcPushbackDamage(baseDamage, level, stats);
  }
  if (simpleEffect === 'damage') {
    return calcDamage(
      baseDamage,
      effectType,
      stats,
      damageTypeInput,
      weaponSkillPower,
    )[damageTypeKey];
  }
  if (simpleEffect === 'shield') {
    return calcShield(baseDamage, level);
  }
  return baseDamage;
};

export const elementMageToWeaponEffect = (elementMage: WeaponElementMage) => {
  switch (elementMage) {
    case WeaponElementMage.EARTH_50:
    case WeaponElementMage.EARTH_68:
    case WeaponElementMage.EARTH_85:
      return WeaponEffectType.EARTH_DAMAGE;
    case WeaponElementMage.FIRE_50:
    case WeaponElementMage.FIRE_68:
    case WeaponElementMage.FIRE_85:
      return WeaponEffectType.FIRE_DAMAGE;
    case WeaponElementMage.WATER_50:
    case WeaponElementMage.WATER_68:
    case WeaponElementMage.WATER_85:
      return WeaponEffectType.WATER_DAMAGE;
    case WeaponElementMage.AIR_50:
    case WeaponElementMage.AIR_68:
    case WeaponElementMage.AIR_85:
      return WeaponEffectType.AIR_DAMAGE;
    default:
      throw new Error('Unknown WeaponElementMage');
  }
};

export const calcElementMage = (
  elementMage: WeaponElementMage,
  baseMin: number,
  baseMax: number,
) => {
  let multiplier = 1;
  switch (elementMage) {
    case WeaponElementMage.EARTH_50:
    case WeaponElementMage.FIRE_50:
    case WeaponElementMage.WATER_50:
    case WeaponElementMage.AIR_50:
      multiplier = 0.5;
      break;
    case WeaponElementMage.EARTH_68:
    case WeaponElementMage.FIRE_68:
    case WeaponElementMage.WATER_68:
    case WeaponElementMage.AIR_68:
      multiplier = 0.68;
      break;
    case WeaponElementMage.EARTH_85:
    case WeaponElementMage.FIRE_85:
    case WeaponElementMage.WATER_85:
    case WeaponElementMage.AIR_85:
      multiplier = 0.85;
      break;
    default:
      throw new Error('Unknown WeaponElementMage');
  }
  const calcDamageBase = Math.floor((baseMin - 1) * multiplier);
  const diff = Math.floor((baseMax - baseMin + 1) * multiplier);

  return {
    minDamage: diff === 1 ? null : calcDamageBase + 1,
    maxDamage: calcDamageBase + diff,
  };
};

export const statCalculators: { [key: string]: StatCalculator } = {
  HP: (statsFromCustomSet, customSet) =>
    50 +
    (customSet?.level ?? 200) * 5 +
    (statsFromCustomSet ? statsFromCustomSet[Stat.VITALITY] || 0 : 0),
  [Stat.AP]: (statsFromCustomSet, customSet) =>
    ((customSet?.level ?? 200) >= 100 ? 7 : 6) +
    getStatWithDefault(statsFromCustomSet, Stat.AP),
  [Stat.MP]: (statsFromCustomSet) =>
    3 + getStatWithDefault(statsFromCustomSet, Stat.MP),
  [Stat.INITIATIVE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.STRENGTH) +
        getStatWithDefault(statsFromCustomSet, Stat.INTELLIGENCE) +
        getStatWithDefault(statsFromCustomSet, Stat.CHANCE) +
        getStatWithDefault(statsFromCustomSet, Stat.AGILITY) +
        getStatWithDefault(statsFromCustomSet, Stat.INITIATIVE)
      : 0,
  [Stat.SUMMON]: (statsFromCustomSet) =>
    1 + getStatWithDefault(statsFromCustomSet, Stat.SUMMON),
  [Stat.PROSPECTING]: (statsFromCustomSet) =>
    100 +
    (statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.CHANCE) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.PROSPECTING)
      : 0),
  [Stat.DODGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.DODGE)
      : 0,
  [Stat.LOCK]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.LOCK)
      : 0,
  [Stat.AP_PARRY]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.AP_PARRY)
      : 0,
  [Stat.AP_REDUCTION]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.AP_REDUCTION)
      : 0,
  [Stat.MP_PARRY]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.MP_PARRY)
      : 0,
  [Stat.MP_REDUCTION]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.MP_REDUCTION)
      : 0,
  [Stat.NEUTRAL_DAMAGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.NEUTRAL_DAMAGE)
      : 0,
  [Stat.EARTH_DAMAGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.EARTH_DAMAGE)
      : 0,
  [Stat.FIRE_DAMAGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.FIRE_DAMAGE)
      : 0,
  [Stat.WATER_DAMAGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.WATER_DAMAGE)
      : 0,
  [Stat.AIR_DAMAGE]: (statsFromCustomSet) =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.AIR_DAMAGE)
      : 0,
  [Stat.PODS]: (statsFromCustomSet) =>
    1000 +
    getStatWithDefault(statsFromCustomSet, Stat.PODS) +
    getStatWithDefault(statsFromCustomSet, Stat.STRENGTH) * 5,
};

function isLeafCondition(
  conditionObj: TConditionObj,
): conditionObj is TCondition {
  return !!(
    (conditionObj as TCondition).operator &&
    (conditionObj as TCondition).stat &&
    (conditionObj as TCondition).value
  );
}

const getDefaultStatCalculator = (stat: Stat) => (
  statsFromCustomSet: StatsFromCustomSet,
) => getStatWithDefault(statsFromCustomSet, stat);

const evaluateLeafCondition = (
  customSet: CustomSet,
  statsFromCustomSet: StatsFromCustomSet,
  condition: TCondition,
) => {
  if (condition.stat === 'SET_BONUS') {
    const setBonuses = getBonusesFromCustomSet(customSet);
    const numberBonuses = Object.values(setBonuses).reduce(
      (acc, v) => acc + v.count - 1,
      0,
    );
    if (condition.operator === '<') {
      return numberBonuses < condition.value;
    }
    if (condition.operator === '>') {
      return numberBonuses > condition.value;
    }
  } else {
    const statCalculator =
      statCalculators[condition.stat] ||
      getDefaultStatCalculator(condition.stat);
    const value = statCalculator(statsFromCustomSet, customSet);
    if (condition.operator === '<') {
      return value < condition.value;
    }
    if (condition.operator === '>') {
      return value > condition.value;
    }
  }
  // eslint-disable-next-line no-console
  console.error('Unable to parse condition', condition);
  return true;
};

const traverseConditions = (
  customSet: CustomSet,
  statsFromCustomSet: StatsFromCustomSet,
  conditionsObj: TConditionObj,
): boolean => {
  if (isLeafCondition(conditionsObj)) {
    return evaluateLeafCondition(customSet, statsFromCustomSet, conditionsObj);
  }
  if (conditionsObj.and) {
    return conditionsObj.and.every((obj) =>
      traverseConditions(customSet, statsFromCustomSet, obj),
    );
  }
  if (conditionsObj.or) {
    return conditionsObj.or.some((obj) =>
      traverseConditions(customSet, statsFromCustomSet, obj),
    );
  }
  // eslint-disable-next-line no-console
  console.error('Unable to parse condition', conditionsObj);
  return true;
};

export const checkConditions = (
  customSet: CustomSet | null,
  statsFromCustomSet?: StatsFromCustomSet | null,
) => {
  const customSetStats = statsFromCustomSet || getStatsFromCustomSet(customSet);

  if (!customSet || !customSetStats) {
    return [];
  }

  const failingItems: Array<EquippedItem> = [];

  customSet.equippedItems.forEach((equippedItem) => {
    if (!customSetStats) {
      return;
    }
    const parsed = JSON.parse(equippedItem.item.conditions);
    if (parsed && parsed.conditions && Object.keys(parsed.conditions).length) {
      const conditionsObj = parsed.conditions;
      const pass = traverseConditions(customSet, customSetStats, conditionsObj);
      if (!pass) {
        failingItems.push(equippedItem);
      }
    }
  });

  return failingItems;
};

export const calcPointCost = (value: number, statKey: BaseStatKey) => {
  if (statKey === 'baseVitality') {
    return value;
  }
  if (statKey === 'baseWisdom') {
    return value * 3;
  }
  let numPoints = 0;
  let remainingValue = value;
  while (remainingValue > 0) {
    const modifier = Math.floor((remainingValue - 1) / 100) + 1;
    const numStats = ((remainingValue - 1) % 100) + 1;
    remainingValue -= numStats;
    numPoints += modifier * numStats;
  }
  return numPoints;
};

const findMultipleExoErrors = (customSet: CustomSet, stat: Stat) => {
  const equippedItemsWithExo = customSet.equippedItems.filter((equippedItem) =>
    equippedItem.exos.some(
      ({ stat: exoStat, value }) => exoStat === stat && value > 0,
    ),
  );

  const totalValueExo = equippedItemsWithExo.reduce(
    (acc, { exos }) =>
      acc + (exos.find((exo) => exo.stat === stat)?.value ?? 0),
    0,
  );

  if (totalValueExo > 1) {
    return equippedItemsWithExo;
  }

  return [];
};

export const getErrors = (
  customSet: CustomSet,
  statsFromCustomSet: StatsFromCustomSet,
) => {
  const failingItems = checkConditions(customSet, statsFromCustomSet);

  const errors = failingItems.map((equippedItem) => ({
    equippedItem,
    reason: 'CONDITION_NOT_MET',
  }));

  const groupedBySet = getBonusesFromCustomSet(customSet);

  Object.values(groupedBySet).forEach((setObj) => {
    const groupByItemId = groupBy(
      setObj.equippedItems,
      (equippedItem) => equippedItem.item.id,
    );
    const dupes = Object.values(groupByItemId).filter((arr) => arr.length > 1);
    dupes.forEach((dupe) => {
      dupe.forEach((equippedItem) =>
        errors.push({ equippedItem, reason: 'DUPLICATE_ITEM_IN_SET' }),
      );
    });
  });

  const dofusesAndTrophies = groupBy(
    customSet.equippedItems.filter(({ slot }) => slot.name === 'Dofus'),
    (equippedItem) => equippedItem.item.id,
  );

  const prysmaradites: Array<EquippedItem> = [];

  Object.values(dofusesAndTrophies).forEach((arr) => {
    arr.forEach((equippedItem) => {
      if (equippedItem.item.itemType.name === 'Prysmaradite') {
        prysmaradites.push(equippedItem);
      }

      if (arr.length > 1) {
        errors.push({ equippedItem, reason: 'DUPLICATE_DOFUS_OR_TROPHY' });
      }
    });
  });

  if (prysmaradites.length > 1) {
    prysmaradites.forEach((prysma) => {
      errors.push({ equippedItem: prysma, reason: 'MULTIPLE_PRYSMARADITES' });
    });
  }

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.AP).map((equippedItem) => ({
      equippedItem,
      reason: 'MULTIPLE_AP_EXO',
    })),
  );

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.MP).map((equippedItem) => ({
      equippedItem,
      reason: 'MULTIPLE_MP_EXO',
    })),
  );

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.RANGE).map((equippedItem) => ({
      equippedItem,
      reason: 'MULTIPLE_RANGE_EXO',
    })),
  );

  return errors;
};

export const renderErrors = (
  reason: string,
  t: TFunction,
  equippedItem?: EquippedItem,
  includeItemName?: boolean,
) => {
  if (reason === 'CONDITION_NOT_MET' && equippedItem && includeItemName) {
    return (
      <li key={`equipped-item-${equippedItem.id}-${reason}`}>
        <Trans i18nKey="common:CONDITION_NOT_MET_WITH_ITEM">
          The conditions for the item{' '}
          <strong css={{ fontWeight: 500 }}>
            {{ itemName: equippedItem.item.name }}
          </strong>{' '}
          have not been met.
        </Trans>
      </li>
    );
  }
  return <li key={`generic-${reason}`}>{t(reason, { ns: 'common' })}</li>;
};

export const getTitle = (title?: string | null) => {
  if (!title) {
    return 'DofusLab';
  }
  return `${title} - DofusLab`;
};

export const getCustomSetMetaDescription = (customSet?: CustomSet | null) => {
  if (!customSet) {
    return META_DESCRIPTION;
  }
  if (customSet.owner && customSet.name) {
    return `View ${customSet.owner.username}'s build ${customSet.name} on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  }
  if (customSet.owner) {
    return `View ${customSet.owner.username}'s untitled build on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  }
  if (customSet.name) {
    return `View the build ${customSet.name} on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  }
  return 'View this untitled build on DofusLab, the open-source set builder for the MMORPG Dofus';
};

export const getCustomSetMetaImage = (customSet?: CustomSet | null) => {
  if (!customSet) {
    return getImageUrl('logo/DL-Full_Dark_Filled_BG_1200x628.png');
  }
  return `https://32kom7xq5i.execute-api.us-east-2.amazonaws.com/${encodeURIComponent(
    customSet.name || 'Untitled',
  )}?${[...customSet.equippedItems]
    .sort((ei1, ei2) => ei1.slot.order - ei2.slot.order)
    .map((ei) => {
      const { imageUrl } = ei.item;
      const match = imageUrl.match(/item\/(\d+)\.png/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    })
    .filter((i) => i !== null)
    .map((i) => `items=${i}`)
    .join('&')}`;
};

export const getCanonicalUrl = (customSet?: CustomSet | null) => {
  if (customSet) {
    return `https://dofuslab.io/build/${customSet.id}`;
  }
  return 'https://dofuslab.io';
};

export const getInitialRangedState = (
  meleeOnly: boolean,
  rangedOnly: boolean,
  statsFromCustomSet: StatsFromCustomSet | null,
) => {
  let initialShowRanged = false;
  if (rangedOnly) {
    initialShowRanged = true;
  } else if (meleeOnly) {
    initialShowRanged = false;
  } else if (statsFromCustomSet) {
    initialShowRanged =
      getStatWithDefault(statsFromCustomSet, Stat.PCT_RANGED_DAMAGE) >=
      getStatWithDefault(statsFromCustomSet, Stat.PCT_MELEE_DAMAGE);
  }
  return initialShowRanged;
};

export const stripQueryString = (asPath: string) => {
  const index = asPath.indexOf('?');
  if (index >= 0) {
    return asPath.substring(0, index);
  }
  return asPath;
};

export const onSelectClass = (
  classes: Array<Class>,
  selectedClass: string,
  router: NextRouter,
) => {
  const idToName = classes.reduce((acc, { id, name }) => {
    return { ...acc, [id]: name };
  }, {} as { [key: string]: string });

  const { query } = router;

  const newQuery: { [key: string]: string | string[] } = {
    ...query,
    ...(idToName && { class: idToName?.[selectedClass] }),
  };
  const { customSetId, ...restNewQuery } = newQuery;

  router.replace(
    { pathname: router.pathname, query: newQuery },
    {
      pathname: stripQueryString(router.asPath),
      query: restNewQuery,
    },
  );
};

export const ClassicContext = React.createContext<
  [boolean, (v: boolean) => void]
>([
  false,
  () => {
    // no-op
  },
]);

export const EditableContext = React.createContext<boolean>(true);

export const CustomSetContext = React.createContext<{
  appliedBuffs: Array<AppliedBuff>;
  dispatch: React.Dispatch<AppliedBuffAction>;
  customSet?: CustomSet | null;
  customSetLoading: boolean;
  statsFromCustomSet: StatsFromCustomSet | null;
  statsFromAppliedBuffs: StatsFromAppliedBuffs;
  statsFromCustomSetWithBuffs: StatsFromCustomSet;
}>({
  appliedBuffs: [],
  dispatch: () => {
    // no-op
  },
  customSet: null,
  customSetLoading: false,
  statsFromCustomSet: null,
  statsFromAppliedBuffs: {},
  statsFromCustomSetWithBuffs: {},
});

export const useClassic = () => {
  const { data: sessionSettingsData } = useQuery<sessionSettings>(
    sessionSettingsQuery,
  );

  const [mutate] = useMutation<changeClassic, changeClassicVariables>(
    changeClassicMutation,
  );

  const [isClassic, setIsClassic] = React.useState<boolean>(
    sessionSettingsData?.classic ?? false,
  );

  React.useEffect(() => {
    let classic = Lockr.get<boolean | null>(IS_CLASSIC_STORAGE_KEY, null);
    if (classic === null) {
      classic = sessionSettingsData?.classic ?? null;
    }
    setIsClassic(classic || false);
  }, []);

  const client = useApolloClient();

  const onIsClassicChange = React.useCallback(
    (value: boolean) => {
      setIsClassic(value);
      Lockr.set(IS_CLASSIC_STORAGE_KEY, value);
      mutate({ variables: { classic: value } });
      if (sessionSettingsData) {
        client.writeQuery<sessionSettings>({
          query: sessionSettingsQuery,
          data: { ...sessionSettingsData, classic: value },
        });
      }
    },
    [client, sessionSettingsData, mutate],
  );

  return [isClassic, onIsClassicChange] as const;
};

export const usePublicBuildActions = (customSet: CustomSet) => {
  const { t } = useTranslation('common');
  const [copyMutate, { loading: copyLoading }] = useMutation<
    copyCustomSet,
    copyCustomSetVariables
  >(copyCustomSetMutation, {
    variables: { customSetId: customSet.id },
    refetchQueries: () => ['myCustomSets'],
  });
  const router = useRouter();

  const linkTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const onCopyLink = async () => {
    let url = `${window.location.protocol}//${window.location.host}/view/${customSet.id}/`;
    if (router.query.class) {
      const singleClass = Array.isArray(router.query.class)
        ? router.query.class[0]
        : router.query.class;
      url = `${url}?class=${singleClass}`;
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        if (!linkTextareaRef.current) {
          return;
        }
        linkTextareaRef.current.value = url;
        linkTextareaRef.current.focus();
        // https://stackoverflow.com/questions/32851485/make-clipboard-copy-paste-work-on-iphone-devices
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          const range = document.createRange();
          range.selectNodeContents(linkTextareaRef.current);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          linkTextareaRef.current.setSelectionRange(0, 999999);
        }
        linkTextareaRef.current.select();
        document.execCommand('copy');
      }
      notification.success({
        message: t('SUCCESS'),
        description: t('COPY_LINK_SUCCESS'),
      });
    } catch (e) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR_OCCURRED'),
      });
    }
  };

  const onCopyBuild = React.useCallback(async () => {
    const { data } = await copyMutate();
    if (data?.copyCustomSet) {
      navigateToNewCustomSet(router, data.copyCustomSet.customSet.id);
      notification.success({
        message: t('SUCCESS'),
        description: t('COPY_BUILD_SUCCESS'),
      });
    }
  }, [copyMutate, customSet, router]);

  return { copyLoading, onCopyLink, onCopyBuild, linkTextareaRef };
};

export const useIsOwnerOfCustomSet = (customSet?: CustomSet | null) => {
  if (!customSet) {
    return true;
  }
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);
  return customSet.owner?.id && customSet.owner.id === data?.currentUser?.id;
};

export const getBuildLink = (
  customSetId: string | undefined | null,
  query: ParsedUrlQuery,
) => {
  const baseAs = customSetId ? `/build/${customSetId}` : '/';
  const asQuery: { [key: string]: string } = {};
  if (query.class) {
    asQuery.class = Array.isArray(query.class) ? query.class[0] : query.class;
  }
  const hrefQuery = { ...asQuery };
  if (customSetId) {
    hrefQuery.customSetId = customSetId;
  }
  return {
    href: {
      pathname: '/',
      query: hrefQuery,
    },
    as: {
      pathname: baseAs,
      query: asQuery,
    },
  };
};

export const getTotalDamage = (
  summaries: Array<
    WeaponEffect | UnconditionalSpellEffect | ConditionalSpellEffect
  >,
) => ({
  nonCrit: {
    min: summaries
      .filter((e) => getSimpleEffect(e.type) === 'damage')
      .reduce((acc, curr) => acc + (curr.nonCrit.min || curr.nonCrit.max), 0),
    max: summaries
      .filter((e) => getSimpleEffect(e.type) === 'damage')
      .reduce((acc, curr) => acc + curr.nonCrit.max, 0),
  },
  crit: summaries.some((s) => !!s.crit)
    ? {
        min: summaries
          .filter((e) => getSimpleEffect(e.type) === 'damage')
          .reduce(
            (acc, curr) => acc + ((curr.crit?.min || curr.crit?.max) ?? 0),
            0,
          ),
        max: summaries
          .filter((e) => getSimpleEffect(e.type) === 'damage')
          .reduce((acc, curr) => acc + (curr.crit?.max ?? 0), 0),
      }
    : null,
});

export const getWeightedAverages = (
  summaries: Array<
    WeaponEffect | UnconditionalSpellEffect | ConditionalSpellEffect
  >,
  critRate: number | null,
) => {
  const averageNonCritDamage = summaries
    .filter(({ type }) => getSimpleEffect(type) === 'damage')
    .reduce((acc, { nonCrit }) => {
      const average = nonCrit.min
        ? (nonCrit.min + nonCrit.max) / 2
        : nonCrit.max;
      return acc + average;
    }, 0);

  const averageCritDamage = summaries
    .filter(({ type }) => getSimpleEffect(type) === 'damage')
    .reduce((acc, { crit }) => {
      if (acc === null || crit === null) {
        return null;
      }
      const average = crit.min ? (crit.min + crit.max) / 2 : crit.max;
      return acc + average;
    }, 0 as number | null);

  const weightedAverageDamage =
    averageCritDamage !== null && critRate
      ? averageCritDamage * (critRate / 100) +
        averageNonCritDamage * (1 - critRate / 100)
      : averageNonCritDamage;

  const averageNonCritHeal = summaries
    .filter(({ type }) => getSimpleEffect(type) === 'heal')
    .reduce((acc, { nonCrit }) => {
      const average = nonCrit.min
        ? (nonCrit.min + nonCrit.max) / 2
        : nonCrit.max;
      return acc + average;
    }, 0);

  const averageCritHeal = summaries
    .filter(({ type }) => getSimpleEffect(type) === 'heal')
    .reduce((acc, { crit }) => {
      if (acc === null || crit === null) {
        return null;
      }
      const average = crit.min ? (crit.min + crit.max) / 2 : crit.max;
      return acc + average;
    }, 0 as number | null);

  const weightedAverageHeal =
    averageCritHeal !== null && critRate
      ? averageCritHeal * (critRate / 100) +
        averageNonCritHeal * (1 - critRate / 100)
      : averageNonCritHeal;

  return {
    weightedAverageDamage,
    weightedAverageHeal,
  };
};

export const useToggleFavoriteMutation = (item: Item) => {
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);

  const isFavorite = (data?.currentUser?.favoriteItems ?? [])
    .map((fi) => fi.id)
    .includes(item.id);

  return {
    isFavorite,
    mutationResult: useMutation<
      toggleFavoriteItem,
      toggleFavoriteItemVariables
    >(toggleFavoriteItemMutation, {
      variables: { isFavorite: !isFavorite, itemId: item.id },
      optimisticResponse:
        (data?.currentUser && {
          toggleFavoriteItem: {
            user: {
              ...data.currentUser,
              favoriteItems: isFavorite
                ? data.currentUser.favoriteItems.filter(
                    (fi) => fi.id !== item.id,
                  )
                : [...data.currentUser.favoriteItems, item],
            },
            __typename: 'ToggleFavoriteItem',
          },
        }) ||
        undefined,
    }),
  };
};

export const appliedBuffsReducer = (
  state: Array<AppliedBuff>,
  action: AppliedBuffAction,
): Array<AppliedBuff> => {
  switch (action.type) {
    case AppliedBuffActionType.ADD_STACK: {
      const newState = [...state];
      let idx = state.findIndex(({ buff: { id } }) => id === action.buff.id);
      if (idx === -1) {
        newState.push({
          spell: action.spell,
          item: action.item,
          buff: action.buff,
          numStacks: 0,
          numCritStacks: 0,
        });
        idx = newState.length - 1;
      }
      const { buff, numStacks, numCritStacks } = newState[idx];
      if (buff.maxStacks && numStacks + numCritStacks >= buff.maxStacks) {
        return state;
      }
      const key = action.isCrit ? 'numCritStacks' : 'numStacks';
      newState[idx] = { ...newState[idx], [key]: newState[idx][key] + 1 };
      return newState;
    }
    case AppliedBuffActionType.MAX_STACKS: {
      const newState = [...state];
      let idx = state.findIndex(({ buff: { id } }) => id === action.buff.id);
      if (idx === -1) {
        newState.push({
          spell: action.spell,
          item: action.item,
          buff: action.buff,
          numStacks: 0,
          numCritStacks: 0,
        });
        idx = newState.length - 1;
      }
      const { buff, numStacks, numCritStacks } = newState[idx];
      if (
        !buff.maxStacks ||
        (buff.maxStacks && numStacks + numCritStacks >= buff.maxStacks)
      ) {
        return state;
      }
      const key = action.isCrit ? 'numCritStacks' : 'numStacks';
      const otherKey = action.isCrit ? 'numStacks' : 'numCritStacks';
      newState[idx] = {
        ...newState[idx],
        [key]: buff.maxStacks - newState[idx][otherKey],
      };
      return newState;
    }
    case AppliedBuffActionType.REMOVE_BUFF: {
      return state.filter(({ buff: { id } }) => id !== action.buffId);
    }
    case AppliedBuffActionType.CLEAR_ALL: {
      return [];
    }
    default:
      throw new Error('Invalid action type');
  }
};

export const useClassId = () => {
  const router = useRouter();
  const { query } = router;
  const { data } = useQuery<classesQueryType>(classesQuery);

  const nameToId = data?.classes.reduce((acc, { id, allNames }) => {
    const obj = { ...acc };
    allNames.forEach((className) => {
      obj[className] = id;
    });
    return obj;
  }, {} as { [key: string]: string });

  const selectedClassName = Array.isArray(query.class)
    ? query.class[0]
    : query.class;
  const selectedClassId = selectedClassName && nameToId?.[selectedClassName];
  return selectedClassId;
};

export const getStatsFromAppliedBuffs = (appliedBuffs: Array<AppliedBuff>) =>
  appliedBuffs.reduce((stats: StatsFromAppliedBuffs, ab: AppliedBuff) => {
    const buffValue =
      ab.numCritStacks * (ab.buff.critIncrementBy || 0) +
      ab.numStacks * (ab.buff.incrementBy || 0);
    const a = stats[ab.buff.stat] || 0;
    const result = {
      ...stats,
      [ab.buff.stat]: a + buffValue,
    } as StatsFromAppliedBuffs;
    return result;
  }, {} as StatsFromAppliedBuffs);

export const combineStatsWithBuffs = (
  statsFromCustomSet: StatsFromCustomSet | null,
  statsFromAppliedBuffs: StatsFromAppliedBuffs,
) => {
  const statsFromCustomSetWithBuffs = Object.entries(
    statsFromAppliedBuffs,
  ).reduce((totalStats, [k, v]) => {
    return {
      ...totalStats,
      [k]: (totalStats[k] || 0) + v,
    } as StatsFromCustomSet;
  }, statsFromCustomSet || ({} as StatsFromCustomSet));
  return statsFromCustomSetWithBuffs;
};

export const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
};
