/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import InfiniteScroll from 'react-infinite-scroller';

import SetQuery from 'graphql/queries/sets.graphql';
import { SharedFilters } from 'common/types';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import { mq } from 'common/constants';
import { getResponsiveGridStyle } from 'common/mixins';
import { SetWithItems, CustomSet } from 'common/type-aliases';
import SetCard from './SetCard';
import SkeletonCardsLoader from './SkeletonCardsLoader';
import SetModal from './SetModal';

const PAGE_SIZE = 12;

const THRESHOLD = 600;

interface Props {
  filters: SharedFilters;
  customSet: CustomSet | null;
}

const SetSelector: React.FC<Props> = ({ filters, customSet }) => {
  const { data, loading, fetchMore } = useQuery<sets, setsVariables>(SetQuery, {
    variables: { first: PAGE_SIZE, filters },
  });

  const [selectedSet, setSelectedSet] = React.useState<SetWithItems | null>(
    null,
  );
  const [setModalVisible, setSetModalVisible] = React.useState(false);

  const openSetModal = React.useCallback((selected: SetWithItems) => {
    setSelectedSet(selected);
    setSetModalVisible(true);
  }, []);

  const closeSetModal = React.useCallback(() => {
    setSetModalVisible(false);
  }, []);

  const onLoadMore = React.useCallback(async () => {
    if (!data || !data.sets.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.sets.pageInfo.endCursor },
        updateQuery: (prevData, { fetchMoreResult: result }) => {
          if (
            !result ||
            result.sets.pageInfo.endCursor === prevData.sets.pageInfo.endCursor
          ) {
            return prevData;
          }
          return {
            ...prevData,
            sets: {
              ...prevData.sets,
              edges: [...prevData.sets.edges, ...result.sets.edges],
              pageInfo: result.sets.pageInfo,
            },
          };
        },
      });
      return fetchMoreResult;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return () => {
      // no-op
    };
  }, [data]);

  return (
    <InfiniteScroll
      hasMore={data?.sets.pageInfo.hasNextPage}
      loader={
        <SkeletonCardsLoader key="loader" length={data?.sets.edges.length} />
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
      {loading ? (
        <SkeletonCardsLoader
          key="initial-loader"
          multiplier={2}
          length={data?.sets.edges.length}
        />
      ) : (
        (data?.sets.edges ?? [])
          .map((edge) => edge.node)
          .map((set) => (
            <SetCard key={set.id} set={set} onClick={openSetModal} />
          ))
      )}
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          onCancel={closeSetModal}
          visible={setModalVisible}
          customSet={customSet}
        />
      )}
    </InfiniteScroll>
  );
};

export default SetSelector;
