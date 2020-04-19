/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';
import { useRouter } from 'next/router';

import { TTheme } from 'common/themes';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import {
  Button,
  Dropdown,
  Menu,
  notification,
  Modal,
  Checkbox,
  Divider,
} from 'antd';
import { useTranslation } from 'i18n';
import { useMutation } from '@apollo/react-hooks';
import {
  copyCustomSet,
  copyCustomSetVariables,
} from 'graphql/mutations/__generated__/copyCustomSet';
import copyCustomSetMutation from 'graphql/mutations/copyCustomSet.graphql';
import {
  restartCustomSet,
  restartCustomSetVariables,
} from 'graphql/mutations/__generated__/restartCustomSet';
import restartCustomSetMutation from 'graphql/mutations/restartCustomSet.graphql';
import {
  deleteCustomSet,
  deleteCustomSetVariables,
} from 'graphql/mutations/__generated__/deleteCustomSet';
import deleteCustomSetMutation from 'graphql/mutations/deleteCustomSet.graphql';
import { navigateToNewCustomSet } from 'common/utils';

import { mq } from 'common/constants';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IProps {
  customSet: customSet;
}

const BuildActions: React.FC<IProps> = ({ customSet }) => {
  const { t } = useTranslation('common');
  const theme = useTheme<TTheme>();
  const [copyMutate, { loading: copyLoading }] = useMutation<
    copyCustomSet,
    copyCustomSetVariables
  >(copyCustomSetMutation, {
    variables: { customSetId: customSet.id },
    refetchQueries: () => ['myCustomSets'],
  });
  const router = useRouter();

  const [restartModalVisible, setRestartModalVisible] = React.useState(false);
  const [shouldResetStats, setShouldResetStats] = React.useState(true);

  const openRestartModal = React.useCallback(() => {
    setRestartModalVisible(true);
  }, []);

  const closeRestartModal = React.useCallback(() => {
    setRestartModalVisible(false);
  }, []);

  const onShouldResetStatsChange = React.useCallback(
    (e: CheckboxChangeEvent) => {
      setShouldResetStats(e.target.checked);
    },
    [],
  );

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  const openDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  const [restartMutate, { loading: restartLoading }] = useMutation<
    restartCustomSet,
    restartCustomSetVariables
  >(restartCustomSetMutation, {
    variables: { customSetId: customSet.id, shouldResetStats },
  });

  const [deleteMutate, { loading: deleteLoading }] = useMutation<
    deleteCustomSet,
    deleteCustomSetVariables
  >(deleteCustomSetMutation, {
    variables: { customSetId: customSet.id },
    refetchQueries: () => ['myCustomSets'],
  });

  const linkTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const onCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        if (!linkTextareaRef.current) {
          return;
        }
        linkTextareaRef.current.value = url;
        linkTextareaRef.current.focus();
        linkTextareaRef.current.select();
        document.execCommand('copy');
      }
      notification.success({
        message: t('SUCCESS'),
        description: t('COPY_LINK_SUCCESS'),
      });
    } catch (e) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR_OCCURRED'),
      });
    }
  };

  const onCopyBuild = React.useCallback(async () => {
    const { data } = await copyMutate();
    if (data?.copyCustomSet) {
      navigateToNewCustomSet(router, data.copyCustomSet.customSet.id);
      notification.success({
        message: t('SUCCESS'),
        description: t('COPY_BUILD_SUCCESS'),
      });
    }
  }, [copyMutate, customSet, router]);

  const onRestart = React.useCallback(async () => {
    await restartMutate();
    closeRestartModal();
  }, [restartMutate]);

  const onDelete = React.useCallback(async () => {
    const { data } = await deleteMutate();
    closeDeleteModal();
    if (data?.deleteCustomSet?.ok) {
      router.push('/', '/', { shallow: true });
      notification.success({
        message: t('SUCCESS'),
        description: t('DELETE_BUILD_SUCCESS'),
      });
    }
  }, [deleteMutate]);

  const anyLoading = copyLoading || restartLoading;

  return (
    <div
      css={{
        marginBottom: 12,
        [mq[1]]: {
          marginBottom: 0,
          marginLeft: 12,
          display: 'flex',
          alignItems: 'center',
        },
        [mq[4]]: { marginLeft: 20 },
      }}
    >
      <textarea
        css={{ display: 'none' }}
        id="clipboard-link"
        ref={linkTextareaRef}
      />
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="copy-link" onClick={onCopyLink}>
              {t('COPY_LINK')}
            </Menu.Item>
            <Menu.Item key="copy" onClick={onCopyBuild} disabled={anyLoading}>
              {copyLoading && <LoadingOutlined css={{ marginRight: 8 }} />}
              {t('COPY_BUILD')}
            </Menu.Item>
            <Menu.Item key="restart" onClick={openRestartModal}>
              {t('RESTART_BUILD')}
            </Menu.Item>
            <Menu.Item
              key="delete"
              css={{ color: theme.text?.danger }}
              onClick={openDeleteModal}
            >
              {t('DELETE_BUILD')}
            </Menu.Item>
          </Menu>
        }
      >
        <Button>
          {t('ACTIONS')} <DownOutlined />
        </Button>
      </Dropdown>
      <Modal
        visible={restartModalVisible}
        title={t('RESTART_BUILD')}
        onOk={onRestart}
        onCancel={closeRestartModal}
        confirmLoading={restartLoading}
        okType="danger"
        okText={t('OK')}
      >
        <div>{t('CONFIRM_RESTART_BUILD')}</div>
        <Divider />
        <div css={{ textAlign: 'center' }}>
          <Checkbox
            checked={shouldResetStats}
            onChange={onShouldResetStatsChange}
          >
            {t('CLEAR_STATS')}
          </Checkbox>
        </div>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        title={t('DELETE_BUILD')}
        onOk={onDelete}
        onCancel={closeDeleteModal}
        confirmLoading={deleteLoading}
        okType="danger"
        okText={t('DELETE')}
      >
        <div>{t('CONFIRM_DELETE_BUILD')}</div>
      </Modal>
    </div>
  );
};

export default BuildActions;
