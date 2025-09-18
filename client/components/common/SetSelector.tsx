/** @jsxImportSource @emotion/react */

import { useState, useCallback, useEffect } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroller';

import SetQuery from 'graphql/queries/sets.query';
import { SharedFilters } from 'common/types';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';

import { mq, getSelectorNumCols } from 'common/constants';
import { getResponsiveGridStyle } from 'common/mixins';
import { SetWithItems, CustomSet } from 'common/type-aliases';
import SetCard from './SetCard';

import SkeletonCardsLoader from './SkeletonCardsLoader';
import SetModal from './SetModal';

const PAGE_SIZE = 12;

const THRESHOLD = 600;

interface Props {
  filters: SharedFilters;
  customSet?: CustomSet | null;
  isMobile: boolean;
  isClassic: boolean;
}

const SetSelector = ({ filters, customSet, isMobile, isClassic }: Props) => {
  const { data, loading, fetchMore } = useQuery<sets, setsVariables>(SetQuery, {
    variables: { first: PAGE_SIZE, filters },
  });

  const [selectedSet, setSelectedSet] = useState<SetWithItems | null>(null);
  const [setModalOpen, setSetModalOpen] = useState(false);

  const openSetModal = useCallback((selected: SetWithItems) => {
    setSelectedSet(selected);
    setSetModalOpen(true);
  }, []);

  const closeSetModal = useCallback(() => {
    setSetModalOpen(false);
  }, []);

  const onLoadMore = useCallback(async () => {
    if (!data || !data.sets.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.sets.pageInfo.endCursor },
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

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const keyIndex = Number(e.key) - 1;

      if (!data) return;

      if (Number.isInteger(keyIndex) && keyIndex >= 0 && keyIndex <= 8) {
        if (keyIndex < data.sets.edges.length) {
          setSelectedSet(data.sets.edges[keyIndex].node);
          setSetModalOpen(true);
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
      hasMore={data?.sets.pageInfo.hasNextPage}
      loader={
        <SkeletonCardsLoader
          key="loader"
          length={data?.sets.edges.length}
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
        <SkeletonCardsLoader
          key="initial-loader"
          multiplier={2}
          length={data?.sets.edges.length}
          isClassic
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
          open={setModalOpen}
          customSet={customSet}
          shouldRedirect={isMobile || isClassic}
        />
      )}
    </InfiniteScroll>
  );
};

export default SetSelector;
