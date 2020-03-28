import React, { useCallback } from 'react';
import { useMutation, useApolloClient, useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { ApolloClient, ApolloError } from 'apollo-boost';
import notification from 'antd/lib/notification';
import { cloneDeep } from 'lodash';
import { TFunction } from 'next-i18next';
import CustomSetFragment from 'graphql/fragments/customSet.graphql';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import {
  customSet_stats,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';
import {
  StatsFromCustomSet,
  SetCounter,
  OriginalStatLine,
  ExoStatLine,
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
import { useTranslation } from 'i18n';
import {
  equipSet,
  equipSetVariables,
} from 'graphql/mutations/__generated__/equipSet';
import {
  itemSlots,
  itemSlots_itemSlots,
} from 'graphql/queries/__generated__/itemSlots';

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
        ? { ...setObj, count: setObj.count + 1, items: [...setObj.items, item] }
        : { set, count: 1, items: [equippedItem.item] };
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

      if (
        data?.updateCustomSetItem &&
        data.updateCustomSetItem.customSet.id !== customSetId
      ) {
        router.replace(
          {
            pathname: '/',
            query: { customSetId: data.updateCustomSetItem.customSet.id },
          },
          `/set/${data.updateCustomSetItem.customSet.id}`,
          {
            shallow: true,
          },
        );
      }
    },
    [updateCustomSetItem, customSetId, item],
  );

  return onClick;
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
  });

  const client = useApolloClient();

  const { t } = useTranslation('common');

  const onClick = useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return;
    try {
      const { data: resultData } = await equipSet();

      if (resultData?.equipSet?.customSet.id !== routerSetId) {
        router.replace(
          {
            pathname: '/',
            query: { customSetId: resultData?.equipSet?.customSet.id },
          },
          `/set/${resultData?.equipSet?.customSet.id}`,
          {
            shallow: true,
          },
        );
      }
    } catch (e) {
      notification.error(e);
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
  }, [mutate]);
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
