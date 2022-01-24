/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Divider, Select, Tag } from 'antd';
import { useRouter } from 'next/router';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery } from '@apollo/client';
import { LabeledValue } from 'antd/lib/select';

import { CustomSetTagAssociations } from 'common/type-aliases';
import {
  addTagToCustomSet,
  addTagToCustomSetVariables,
} from 'graphql/mutations/__generated__/addTagToCustomSet';
import addTagToCustomSetMutation from 'graphql/mutations/addTagToCustomSet.graphql';
import customSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import {
  antdSelectFilterOption,
  EditableContext,
  getImageUrl,
  navigateToNewCustomSet,
} from 'common/utils';
import { mq } from 'common/constants';
import {
  removeTagFromCustomSet,
  removeTagFromCustomSetVariables,
} from 'graphql/mutations/__generated__/removeTagFromCustomSet';
import removeTagFromCustomSetMutation from 'graphql/mutations/removeTagFromCustomSet.graphql';
import { useTranslation } from 'i18n';
import { smallInputFontSize } from 'common/mixins';

interface Props {
  customSetId?: string;
  tagAssociations?: Array<CustomSetTagAssociations>;
  isMobile: boolean;
}

const BuildTags: React.FC<Props> = ({
  customSetId,
  tagAssociations,
  isMobile,
}) => {
  const { t } = useTranslation('common');
  const isEditable = React.useContext(EditableContext);
  const { data } = useQuery<customSetTags>(customSetTagsQuery);
  const maxAssociationTime =
    tagAssociations?.reduce(
      (currMax, { associationDate }) =>
        Math.max(currMax, new Date(associationDate).getTime()),
      0,
    ) ?? 0;
  const [addMutate] = useMutation<
    addTagToCustomSet,
    addTagToCustomSetVariables
  >(addTagToCustomSetMutation, {
    optimisticResponse:
      customSetId && tagAssociations && data
        ? ({ customSetTagId }) => {
            const newTag = data.customSetTags.find(
              (cst) => cst.id === customSetTagId,
            );
            if (!newTag) {
              return {
                addTagToCustomSet: {
                  customSet: {
                    id: customSetId,
                    tagAssociations,
                    __typename: 'CustomSet',
                  },
                  __typename: 'AddTagToCustomSet',
                },
              };
            }
            const newTagAssociation = {
              id: '0',
              associationDate: new Date(maxAssociationTime + 1).toISOString(), // hack to always show new tag last
              customSetTag: newTag,
              __typename: 'CustomSetTagAssociation' as const,
            };

            return {
              addTagToCustomSet: {
                customSet: {
                  id: customSetId,
                  tagAssociations: newTagAssociation
                    ? [...tagAssociations, newTagAssociation]
                    : tagAssociations,
                  __typename: 'CustomSet',
                },
                __typename: 'AddTagToCustomSet',
              },
            };
          }
        : undefined,
  });
  const [removeMutate] = useMutation<
    removeTagFromCustomSet,
    removeTagFromCustomSetVariables
  >(removeTagFromCustomSetMutation, {
    optimisticResponse:
      customSetId && tagAssociations
        ? ({ customSetTagId }) => {
            return {
              removeTagFromCustomSet: {
                customSet: {
                  id: customSetId,
                  tagAssociations: tagAssociations.filter(
                    (t1) => t1.customSetTag?.id !== customSetTagId,
                  ),
                  __typename: 'CustomSet',
                },
                __typename: 'RemoveTagFromCustomSet',
              },
            };
          }
        : undefined,
  });

  const router = useRouter();

  const selectMenu = (
    <Select
      key={
        tagAssociations?.length
          ? tagAssociations[tagAssociations.length - 1].id
          : undefined
      }
      size={isMobile ? 'middle' : 'small'}
      onSelect={async (selectedValue: LabeledValue) => {
        const { data: addMutateData } = await addMutate({
          variables: { customSetTagId: selectedValue.value, customSetId },
        });
        if (addMutateData?.addTagToCustomSet?.customSet) {
          navigateToNewCustomSet(
            router,
            addMutateData?.addTagToCustomSet.customSet.id,
          );
        }
      }}
      showSearch
      css={[
        {
          width: 160,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 4,
          marginTop: tagAssociations?.length ? 8 : 0,
          [mq[1]]: {
            width: 100,
            marginTop: 0,
            display: 'inline-flex',
          },
        },
        smallInputFontSize,
      ]}
      placeholder={t('ADD_TAG')}
      labelInValue
      filterOption={antdSelectFilterOption}
      onKeyDown={(e) => {
        // prevents triggering SetBuilderKeyboardShortcuts
        e.nativeEvent.stopPropagation();
      }}
    >
      {data &&
        [...data.customSetTags]
          .sort((t1, t2) => t1.name.localeCompare(t2.name))
          .map((tag) => (
            <Select.Option
              key={tag.id}
              value={tag.id}
              disabled={tagAssociations?.some(
                ({ customSetTag: t1 }) => t1.id === tag.id,
              )}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: isMobile ? 'max(0.9rem, 16px)' : '0.65rem',
              }}
            >
              <img
                src={getImageUrl(tag.imageUrl)}
                alt={tag.name}
                css={{
                  width: 14,
                  height: 'auto',
                  marginRight: 6,
                }}
              />
              {tag.name}
            </Select.Option>
          ))}
    </Select>
  );

  return (
    <>
      <div>
        <div
          css={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'flex-start',
            flexFlow: 'wrap',
            [mq[1]]: { marginTop: 0 },
          }}
        >
          {tagAssociations &&
            [...tagAssociations]
              .sort(
                (a1, a2) =>
                  new Date(a1.associationDate).getTime() -
                  new Date(a2.associationDate).getTime(),
              )
              .map(({ customSetTag: tag }) => {
                return (
                  <Tag
                    key={tag.id}
                    css={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginBottom: 4,
                      height: 24,
                      cursor: isEditable ? 'pointer' : 'auto',
                    }}
                    closable={isEditable}
                    closeIcon={
                      <FontAwesomeIcon icon={faTimes} css={{ marginLeft: 4 }} />
                    }
                    onClose={() => {
                      if (!isEditable) {
                        return;
                      }
                      removeMutate({
                        variables: { customSetTagId: tag.id, customSetId },
                      });
                    }}
                    onClick={() => {
                      if (!isEditable) {
                        return;
                      }
                      removeMutate({
                        variables: { customSetTagId: tag.id, customSetId },
                      });
                    }}
                  >
                    <img
                      src={getImageUrl(tag.imageUrl)}
                      alt={tag.name}
                      css={{
                        width: 14,
                        height: 'auto',
                        marginRight: 4,
                      }}
                    />
                    {tag.name}
                  </Tag>
                );
              })}
          {isEditable && !isMobile && selectMenu}
        </div>
        {isEditable && isMobile && selectMenu}
      </div>
      {isMobile && !!(isEditable || tagAssociations?.length) && (
        <Divider css={{ margin: '12px 0' }} />
      )}
    </>
  );
};

export default BuildTags;
