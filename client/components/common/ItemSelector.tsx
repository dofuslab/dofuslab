/** @jsxImportSource @emotion/react */

import React from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { getResponsiveGridStyle } from 'common/mixins';
import { SharedFilters } from 'common/types';
import { mq, getSelectorNumCols, ITEMS_PAGE_SIZE } from 'common/constants';
import { Item, ItemSet } from 'common/type-aliases';
import {
  findEmptyOrOnlySlotId,
  findNextEmptySlotIds,
  isUUID,
  useEquipItemMutation,
} from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import SetModal from './SetModal';

import SkeletonCardsLoader from './SkeletonCardsLoader';
import ItemCardWithContext, { SharedProps } from './ItemCardWithContext';

const THRESHOLD = 600;

type Props = SharedProps & {
  filters: SharedFilters;
  itemTypeIds: Set<string>;
};

const ItemSelector: React.FC<Props> = ({
  selectedItemSlot,
  customSet,
  selectItemSlot,
  customSetItemIds,
  filters,
  itemTypeIds,
  isMobile,
  isClassic,
}) => {
  const itemTypeIdsArr = Array.from(itemTypeIds);
  const queryFilters = {
    ...filters,
    itemTypeIds:
      selectedItemSlot && itemTypeIdsArr.length === 0
        ? selectedItemSlot.itemTypes.map((type) => type.id)
        : itemTypeIdsArr,
  };

  const { data, loading, fetchMore } = useQuery<items, itemsVariables>(
    ItemsQuery,
    {
      variables: {
        first: ITEMS_PAGE_SIZE,
        filters: queryFilters,
        itemSlotId: selectedItemSlot?.id,
        // filter required because of optimistic equipped item IDs that have the form of `equipped-item-{item UUID}`
        // and to prevent dofuses from being used in item suggestion algorithm
        equippedItemIds:
          customSet?.equippedItems
            .filter((ei) => isUUID(ei.id) && ei.slot.enName !== 'Dofus')
            .map((ei) => ei.id) ?? [],
        level: customSet?.level ?? 200,
      },
    },
  );

  const { data: itemSlotsData } = useQuery<itemSlots>(ItemSlotsQuery);

  const onLoadMore = React.useCallback(async () => {
    if (!data || !data.items.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    const fetchMoreResult = await fetchMore({
      variables: { after: data.items.pageInfo.endCursor },
    });
    return fetchMoreResult;
  }, [data, loading]);

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

  const mutate = useEquipItemMutation();

  const equipItem = React.useCallback(
    (item: Item) => {
      if (isClassic || isMobile) return;
      const remainingSlotIds = selectedItemSlot
        ? findNextEmptySlotIds(item.itemType, selectedItemSlot.id, customSet)
        : [];
      const itemSlotId =
        selectedItemSlot?.id || findEmptyOrOnlySlotId(item.itemType, customSet);
      const nextSlotId = remainingSlotIds[0];
      if (itemSlotId) {
        let nextSlot = null;
        if (nextSlotId && itemSlotsData) {
          nextSlot =
            itemSlotsData.itemSlots.find((slot) => slot.id === nextSlotId) ||
            null;
        }
        if (selectItemSlot) {
          selectItemSlot(nextSlot);
        }

        mutate(itemSlotId, item);
      }
    },
    [mutate, selectItemSlot, selectedItemSlot, customSet, isClassic],
  );

  const filtersUnchanged =
    !filters.search &&
    (!customSet || filters.maxLevel === customSet.level) &&
    filters.stats.length === 0 &&
    itemTypeIdsArr.length === 0;

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const keyIndex = Number(e.key) - 1;

      if (!data) return;

      const numSuggestions = data.itemSuggestions.length;

      if (Number.isInteger(keyIndex) && keyIndex >= 0 && keyIndex <= 8) {
        if (filtersUnchanged) {
          if (keyIndex < numSuggestions) {
            equipItem(data.itemSuggestions[keyIndex]);
          } else {
            const idx = keyIndex - numSuggestions;

            if (data.items.edges[idx]) {
              equipItem(data.items.edges[idx].node);
            }
          }
        } else if (data.items.edges[keyIndex]) {
          equipItem(data.items.edges[keyIndex].node);
        }
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [data, filtersUnchanged]);

  return (
    <InfiniteScroll
      hasMore={data?.items.pageInfo.hasNextPage}
      loadMore={onLoadMore}
      useWindow={isMobile || isClassic}
      threshold={THRESHOLD}
      css={{
        ...getResponsiveGridStyle(getSelectorNumCols(isClassic)),
        marginTop: 12,
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        minWidth: 0,
        [mq[1]]: { gridGap: 12 },
      }}
      loader={
        <SkeletonCardsLoader
          key="loader"
          length={data && data.items.edges.length + data.itemSuggestions.length}
          isClassic
        />
      }
    >
      {loading ? (
        <SkeletonCardsLoader
          key="loader"
          length={data && data.items.edges.length + data.itemSuggestions.length}
          isClassic
          multiplier={2}
        />
      ) : (
        <>
          {filtersUnchanged &&
            data?.itemSuggestions.map((item) => (
              <ItemCardWithContext
                key={`suggestion-${item.id}`}
                item={item}
                selectedItemSlot={selectedItemSlot}
                selectItemSlot={selectItemSlot}
                isMobile={isMobile}
                isClassic={isClassic}
                customSetItemIds={customSetItemIds}
                openSetModal={openSetModal}
                isSuggestion
                customSet={customSet}
              />
            ))}
          {data &&
            data.items.edges
              .map((edge) => edge.node)
              .map((item) => (
                <ItemCardWithContext
                  key={item.id}
                  item={item}
                  selectedItemSlot={selectedItemSlot}
                  selectItemSlot={selectItemSlot}
                  isMobile={isMobile}
                  isClassic={isClassic}
                  customSetItemIds={customSetItemIds}
                  openSetModal={openSetModal}
                  customSet={customSet}
                />
              ))}
        </>
      )}
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
          shouldRedirect={isMobile || isClassic}
        />
      )}
    </InfiniteScroll>
  );
};

export default ItemSelector;
