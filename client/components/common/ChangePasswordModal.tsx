/** @jsxImportSource @emotion/react */

import React from 'react';

import { Button, Form, Input, Modal, notification } from 'antd';

import { useMutation, useApolloClient } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import {
  changePassword as ChangePassword,
  changePasswordVariables as ChangePasswordVariables,
} from 'graphql/mutations/__generated__/changePassword';
import changePasswordMutation from 'graphql/mutations/changePassword.graphql';
import { PASSWORD_REGEX } from 'common/constants';
import { inputFontSize } from 'common/mixins';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [changePassword, { loading }] = useMutation<
    ChangePassword,
    ChangePasswordVariables
  >(changePasswordMutation);
  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await changePassword({
      variables: {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
    });
    if (data?.changePassword?.ok) {
      form.resetFields();
      onClose();
      notification.success({ message: t('PASSWORD_CHANGE_SUCCESS') });
    }
  }, [changePassword, onClose, client, form]);

  return (
    <Modal
      title={t('CHANGE_PASSWORD')}
      open={open}
      onCancel={onClose}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      footer={[
        <Button
          key="cancel"
          type="default"
          onClick={onClose}
          css={{ fontSize: '0.75rem' }}
        >
          {t('CANCEL', { ns: 'common' })}
        </Button>,
        <Button
          form="change-password-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
          css={{ fontSize: '0.75rem' }}
        >
          {t('OK', { ns: 'common' })}
        </Button>,
      ]}
      zIndex={1051} // higher than dropdown
    >
      <Form
        form={form}
        name="change-password"
        id="change-password-form"
        initialValues={{ remember: true }}
        onFinish={handleOk}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        css={{
          width: '100%',
          '.ant-form-item-explain, .ant-form-item-extra': {
            margin: '4px 0',
          },
        }}
      >
        <Form.Item
          name="oldPassword"
          label={<span css={{ fontSize: '0.75rem' }}>{t('OLD_PASSWORD')}</span>}
          validateTrigger="onSubmit"
          rules={[
            { required: true, message: t('VALIDATION.REQUIRED_FIELD') },
            {
              pattern: PASSWORD_REGEX,
              message: t('VALIDATION.PASSWORD_RULES'),
            },
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password
            css={{
              '.ant-input': inputFontSize,
            }}
            placeholder={t('PASSWORD')}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={<span css={{ fontSize: '0.75rem' }}>{t('NEW_PASSWORD')}</span>}
          validateTrigger="onSubmit"
          rules={[
            { required: true, message: t('VALIDATION.REQUIRED_FIELD') },
            {
              pattern: PASSWORD_REGEX,
              message: t('VALIDATION.PASSWORD_RULES'),
            },
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password
            css={{ '.ant-input': inputFontSize }}
            placeholder={t('PASSWORD')}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={
            <span css={{ fontSize: '0.75rem' }}>{t('CONFIRM_PASSWORD')}</span>
          }
          dependencies={['newPassword']}
          validateTrigger="onSubmit"
          rules={[
            { required: true, message: t('VALIDATION.REQUIRED_FIELD') },
            ({ getFieldValue }) => ({
              validator: async (_, value) => {
                if (!value || getFieldValue('newPassword') === value) {
                  return;
                }
                throw new Error(t('VALIDATION.PASSWORDS_DO_NOT_MATCH'));
              },
            }),
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password
            css={{ '.ant-input': inputFontSize }}
            placeholder={t('PASSWORD')}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
