/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';
import InfiniteScroll from 'react-infinite-scroller';

import { Theme } from 'common/types';
import {
  myCustomSets,
  myCustomSetsVariables,
} from 'graphql/queries/__generated__/myCustomSets';
import myCustomSetsQuery from 'graphql/queries/myCustomSets.graphql';
import { Button, Input, Select } from 'antd';
import { useTranslation } from 'i18n';
import { inputFontSize, itemCardStyle, selected } from 'common/mixins';
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
import {
  getFaceImageUrl,
  getImageUrl,
  navigateToNewCustomSet,
} from 'common/utils';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import customSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import DeleteCustomSetModal from './DeleteCustomSetModal';
import { ClassSelect } from './ClassSelect';

const PAGE_SIZE = 20;
const THRESHOLD = 600;

interface Props {
  onClose?: () => void;
  isMobile: boolean;
}

const MyBuilds: React.FC<Props> = ({ onClose, isMobile }) => {
  const [search, setSearch] = React.useState('');
  const [dofusClassId, setDofusClassId] = React.useState<string | undefined>(
    undefined,
  );
  const [tagIds, setTagIds] = React.useState<Array<string>>([]);
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
    variables: {
      first: PAGE_SIZE,
      filters: { search, defaultClassId: dofusClassId, tagIds },
    },
  });

  const { data: tagsData } = useQuery<customSetTags>(customSetTagsQuery);

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
          variables: { first: PAGE_SIZE, filters: { search: '', tagIds: [] } },
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
            variables: {
              first: PAGE_SIZE,
              filters: { search: '', tagIds: [] },
            },
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

  const classSelect = (
    <ClassSelect
      css={[
        { ...inputFontSize },
        { marginTop: 20, [mq[1]]: { marginTop: 0, marginLeft: 20, flex: 1 } },
      ]}
      value={dofusClassId}
      onChange={(value: string) => {
        setDofusClassId(value);
      }}
      allowClear
    />
  );

  return (
    <InfiniteScroll
      hasMore={myBuilds?.currentUser?.customSets.pageInfo.hasNextPage}
      loadMore={onLoadMore}
      useWindow={false}
      threshold={THRESHOLD}
      css={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 20,
        [mq[1]]: {
          display: 'grid',
          marginTop: 36,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridGap: 20,
        },
      }}
      loader={
        <React.Fragment key="frag">
          {Array(4)
            .fill(null)
            .map((_, idx) => (
              <CardSkeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`card-skeleton-${idx}`}
                numRows={2}
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
      <div css={{ display: 'flex', gridColumn: '1 / -1' }}>
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
        <Input.Search
          css={{
            marginLeft: 20,
            flex: 1,
            ...inputFontSize,
            '.ant-input': inputFontSize,
            height: 32,
          }}
          onChange={onSearch}
          placeholder={t('SEARCH')}
        />
        {!isMobile && classSelect}
      </div>
      {isMobile && classSelect}
      {tagsData && (
        <Select<Array<string>>
          getPopupContainer={(node: HTMLElement) => {
            if (node.parentElement) {
              return node.parentElement;
            }
            return document && document.body;
          }}
          css={[
            inputFontSize,
            {
              gridColumn: '1 / -1',

              marginTop: 20,
              [mq[1]]: { marginTop: 0 },
            },
          ]}
          showSearch
          filterOption={(input, option) => {
            return (option?.children[1] as string)
              .toLocaleUpperCase()
              .includes(input.toLocaleUpperCase());
          }}
          value={tagIds}
          onChange={(value: Array<string>) => {
            setTagIds(value);
          }}
          placeholder={t('SELECT_TAGS')}
          mode="multiple"
          allowClear
        >
          {[...tagsData.customSetTags]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                <img
                  src={getImageUrl(tag.imageUrl)}
                  alt={tag.name}
                  css={{ width: 16, marginRight: 8 }}
                />
                {tag.name}
              </Select.Option>
            ))}
        </Select>
      )}
      {myBuilds?.currentUser?.customSets.edges.map(({ node }) => (
        <Link
          href={{ pathname: '/index', query: { customSetId: node.id } }}
          as={`/build/${node.id}/`}
          key={node.id}
        >
          <a key={node.id}>
            <Card
              onClick={onClose}
              hoverable
              title={
                <CardTitleWithLevel
                  title={node.name || t('UNTITLED')}
                  level={node.level}
                  afterLevel={
                    <div css={{ display: 'flex', alignItems: 'center' }}>
                      {[...node.tagAssociations]
                        .sort(
                          (a1, a2) =>
                            new Date(a1.associationDate).getTime() -
                            new Date(a2.associationDate).getTime(),
                        )
                        .map(({ customSetTag: tag }) => {
                          return (
                            <img
                              title={tag.name}
                              key={tag.id}
                              src={getImageUrl(tag.imageUrl)}
                              css={{ width: 14, height: 'auto', marginLeft: 4 }}
                              alt={tag.name}
                            />
                          );
                        })}
                    </div>
                  }
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
                        e.preventDefault();
                        setCustomSetIdToDelete(node.id);
                        setDeleteModalVisible(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </div>
                  }
                  leftImageUrl={getFaceImageUrl(
                    node.defaultClass,
                    node.buildGender,
                  )}
                  leftImageAlt={node.defaultClass?.name}
                />
              }
              size="small"
              css={{
                ...itemCardStyle,
                marginTop: 20,
                [mq[1]]: {
                  marginTop: 0,
                },
                height: '100%',
                ':hover': {
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
                <div
                  css={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gridAutoRows: '1fr 1fr',
                  }}
                >
                  {[...node.equippedItems]
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
                        <div
                          css={{
                            position: 'relative',
                            '&::before': {
                              content: "''",
                              display: 'block',
                              paddingTop: '100%',
                            },
                          }}
                        >
                          <img
                            key={`equipped-item-${id}`}
                            src={getImageUrl(item.imageUrl)}
                            css={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%',
                              height: '100%',
                            }}
                            onError={() => {
                              setBrokenImages((prev) => [...prev, id]);
                            }}
                            alt={id}
                          />
                        </div>
                      ),
                    )}
                </div>
              ) : (
                <div css={{ fontStyle: 'italic', color: theme.text?.light }}>
                  {t('NO_ITEMS_EQUIPPED')}
                </div>
              )}
            </Card>
          </a>
        </Link>
      ))}
      {!queryLoading && myBuilds?.currentUser?.customSets.edges.length === 0 && (
        <div
          css={{
            color: theme.text?.light,
            marginTop: 20,
            fontStyle: 'italic',
            textAlign: 'center',
            gridColumn: '1 / -1',
          }}
        >
          {t('NO_BUILDS_FOUND')}
        </div>
      )}
      {queryLoading &&
        Array(isMobile ? 4 : PAGE_SIZE)
          .fill(null)
          .map((_, idx) => (
            <CardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`card-${idx}`}
              css={{
                marginTop: 20,
                [mq[1]]: { marginTop: 0 },
                backgroundColor: theme.layer?.backgroundLight,
              }}
              numRows={2}
            />
          ))}
    </InfiniteScroll>
  );
};

export default MyBuilds;
