/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Select, Tag } from 'antd';
// import { useTranslation } from 'i18n';
import { CustomSetTags } from 'common/type-aliases';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery } from '@apollo/client';
import {
  addTagToCustomSet,
  addTagToCustomSetVariables,
} from 'graphql/mutations/__generated__/addTagToCustomSet';
import addTagToCustomSetMutation from 'graphql/mutations/addTagToCustomSet.graphql';
import customSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import {
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
import { LabeledValue } from 'antd/lib/select';
import { useRouter } from 'next/router';

interface Props {
  customSetId?: string;
  tags?: Array<CustomSetTags>;
}

const BuildTags: React.FC<Props> = ({ customSetId, tags }) => {
  const isEditable = React.useContext(EditableContext);
  const { data } = useQuery<customSetTags>(customSetTagsQuery);
  const [addMutate] = useMutation<
    addTagToCustomSet,
    addTagToCustomSetVariables
  >(addTagToCustomSetMutation, {
    optimisticResponse:
      customSetId && tags && data
        ? ({ customSetTagId }) => {
            const newTag = data.customSetTags.find(
              (cst) => cst.id === customSetTagId,
            );
            return {
              addTagToCustomSet: {
                customSet: {
                  id: customSetId,
                  tags: newTag ? [...tags, newTag] : tags,
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
      customSetId && tags
        ? ({ customSetTagId }) => {
            return {
              removeTagFromCustomSet: {
                customSet: {
                  id: customSetId,
                  tags: tags.filter((t1) => t1.id !== customSetTagId),
                  __typename: 'CustomSet',
                },
                __typename: 'RemoveTagFromCustomSet',
              },
            };
          }
        : undefined,
  });

  const router = useRouter();

  return (
    <div
      css={{
        marginTop: 12,
        display: 'flex',
        alignItems: 'flex-start',
        flexFlow: 'wrap',
        [mq[1]]: { marginTop: 0 },
      }}
    >
      {tags?.map((tag) => {
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
      {isEditable && (
        <Select
          key={tags?.length ? tags[tags.length - 1].id : undefined}
          size="small"
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
          css={{
            width: 100,
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 12,
            marginBottom: 4,
          }}
          placeholder="Add tag"
          labelInValue
          filterOption={(input, option) => {
            return (option?.children[1] as string)
              .toLocaleUpperCase()
              .includes(input.toLocaleUpperCase());
          }}
        >
          {data &&
            [...data.customSetTags]
              .sort((t1, t2) => t1.name.localeCompare(t2.name))
              .map((tag) => (
                <Select.Option
                  key={tag.id}
                  value={tag.id}
                  disabled={tags?.some((t1) => t1.id === tag.id)}
                  style={{
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
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
      )}
    </div>
  );
};

export default BuildTags;
