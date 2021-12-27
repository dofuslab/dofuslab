/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { getResponsiveGridStyle } from 'common/mixins';
import { SharedFilters } from 'common/types';
import { mq, getSelectorNumCols } from 'common/constants';
import { ItemSet } from 'common/type-aliases';
import SetModal from './SetModal';

import SkeletonCardsLoader from './SkeletonCardsLoader';
import ItemCardWithContext, { SharedProps } from './ItemCardWithContext';

const PAGE_SIZE = 24;

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
        first: PAGE_SIZE,
        filters: queryFilters,
        customSetId: customSet?.id,
        itemSlotId: selectedItemSlot?.id,
      },
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

  const filtersUnchanged =
    !filters.search &&
    (!customSet || filters.maxLevel === customSet.level) &&
    filters.stats.length === 0;

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
    >
      {loading ? (
        <SkeletonCardsLoader
          key="loader"
          length={data?.items.edges.length}
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
              />
            ))}
          {(data?.items.edges ?? [])
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
