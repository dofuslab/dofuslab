import React, { useCallback } from 'react';
import { useMutation, useApolloClient, useQuery } from '@apollo/react-hooks';
import { useRouter, NextRouter } from 'next/router';
import { ApolloClient, ApolloError } from 'apollo-boost';
import { notification } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import { TFunction } from 'next-i18next';
import CustomSetFragment from 'graphql/fragments/customSet.graphql';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import {
  customSet_stats,
  customSet,
  customSet_equippedItems,
} from 'graphql/fragments/__generated__/customSet';
import {
  Stat,
  WeaponEffectType,
  SpellEffectType,
  WeaponElementMage,
} from '__generated__/globalTypes';
import {
  StatsFromCustomSet,
  SetCounter,
  OriginalStatLine,
  ExoStatLine,
  ICalcDamageInput,
  TSimpleEffect,
  TCondition,
  TConditionObj,
  StatCalculator,
  BaseStatKey,
} from './types';
import {
  item_itemType,
  item,
  item_set,
} from 'graphql/fragments/__generated__/item';
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
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.graphql';
import { useTranslation, Trans } from 'i18n';
import {
  equipSet,
  equipSetVariables,
} from 'graphql/mutations/__generated__/equipSet';
import {
  itemSlots,
  itemSlots_itemSlots,
} from 'graphql/queries/__generated__/itemSlots';
import {
  equipItems,
  equipItemsVariables,
} from 'graphql/mutations/__generated__/equipItems';
import EquipItemsMutation from 'graphql/mutations/equipItems.graphql';
import { META_DESCRIPTION } from './constants';

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

export const getStatsFromCustomSet = (customSet?: customSet | null) => {
  if (!customSet) {
    return null;
  }

  const statsFromCustomSet: StatsFromCustomSet = customSet.equippedItems.reduce(
    (acc, { item, exos }) => {
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
      exos.forEach(statLine => {
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
          .filter(
            bonus => bonus.numItems === count && !!bonus.stat && !!bonus.value,
          )
          .map(({ stat, value }) => ({ [stat!]: value! })),
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
        ? {
            ...setObj,
            count: setObj.count + 1,
            equippedItems: [...setObj.equippedItems, equippedItem],
          }
        : { set, count: 1, equippedItems: [equippedItem] };
    }
  }

  const filteredSets = Object.entries(sets).filter(
    ([_, setObj]) => setObj.count > 1,
  );

  const result = filteredSets.reduce((obj, [setId, setWithCount]) => {
    obj[setId] = setWithCount;
    return obj;
  }, {} as SetCounter);

  return result;
};

export const findNextEmptySlotId = (
  itemType: item_itemType,
  currentSlotId: string,
  customSet?: customSet | null,
) => {
  const eligibleItemSlots = [...itemType.eligibleItemSlots].sort(
    (i, j) => i.order - j.order,
  );
  if (!customSet) {
    return eligibleItemSlots.find(slot => slot.id !== currentSlotId) || null;
  }
  const occupiedSlotsSet = customSet.equippedItems.reduce((set, curr) => {
    set.add(curr.slot.id);
    return set;
  }, new Set<string>());
  for (const slot of eligibleItemSlots) {
    if (!occupiedSlotsSet.has(slot.id) && slot.id !== currentSlotId) {
      return slot.id;
    }
  }
  return null;
};

export const findEmptySlotId = (
  itemType: item_itemType,
  customSet?: customSet | null,
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
  for (const slot of eligibleItemSlots) {
    if (!occupiedSlotsSet.has(slot.id)) {
      return slot.id;
    }
  }
  return null;
};

export const findEmptyOrOnlySlotId = (
  itemType: item_itemType,
  customSet?: customSet | null,
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
  customSet?: customSet | null,
) => {
  const { data } = await client.query<currentUser>({ query: CurrentUserQuery });
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

export const useEquipItemMutation = (item: item) => {
  const router = useRouter();
  const { customSetId: routerCustomSetId } = router.query;

  const customSetId: string | null = routerCustomSetId
    ? String(routerCustomSetId)
    : null;

  const client = useApolloClient();

  const { data: itemSlotsData } = useQuery<itemSlots>(ItemSlotsQuery);

  const [updateCustomSetItem] = useMutation<
    updateCustomSetItem,
    updateCustomSetItemVariables
  >(UpdateCustomSetItemMutation, {
    refetchQueries: () => ['myCustomSets'],
    optimisticResponse:
      customSetId && itemSlotsData
        ? ({ itemSlotId }) => {
            const customSet = getCustomSet(client, customSetId)!;

            const { equippedItems: oldEquippedItems } = customSet;

            const equippedItems = [...oldEquippedItems];

            const oldEquippedItemIdx = oldEquippedItems.findIndex(
              equippedItem => equippedItem.slot.id === itemSlotId,
            );

            const slot = itemSlotsData.itemSlots.find(
              slot => slot.id === itemSlotId,
            ) as itemSlots_itemSlots;

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
      const { data } = await updateCustomSetItem({
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
    [updateCustomSetItem, customSetId, item],
  );

  return onClick;
};

export const useEquipItemsMutation = (
  itemIds: Array<string>,
  customSet?: customSet | null,
): [
  () => Promise<void>,
  { data?: equipItems; loading: boolean; error?: ApolloError },
] => {
  const router = useRouter();
  const { customSetId: routerSetId } = router.query;

  const [equipItems, { data, loading, error }] = useMutation<
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
    const { data: resultData } = await equipItems();

    if (resultData?.equipMultipleItems?.customSet) {
      navigateToNewCustomSet(
        router,
        resultData.equipMultipleItems.customSet.id,
      );
    }
  }, [equipItems, routerSetId, router]);

  return [onClick, { data, loading, error }];
};

export const useEquipSetMutation = (
  setId: string,
  customSet?: customSet | null,
): [
  () => Promise<void>,
  { data?: equipSet; loading: boolean; error?: ApolloError },
] => {
  const router = useRouter();
  const { customSetId: routerSetId } = router.query;

  const [equipSet, { data, loading, error }] = useMutation<
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
    const { data: resultData } = await equipSet();

    if (resultData?.equipSet) {
      navigateToNewCustomSet(router, resultData.equipSet.customSet.id);
    }
  }, [equipSet, routerSetId, router]);

  return [onClick, { data, loading, error }];
};

export const useDeleteItemMutation = (
  itemSlotId: string,
  customSet: customSet,
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
              .filter(equippedItem => equippedItem.slot.id !== slotId)
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

export const getCustomSet = (
  client: ApolloClient<object>,
  customSetId: string,
) => {
  const customSet = client.readFragment<customSet>(
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

export const useSetModal = () => {
  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<item_set | null>(null);

  const openSetModal = React.useCallback(
    (set: item_set) => {
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

const getStats = (effectType: WeaponEffectType | SpellEffectType) => {
  switch (effectType) {
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
  damageTypeInput: ICalcDamageInput,
  weaponSkillPower?: number,
) => {
  const statTypes = getStats(effectType);
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
  (level / 2 + (getStatWithDefault(stats, Stat.PUSHBACK_DAMAGE) + 32)) *
  (numSquaresPushed / 4);

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
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg';
    case WeaponEffectType.EARTH_DAMAGE:
    case WeaponEffectType.EARTH_STEAL:
    case SpellEffectType.EARTH_DAMAGE:
    case SpellEffectType.EARTH_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg';
    case WeaponEffectType.FIRE_DAMAGE:
    case WeaponEffectType.FIRE_STEAL:
    case SpellEffectType.FIRE_DAMAGE:
    case SpellEffectType.FIRE_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg';
    case WeaponEffectType.NEUTRAL_DAMAGE:
    case WeaponEffectType.NEUTRAL_STEAL:
    case SpellEffectType.NEUTRAL_DAMAGE:
    case SpellEffectType.NEUTRAL_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral.svg';
    case WeaponEffectType.WATER_DAMAGE:
    case WeaponEffectType.WATER_STEAL:
    case SpellEffectType.WATER_DAMAGE:
    case SpellEffectType.WATER_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg';
    case WeaponEffectType.AP:
    case SpellEffectType.AP:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Action_Point.svg';
    case WeaponEffectType.MP:
    case SpellEffectType.MP:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Movement_Point.svg';
    case WeaponEffectType.HP_RESTORED:
    case SpellEffectType.HP_RESTORED:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Health_Point.svg';
    case SpellEffectType.SHIELD:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Shield_Point.svg';
    case SpellEffectType.PUSHBACK_DAMAGE:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pushback_Damage.svg';
  }
};

export const getSimpleEffect: (
  effectType: WeaponEffectType | SpellEffectType,
) => TSimpleEffect = effectType => {
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
  }
};

export const calcEffect = (
  baseDamage: number,
  effectType: WeaponEffectType | SpellEffectType,
  level: number,
  stats: StatsFromCustomSet | null,
  damageTypeInput: ICalcDamageInput,
  damageTypeKey: 'melee' | 'ranged',
  weaponSkillPower?: number,
) => {
  const simpleEffect = getSimpleEffect(effectType);

  if (simpleEffect === 'heal') {
    return calcHeal(baseDamage, stats, weaponSkillPower);
  } else if (simpleEffect === 'pushback_damage') {
    return calcPushbackDamage(baseDamage, level, stats);
  } else if (simpleEffect === 'damage') {
    return calcDamage(
      baseDamage,
      effectType,
      stats,
      damageTypeInput,
      weaponSkillPower,
    )[damageTypeKey];
  } else if (simpleEffect === 'shield') {
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
  [Stat.MP]: statsFromCustomSet =>
    3 + getStatWithDefault(statsFromCustomSet, Stat.MP),
  [Stat.INITIATIVE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.STRENGTH) +
        getStatWithDefault(statsFromCustomSet, Stat.INTELLIGENCE) +
        getStatWithDefault(statsFromCustomSet, Stat.CHANCE) +
        getStatWithDefault(statsFromCustomSet, Stat.AGILITY) +
        getStatWithDefault(statsFromCustomSet, Stat.INITIATIVE)
      : 0,
  [Stat.SUMMON]: statsFromCustomSet =>
    1 + getStatWithDefault(statsFromCustomSet, Stat.SUMMON),
  [Stat.PROSPECTING]: statsFromCustomSet =>
    100 +
    (statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.CHANCE) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.PROSPECTING)
      : 0),
  [Stat.DODGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.DODGE)
      : 0,
  [Stat.LOCK]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.LOCK)
      : 0,
  [Stat.AP_PARRY]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.AP_PARRY)
      : 0,
  [Stat.AP_REDUCTION]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.AP_REDUCTION)
      : 0,
  [Stat.MP_PARRY]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.MP_PARRY)
      : 0,
  [Stat.MP_REDUCTION]: statsFromCustomSet =>
    statsFromCustomSet
      ? Math.floor(getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10) +
        getStatWithDefault(statsFromCustomSet, Stat.MP_REDUCTION)
      : 0,
  [Stat.NEUTRAL_DAMAGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.NEUTRAL_DAMAGE)
      : 0,
  [Stat.EARTH_DAMAGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.EARTH_DAMAGE)
      : 0,
  [Stat.FIRE_DAMAGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.FIRE_DAMAGE)
      : 0,
  [Stat.WATER_DAMAGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.WATER_DAMAGE)
      : 0,
  [Stat.AIR_DAMAGE]: statsFromCustomSet =>
    statsFromCustomSet
      ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
        getStatWithDefault(statsFromCustomSet, Stat.AIR_DAMAGE)
      : 0,
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
  customSet: customSet,
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
    } else if (condition.operator === '>') {
      return numberBonuses > condition.value;
    }
  } else {
    const statCalculator =
      statCalculators[condition.stat] ||
      getDefaultStatCalculator(condition.stat);
    const value = statCalculator(statsFromCustomSet, customSet);
    if (condition.operator === '<') {
      return value < condition.value;
    } else if (condition.operator === '>') {
      return value > condition.value;
    }
  }
  console.error('Unable to parse condition', condition);
  return true;
};

const traverseConditions = (
  customSet: customSet,
  statsFromCustomSet: StatsFromCustomSet,
  conditionsObj: TConditionObj,
): boolean => {
  if (isLeafCondition(conditionsObj)) {
    return evaluateLeafCondition(customSet, statsFromCustomSet, conditionsObj);
  } else if (conditionsObj.and) {
    return conditionsObj.and.every(obj =>
      traverseConditions(customSet, statsFromCustomSet, obj),
    );
  } else if (conditionsObj.or) {
    return conditionsObj.or.some(obj =>
      traverseConditions(customSet, statsFromCustomSet, obj),
    );
  }
  console.error('Unable to parse condition', conditionsObj);
  return true;
};

export const checkConditions = (
  customSet: customSet | null,
  statsFromCustomSet?: StatsFromCustomSet | null,
) => {
  let customSetStats = statsFromCustomSet
    ? statsFromCustomSet
    : getStatsFromCustomSet(customSet);

  if (!customSet || !customSetStats) {
    return [];
  }

  const failingItems: Array<customSet_equippedItems> = [];

  customSet.equippedItems.forEach(equippedItem => {
    const parsed = JSON.parse(equippedItem.item.conditions);
    if (parsed && parsed.conditions && Object.keys(parsed.conditions).length) {
      const conditionsObj = parsed.conditions;
      const pass = traverseConditions(
        customSet,
        customSetStats!,
        conditionsObj,
      );
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
  } else if (statKey === 'baseWisdom') {
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

const findMultipleExoErrors = (customSet: customSet, stat: Stat) => {
  const equippedItemsWithExo = customSet.equippedItems.filter(equippedItem =>
    equippedItem.exos.some(
      ({ stat: exoStat, value }) => exoStat === stat && value > 0,
    ),
  );

  const totalValueExo = equippedItemsWithExo.reduce(
    (acc, { exos }) => acc + (exos.find(exo => exo.stat === stat)?.value ?? 0),
    0,
  );

  if (totalValueExo > 1) {
    return equippedItemsWithExo;
  }

  return [];
};

export const getErrors = (
  customSet: customSet,
  statsFromCustomSet: StatsFromCustomSet,
) => {
  const failingItems = checkConditions(customSet, statsFromCustomSet);

  const errors = failingItems.map(equippedItem => ({
    equippedItem,
    reason: 'CONDITION_NOT_MET',
  }));

  const groupedBySet = getBonusesFromCustomSet(customSet);

  Object.values(groupedBySet).forEach(setObj => {
    const groupByItemId = groupBy(
      setObj.equippedItems,
      equippedItem => equippedItem.item.id,
    );
    const dupes = Object.values(groupByItemId).filter(arr => arr.length > 1);
    dupes.forEach(dupe => {
      dupe.forEach(equippedItem =>
        errors.push({ equippedItem, reason: 'DUPLICATE_ITEM_IN_SET' }),
      );
    });
  });

  const dofusesAndTrophies = groupBy(
    customSet.equippedItems.filter(({ slot }) => slot.name === 'Dofus'),
    equippedItem => equippedItem.item.id,
  );

  const prysmaradites: Array<customSet_equippedItems> = [];

  Object.values(dofusesAndTrophies).forEach(arr => {
    arr.forEach(equippedItem => {
      if (equippedItem.item.itemType.name === 'Prysmaradite') {
        prysmaradites.push(equippedItem);
      }

      if (arr.length > 1) {
        errors.push({ equippedItem, reason: 'DUPLICATE_DOFUS_OR_TROPHY' });
      }
    });
  });

  if (prysmaradites.length > 1) {
    prysmaradites.forEach(prysma => {
      errors.push({ equippedItem: prysma, reason: 'MULTIPLE_PRYSMARADITES' });
    });
  }

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.AP).map(equippedItem => ({
      equippedItem,
      reason: 'MULTIPLE_AP_EXO',
    })),
  );

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.MP).map(equippedItem => ({
      equippedItem,
      reason: 'MULTIPLE_MP_EXO',
    })),
  );

  errors.push(
    ...findMultipleExoErrors(customSet, Stat.RANGE).map(equippedItem => ({
      equippedItem,
      reason: 'MULTIPLE_RANGE_EXO',
    })),
  );

  return errors;
};

export const renderErrors = (
  reason: string,
  t: TFunction,
  equippedItem?: customSet_equippedItems,
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

export const getCustomSetMetaDescription = (customSet?: customSet | null) => {
  if (!customSet) {
    return META_DESCRIPTION;
  }
  if (customSet.owner && customSet.name) {
    return `View ${customSet.owner.username}'s build ${customSet.name} on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  } else if (customSet.owner) {
    return `View ${customSet.owner.username}'s untitled build on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  } else if (customSet.name) {
    return `View the build ${customSet.name} on DofusLab, the open-source set builder for the MMORPG Dofus.`;
  }
  return 'View this untitled build on DofusLab, the open-source set builder for the MMORPG Dofus';
};

export const getCanonicalUrl = (customSet?: customSet | null) => {
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
