/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Modal, notification } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18n';
import {
  deleteCustomSet,
  deleteCustomSetVariables,
} from 'graphql/mutations/__generated__/deleteCustomSet';
import deleteCustomSetMutation from 'graphql/mutations/deleteCustomSet.graphql';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  customSetId: string;
}

const DeleteCustomSetModal: React.FC<IProps> = ({
  visible,
  onCancel,
  customSetId,
}) => {
  const { t } = useTranslation('common');
  const [deleteMutate, { loading: deleteLoading }] = useMutation<
    deleteCustomSet,
    deleteCustomSetVariables
  >(deleteCustomSetMutation, {
    variables: { customSetId },
    refetchQueries: () => ['myCustomSets'],
    awaitRefetchQueries: true,
  });
  const router = useRouter();

  const onDelete = React.useCallback(async () => {
    const { data } = await deleteMutate();
    onCancel();
    if (data?.deleteCustomSet?.ok) {
      if (customSetId === router.query.customSetId) {
        router.push('/', '/', { shallow: true });
      }
      notification.success({
        message: t('SUCCESS'),
        description: t('DELETE_BUILD_SUCCESS'),
      });
    }
  }, [deleteMutate, router, onCancel, customSetId]);

  return (
    <Modal
      visible={visible}
      title={t('DELETE_BUILD')}
      onOk={onDelete}
      onCancel={onCancel}
      confirmLoading={deleteLoading}
      okType="danger"
      okText={t('DELETE')}
    >
      <div>{t('CONFIRM_DELETE_BUILD')}</div>
    </Modal>
  );
};

export default DeleteCustomSetModal;
