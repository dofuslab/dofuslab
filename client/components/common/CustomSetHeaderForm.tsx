/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { Button, Input, InputNumber, Form } from 'antd';

import {
  editCustomSetMetadata,
  editCustomSetMetadataVariables,
} from 'graphql/mutations/__generated__/editCustomSetMetadata';
import EditCustomSetMetadataMutation from 'graphql/mutations/editCustomSetMetdata.graphql';
import { CustomSet } from 'common/type-aliases';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  checkAuthentication,
  EditableContext,
  navigateToNewCustomSet,
} from 'common/utils';
import { CustomSetMetadata, CustomSetMetadataAction } from 'common/types';
import { useRouter } from 'next/router';
import { mq } from 'common/constants';
import { useTranslation } from 'next-i18next';
import { ellipsis, inputFontSize } from 'common/mixins';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
  customSet?: CustomSet | null;
  isMobile: boolean;
  metadataState: CustomSetMetadata;
  dispatch: React.Dispatch<CustomSetMetadataAction>;
  originalState: CustomSetMetadata;
}

const CustomSetHeaderForm: React.FC<Props> = ({
  customSet,
  isMobile,
  dispatch,
  metadataState,
  originalState,
  ...restProps
}) => {
  const isEditable = React.useContext(EditableContext);

  const { t } = useTranslation('common');

  const [mutate] = useMutation<
    editCustomSetMetadata,
    editCustomSetMetadataVariables
  >(EditCustomSetMetadataMutation, { refetchQueries: () => ['myCustomSets'] });

  const [form] = Form.useForm();

  const onStartEdit = React.useCallback(() => {
    if (!isEditable) {
      return;
    }
    dispatch({ type: 'START_EDIT', originalState });
  }, [dispatch, customSet?.name, customSet?.level, isEditable]);

  const onStopEdit = React.useCallback(() => {
    dispatch({ type: 'STOP_EDIT' });
    form.resetFields();
  }, [dispatch, form]);

  const client = useApolloClient();

  const router = useRouter();

  const handleOk = React.useCallback(
    async (values) => {
      const ok = await checkAuthentication(client, t, customSet);
      if (!ok) return;
      dispatch({ type: 'STOP_EDIT' });
      const { data } = await mutate({
        variables: {
          name: values.name,
          level: values.level,
          customSetId: customSet?.id,
        },
        optimisticResponse: customSet
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ({ name, level }: any) => {
              const optimisticCustomSet: CustomSet = {
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
            }
          : undefined,
      });

      if (data?.editCustomSetMetadata?.customSet) {
        navigateToNewCustomSet(router, data.editCustomSetMetadata.customSet.id);
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

  return (
    <Form
      key={`form-${customSet?.id}`}
      form={form}
      name="header"
      id={isMobile ? 'header-form-mobile' : 'header-form'}
      onFinish={handleOk}
      layout="inline"
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        [mq[1]]: {
          width: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          minWidth: 200,
          flex: '0 1 auto',
          maxWidth: 480,
          flexWrap: 'nowrap',
        },
        '&.ant-form-inline .ant-form-item': {
          marginRight: 0,
          [mq[1]]: {
            marginRight: 16,
            minWidth: 0,
            flex: '1 1 0',
          },
        },
      }}
      initialValues={{
        name: customSet?.name || '',
        level: customSet?.level || 200,
      }}
      // used for Popover events onMouseEnter, onMouseLeave, onFocus, onClick
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    >
      {metadataState.isEditing ? (
        <Form.Item name="name">
          <Input
            key={`input-${customSet?.id}`}
            css={{
              fontSize: '1.15rem',
              fontWeight: 500,
              [mq[1]]: {
                flex: '1 1 0',
                width: 240,
                maxWidth: '100%',
              },
            }}
            maxLength={50}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
      ) : (
        <div
          css={{
            ...ellipsis,
            fontSize: '1.2rem',
            fontWeight: 500,
            maxWidth: '100%',
            color: 'rgba(255, 255, 255, 0.85)',
            [mq[1]]: {
              flex: '0 1 auto',
              fontSize: '1.5rem',
              maxWidth: 400,
            },
            marginRight: 12,
            cursor: isEditable ? 'pointer' : 'auto',
          }}
          onClick={onStartEdit}
        >
          {customSet?.name || t('UNTITLED')}
        </div>
      )}
      <div
        css={{
          display: 'flex',
          fontSize: '0.75rem',
          alignItems: 'center',
          marginTop: 8,
          [mq[1]]: {
            // space in case div needs to wrap
            margin: '4px 0',
          },
          flex: '0 0 auto',
        }}
      >
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            cursor: isEditable ? 'pointer' : 'auto',
          }}
          onClick={onStartEdit}
        >
          {t('LEVEL')}{' '}
          {metadataState.isEditing ? (
            <Form.Item name="level" css={{ display: 'inline-flex' }}>
              <InputNumber
                css={{ marginLeft: 8, width: 64, ...inputFontSize }}
                type="number"
                max={200}
                min={1}
                onKeyDown={(e) => {
                  // prevents triggering SetBuilderKeyboardShortcuts
                  e.nativeEvent.stopPropagation();
                }}
              />
            </Form.Item>
          ) : (
            customSet?.level ?? 200
          )}
        </div>
        {isEditable &&
          (metadataState.isEditing ? (
            <div css={{ marginLeft: 'auto' }}>
              <Button type="primary" htmlType="submit">
                {t('OK')}
              </Button>
              <Button css={{ marginLeft: 12 }} onClick={onStopEdit}>
                {t('CANCEL')}
              </Button>
            </div>
          ) : (
            <a css={{ marginLeft: 12 }}>
              <FontAwesomeIcon icon={faPencilAlt} onClick={onStartEdit} />
            </a>
          ))}
      </div>
    </Form>
  );
};

export default CustomSetHeaderForm;
