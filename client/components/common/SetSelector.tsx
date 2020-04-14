/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import InfiniteScroll from 'react-infinite-scroller';

import { CardSkeleton } from 'common/wrappers';
import SetQuery from 'graphql/queries/sets.graphql';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { SharedFilters } from 'common/types';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import SetCard from './SetCard';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';
import { getResponsiveGridStyle } from 'common/mixins';

const PAGE_SIZE = 12;

const THRESHOLD = 600;

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

  const onLoadMore = React.useCallback(async () => {
    if (!data || !data.sets.pageInfo.hasNextPage) {
      return () => {};
    }

    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.sets.pageInfo.endCursor },
        updateQuery: (prevData, { fetchMoreResult }) => {
          if (
            !fetchMoreResult ||
            fetchMoreResult.sets.pageInfo.endCursor ===
              prevData.sets.pageInfo.endCursor
          ) {
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

  return (
    <InfiniteScroll
      hasMore={data?.sets.pageInfo.hasNextPage}
      loader={
        <React.Fragment key={'frag'}>
          {Array(isMobile ? 2 : loading ? 24 : 12)
            .fill(null)
            .map((_, idx) => (
              <CardSkeleton key={`card-skeleton-${idx}`} />
            ))}
        </React.Fragment>
      }
      loadMore={onLoadMore}
      css={{
        ...getResponsiveGridStyle([2, 2, 2, 3, 4, 5, 6]),
        marginTop: 12,
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        minWidth: 0,
        [mq[1]]: { gridGap: 12 },
      }}
      useWindow={false}
      threshold={THRESHOLD}
    >
<<<<<<< HEAD
      {loading
        ? Array(isMobile ? 2 : 24)
            .fill(null)
            .map((_, idx) => <CardSkeleton key={`card-skeleton-${idx}`} />)
        : (data?.sets.edges ?? [])
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
    </InfiniteScroll>
=======
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
>>>>>>> Change number of loaders based on whether is first load
  );
};

export default SetSelector;
