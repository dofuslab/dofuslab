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
import CurrentlyEquippedItem from './CurrentlyEquippedItem';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { ItemFilters } from '__generated__/globalTypes';
import ItemSelectorFilters from './ItemSelectorFilters';
import { FilterAction } from 'common/types';

const PAGE_SIZE = 24;

const BOTTOM_OFFSET = -1200;

interface IProps {
  selectedItemSlot: itemSlots_itemSlots | null;
  customSet?: customSet | null;
}

const reducer = (state: ItemFilters, action: FilterAction) => {
  switch (action.type) {
    case 'SEARCH':
      return { ...state, search: action.search };
    case 'MAX_LEVEL':
      return { ...state, maxLevel: action.maxLevel };
    case 'STATS':
      return { ...state, stats: action.stats };
    case 'ITEM_TYPE_IDS':
      return { ...state, itemTypeIds: action.itemTypeIds };
    default:
      throw new Error('Invalid action type');
  }
};

const ItemSelector: React.FC<IProps> = ({ selectedItemSlot, customSet }) => {
  const [filters, dispatch] = React.useReducer(reducer, {
    stats: [],
    maxLevel: null,
    search: '',
    itemTypeIds: [],
  });
  const { data, fetchMore } = useQuery<items, itemsVariables>(ItemsQuery, {
    variables: { first: PAGE_SIZE, filters },
  });

  const endCursorRef = React.useRef<string | null>(null);

  const onLoadMore = React.useCallback(() => {
    if (
      !data ||
      !data.items.pageInfo.hasNextPage ||
      endCursorRef.current === data.items.pageInfo.endCursor
    ) {
      return () => {};
    }

    endCursorRef.current = data.items.pageInfo.endCursor;

    return fetchMore({
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
  }, [data]);

  const responsiveGridRef = React.useRef<HTMLDivElement | null>(null);

  const [numLoadersToRender, setNumLoadersToRender] = React.useState(4);

  const calcColumns = React.useCallback(() => {
    const NUM_COLUMNS = getComputedStyle(
      responsiveGridRef.current!,
    ).gridTemplateColumns.split(' ').length;

    setNumLoadersToRender(
      NUM_COLUMNS - ((data?.items.edges.length ?? 0) % NUM_COLUMNS),
    );
  }, [responsiveGridRef, data, setNumLoadersToRender]);

  const calcLoaders = useDebounceCallback(calcColumns, 300);

  React.useEffect(calcLoaders, [data]);

  React.useEffect(() => {
    window.addEventListener('resize', calcLoaders);
    return () => {
      window.removeEventListener('resize', calcLoaders);
    };
  }, []);

  if (!data || !data.items) return null;

  const selectedEquippedItem =
    customSet && selectedItemSlot
      ? customSet.equippedItems.find(
          item => item.slot.id === selectedItemSlot.id,
        )?.item
      : null;

  return (
    <ResponsiveGrid
      numColumns={[1, 1, 2, 3, 4, 5]}
      css={{ marginBottom: 20, position: 'relative' }}
      ref={responsiveGridRef}
    >
      <ItemSelectorFilters
        key={`filters-level${customSet?.level}`}
        filters={filters}
        dispatch={dispatch}
        customSetLevel={customSet?.level || null}
      />
      {selectedEquippedItem && (
        <CurrentlyEquippedItem
          item={selectedEquippedItem}
          selectedItemSlotId={selectedItemSlot!.id}
          customSetId={customSet!.id}
        />
      )}
      {data.items.edges
        .map(edge => edge.node)
        .map(item => (
          <ItemCard
            key={item.id}
            item={item}
            selectedItemSlotId={selectedItemSlot?.id ?? null}
            selectedEquippedItem={selectedEquippedItem}
            customSet={customSet}
            responsiveGridRef={responsiveGridRef}
          />
        ))}
      {data.items.pageInfo.hasNextPage &&
        Array(numLoadersToRender)
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
              <Skeleton loading title active paragraph={{ rows: 8 }}></Skeleton>
            </Card>
          ))}
      <Waypoint onEnter={onLoadMore} bottomOffset={BOTTOM_OFFSET} />
    </ResponsiveGrid>
  );
};

export default ItemSelector;
