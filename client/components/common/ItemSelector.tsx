/** @jsxImportSource @emotion/react */

import { useCallback, useState, useEffect } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { getResponsiveGridStyle } from 'common/mixins';
import { mq, getSelectorNumCols, ITEMS_PAGE_SIZE } from 'common/constants';
import { Item, ItemSet } from 'common/type-aliases';
import {
  findEmptyOrOnlySlotId,
  findNextEmptySlotIds,
  useEquipItemMutation,
} from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { FilterState } from 'common/types';
import SetModal from './SetModal';

import SkeletonCardsLoader from './SkeletonCardsLoader';
import ItemCardWithContext, { SharedProps } from './ItemCardWithContext';

const THRESHOLD = 600;

type Props = SharedProps & {
  filters: FilterState;
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
      // Keep the server-rendered first page visible during hydration while the
      // browser bootstraps or refreshes the complete IndexedDB catalog.
      fetchPolicy:
        typeof window === 'undefined' ? 'cache-first' : 'cache-and-network',
      variables: {
        first: ITEMS_PAGE_SIZE,
        filters: queryFilters,
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

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const keyIndex = Number(e.key) - 1;

      if (!data) return;

      if (Number.isInteger(keyIndex) && keyIndex >= 0 && keyIndex <= 8) {
        if (data.items.edges[keyIndex]) {
          equipItem(data.items.edges[keyIndex].node);
        }
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [data]);

  return (
    <InfiniteScroll
      hasMore={data?.items.pageInfo.hasNextPage}
      loadMore={onLoadMore}
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
          length={data?.items.edges.length}
          isClassic
        />
      }
      useWindow={isMobile}
    >
      {loading && !data ? (
        <SkeletonCardsLoader
          key="loader"
          isClassic
          multiplier={2}
        />
      ) : (
        <>
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
