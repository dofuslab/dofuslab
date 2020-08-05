/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { getResponsiveGridStyle } from 'common/mixins';
import { SharedFilters } from 'common/types';
import { findEmptyOrOnlySlotId, findNextEmptySlotIds } from 'common/utils';
import { mq, getSelectorNumCols } from 'common/constants';
import { ItemSlot, CustomSet, ItemSet } from 'common/type-aliases';
import ConfirmReplaceItemPopover from '../desktop/ConfirmReplaceItemPopover';
import SetModal from './SetModal';
import ItemCard from './ItemCard';

import SkeletonCardsLoader from './SkeletonCardsLoader';

const PAGE_SIZE = 24;

const THRESHOLD = 600;

interface Props {
  selectedItemSlot: ItemSlot | null;
  customSet?: CustomSet | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  customSetItemIds: Set<string>;
  filters: SharedFilters;
  itemTypeIds: Set<string>;
  isMobile: boolean;
  isClassic: boolean;
}

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
      variables: { first: PAGE_SIZE, filters: queryFilters },
    },
  );

  const onLoadMore = React.useCallback(async () => {
    if (!data || !data.items.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    const fetchMoreResult = await fetchMore({
      variables: { after: data.items.pageInfo.endCursor },
      updateQuery: (prevData, { fetchMoreResult: result }) => {
        if (
          !result ||
          result.items.pageInfo.endCursor === prevData.items.pageInfo.endCursor
        ) {
          return prevData;
        }
        return {
          ...prevData,
          items: {
            ...prevData.items,
            edges: [...prevData.items.edges, ...result.items.edges],
            pageInfo: result.items.pageInfo,
          },
        };
      },
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

  return (
    <InfiniteScroll
      hasMore={data?.items.pageInfo.hasNextPage}
      loader={
        <SkeletonCardsLoader
          key="loader"
          length={data?.items.edges.length}
          isClassic
        />
      }
      loadMore={onLoadMore}
      css={{
        ...getResponsiveGridStyle(getSelectorNumCols(isClassic)),
        marginTop: 12,
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        minWidth: 0,
        [mq[1]]: { gridGap: 12 },
      }}
      useWindow={isMobile || isClassic}
      threshold={THRESHOLD}
    >
      {loading ? (
        <SkeletonCardsLoader key="initial-loader" multiplier={2} isClassic />
      ) : (
        (data?.items.edges ?? [])
          .map((edge) => edge.node)
          .map((item) => {
            const itemSlotId =
              selectedItemSlot?.id ||
              findEmptyOrOnlySlotId(item.itemType, customSet);
            const remainingSlotIds = selectedItemSlot
              ? findNextEmptySlotIds(
                  item.itemType,
                  selectedItemSlot.id,
                  customSet,
                )
              : [];
            const card = (
              <ItemCard
                key={`item-card-${item.id}`}
                item={item}
                itemSlotId={itemSlotId}
                equipped={customSetItemIds.has(item.id)}
                customSetId={customSet?.id ?? null}
                selectItemSlot={selectItemSlot}
                openSetModal={openSetModal}
                shouldRedirect={isMobile || isClassic}
                remainingSlotIds={remainingSlotIds}
                notifyOnEquip={false}
              />
            );
            return itemSlotId || !customSet ? (
              card
            ) : (
              <ConfirmReplaceItemPopover
                key={`confirm-replace-item-popover-${item.id}`}
                item={item}
                customSet={customSet}
              >
                {card}
              </ConfirmReplaceItemPopover>
            );
          })
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
