/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import {
  Modal,
  // notification
} from 'antd';
// import { useMutation } from '@apollo/client';
// import { useRouter } from 'next/router';

import { useTranslation } from 'i18n';
// import {
//   deleteCustomSet,
//   deleteCustomSetVariables,
// } from 'graphql/mutations/__generated__/deleteCustomSet';
// import deleteCustomSetMutation from 'graphql/mutations/deleteCustomSet.graphql';

interface Props {
  visible: boolean;
  onCancel: () => void;
}

const ProfilePictureModal: React.FC<Props> = ({ onCancel, visible }) => {
  const { t } = useTranslation('common');
  // const [profileMutate, { loading: changePictureLoading }] = useMutation<
  //   changeProfilePicture,
  //   changeProfilePictureVariables
  // >(changeProfilePictureMutation, {
  //   variables: {  },
  //   refetchQueries: () => ['userProfile'],
  //   awaitRefetchQueries: true,
  // });
  // const router = useRouter();

  // const onChangePicture = React.useCallback(
  //   async (e: React.MouseEvent<HTMLElement>) => {
  //     e.stopPropagation();
  //     const { data } = await profileMutate();
  //     onCancel();
  //     if (data?.deleteCustomSet?.ok) {
  //       if (customSetId === router.query.customSetId) {
  //         router.push('/', '/', { shallow: true });
  //       }
  //       notification.success({
  //         message: t('SUCCESS'),
  //         description: t('DELETE_BUILD_SUCCESS'),
  //       });
  //     }
  //   },
  //   [deleteMutate, router, onCancel, customSetId],
  // );

  const onCancelClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      onCancel();
    },
    [onCancel],
  );

  return (
    <Modal
      visible={visible}
      title={t('DELETE_BUILD')}
      centered
      onOk={() => {
        console.log('clicked!');
      }}
      onCancel={onCancelClick}
      // confirmLoading={changePictureLoading}
      okText={t('DELETE')}
    >
      <div
        css={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
        }}
      >
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt=""
          width={100}
          height={100}
        />
      </div>
    </Modal>
  );
};

export default ProfilePictureModal;
