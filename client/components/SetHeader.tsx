/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import Input from 'antd/lib/input';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import Button from 'antd/lib/button';
import InputNumber from 'antd/lib/input-number';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'i18n';
import {
  editCustomSetMetadata,
  editCustomSetMetadataVariables,
  editCustomSetMetadata_editCustomSetMetadata_customSet,
} from 'graphql/mutations/__generated__/editCustomSetMetadata';
import EditCustomSetMetadataMutation from 'graphql/mutations/editCustomSetMetdata.graphql';
import { checkAuthentication } from 'common/utils';
import { useRouter } from 'next/router';
import { ellipsis } from 'common/mixins';

interface IProps {
  customSet?: customSet | null;
}

interface CustomSetMetadata {
  isEditing: boolean;
  name: string;
  level: number;
}

type CustomSetMetdataAction =
  | { type: 'START_EDIT'; originalState: CustomSetMetadata }
  | { type: 'EDIT_NAME'; name: string }
  | { type: 'EDIT_LEVEL'; level: number }
  | { type: 'STOP_EDIT' };

const reducer = (state: CustomSetMetadata, action: CustomSetMetdataAction) => {
  switch (action.type) {
    case 'START_EDIT': {
      return { ...action.originalState, isEditing: true };
    }
    case 'EDIT_NAME': {
      return { ...state, name: action.name };
    }
    case 'EDIT_LEVEL': {
      return { ...state, level: action.level };
    }
    case 'STOP_EDIT': {
      return { ...state, isEditing: false };
    }
    default:
      throw new Error('Invalid action type');
  }
};

const SetHeader: React.FC<IProps> = ({ customSet }) => {
  const originalState = {
    isEditing: false,
    name: customSet?.name || '',
    level: customSet?.level || 200,
  };

  const router = useRouter();

  const [metadataState, dispatch] = React.useReducer(reducer, originalState);

  const { t } = useTranslation('common');
  const [mutate] = useMutation<
    editCustomSetMetadata,
    editCustomSetMetadataVariables
  >(EditCustomSetMetadataMutation, {
    variables: {
      name: metadataState.name,
      level: metadataState.level,
      customSetId: customSet?.id,
    },
    optimisticResponse: ({ name, level }) => {
      const optimisticCustomSet: editCustomSetMetadata_editCustomSetMetadata_customSet = {
        id: 'custom-set-0',
        ...customSet,
        name: name || null,
        level,
        __typename: 'CustomSet',
      };

      return {
        editCustomSetMetadata: {
          customSet: optimisticCustomSet,
          __typename: 'EditCustomSetMetadata',
        },
      };
    },
  });

  const onStartEdit = React.useCallback(() => {
    dispatch({ type: 'START_EDIT', originalState });
  }, [dispatch, customSet?.name, customSet?.level]);

  const onStopEdit = React.useCallback(() => {
    dispatch({ type: 'STOP_EDIT' });
  }, [dispatch]);

  const onEditName = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'EDIT_NAME', name: e.currentTarget.value });
    },
    [dispatch],
  );

  const onEditLevel = React.useCallback(
    (level: number | undefined) => {
      if (level) {
        dispatch({ type: 'EDIT_LEVEL', level });
      }
    },
    [dispatch],
  );

  const client = useApolloClient();

  const onConfirm = React.useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return;
    dispatch({ type: 'STOP_EDIT' });
    const { data } = await mutate();
    if (data?.editCustomSetMetadata?.customSet.id !== customSet?.id) {
      router.replace(
        `/?id=${data?.editCustomSetMetadata?.customSet.id}`,
        `/set/${data?.editCustomSetMetadata?.customSet.id}`,
        {
          shallow: true,
        },
      );
    }
  }, [
    client,
    t,
    customSet,
    customSet?.name,
    customSet?.level,
    router,
    metadataState,
  ]);

  return (
    <div
      css={{
        margin: '8px 20px',
        display: 'flex',
        alignItems: 'baseline',
        flex: '0 0 48px',
      }}
    >
      {metadataState.isEditing ? (
        <Input
          css={{ fontSize: '1.5rem', fontWeight: 500, width: 240 }}
          value={metadataState.name}
          onChange={onEditName}
          maxLength={50}
        />
      ) : (
        <div
          css={{
            ...ellipsis,
            fontSize: '1.5rem',
            fontWeight: 500,
            maxWidth: 400,
          }}
        >
          {customSet?.name || t('UNTITLED')}
        </div>
      )}

      <div css={{ marginLeft: 20 }}>
        {t('LEVEL')}{' '}
        {metadataState.isEditing ? (
          <InputNumber
            css={{ marginLeft: 8 }}
            type="number"
            max={200}
            min={1}
            value={metadataState.level}
            onChange={onEditLevel}
          />
        ) : (
          customSet?.level ?? 200
        )}
      </div>
      {metadataState.isEditing ? (
        <>
          <Button css={{ marginLeft: 12 }} onClick={onConfirm}>
            {t('OK')}
          </Button>
          <Button css={{ marginLeft: 12 }} onClick={onStopEdit}>
            {t('CANCEL')}
          </Button>
        </>
      ) : (
        <a css={{ marginLeft: 12 }}>
          <FontAwesomeIcon icon={faPencilAlt} onClick={onStartEdit} />
        </a>
      )}
    </div>
  );
};

export default SetHeader;
