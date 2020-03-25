/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { Waypoint } from 'react-waypoint';
import Card from 'antd/lib/card';
import Skeleton from 'antd/lib/skeleton';
import { useDebounceCallback } from '@react-hook/debounce';

import ItemCard from './ItemCard';
import { ResponsiveGrid } from 'common/wrappers';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { SharedFilters } from 'common/types';
import { findEmptyOrOnlySlotId } from 'common/utils';
import ConfirmReplaceItemPopover from '../desktop/ConfirmReplaceItemPopover';
import { item_set } from 'graphql/fragments/__generated__/item';
import SetModal from './SetModal';
import { mq } from 'common/constants';

const PAGE_SIZE = 24;

const BOTTOM_OFFSET = -1200;

interface IProps {
  selectedItemSlot: itemSlots_itemSlots | null;
  customSet?: customSet | null;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  customSetItemIds: Set<string>;
  filters: SharedFilters;
  windowNode?: Window | null;
  itemTypeIds: Set<string>;
}

const ItemSelector: React.FC<IProps> = ({
  selectedItemSlot,
  customSet,
  selectItemSlot,
  customSetItemIds,
  filters,
  windowNode,
  itemTypeIds,
}) => {
  const itemTypeIdsArr = Array.from(itemTypeIds);
  const queryFilters = {
    ...filters,
    itemTypeIds:
      selectedItemSlot && itemTypeIdsArr.length === 0
        ? selectedItemSlot.itemTypes.map(type => type.id)
        : itemTypeIdsArr,
  };
  const { data, loading, fetchMore, networkStatus } = useQuery<
    items,
    itemsVariables
  >(ItemsQuery, {
    variables: { first: PAGE_SIZE, filters: queryFilters },
    notifyOnNetworkStatusChange: true,
  });

  const endCursorRef = React.useRef<string | null>(null);

  const onLoadMore = React.useCallback(async () => {
    if (
      !data ||
      !data.items.pageInfo.hasNextPage ||
      endCursorRef.current === data.items.pageInfo.endCursor
    ) {
      return () => {};
    }

    endCursorRef.current = data.items.pageInfo.endCursor;
    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.items.pageInfo.endCursor },
        updateQuery: (prevData, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prevData;
          }
          return {
            ...prevData,
            items: {
              ...prevData.items,
              edges: [...prevData.items.edges, ...fetchMoreResult.items.edges],
              pageInfo: fetchMoreResult.items.pageInfo,
            },
          };
        },
      });
      return fetchMoreResult;
    } catch (e) {}
  }, [data]);

  const responsiveGridRef = React.useRef<HTMLDivElement | null>(null);

  const [numLoadersToRender, setNumLoadersToRender] = React.useState(4);

  const calcColumns = React.useCallback(() => {
    if (!responsiveGridRef.current) return;
    const NUM_COLUMNS = getComputedStyle(
      responsiveGridRef.current,
    ).gridTemplateColumns.split(' ').length;

    setNumLoadersToRender(
      2 * NUM_COLUMNS - ((data?.items.edges.length ?? 0) % NUM_COLUMNS),
    );
  }, [responsiveGridRef, data, setNumLoadersToRender]);

  const calcLoaders = useDebounceCallback(calcColumns, 300);

  React.useEffect(calcLoaders, [data]);

  React.useEffect(() => {
    window.addEventListener('resize', calcLoaders);
    return () => {
      window.removeEventListener('resize', calcLoaders);
    };
  }, [data]);

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

  return (
    <ResponsiveGrid
      numColumns={[2, 2, 2, 3, 4, 5, 6]}
      css={{
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        [mq[1]]: { gridGap: 12 },
      }}
      ref={responsiveGridRef}
    >
      {data &&
        data.items.edges
          .map(edge => edge.node)
          .map(item => {
            const itemSlotId =
              selectedItemSlot?.id ||
              findEmptyOrOnlySlotId(item.itemType, customSet);
            const card = (
              <ItemCard
                key={`item-card-${item.id}`}
                item={item}
                itemSlotId={itemSlotId}
                equipped={customSetItemIds.has(item.id)}
                customSetId={customSet?.id ?? null}
                selectItemSlot={selectItemSlot}
                openSetModal={openSetModal}
              />
            );
            return itemSlotId || !customSet ? (
              card
            ) : (
              <ConfirmReplaceItemPopover
                key={`confirm-replace-item-popover-${item.id}`}
                item={item}
                customSet={customSet}
                responsiveGridRef={responsiveGridRef}
              >
                {card}
              </ConfirmReplaceItemPopover>
            );
          })}
      {(loading || data?.items.pageInfo.hasNextPage) &&
        Array(loading ? numLoadersToRender * 2 : numLoadersToRender)
          .fill(null)
          .map((_, idx) => (
            <Card
              key={`card-${idx}`}
              size="small"
              css={{
                ...itemCardStyle,
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <Skeleton loading title active paragraph={{ rows: 6 }}></Skeleton>
            </Card>
          ))}
      <Waypoint
        key={networkStatus}
        onEnter={onLoadMore}
        bottomOffset={BOTTOM_OFFSET}
        scrollableAncestor={windowNode || undefined}
      />
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
        />
      )}
    </ResponsiveGrid>
  );
};

export default ItemSelector;
