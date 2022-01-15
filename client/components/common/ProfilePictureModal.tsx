/** @jsx jsx */

import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { Modal, notification } from 'antd';
import { useTheme } from 'emotion-theming';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18n';
import { getImageUrl } from 'common/utils';
import { PROFILE_PICTURES, mq } from '../../common/constants';
import changeProfilePictureMutation from 'graphql/mutations/changeProfilePicture.graphql';
import { Theme } from 'common/types';
import {
  changeProfilePicture,
  changeProfilePictureVariables,
} from 'graphql/mutations/__generated__/changeProfilePicture';
import { useMutation } from '@apollo/client';

interface Props {
  visible: boolean;
  onCancel: () => void;
  currentlyActive: string;
}

const ProfilePictureModal: React.FC<Props> = ({
  onCancel,
  visible,
  currentlyActive,
}) => {
  const { t } = useTranslation('common');
  const [active, setActive] = useState<string>(currentlyActive);
  const theme = useTheme<Theme>();

  const [profilePictureMutate, { loading: changePictureLoading }] = useMutation<
    changeProfilePicture,
    changeProfilePictureVariables
  >(changeProfilePictureMutation, {
    variables: { picture: active },
    awaitRefetchQueries: true,
  });
  const router = useRouter();

  const onChangePicture = React.useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const { data } = await profilePictureMutate();
      onCancel();
      if (data?.changeProfilePicture?.user?.profilePicture) {
        notification.success({
          message: t('SUCCESS'),
          // Missing translation
          description: t('CHANGE_PICTURE_SUCCESS'),
        });
      }
    },
    [profilePictureMutate, router, onCancel],
  );

  const onCancelClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setActive(currentlyActive);
      onCancel();
    },
    [onCancel],
  );

  return (
    <Modal
      visible={visible}
      // Missing translation
      title={t('CHANGE_PICTURE')}
      centered
      onOk={onChangePicture}
      onCancel={onCancelClick}
      confirmLoading={changePictureLoading}
      okText={t('OK')}
    >
      <div
        css={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
      >
        <img
          src={getImageUrl(active)}
          // Missing translation
          alt={t('SELECTED_PROFILE_PICTURE')}
          css={{ maxWidth: 220, borderRadius: 4 }}
        />
      </div>
      <div
        css={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          maxHeight: '30vh',
          overflow: 'auto',
          padding: 4,
          [mq[1]]: {
            maxHeight: 'auto',
          },
        }}
      >
        {PROFILE_PICTURES.map((item, index) => {
          const activeStyle =
            active === item
              ? {
                  borderRadius: 4,
                  boxShadow: `0px 0px 0px 2px ${theme.border?.primarySelected}`,
                  '&:hover': {
                    cursor: 'pointer',
                  },
                }
              : {
                  borderRadius: 4,
                  boxShadow: `0px 0px 0px 1px ${theme.border?.light}`,
                  '&:hover': {
                    cursor: 'pointer',
                  },
                };

          return (
            <img
              src={getImageUrl(item)}
              key={`profile-pic-${index}`}
              // Missing translation
              alt={t('PROFILE_PICTURE')}
              width={'100px'}
              onClick={() => {
                setActive(item);
              }}
              css={activeStyle}
            />
          );
        })}
      </div>
    </Modal>
  );
};

export default ProfilePictureModal;
