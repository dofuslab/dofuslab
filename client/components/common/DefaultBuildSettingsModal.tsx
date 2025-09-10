/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { Button, Form, Modal } from 'antd';
import { useMutation, useQuery } from '@apollo/client';

import { useTranslation } from 'next-i18next';

import {
  editBuildSettings,
  editBuildSettingsVariables,
} from 'graphql/mutations/__generated__/editBuildSettings';
import editBuildSettingsMutation from 'graphql/mutations/editBuildSettings.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import BuildSettingsForm from './BuildSettingsForm';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DefaultBuildSettingsModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation('common');

  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const [form] = Form.useForm();

  const [mutate, { loading }] = useMutation<
    editBuildSettings,
    editBuildSettingsVariables
  >(editBuildSettingsMutation);

  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    await mutate({
      variables: {
        gender: values.gender,
        buildDefaultClassId: values.buildDefaultClassId || null,
      },
    });
    form.resetFields();

    onClose();
  }, [mutate, onClose, form]);

  return currentUserData?.currentUser ? (
    <Modal
      open={open}
      title={t('DEFAULT_BUILD_SETTINGS')}
      footer={[
        <Button
          key="cancel"
          type="default"
          onClick={onClose}
          css={{ fontSize: '0.75rem' }}
        >
          {t('CANCEL')}
        </Button>,
        <Button
          form="default-build-settings-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
          css={{ fontSize: '0.75rem' }}
        >
          {t('OK')}
        </Button>,
      ]}
      onCancel={onClose}
    >
      <Form
        form={form}
        name="default-build-settings-form"
        id="default-build-settings-form"
        initialValues={{
          gender: currentUserData.currentUser.settings.buildGender,
          buildDefaultClassId:
            currentUserData.currentUser.settings.buildClass?.id,
        }}
        onFinish={handleOk}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
      >
        <BuildSettingsForm />
      </Form>
    </Modal>
  ) : null;
};

export default DefaultBuildSettingsModal;
