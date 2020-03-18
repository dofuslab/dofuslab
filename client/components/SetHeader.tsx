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
import { useRouter } from 'next/router';
import Form from 'antd/lib/form';

import { useTranslation } from 'i18n';
import {
  editCustomSetMetadata,
  editCustomSetMetadataVariables,
  editCustomSetMetadata_editCustomSetMetadata_customSet,
} from 'graphql/mutations/__generated__/editCustomSetMetadata';
import EditCustomSetMetadataMutation from 'graphql/mutations/editCustomSetMetdata.graphql';
import { checkAuthentication } from 'common/utils';
import { ellipsis } from 'common/mixins';
import { mq } from 'common/constants';

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
  >(EditCustomSetMetadataMutation);

  const onStartEdit = React.useCallback(() => {
    dispatch({ type: 'START_EDIT', originalState });
  }, [dispatch, customSet?.name, customSet?.level]);

  const onStopEdit = React.useCallback(() => {
    dispatch({ type: 'STOP_EDIT' });
  }, [dispatch]);

  const client = useApolloClient();

  const handleOk = React.useCallback(
    async values => {
      const ok = await checkAuthentication(client, t, customSet);
      if (!ok) return;
      dispatch({ type: 'STOP_EDIT' });
      const { data } = await mutate({
        variables: {
          name: values.name,
          level: values.level,
          customSetId: customSet?.id,
        },
        optimisticResponse: ({ name, level }: any) => {
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
      if (data?.editCustomSetMetadata?.customSet.id !== customSet?.id) {
        router.replace(
          `/?id=${data?.editCustomSetMetadata?.customSet.id}`,
          `/set/${data?.editCustomSetMetadata?.customSet.id}`,
          {
            shallow: true,
          },
        );
      }
    },
    [
      client,
      t,
      customSet,
      customSet?.name,
      customSet?.level,
      router,
      metadataState,
    ],
  );

  const [form] = Form.useForm();

  return (
    <div
      css={{
        margin: '4px 14px',
        [mq[4]]: {
          margin: '4px 20px',
        },
        display: 'flex',
        alignItems: 'baseline',
        flex: '0 0 48px',
      }}
    >
      <Form
        form={form}
        name="header"
        id="header-form"
        onFinish={handleOk}
        layout="inline"
        css={{ display: 'flex', alignItems: 'baseline' }}
        initialValues={{
          name: customSet?.name || '',
          level: customSet?.level || 200,
        }}
      >
        {metadataState.isEditing ? (
          <Form.Item name="name">
            <Input
              css={{
                fontSize: '1.5rem',
                fontWeight: 500,
                width: 240,
              }}
              maxLength={50}
            />
          </Form.Item>
        ) : (
          <div
            css={{
              ...ellipsis,
              fontSize: '1.5rem',
              fontWeight: 500,
              maxWidth: 400,
              marginRight: 20,
            }}
          >
            {customSet?.name || t('UNTITLED')}
          </div>
        )}
        {t('LEVEL')}{' '}
        {metadataState.isEditing ? (
          <Form.Item name="level" css={{ display: 'inline-flex' }}>
            <InputNumber
              css={{ marginLeft: 8 }}
              type="number"
              max={200}
              min={1}
            />
          </Form.Item>
        ) : (
          customSet?.level ?? 200
        )}
        {metadataState.isEditing ? (
          <>
            <Button css={{ marginLeft: 12 }} type="primary" htmlType="submit">
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
      </Form>
    </div>
  );
};

export default SetHeader;
