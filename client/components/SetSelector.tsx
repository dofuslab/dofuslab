/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { Waypoint } from 'react-waypoint';
import { useDebounceCallback } from '@react-hook/debounce';

import { ResponsiveGrid, CardSkeleton } from 'common/wrappers';
import SetQuery from 'graphql/queries/sets.graphql';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { SharedFilters } from 'common/types';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import SetCard from './SetCard';

const PAGE_SIZE = 24;

const BOTTOM_OFFSET = -1200;

interface IProps {
  customSet?: customSet | null;
  filters: SharedFilters;
}

const SetSelector: React.FC<IProps> = ({ customSet, filters }) => {
  const { data, loading, fetchMore, networkStatus } = useQuery<
    sets,
    setsVariables
  >(SetQuery, {
    variables: { first: PAGE_SIZE, filters },
    notifyOnNetworkStatusChange: true,
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
          if (!fetchMoreResult) {
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

  const [numLoadersToRender, setNumLoadersToRender] = React.useState(4);

  const calcColumns = React.useCallback(() => {
    if (!responsiveGridRef.current) return;
    const NUM_COLUMNS = getComputedStyle(
      responsiveGridRef.current,
    ).gridTemplateColumns.split(' ').length;

    setNumLoadersToRender(
      2 * NUM_COLUMNS - ((data?.sets.edges.length ?? 0) % NUM_COLUMNS),
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

  return (
    <ResponsiveGrid
      numColumns={[1, 2, 2, 3, 4, 5, 6]}
      css={{ marginBottom: 20, position: 'relative' }}
      ref={responsiveGridRef}
    >
      {data &&
        data.sets.edges
          .map(edge => edge.node)
          .map(set => <SetCard key={set.id} set={set} customSet={customSet} />)}
      {(loading || data?.sets.pageInfo.hasNextPage) &&
        Array(loading ? numLoadersToRender * 2 : numLoadersToRender)
          .fill(null)
          .map((_, idx) => <CardSkeleton key={`card-skeleton-${idx}`} />)}
      <Waypoint
        key={networkStatus}
        onEnter={onLoadMore}
        bottomOffset={BOTTOM_OFFSET}
      />
    </ResponsiveGrid>
  );
};

export default SetSelector;
