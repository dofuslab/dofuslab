/** @jsxImportSource @emotion/react */

import React from 'react';

import { Modal, Input, Form, Button, Checkbox, Divider } from 'antd';
import { useMutation, useApolloClient } from '@apollo/client';
import {
  login as ILogin,
  loginVariables as ILoginVariables,
} from 'graphql/mutations/__generated__/login';
import loginMutation from 'graphql/mutations/login.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation, Trans } from 'next-i18next';
import { mq, PASSWORD_REGEX, EMAIL_REGEX } from 'common/constants';
import sessionSettingsQuery from 'graphql/queries/sessionSettings.graphql';
import { inputFontSize } from 'common/mixins';

import RequestPasswordResetModal from './RequestPasswordResetModal';

interface Props {
  open: boolean;
  onClose: () => void;
  openSignUpModal: () => void;
}

const LoginModal = ({ open, onClose, openSignUpModal }: Props) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [login, { loading }] = useMutation<ILogin, ILoginVariables>(
    loginMutation,
    { refetchQueries: [{ query: sessionSettingsQuery }] },
  );

  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await login({
      variables: {
        email: values.email,
        password: values.password,
        remember: values.remember,
      },
    });
    form.resetFields();
    if (data?.loginUser?.user) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: { ...data.loginUser.user } },
      });
      onClose();
    }
  }, [login, onClose, client, form]);

  const onSignUp = React.useCallback(() => {
    onClose();
    openSignUpModal();
  }, [onClose, openSignUpModal]);

  const [showRequestPasswordResetModal, setRequestPasswordResetModal] =
    React.useState(false);
  const openRequestPasswordResetModal = React.useCallback(() => {
    onClose();
    setRequestPasswordResetModal(true);
  }, [onClose]);
  const closeRequestPasswordResetModal = React.useCallback(() => {
    setRequestPasswordResetModal(false);
  }, []);

  return (
    <>
      <Modal
        title={t('LOGIN')}
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
            form="login-form"
            key="submit"
            htmlType="submit"
            type="primary"
            loading={loading}
            css={{ fontSize: '0.75rem' }}
          >
            {t('LOGIN')}
          </Button>,
        ]}
      >
        <Form
          form={form}
          name="login"
          id="login-form"
          initialValues={{ remember: true }}
          onFinish={handleOk}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          css={{ [mq[1]]: { width: '70%' } }}
        >
          <Form.Item
            name="email"
            label={<span css={{ fontSize: '0.75rem' }}>{t('EMAIL')}</span>}
            rules={[
              { required: true, message: t('VALIDATION.EMAIL_REQUIRED') },
              {
                pattern: EMAIL_REGEX,
                message: t('VALIDATION.VALID_EMAIL'),
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input
              placeholder={t('EMAIL')}
              css={inputFontSize}
              onKeyDown={(e) => {
                // prevents triggering SetBuilderKeyboardShortcuts
                e.nativeEvent.stopPropagation();
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span css={{ fontSize: '0.75rem' }}>{t('PASSWORD')}</span>}
            validateTrigger="onSubmit"
            rules={[
              { required: true, message: t('VALIDATION.PASSWORD_REQUIRED') },
              {
                pattern: PASSWORD_REGEX,
                message: t('VALIDATION.PASSWORD_RULES'),
              },
            ]}
            css={{ marginTop: 16 }}
          >
            <Input.Password
              placeholder={t('PASSWORD')}
              css={{ '.ant-input': inputFontSize }}
              onKeyDown={(e) => {
                // prevents triggering SetBuilderKeyboardShortcuts
                e.nativeEvent.stopPropagation();
              }}
            />
          </Form.Item>
          <Form.Item
            name="remember"
            wrapperCol={{ span: 24 }}
            css={{ textAlign: 'center', marginBottom: 0 }}
            valuePropName="checked"
          >
            <Checkbox defaultChecked={false}>
              <span css={{ fontSize: '0.75rem' }}>{t('REMEMBER_ME')}</span>
            </Checkbox>
          </Form.Item>
        </Form>
        <Divider />
        <div css={{ fontSize: '0.75rem', textAlign: 'center' }}>
          <div>
            <a onClick={openRequestPasswordResetModal}>
              {t('FORGOT_PASSWORD')}
            </a>
          </div>
          <Trans i18nKey="auth:NO_ACCOUNT_SIGNUP">
            Don&apos;t have an account? <a onClick={onSignUp}>Sign up here.</a>
          </Trans>
        </div>
      </Modal>
      <RequestPasswordResetModal
        open={showRequestPasswordResetModal}
        onClose={closeRequestPasswordResetModal}
      />
    </>
  );
};

export default LoginModal;
