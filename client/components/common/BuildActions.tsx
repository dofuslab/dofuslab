/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';
import { useRouter } from 'next/router';

import { Theme } from 'common/types';
import { customSet as CustomSet } from 'graphql/fragments/__generated__/customSet';
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
import { navigateToNewCustomSet, EditableContext } from 'common/utils';

import { mq } from 'common/constants';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import DeleteCustomSetModal from './DeleteCustomSetModal';

interface Props {
  customSet: CustomSet;
  isMobile: boolean;
  isClassic: boolean;
}

const BuildActions: React.FC<Props> = ({ customSet, isMobile, isClassic }) => {
  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();
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
  const isEditable = React.useContext(EditableContext);

  const openDeleteModal = React.useCallback(() => {
    if (!isEditable) return;
    setDeleteModalVisible(true);
  }, [isEditable]);

  const closeDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  const [restartMutate, { loading: restartLoading }] = useMutation<
    restartCustomSet,
    restartCustomSetVariables
  >(restartCustomSetMutation, {
    variables: { customSetId: customSet.id, shouldResetStats },
  });

  const linkTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const onCopyLink = async () => {
    let url = `${window.location.protocol}//${window.location.host}/view/${customSet.id}/`;
    if (router.query.class) {
      const singleClass = Array.isArray(router.query.class)
        ? router.query.class[0]
        : router.query.class;
      url = `${url}?class=${singleClass}`;
    }
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
    if (!isEditable) return;
    await restartMutate();
    closeRestartModal();
  }, [restartMutate, isEditable]);

  const anyLoading = copyLoading || restartLoading;

  return (
    <div
      css={{
        marginBottom: 12,
        [mq[1]]: {
          marginBottom: 0,
          marginLeft: isClassic ? 'auto' : 12,
          display: 'flex',
          alignItems: 'center',
        },
        [mq[4]]: { marginLeft: isClassic ? 'auto' : 20 },
      }}
    >
      <textarea
        css={{ display: 'none' }}
        id="clipboard-link"
        ref={linkTextareaRef}
      />
      <Dropdown
        trigger={isMobile ? ['click'] : ['hover']}
        placement={isClassic ? 'bottomRight' : 'bottomLeft'}
        overlay={
          <Menu>
            <Menu.Item key="copy-link" onClick={onCopyLink}>
              {t('COPY_LINK')}
            </Menu.Item>
            <Menu.Item key="copy" onClick={onCopyBuild} disabled={anyLoading}>
              {copyLoading && <LoadingOutlined css={{ marginRight: 8 }} />}
              {t('COPY_BUILD')}
            </Menu.Item>
            {isEditable && (
              <Menu.Item key="restart" onClick={openRestartModal}>
                {t('RESTART_BUILD')}
              </Menu.Item>
            )}
            {isEditable && (
              <Menu.Item
                key="delete"
                css={{ color: theme.text?.danger }}
                onClick={openDeleteModal}
              >
                {t('DELETE_BUILD')}
              </Menu.Item>
            )}
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
        okButtonProps={{ danger: true }}
        okText={t('OK')}
        cancelText={t('CANCEL')}
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
      <DeleteCustomSetModal
        customSetId={customSet.id}
        onCancel={closeDeleteModal}
        visible={deleteModalVisible}
      />
    </div>
  );
};

export default BuildActions;
