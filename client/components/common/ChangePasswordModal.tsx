/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Button, Form, Input, Modal, notification } from 'antd';

import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { useTranslation } from 'i18n';
import {
  changePassword,
  changePasswordVariables,
} from 'graphql/mutations/__generated__/changePassword';
import changePasswordMutation from 'graphql/mutations/changePassword.graphql';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<IProps> = ({ visible, onClose }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [changePassword, { loading }] = useMutation<
    changePassword,
    changePasswordVariables
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
      title={<div css={{ fontSize: '0.9rem' }}>{t('CHANGE_PASSWORD')}</div>}
      visible={visible}
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
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        css={{
          width: '88%',
          ['.ant-form-item-explain, .ant-form-item-extra']: {
            margin: '4px 0',
          },
        }}
      >
        <Form.Item
          name="oldPassword"
          label={<span css={{ fontSize: '0.75rem' }}>{t('OLD_PASSWORD')}</span>}
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.FIELD_REQUIRED') },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/,
              message: t('VALIDATION.PASSWORD_RULES'),
            },
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password
            css={{ '.ant-input': { fontSize: '0.75rem' } }}
            placeholder={t('PASSWORD')}
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={<span css={{ fontSize: '0.75rem' }}>{t('NEW_PASSWORD')}</span>}
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.FIELD_REQUIRED') },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/,
              message: t('VALIDATION.PASSWORD_RULES'),
            },
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password
            css={{ '.ant-input': { fontSize: '0.75rem' } }}
            placeholder={t('PASSWORD')}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={
            <span css={{ fontSize: '0.75rem' }}>{t('CONFIRM_PASSWORD')}</span>
          }
          dependencies={['password']}
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.FIELD_REQUIRED') },
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
            css={{ '.ant-input': { fontSize: '0.75rem' } }}
            placeholder={t('PASSWORD')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
