/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Button, Input, InputNumber, Form, Popover } from 'antd';
import { useMutation, useApolloClient } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18n';
import {
  editCustomSetMetadata,
  editCustomSetMetadataVariables,
} from 'graphql/mutations/__generated__/editCustomSetMetadata';
import EditCustomSetMetadataMutation from 'graphql/mutations/editCustomSetMetdata.graphql';
import {
  checkAuthentication,
  navigateToNewCustomSet,
  EditableContext,
  useIsOwnerOfCustomSet,
  getBuildLink,
  getImageUrl,
} from 'common/utils';
import { ellipsis, inputFontSize } from 'common/mixins';
import { mq } from 'common/constants';
import { BuildError } from 'common/types';
import { CustomSet } from 'common/type-aliases';
import Link from 'next/link';
import PublicBuildActions from 'components/common/PublicBuildActions';
import BonusStats from '../desktop/BonusStats';
import BuildErrors from './BuildErrors';
import BuildActions from './BuildActions';
import DefaultClassModal from './DefaultClassModal';

interface Props {
  customSet?: CustomSet | null;
  isMobile: boolean;
  errors: Array<BuildError>;
  isClassic: boolean;
  className?: string;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
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

const SetHeader: React.FC<Props> = ({
  customSet,
  isClassic,
  isMobile,
  errors,
  className,
  setDofusClassId,
}) => {
  const originalState = {
    isEditing: false,
    name: customSet?.name || '',
    level: customSet?.level || 200,
  };

  const router = useRouter();

  const isEditable = React.useContext(EditableContext);

  const [metadataState, dispatch] = React.useReducer(reducer, originalState);

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

  const [
    defaultClassModalVisible,
    setDefaultClassModalVisible,
  ] = React.useState(false);

  const openDefaultClassModal = React.useCallback(() => {
    setDefaultClassModalVisible(true);
  }, [setDefaultClassModalVisible]);
  const closeDefaultClassModal = React.useCallback(() => {
    setDefaultClassModalVisible(false);
  }, [setDefaultClassModalVisible]);

  const isOwner = useIsOwnerOfCustomSet(customSet);

  const formElement = (
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
    >
      {metadataState.isEditing ? (
        <Form.Item name="name">
          <Input
            key={`input-${customSet?.id}`}
            css={{
              fontSize: '1.2rem',
              fontWeight: 500,
              [mq[1]]: {
                flex: '1 1 0',
                fontSize: '1.5rem',
                width: 240,
                maxWidth: '100%',
              },
            }}
            maxLength={50}
          />
        </Form.Item>
      ) : (
        <div
          css={{
            ...ellipsis,
            fontSize: '1.2rem',
            fontWeight: 500,
            maxWidth: '100%',
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

  const creationDate = new Date(customSet?.creationDate);
  const modifiedDate = new Date(customSet?.lastModified);

  const buildLink = getBuildLink(customSet?.id);

  const editBuildButton = (
    <Link href={buildLink.href} as={buildLink.as}>
      <a
        css={{
          marginBottom: 20,
          [mq[1]]: { alignSelf: 'center', marginLeft: 12, marginBottom: 0 },
        }}
      >
        <Button>
          {t('EDIT_BUILD')}
          <FontAwesomeIcon icon={faPencilAlt} css={{ marginLeft: 8 }} />
        </Button>
      </a>
    </Link>
  );

  return (
    <ClassNames>
      {({ css, cx }) => (
        <>
          <div
            css={cx(
              css({
                display: 'flex',
                alignItems: 'center',
                flex: '0 0 96px',
                margin: '12px 4px',
                [mq[1]]: {
                  overflowX: 'hidden',
                  alignItems: 'stretch',
                  margin: '4px 0px',
                  flex: '0 0 52px',
                },
              }),
              className,
            )}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                flex: '0 0 36px',
                marginRight: 12,
              }}
            >
              {isEditable ? (
                <a
                  onClick={openDefaultClassModal}
                  css={{ display: 'block', flex: 1 }}
                >
                  <img
                    src={
                      customSet?.defaultClass?.faceImageUrl ??
                      getImageUrl('class/face/No_Class.svg')
                    }
                    css={{
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                    alt={customSet?.defaultClass?.name ?? t('NO_CLASS')}
                  />
                </a>
              ) : (
                <div css={{ flex: 1 }}>
                  <img
                    src={
                      customSet?.defaultClass?.faceImageUrl ??
                      getImageUrl('class/face/No_Class.svg')
                    }
                    css={{
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                    alt={customSet?.defaultClass?.name ?? t('NO_CLASS')}
                  />
                </div>
              )}
            </div>
            {customSet && !metadataState.isEditing && !isMobile ? (
              <Popover
                overlayStyle={{ maxWidth: 360 }}
                title={
                  <div css={{ fontWeight: 500, overflowWrap: 'break-word' }}>
                    {customSet.name || t('UNTITLED')}
                  </div>
                }
                content={
                  <div
                    css={{
                      display: 'grid',
                      gridTemplateColumns: 'auto auto',
                      gridColumnGap: 12,
                    }}
                  >
                    <div css={{ fontWeight: 500 }}>{t('OWNER')}</div>
                    <div>{customSet.owner?.username ?? t('ANONYMOUS')}</div>
                    <div css={{ fontWeight: 500 }}>{t('CREATED')}</div>
                    <div>
                      {creationDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      {creationDate.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div css={{ fontWeight: 500 }}>{t('LAST_MODIFIED')}</div>
                    <div>
                      {modifiedDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      {modifiedDate.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                }
              >
                {formElement}
              </Popover>
            ) : (
              formElement
            )}
            {customSet && !isMobile && !isClassic && (
              <BonusStats
                customSet={customSet}
                isMobile={false}
                isClassic={false}
              />
            )}
            {customSet && !isMobile && (
              <BuildErrors
                customSet={customSet}
                errors={errors}
                isMobile={false}
              />
            )}
            {customSet && !isMobile && isEditable && (
              <BuildActions
                customSet={customSet}
                isMobile={false}
                isClassic={isClassic}
              />
            )}
            {customSet &&
              isOwner &&
              !isEditable &&
              !isMobile &&
              editBuildButton}
            {customSet && !isMobile && (
              <PublicBuildActions
                customSet={customSet}
                css={{ marginLeft: 'auto' }}
              />
            )}
          </div>
          {customSet && isMobile && (
            <>
              <div css={{ marginBottom: 20, fontSize: '0.75rem' }}>
                <div css={{ display: 'flex' }}>
                  <div css={{ fontWeight: 500 }}>{t('OWNER')}</div>
                  <div css={{ marginLeft: 8 }}>
                    {customSet.owner?.username ?? t('ANONYMOUS')}
                  </div>
                </div>
                <div css={{ display: 'flex' }}>
                  <div css={{ fontWeight: 500 }}>{t('CREATED')}</div>
                  <div css={{ marginLeft: 8 }}>
                    {creationDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    {creationDate.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div css={{ display: 'flex' }}>
                  <div css={{ fontWeight: 500 }}>{t('LAST_MODIFIED')}</div>
                  <div css={{ marginLeft: 8 }}>
                    {modifiedDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    {modifiedDate.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              {isEditable && (
                <BuildActions
                  customSet={customSet}
                  isMobile
                  isClassic={false}
                />
              )}
              {isOwner && !isEditable && editBuildButton}
              <BuildErrors customSet={customSet} errors={errors} isMobile />
            </>
          )}
          <DefaultClassModal
            closeModal={closeDefaultClassModal}
            visible={defaultClassModalVisible}
            setDofusClassId={setDofusClassId}
            customSet={customSet}
          />
        </>
      )}
    </ClassNames>
  );
};

export default SetHeader;
