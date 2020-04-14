/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import {
  myCustomSets,
  myCustomSetsVariables,
} from 'graphql/queries/__generated__/myCustomSets';
import myCustomSetsQuery from 'graphql/queries/myCustomSets.graphql';
import { Button, Card, Input, Skeleton } from 'antd';
import { useTranslation } from 'i18n';
import { itemCardStyle, selected, gray6 } from 'common/mixins';
import { mq, DEBOUNCE_INTERVAL } from 'common/constants';
import Link from 'next/link';
import { CardTitleWithLevel } from 'common/wrappers';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { createCustomSet } from 'graphql/mutations/__generated__/createCustomSet';
import createCustomSetMutation from 'graphql/mutations/createCustomSet.graphql';
import { Waypoint } from 'react-waypoint';
import { useDebounceCallback } from '@react-hook/debounce';

const PAGE_SIZE = 10;
const BOTTOM_OFFSET = -1200;

const MyBuilds: React.FC = () => {
  const [search, setSearch] = React.useState('');

  const handleSearchChange = React.useCallback(
    (searchValue: string) => {
      setSearch(searchValue);
    },
    [setSearch],
  );

  const debouncedSearch = useDebounceCallback(
    handleSearchChange,
    DEBOUNCE_INTERVAL,
  );

  const onSearch = React.useCallback(
    (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(changeEvent.currentTarget.value);
      debouncedSearch(changeEvent.currentTarget.value);
    },
    [debouncedSearch, setSearch],
  );

  const {
    data: myBuilds,
    loading: queryLoading,
    networkStatus,
    fetchMore,
  } = useQuery<myCustomSets, myCustomSetsVariables>(myCustomSetsQuery, {
    variables: { first: PAGE_SIZE, search },
  });

  const router = useRouter();
  const { customSetId } = router.query;

  const [mutate, { loading: createLoading }] = useMutation<createCustomSet>(
    createCustomSetMutation,
  );

  const client = useApolloClient();

  const onCreate = React.useCallback(async () => {
    const { data: resultData } = await mutate({
      update: (_, { data }) => {
        if (!data?.createCustomSet) return;
        const oldData = client.readQuery<myCustomSets, myCustomSetsVariables>({
          query: myCustomSetsQuery,
          variables: { first: PAGE_SIZE, search: '' },
        });

        const newData: myCustomSets | null = oldData && {
          currentUser: oldData.currentUser && {
            ...oldData.currentUser,
            customSets: {
              ...oldData.currentUser.customSets,
              edges: [
                {
                  node: data.createCustomSet.customSet,
                  __typename: 'CustomSetEdge',
                },
                ...oldData.currentUser.customSets.edges,
              ],
            },
          },
        };

        if (newData) {
          client.writeQuery<myCustomSets, myCustomSetsVariables>({
            data: newData,
            query: myCustomSetsQuery,
            variables: { first: PAGE_SIZE, search: '' },
          });
        }
      },
    });

    if (
      resultData?.createCustomSet?.customSet &&
      resultData.createCustomSet.customSet.id !== customSetId
    ) {
      router.replace(
        {
          pathname: '/',
          query: { customSetId: resultData?.createCustomSet?.customSet.id },
        },
        `/build/${resultData?.createCustomSet?.customSet.id}`,
        {
          shallow: true,
        },
      );
    }
  }, [customSetId, mutate, router, myBuilds, client]);

  const { t } = useTranslation('common');

  const endCursorRef = React.useRef<string | null>(null);

  const onLoadMore = React.useCallback(async () => {
    if (
      !myBuilds?.currentUser?.customSets.pageInfo.hasNextPage ||
      endCursorRef.current ===
        myBuilds.currentUser.customSets.pageInfo.endCursor
    ) {
      return () => {};
    }

    endCursorRef.current = myBuilds.currentUser.customSets.pageInfo.endCursor;
    const fetchMoreResult = await fetchMore({
      variables: {
        after: myBuilds.currentUser.customSets.pageInfo.endCursor,
        search,
      },
      updateQuery: (prevData, { fetchMoreResult }) => {
        if (!fetchMoreResult?.currentUser) {
          return prevData;
        }

        const myBuildsCopy: myCustomSets = {
          currentUser: myBuilds.currentUser && {
            ...myBuilds.currentUser,
            customSets: {
              ...myBuilds.currentUser.customSets,
              edges: [
                ...myBuilds.currentUser.customSets.edges,
                ...fetchMoreResult.currentUser.customSets.edges,
              ],
              pageInfo: fetchMoreResult.currentUser.customSets.pageInfo,
            },
          },
        };

        return myBuildsCopy;
      },
    });
    return fetchMoreResult;
  }, [myBuilds, search]);

  const theme = useTheme<TTheme>();

  return (
    <div css={{ marginBottom: 20, [mq[1]]: { marginTop: 36 } }}>
      <div css={{ display: 'flex' }}>
        <Button
          type="primary"
          onClick={onCreate}
          disabled={queryLoading || createLoading}
          css={{ fontSize: '0.75rem' }}
        >
          <span css={{ marginRight: 12 }}>
            {createLoading ? (
              <LoadingOutlined />
            ) : (
              <FontAwesomeIcon icon={faPlus} />
            )}
          </span>
          {t('NEW_BUILD')}
        </Button>
        <Input
          css={{ marginLeft: 20, flex: 1, fontSize: '0.75rem' }}
          onChange={onSearch}
          placeholder={t('SEARCH')}
        />
      </div>
      {myBuilds?.currentUser?.customSets.edges.map(({ node }) => (
        <Link
          href={{ pathname: '/index', query: { customSetId: node.id } }}
          as={`/build/${node.id}`}
          key={node.id}
        >
          <Card
            hoverable
            title={
              <CardTitleWithLevel
                title={node.name || t('UNTITLED')}
                level={node.level}
              />
            }
            size="small"
            css={{
              ...itemCardStyle,
              border: `1px solid ${theme.border?.default}`,
              marginTop: 20,
              ':hover': {
                border: `1px solid ${theme.border?.default}`,
                ...(node.id === customSetId && selected(theme)),
              },
              ...(node.id === customSetId && selected(theme)),
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {node.equippedItems.length > 0 ? (
              node.equippedItems
                .sort(({ slot: { order: i } }, { slot: { order: j } }) => i - j)
                .map(({ id, item }) => (
                  <img
                    key={`equipped-item-${id}`}
                    src={item.imageUrl}
                    css={{ width: 40 }}
                  />
                ))
            ) : (
              <div css={{ fontStyle: 'italic', color: gray6 }}>
                {t('NO_ITEMS_EQUIPPED')}
              </div>
            )}
          </Card>
        </Link>
      ))}
      {!queryLoading &&
        myBuilds?.currentUser?.customSets.edges.length === 0 && (
          <div css={{ color: gray6, marginTop: 20, fontStyle: 'italic' }}>
            {t('NO_BUILDS_MATCHED', { search })}
          </div>
        )}
      {(queryLoading ||
        myBuilds?.currentUser?.customSets.pageInfo.hasNextPage) &&
        Array(PAGE_SIZE)
          .fill(null)
          .map((_, idx) => (
            <Card
              key={`card-${idx}`}
              size="small"
              css={{
                ...itemCardStyle,
                marginTop: 20,
                border: `1px solid ${theme.border?.default}`,
              }}
            >
              <Skeleton loading title active paragraph={{ rows: 2 }}></Skeleton>
            </Card>
          ))}
      <Waypoint
        key={networkStatus}
        onEnter={onLoadMore}
        bottomOffset={BOTTOM_OFFSET}
      />
    </div>
  );
};

export default MyBuilds;
