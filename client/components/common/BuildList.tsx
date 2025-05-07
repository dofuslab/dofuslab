/** @jsxImportSource @emotion/react */

import React from 'react';

import { useTheme } from '@emotion/react';
import InfiniteScroll from 'react-infinite-scroller';

import {
  buildList,
  buildListVariables,
} from 'graphql/queries/__generated__/buildList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { inputFontSize } from 'common/mixins';
import Link from 'next/link';
import { CardSkeleton } from 'common/wrappers';
import { useRouter } from 'next/router';
import {
  getImageUrl,
  navigateToNewCustomSet,
  antdSelectFilterOption,
} from 'common/utils';
import { createCustomSet } from 'graphql/mutations/__generated__/createCustomSet';
import createCustomSetMutation from 'graphql/mutations/createCustomSet.graphql';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';

import buildListQuery from 'graphql/queries/buildList.graphql';
import {
  myCustomSets,
  myCustomSetsVariables,
} from 'graphql/queries/__generated__/myCustomSets';
import myCustomSetsQuery from 'graphql/queries/myCustomSets.graphql';
import { Input, Select, Tabs, Button } from 'antd';
import { BUILD_LIST_PAGE_SIZE, DEBOUNCE_INTERVAL, mq } from 'common/constants';
import { useDebounceCallback } from '@react-hook/debounce';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import customSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import DeleteCustomSetModal from './DeleteCustomSetModal';
import ClassSelect from './ClassSelect';
import BuildCard from './BuildCard';
import TogglePrivateModal from './TogglePrivateModal';

const THRESHOLD = 600;
const PAGE_SIZE = 20;

const { TabPane } = Tabs;

interface Props {
  username: string;
  onClose?: () => void;
  isEditable: boolean;
  getScrollParent?: () => HTMLElement | null;
  isMobile: boolean;
}

const BuildList: React.FC<Props> = ({
  username,
  onClose,
  isEditable,
  getScrollParent,
  isMobile,
}) => {
  const { t } = useTranslation('common');

  const [mutate, { loading: createLoading }] = useMutation<createCustomSet>(
    createCustomSetMutation,
  );

  const client = useApolloClient();

  const [selectedCustomSetId, setSelectedCustomSetId] = React.useState<
    string | null
  >(null);

  const [togglePrivateModalVisible, setTogglePrivateModalVisible] =
    React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  const closeDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  const closeTogglePrivateModal = React.useCallback(() => {
    setTogglePrivateModalVisible(false);
  }, []);

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

  const {
    data: userBuilds,
    loading: queryLoading,
    fetchMore,
  } = useQuery<buildList, buildListVariables>(buildListQuery, {
    variables: {
      username,
      first: BUILD_LIST_PAGE_SIZE,
      filters: {
        search,
        defaultClassId: dofusClassId,
        tagIds,
        private: isEditable ? undefined : false,
      },
    },
  });

  const { data: tagsData } = useQuery<customSetTags>(customSetTagsQuery);

  const onLoadMore = React.useCallback(async () => {
    if (!userBuilds?.userByName?.customSets.pageInfo.hasNextPage) {
      return () => {
        // no-op
      };
    }

    const fetchMoreResult = await fetchMore({
      variables: {
        after: userBuilds.userByName.customSets.pageInfo.endCursor,
        search,
      },
    });
    return fetchMoreResult;
  }, [userBuilds, search]);

  const classSelect = (
    <ClassSelect
      css={[
        { ...inputFontSize },
        { marginTop: 20, [mq[1]]: { marginTop: 0, flex: 1 } },
      ]}
      value={dofusClassId}
      onChange={(value: string) => {
        setDofusClassId(value);
      }}
      size={isMobile ? 'large' : 'middle'}
      allowClear
    />
  );

  const theme = useTheme();

  const router = useRouter();

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
              totalCount: oldData.currentUser.customSets.totalCount + 1,
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
  }, [mutate, router, userBuilds, client, onClose]);

  const getCustomSetPathname = () => {
    return isEditable ? '/build' : '/view';
  };

  return (
    <div
      css={{
        width: '100%',
        marginBottom: 60,
      }}
    >
      <Tabs defaultActiveKey="1" css={{ gridArea: '4/1/4/3', width: '100%' }}>
        <TabPane
          tab={`${t('BUILDS')} ${
            userBuilds?.userByName?.customSets
              ? `(${userBuilds?.userByName?.customSets.totalCount})`
              : ''
          }`}
          key="1"
        >
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              [mq[1]]: {
                display: 'grid',
                marginBottom: 16,
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridGap: 16,
              },
            }}
          >
            <div css={{ display: 'flex', gridColumn: '1 / 1' }}>
              {isEditable && (
                <Button
                  type="primary"
                  onClick={onCreate}
                  disabled={queryLoading || createLoading}
                  css={{ fontSize: '0.75rem', marginRight: 16 }}
                  size={isMobile ? 'large' : 'middle'}
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
              )}
              <Input.Search
                css={{
                  flex: 1,
                  ...inputFontSize,
                  '.ant-input': inputFontSize,
                  height: 40,
                  [mq[1]]: {
                    height: 32,
                  },
                }}
                onChange={onSearch}
                placeholder={t('SEARCH')}
                onKeyDown={(e) => {
                  // prevents triggering SetBuilderKeyboardShortcuts
                  e.nativeEvent.stopPropagation();
                }}
                size={isMobile ? 'large' : 'middle'}
              />
            </div>
            {classSelect}
            {tagsData && (
              <Select<Array<string>>
                css={[
                  inputFontSize,
                  {
                    gridArea: '2/3/3/1',
                    marginTop: 20,
                    [mq[1]]: { marginTop: 0 },
                  },
                ]}
                showSearch
                filterOption={antdSelectFilterOption}
                value={tagIds}
                onChange={(value: Array<string>) => {
                  setTagIds(value);
                }}
                placeholder={t('SELECT_TAGS')}
                mode="multiple"
                allowClear
                onKeyDown={(e) => {
                  // prevents triggering SetBuilderKeyboardShortcuts
                  e.nativeEvent.stopPropagation();
                }}
                size={isMobile ? 'large' : undefined}
              >
                {[...tagsData.customSetTags]
                  .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
                  .map((tag) => (
                    <Select.Option key={tag.id} value={tag.id}>
                      <img
                        src={getImageUrl(tag.imageUrl)}
                        alt={tag.name}
                        css={{ width: 16, marginRight: 8, maxHeight: 16 }}
                      />
                      {tag.name}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </div>
        </TabPane>
        )
      </Tabs>
      <InfiniteScroll
        hasMore={userBuilds?.userByName?.customSets.pageInfo.hasNextPage}
        loadMore={onLoadMore}
        useWindow={!getScrollParent}
        threshold={THRESHOLD}
        css={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 20,
          margin: 0,
          [mq[1]]: {
            display: 'grid',
            marginTop: 36,
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridGap: 20,
            margin: '0 auto',
          },
        }}
        getScrollParent={getScrollParent}
        loader={
          <React.Fragment key="frag">
            {Array(4)
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`card-skeleton-${idx}`}
                  css={{
                    marginTop: 20,
                    [mq[1]]: { marginTop: 0 },
                    backgroundColor: theme.layer?.backgroundLight,
                  }}
                  numRows={2}
                />
              ))}
          </React.Fragment>
        }
      >
        {selectedCustomSetId && (
          <DeleteCustomSetModal
            customSetId={selectedCustomSetId}
            visible={deleteModalVisible}
            onCancel={closeDeleteModal}
          />
        )}
        {selectedCustomSetId && (
          <TogglePrivateModal
            customSetId={selectedCustomSetId}
            visible={togglePrivateModalVisible}
            onCancel={closeTogglePrivateModal}
          />
        )}
        {userBuilds?.userByName?.customSets.edges.map(({ node }) => (
          <Link href={`${getCustomSetPathname()}/${node.id}/`} key={node.id}>
            <a>
              <BuildCard
                customSet={node}
                setDeleteModalVisible={setDeleteModalVisible}
                setSelectedCustomSetId={setSelectedCustomSetId}
                setTogglePrivateModalVisible={setTogglePrivateModalVisible}
                isEditable={isEditable}
              />
            </a>
          </Link>
        ))}
        {!queryLoading &&
          userBuilds?.userByName?.customSets.edges.length === 0 && (
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
          Array(BUILD_LIST_PAGE_SIZE)
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
    </div>
  );
};

export default BuildList;
