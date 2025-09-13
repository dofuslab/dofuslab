/** @jsxImportSource @emotion/react */

import { useCallback, useState, useEffect } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import ItemsQuery from 'graphql/queries/items.query';
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
import ItemSlotsQuery from 'graphql/queries/itemSlots.query';
import SetModal from './SetModal';

import SkeletonCardsLoader from './SkeletonCardsLoader';
import ItemCardWithContext, { SharedProps } from './ItemCardWithContext';

const THRESHOLD = 600;

type Props = SharedProps & {
  filters: SharedFilters;
  itemTypeIds: Set<string>;
};

const ItemSelector = ({
  selectedItemSlot,
  customSet,
  selectItemSlot,
  customSetItemIds,
  filters,
  itemTypeIds,
  isMobile,
  isClassic,
}: Props) => {
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
        eligibleItemTypeIds:
          selectedItemSlot?.itemTypes.map((type) => type.id) ?? [],
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

  const onLoadMore = useCallback(async () => {
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

  const [setModalOpen, setSetModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<ItemSet | null>(null);

  const openSetModal = useCallback(
    (set: ItemSet) => {
      setSelectedSet(set);
      setSetModalOpen(true);
    },
    [setSelectedSet, setSetModalOpen],
  );

  const closeSetModal = useCallback(() => {
    setSetModalOpen(false);
  }, [setSetModalOpen]);

  const mutate = useEquipItemMutation();

  const equipItem = useCallback(
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

  useEffect(() => {
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
          open={setModalOpen}
          onCancel={closeSetModal}
          customSet={customSet}
          shouldRedirect={isMobile || isClassic}
        />
      )}
    </InfiniteScroll>
  );
};

export default ItemSelector;
