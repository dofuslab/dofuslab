/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { Waypoint } from 'react-waypoint';

import { ResponsiveGrid, CardSkeleton } from 'common/wrappers';
import SetQuery from 'graphql/queries/sets.graphql';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { SharedFilters } from 'common/types';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import SetCard from './SetCard';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';

const PAGE_SIZE = 12;

const BOTTOM_OFFSET = -600;

interface IProps {
  customSet?: customSet | null;
  filters: SharedFilters;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  isMobile?: boolean;
}

const SetSelector: React.FC<IProps> = ({
  customSet,
  filters,
  selectItemSlot,
  isMobile,
}) => {
  const { data, loading, fetchMore } = useQuery<sets, setsVariables>(SetQuery, {
    variables: { first: PAGE_SIZE, filters },
  });

  const endCursorRef = React.useRef<string | null>(null);

  const onLoadMore = React.useCallback(async () => {
    if (
      !data ||
      !data.sets.pageInfo.hasNextPage ||
      endCursorRef.current === data.sets.pageInfo.endCursor
    ) {
      return () => {};
    }

    endCursorRef.current = data.sets.pageInfo.endCursor;

    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.sets.pageInfo.endCursor },
        updateQuery: (prevData, { fetchMoreResult }) => {
          if (!fetchMoreResult || !prevData) {
            endCursorRef.current = null;
            return prevData;
          }
          return {
            ...prevData,
            sets: {
              ...prevData.sets,
              edges: [...prevData.sets.edges, ...fetchMoreResult.sets.edges],
              pageInfo: fetchMoreResult.sets.pageInfo,
            },
          };
        },
      });
      return fetchMoreResult;
    } catch (e) {}
  }, [data]);

  const responsiveGridRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!data) {
      endCursorRef.current = null;
    }
  }, [data]);

  return (
    <ResponsiveGrid
      numColumns={[2, 2, 2, 3, 4, 5, 6]}
      css={{
        marginTop: 12,
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        [mq[1]]: { gridGap: 12 },
      }}
      ref={responsiveGridRef}
    >
      {data &&
        !loading &&
        data.sets.edges
          .map(edge => edge.node)
          .map(set => (
            <SetCard
              key={set.id}
              set={set}
              customSetId={customSet?.id ?? null}
              selectItemSlot={selectItemSlot}
              isMobile={isMobile}
            />
          ))}
      {(loading || data?.sets.pageInfo.hasNextPage) &&
        Array(isMobile ? 2 : loading ? 24 : PAGE_SIZE)
          .fill(null)
          .map((_, idx) => <CardSkeleton key={`card-skeleton-${idx}`} />)}
      <Waypoint
        key={data?.sets.pageInfo.endCursor || 'null'}
        onEnter={onLoadMore}
        bottomOffset={BOTTOM_OFFSET}
      />
    </ResponsiveGrid>
  );
};

export default SetSelector;
