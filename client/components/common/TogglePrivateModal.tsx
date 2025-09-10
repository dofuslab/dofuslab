/** @jsxImportSource @emotion/react */

import { useMutation } from '@apollo/client';
import { Modal, notification } from 'antd';
import React from 'react';

import { togglePrivateCustomSet } from 'graphql/mutations/__generated__/togglePrivateCustomSet';
import togglePrivateCustomSetMutation from 'graphql/mutations/togglePrivateCustomSet.graphql';
import { useTranslation } from 'next-i18next';

interface Props {
  visible: boolean;
  onCancel: () => void;
  customSetId: string;
}

const TogglePrivateModal: React.FC<Props> = ({
  visible,
  onCancel,
  customSetId,
}) => {
  const { t } = useTranslation('common');

  const [togglePrivateMutate, { loading: togglePrivateLoading }] =
    useMutation<togglePrivateCustomSet>(togglePrivateCustomSetMutation, {
      variables: {
        customSetId: customSetId,
        refetchQueries: () => ['buildList'],
        awaitRefetchQueries: true,
      },
    });

  const onTogglePrivate = React.useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const { data } = await togglePrivateMutate();
      onCancel();
      if (data?.togglePrivateCustomSet?.ok) {
        notification.success({
          message: t('SUCCESS'),
          description: t('TOGGLE_PRIVATE_SUCCESS', {
            visibility: data.togglePrivateCustomSet.customSet.private
              ? t('PRIVATE')
              : t('PUBLIC'),
          }),
        });
      }
    },
    [togglePrivateMutate, onCancel, customSetId],
  );

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
      title={t('TOGGLE_PRIVATE')}
      onOk={onTogglePrivate}
      onCancel={onCancelClick}
      confirmLoading={togglePrivateLoading}
      okText={t('OK')}
    >
      <div>{t('CONFIRM_TOGGLE_PRIVATE')}</div>
    </Modal>
  );
};

export default TogglePrivateModal;
