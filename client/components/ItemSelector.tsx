/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { Waypoint } from 'react-waypoint';
import Card from 'antd/lib/card';
import Skeleton from 'antd/lib/skeleton';
import { debounce } from 'lodash';

import ItemCard from './ItemCard';
import { ResponsiveGrid } from 'common/wrappers';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import CurrentlyEquippedItem from './CurrentlyEquippedItem';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';

const PAGE_SIZE = 24;

const BOTTOM_OFFSET = -1200;

interface IProps {
  selectedItemSlotId: string | null;
  customSet?: customSet | null;
}

const ItemSelector: React.FC<IProps> = ({ selectedItemSlotId, customSet }) => {
  const { data, fetchMore } = useQuery<items, itemsVariables>(ItemsQuery, {
    variables: { first: PAGE_SIZE },
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

  const calcLoaders = debounce(() => {
    const NUM_COLUMNS = getComputedStyle(
      responsiveGridRef.current!,
    ).gridTemplateColumns.split(' ').length;

    setNumLoadersToRender(
      NUM_COLUMNS - ((data?.items.edges.length ?? 0) % NUM_COLUMNS),
    );
  }, 300);

  React.useEffect(calcLoaders, [data]);

  React.useEffect(() => {
    window.addEventListener('resize', calcLoaders);
    return () => {
      window.removeEventListener('resize', calcLoaders);
    };
  }, []);

  if (!data || !data.items) return null;

  const selectedEquippedItem =
    customSet && selectedItemSlotId
      ? customSet.equippedItems.find(
          item => item.slot.id === selectedItemSlotId,
        )?.item
      : null;

  return (
    <ResponsiveGrid
      numColumns={[1, 1, 2, 3, 4, 5]}
      css={{ marginBottom: 20, position: 'relative' }}
      ref={responsiveGridRef}
    >
      {selectedEquippedItem && (
        <CurrentlyEquippedItem
          item={selectedEquippedItem}
          selectedItemSlotId={selectedItemSlotId!}
          customSetId={customSet!.id}
        />
      )}
      {data.items.edges
        .map(edge => edge.node)
        .filter(
          item =>
            !selectedItemSlotId ||
            item.itemType.eligibleItemSlots.some(
              slot => slot.id === selectedItemSlotId,
            ),
        )
        .map(item => (
          <ItemCard
            key={item.id}
            item={item}
            selectedItemSlotId={selectedItemSlotId}
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
