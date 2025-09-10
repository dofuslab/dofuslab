/** @jsxImportSource @emotion/react */

import * as React from 'react';

// import { DownOutlined, LoadingOutlined } from '@ant-design/icons';

import { useMutation } from '@apollo/client';
import { Button, Checkbox, Divider, Modal } from 'antd';
import { customSet as CustomSet } from 'graphql/fragments/__generated__/customSet';
import { useTranslation } from 'next-i18next';

import { EditableContext } from 'common/utils';
import {
  restartCustomSet,
  restartCustomSetVariables,
} from 'graphql/mutations/__generated__/restartCustomSet';
import restartCustomSetMutation from 'graphql/mutations/restartCustomSet.graphql';

import {
  faEyeSlash,
  faGlobe,
  faRedoAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { mq } from 'common/constants';
import { optionalIconCss } from 'common/mixins';
import DeleteCustomSetModal from './DeleteCustomSetModal';
import TogglePrivateModal from './TogglePrivateModal';

interface Props {
  customSet: CustomSet;
}

const BuildActions: React.FC<Props> = ({ customSet }) => {
  const { t } = useTranslation('common');

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

  const [togglePrivateModalVisible, setTogglePrivateModalVisible] =
    React.useState(false);

  const openTogglePrivateModal = React.useCallback(() => {
    if (!isEditable) return;
    setTogglePrivateModalVisible(true);
  }, [isEditable]);

  const closeTogglePrivateModal = React.useCallback(() => {
    setTogglePrivateModalVisible(false);
  }, []);

  const [restartMutate, { loading: restartLoading }] = useMutation<
    restartCustomSet,
    restartCustomSetVariables
  >(restartCustomSetMutation, {
    variables: { customSetId: customSet.id, shouldResetStats },
  });

  const onRestart = React.useCallback(async () => {
    if (!isEditable) return;
    await restartMutate();
    closeRestartModal();
  }, [restartMutate, isEditable]);

  return (
    <div
      css={{
        marginBottom: 8,
        [mq[1]]: {
          margin: '0 12px',
          display: 'flex',
          alignItems: 'center',
        },
        [mq[4]]: { marginLeft: 20, marginRight: 12 },
      }}
    >
      <Button onClick={openRestartModal}>
        {t('RESTART_BUILD')}
        <FontAwesomeIcon icon={faRedoAlt} css={optionalIconCss} />
      </Button>
      <Button
        onClick={openDeleteModal}
        css={{
          marginLeft: 12,
        }}
        danger
      >
        {t('DELETE_BUILD')}
        <FontAwesomeIcon icon={faTrashAlt} css={optionalIconCss} />
      </Button>
      <Button
        css={{
          marginLeft: 12,
        }}
        onClick={openTogglePrivateModal}
      >
        {customSet.private ? (
          <FontAwesomeIcon icon={faEyeSlash} />
        ) : (
          <FontAwesomeIcon icon={faGlobe} />
        )}
      </Button>

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
      <TogglePrivateModal
        customSetId={customSet.id}
        onCancel={closeTogglePrivateModal}
        visible={togglePrivateModalVisible}
      />
    </div>
  );
};

export default BuildActions;
