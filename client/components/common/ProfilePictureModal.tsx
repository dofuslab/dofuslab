/** @jsxImportSource @emotion/react */

import type { MouseEvent } from 'react';

import { useCallback, useContext, useState } from 'react';

import { Divider, Modal } from 'antd';
import { useTheme } from '@emotion/react';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';
import { getImageUrl } from 'common/utils';
import changeProfilePictureMutation from 'graphql/mutations/changeProfilePicture.graphql';
import {
  changeProfilePicture,
  changeProfilePictureVariables,
} from 'graphql/mutations/__generated__/changeProfilePicture';
import { useMutation } from '@apollo/client';
import { PROFILE_PICTURES, mq } from 'common/constants';
import NotificationContext from 'common/notificationContext';

interface Props {
  open: boolean;
  onCancel: () => void;
  currentlyActive: string;
}

const ProfilePictureModal = ({ onCancel, open, currentlyActive }: Props) => {
  const { t } = useTranslation('common');
  const [active, setActive] = useState<string>(currentlyActive);
  const theme = useTheme();

  const [profilePictureMutate, { loading: changePictureLoading }] = useMutation<
    changeProfilePicture,
    changeProfilePictureVariables
  >(changeProfilePictureMutation, {
    variables: { picture: active },
    awaitRefetchQueries: true,
  });
  const router = useRouter();
  const notificationApi = useContext(NotificationContext);
  const onChangePicture = useCallback(
    async (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const { data } = await profilePictureMutate();
      onCancel();
      if (data?.changeProfilePicture?.user?.profilePicture) {
        notificationApi.success({
          message: t('SUCCESS'),
          description: t('CHANGE_PICTURE_SUCCESS'),
        });
      }
    },
    [profilePictureMutate, router, onCancel],
  );

  const onCancelClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setActive(currentlyActive);
      onCancel();
    },
    [onCancel],
  );

  return (
    <Modal
      open={open}
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
          alt={t('SELECTED_PROFILE_PICTURE')}
          css={{ maxWidth: 220, borderRadius: 4 }}
        />
      </div>
      <Divider />
      <div
        css={{
          display: 'grid',
          gap: '16px',
          maxHeight: '30vh',
          gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))',
          overflow: 'auto',
          padding: 4,
          [mq[1]]: {
            maxHeight: 'auto',
          },
        }}
      >
        {PROFILE_PICTURES.map((pictureUrlSuffix) => {
          const activeStyle =
            active === pictureUrlSuffix
              ? {
                  borderRadius: 4,
                  boxShadow: `0px 0px 0px 2px ${theme.border?.primarySelected}`,
                  width: '100%',
                  height: '100%',
                  '&:hover': {
                    cursor: 'pointer',
                  },
                }
              : {
                  borderRadius: 4,
                  boxShadow: `0px 0px 0px 1px ${theme.border?.light}`,
                  width: '100%',
                  height: '100%',
                  '&:hover': {
                    cursor: 'pointer',
                  },
                };

          return (
            <a
              onClick={() => {
                setActive(pictureUrlSuffix);
              }}
              key={`profile-pic-${pictureUrlSuffix}`}
            >
              <img
                src={getImageUrl(pictureUrlSuffix)}
                alt={t('PROFILE_PICTURE')}
                css={activeStyle}
              />
            </a>
          );
        })}
      </div>
    </Modal>
  );
};

export default ProfilePictureModal;
