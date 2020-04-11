/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Button, Divider, Form, Input, Modal } from 'antd';

import { useMutation, useApolloClient } from '@apollo/react-hooks';
import registerMutation from 'graphql/mutations/register.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation, Trans } from 'i18n';
import {
  register,
  registerVariables,
} from 'graphql/mutations/__generated__/register';

interface IProps {
  visible: boolean;
  onClose: () => void;
  openLoginModal: () => void;
}

const SignUpModal: React.FC<IProps> = ({
  visible,
  onClose,
  openLoginModal,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [register, { loading }] = useMutation<register, registerVariables>(
    registerMutation,
  );
  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await register({
      variables: {
        email: values.email,
        password: values.password,
        username: values.username,
      },
    });
    form.resetFields();
    if (data?.registerUser?.user) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: { ...data.registerUser.user } },
      });
      onClose();
    }
  }, [register, onClose, client, form]);

  const onLogin = React.useCallback(() => {
    onClose();
    openLoginModal();
  }, [onClose, openLoginModal]);

  return (
    <Modal
      title={<div css={{ fontSize: '0.9rem' }}>{t('SIGN_UP')}</div>}
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
          form="sign-up-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
          css={{ fontSize: '0.75rem' }}
        >
          {t('SIGN_UP')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="sign-up"
        id="sign-up-form"
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
          name="email"
          label={<span css={{ fontSize: '0.75rem' }}>{t('EMAIL')}</span>}
          rules={[
            { required: true, message: t('VALIDATION.EMAIL_REQUIRED') },
            {
              pattern: /[^@]+@[^@]+\.[^@]+/,
              message: t('VALIDATION.VALID_EMAIL'),
            },
          ]}
          validateTrigger={'onSubmit'}
        >
          <Input css={{ fontSize: '0.75rem' }} placeholder={t('EMAIL')} />
        </Form.Item>
        <Form.Item
          name="username"
          label={<span css={{ fontSize: '0.75rem' }}>{t('DISPLAY_NAME')}</span>}
          rules={[
            { required: true, message: t('VALIDATION.DISPLAY_NAME_REQUIRED') },
            {
              pattern: /^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
              message: t('VALIDATION.DISPLAY_NAME_RULES'),
            },
          ]}
          validateTrigger={'onSubmit'}
        >
          <Input
            css={{ fontSize: '0.75rem' }}
            placeholder={t('DISPLAY_NAME')}
            maxLength={20}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={<span css={{ fontSize: '0.75rem' }}>{t('PASSWORD')}</span>}
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.PASSWORD_REQUIRED') },
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
          name="confirm-password"
          label={
            <span css={{ fontSize: '0.75rem' }}>{t('CONFIRM_PASSWORD')}</span>
          }
          dependencies={['password']}
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.PASSWORD_REQUIRED') },
            ({ getFieldValue }) => ({
              validator: async (_, value) => {
                if (!value || getFieldValue('password') === value) {
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
      <Divider />
      <div css={{ fontSize: '0.75rem' }}>
        <Trans i18nKey="auth:ALREADY_HAVE_ACCOUNT">
          Already have an account? <a onClick={onLogin}>Login here.</a>
        </Trans>
      </div>
    </Modal>
  );
};

export default SignUpModal;
