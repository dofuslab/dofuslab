/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Button, Divider, Skeleton } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'i18n';

import {
  EditableContext,
  useIsOwnerOfCustomSet,
  getBuildLink,
  getFaceImageUrl,
} from 'common/utils';

import {
  BuildError,
  CustomSetMetadata,
  CustomSetMetadataAction,
} from 'common/types';
import { CustomSet } from 'common/type-aliases';
import Link from 'next/link';
import PublicBuildActions from 'components/common/PublicBuildActions';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import BuildErrors from '../common/BuildErrors';
import BuildActions from '../common/BuildActions';
import DefaultClassModal from '../common/DefaultClassModal';
import BuildTags from '../common/BuildTags';
import CustomSetHeaderForm from '../common/CustomSetHeaderForm';
import { useQuery } from '@apollo/client';

interface Props {
  customSet?: CustomSet | null;
  customSetLoading: boolean;
  isMobile: boolean;
  errors: Array<BuildError>;
  isClassic: boolean;
  className?: string;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const reducer = (state: CustomSetMetadata, action: CustomSetMetadataAction) => {
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
  errors,
  className,
  setDofusClassId,
  customSetLoading,
}) => {
  const originalState = {
    isEditing: false,
    name: customSet?.name || '',
    level: customSet?.level || 200,
  };

  const { data: currentUserData } = useQuery<CurrentUserQueryType>(
    currentUserQuery,
  );

  const isEditable = React.useContext(EditableContext);

  const [metadataState, dispatch] = React.useReducer(reducer, originalState);

  const { t } = useTranslation('common');

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

  const formElement = customSetLoading ? (
    <Skeleton.Input />
  ) : (
    <CustomSetHeaderForm
      customSet={customSet}
      isMobile
      metadataState={metadataState}
      dispatch={dispatch}
      originalState={originalState}
    />
  );

  const creationDate = new Date(customSet?.creationDate);
  const modifiedDate = new Date(customSet?.lastModified);

  const buildLink = getBuildLink(customSet?.id);

  const editBuildButton = (
    <Link href={buildLink.href} as={buildLink.as}>
      <a>
        <Button css={{ marginBottom: 12 }}>
          {t('EDIT_BUILD')}
          <FontAwesomeIcon icon={faPencilAlt} css={{ marginLeft: 8 }} />
        </Button>
      </a>
    </Link>
  );

  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          css={cx(
            css({
              flex: '0 0 96px',
              margin: '12px 4px',
            }),
            className,
          )}
        >
          <div
            css={cx(
              css({
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
              }),
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
                      customSet
                        ? getFaceImageUrl(
                            customSet.defaultClass,
                            customSet.buildGender,
                          )
                        : getFaceImageUrl(
                            currentUserData?.currentUser?.settings.buildClass ??
                              null,
                            currentUserData?.currentUser?.settings.buildGender,
                          )
                    }
                    css={{
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                    alt={
                      (customSet
                        ? customSet.defaultClass?.name
                        : currentUserData?.currentUser?.settings.buildClass
                            ?.name) || t('NO_CLASS')
                    }
                  />
                </a>
              ) : (
                <div css={{ flex: 1 }}>
                  <img
                    src={getFaceImageUrl(
                      customSet?.defaultClass ?? null,
                      currentUserData?.currentUser?.settings.buildGender,
                    )}
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
            {formElement}
          </div>
          <Divider css={{ margin: '12px 0' }} />
          <>
            {customSet && (
              <div css={{ fontSize: '0.75rem' }}>
                <div css={{ display: 'flex' }}>
                  <div css={{ fontWeight: 500 }}>{t('OWNER')}</div>
                  <div css={{ marginLeft: 8 }}>
                    {customSet.owner?.username ? (
                      <Link href={`/user/${customSet.owner.username}`}>
                        <a>{customSet.owner.username}</a>
                      </Link>
                    ) : (
                      t('ANONYMOUS')
                    )}
                  </div>
                </div>
                <div css={{ display: 'flex' }}>
                  {isEditable && (
                    <>
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
                    </>
                  )}
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
            )}
            <Divider css={{ margin: '12px 0' }} />
            <BuildTags
              customSetId={customSet?.id}
              tagAssociations={customSet?.tagAssociations}
              isMobile
            />
            <div>
              {isEditable && customSet && (
                <BuildActions
                  customSet={customSet}
                  isMobile
                  isClassic={false}
                />
              )}
              {customSet && <PublicBuildActions customSet={customSet} />}
            </div>
            {isOwner && !isEditable && editBuildButton}
            {customSet && (
              <BuildErrors customSet={customSet} errors={errors} isMobile />
            )}
          </>
          <DefaultClassModal
            closeModal={closeDefaultClassModal}
            visible={defaultClassModalVisible}
            setDofusClassId={setDofusClassId}
            customSet={customSet}
          />
        </div>
      )}
    </ClassNames>
  );
};

export default SetHeader;
