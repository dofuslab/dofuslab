/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Button, Popover, Skeleton } from 'antd';
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
import BonusStats from './BonusStats';
import BuildErrors from '../common/BuildErrors';
import BuildActions from '../common/BuildActions';
import DefaultClassModal from '../common/DefaultClassModal';
import BuildTags from '../common/BuildTags';
import CustomSetHeaderForm from '../common/CustomSetHeaderForm';
import { useQuery } from '@apollo/client';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { MAX_LEVEL } from 'common/constants';

interface Props {
  customSet?: CustomSet | null;
  customSetLoading: boolean;
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
  isClassic,
  errors,
  className,
  setDofusClassId,
  customSetLoading,
}) => {
  const isEditable = React.useContext(EditableContext);

  const { data: currentUserData } = useQuery<CurrentUserQueryType>(
    currentUserQuery,
  );

  const originalState = {
    isEditing: false,
    name: customSet?.name || '',
    level: customSet?.level || MAX_LEVEL,
  };

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

  const formElement = (
    <CustomSetHeaderForm
      customSet={customSet}
      isMobile={false}
      metadataState={metadataState}
      dispatch={dispatch}
      originalState={originalState}
    />
  );

  const defaultClassImg = (
    <img
      src={
        customSet
          ? getFaceImageUrl(customSet.defaultClass, customSet.buildGender)
          : getFaceImageUrl(
              currentUserData?.currentUser?.settings.buildClass ?? null,
              currentUserData?.currentUser?.settings.buildGender,
            )
      }
      css={{
        maxWidth: '100%',
        width: 'auto',
        height: 'auto',
      }}
      alt={customSet?.defaultClass?.name ?? t('NO_CLASS')}
    />
  );

  let defaultClassContent = <div css={{ flex: 1 }}>{defaultClassImg}</div>;

  if (customSetLoading) {
    defaultClassContent = (
      <Skeleton.Avatar active css={{ width: 42, height: 42 }} />
    );
  } else if (isEditable) {
    defaultClassContent = (
      <a onClick={openDefaultClassModal} css={{ display: 'block', flex: 1 }}>
        {defaultClassImg}
      </a>
    );
  }

  let content = formElement;

  const creationDate = new Date(customSet?.creationDate);
  const modifiedDate = new Date(customSet?.lastModified);

  if (customSetLoading) {
    content = <Skeleton.Input active css={{ width: 200 }} />;
  } else if (customSet && !isEditable) {
    content = (
      <div>
        {formElement}
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            gridColumnGap: 12,
          }}
        >
          <div css={{ fontWeight: 500 }}>{t('OWNER')}</div>
          <div>
            {customSet.owner?.username ? (
              <Link href={`/user/${customSet.owner.username}`}>
                {customSet.owner.username}
              </Link>
            ) : (
              t('ANONYMOUS')
            )}
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
      </div>
    );
  } else if (customSet && !metadataState.isEditing) {
    content = (
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
            <div>
              {customSet.owner?.username ? (
                <Link href={`/user/${customSet.owner.username}`}>
                  {customSet.owner.username}
                </Link>
              ) : (
                t('ANONYMOUS')
              )}
            </div>
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
    );
  }

  const buildLink = getBuildLink(customSet?.id);

  const editBuildButton = (
    <Link href={buildLink.href} as={buildLink.as}>
      <a
        css={{
          alignSelf: 'center',
          marginLeft: 12,
          marginBottom: 0,
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
        <div
          css={cx(
            css({
              flex: '0 0 52px',
              margin: '4px 0px',
            }),
            className,
          )}
        >
          <div
            css={{
              display: 'flex',
              marginBottom: 8,
              overflowX: 'hidden',
              alignItems: 'stretch',
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                flex: '0 0 36px',
                marginRight: 12,
              }}
            >
              {defaultClassContent}
            </div>
            {content}
            {customSet && !isClassic && (
              <BonusStats
                customSet={customSet}
                isMobile={false}
                isClassic={false}
              />
            )}
            {customSet && (
              <BuildErrors
                customSet={customSet}
                errors={errors}
                isMobile={false}
              />
            )}
            {customSet && isEditable && (
              <BuildActions
                customSet={customSet}
                isMobile={false}
                isClassic={isClassic}
              />
            )}
            {customSet && isOwner && !isEditable && editBuildButton}
            {customSet && (
              <PublicBuildActions
                customSet={customSet}
                css={{ marginLeft: 'auto' }}
              />
            )}
          </div>
          <DefaultClassModal
            closeModal={closeDefaultClassModal}
            visible={defaultClassModalVisible}
            setDofusClassId={setDofusClassId}
            customSet={customSet}
          />
          <BuildTags
            customSetId={customSet?.id}
            tagAssociations={customSet?.tagAssociations}
            isMobile={false}
          />
        </div>
      )}
    </ClassNames>
  );
};

export default SetHeader;
