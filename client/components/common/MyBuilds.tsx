/** @jsx jsx */

import React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';
import InfiniteScroll from 'react-infinite-scroller';

import { Theme } from 'common/types';
import {
  myCustomSets,
  myCustomSetsVariables,
} from 'graphql/queries/__generated__/myCustomSets';
import myCustomSetsQuery from 'graphql/queries/myCustomSets.graphql';
import { Button, Input } from 'antd';
import { useTranslation } from 'i18n';
import { itemCardStyle, selected } from 'common/mixins';
import { mq, DEBOUNCE_INTERVAL } from 'common/constants';
import Link from 'next/link';
import {
  CardTitleWithLevel,
  BrokenImagePlaceholder,
  CardSkeleton,
} from 'common/wrappers';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { createCustomSet } from 'graphql/mutations/__generated__/createCustomSet';
import createCustomSetMutation from 'graphql/mutations/createCustomSet.graphql';
import { useDebounceCallback } from '@react-hook/debounce';
import Card from 'components/common/Card';
import { navigateToNewCustomSet } from 'common/utils';
import DeleteCustomSetModal from './DeleteCustomSetModal';

const PAGE_SIZE = 10;
const THRESHOLD = 600;

interface Props {
  onClose?: () => void;
}

const MyBuilds: React.FC<Props> = ({ onClose }) => {
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

  const { data: myBuilds, loading: queryLoading, fetchMore } = useQuery<
    myCustomSets,
    myCustomSetsVariables
  >(myCustomSetsQuery, {
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

          if (onClose) {
            onClose();
          }
        }
      },
    });

    if (resultData?.createCustomSet?.customSet) {
      navigateToNewCustomSet(router, resultData.createCustomSet.customSet.id);
    }
  }, [customSetId, mutate, router, myBuilds, client, onClose]);

  const { t } = useTranslation('common');

  const onLoadMore = React.useCallback(async () => {
    if (!myBuilds?.currentUser?.customSets.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    const fetchMoreResult = await fetchMore({
      variables: {
        after: myBuilds.currentUser.customSets.pageInfo.endCursor,
        search,
      },
      updateQuery: (prevData, { fetchMoreResult: result }) => {
        if (!result?.currentUser) {
          return prevData;
        }

        const myBuildsCopy: myCustomSets = {
          currentUser: myBuilds.currentUser && {
            ...myBuilds.currentUser,
            customSets: {
              ...myBuilds.currentUser.customSets,
              edges: [
                ...myBuilds.currentUser.customSets.edges,
                ...result.currentUser.customSets.edges,
              ],
              pageInfo: result.currentUser.customSets.pageInfo,
            },
          },
        };

        return myBuildsCopy;
      },
    });
    return fetchMoreResult;
  }, [myBuilds, search]);

  const theme = useTheme<Theme>();

  const [brokenImages, setBrokenImages] = React.useState<Array<string>>([]);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [customSetIdToDelete, setCustomSetIdToDelete] = React.useState<
    string | null
  >(null);

  const closeDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  return (
    <InfiniteScroll
      hasMore={myBuilds?.currentUser?.customSets.pageInfo.hasNextPage}
      loadMore={onLoadMore}
      useWindow={false}
      threshold={THRESHOLD}
      css={{ marginBottom: 20, [mq[1]]: { marginTop: 36 } }}
      loader={
        <React.Fragment key="frag">
          {Array(4)
            .fill(null)
            .map((_, idx) => (
              <CardSkeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`card-skeleton-${idx}`}
                numRows={2}
                css={{ marginTop: 20 }}
              />
            ))}
        </React.Fragment>
      }
    >
      {customSetIdToDelete && (
        <DeleteCustomSetModal
          customSetId={customSetIdToDelete}
          visible={deleteModalVisible}
          onCancel={closeDeleteModal}
        />
      )}
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
          as={`/build/${node.id}/`}
          key={node.id}
        >
          <div>
            <Card
              onClick={onClose}
              hoverable
              title={
                <ClassNames>
                  {({ css }) => (
                    <CardTitleWithLevel
                      title={node.name || t('UNTITLED')}
                      level={node.level}
                      levelClassName={css({ marginLeft: 8 })}
                      rightAlignedContent={
                        <div
                          css={{
                            padding: '0px 4px 0px 8px',
                            marginLeft: 4,
                            opacity: 0.3,
                            transition: '0.3s opacity ease-in-out',
                            '&:hover': { opacity: 1 },
                          }}
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            setCustomSetIdToDelete(node.id);
                            setDeleteModalVisible(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </div>
                      }
                    />
                  )}
                </ClassNames>
              }
              size="small"
              css={{
                ...itemCardStyle,
                border: `1px solid ${theme.border?.light}`,
                marginTop: 20,
                ':hover': {
                  border: `1px solid ${theme.border?.light}`,
                  ...(node.id === customSetId && selected(theme)),
                },
                ...(node.id === customSetId && selected(theme)),
                transition: 'all 0.3s ease-in-out',
                '&.ant-card': {
                  background: theme.layer?.backgroundLight,
                },
              }}
            >
              {node.equippedItems.length > 0 ? (
                node.equippedItems
                  .sort(
                    ({ slot: { order: i } }, { slot: { order: j } }) => i - j,
                  )
                  .map(({ id, item }) =>
                    brokenImages.includes(id) ? (
                      <BrokenImagePlaceholder
                        key={`broken-image-${id}`}
                        css={{
                          width: 40,
                          height: 40,
                          display: 'inline-flex',
                        }}
                      />
                    ) : (
                      <img
                        key={`equipped-item-${id}`}
                        src={item.imageUrl}
                        css={{ width: 40 }}
                        onError={() => {
                          setBrokenImages((prev) => [...prev, id]);
                        }}
                        alt={id}
                      />
                    ),
                  )
              ) : (
                <div css={{ fontStyle: 'italic', color: theme.text?.light }}>
                  {t('NO_ITEMS_EQUIPPED')}
                </div>
              )}
            </Card>
          </div>
        </Link>
      ))}
      {!queryLoading && myBuilds?.currentUser?.customSets.edges.length === 0 && (
        <div
          css={{
            color: theme.text?.light,
            marginTop: 20,
            fontStyle: 'italic',
          }}
        >
          {t('NO_BUILDS_MATCHED', { search })}
        </div>
      )}
      {queryLoading &&
        Array(10)
          .fill(null)
          .map((_, idx) => (
            <CardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`card-${idx}`}
              css={{ marginTop: 20 }}
              numRows={2}
            />
          ))}
    </InfiniteScroll>
  );
};

export default MyBuilds;
