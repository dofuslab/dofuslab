/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Divider from 'antd/lib/divider';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import {
  login as ILogin,
  loginVariables as ILoginVariables,
} from 'graphql/mutations/__generated__/login';
import loginMutation from 'graphql/mutations/login.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation, Trans } from 'i18n';

interface IProps {
  visible: boolean;
  onClose: () => void;
  openSignUpModal: () => void;
}

const LoginModal: React.FC<IProps> = ({
  visible,
  onClose,
  openSignUpModal,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [login, { loading }] = useMutation<ILogin, ILoginVariables>(
    loginMutation,
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

  return (
    <Modal
      title="Login"
      visible={visible}
      onCancel={onClose}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      footer={[
        <Button key="cancel" type="default" onClick={onClose}>
          {t('common:CANCEL')}
        </Button>,
        <Button
          form="login-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
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
        css={{ width: '70%' }}
      >
        <Form.Item
          name="email"
          label={t('EMAIL')}
          rules={[
            { required: true, message: t('VALIDATION.EMAIL_REQUIRED') },
            {
              pattern: /[^@]+@[^@]+\.[^@]+/,
              message: t('VALIDATION.VALID_EMAIL'),
            },
          ]}
          validateTrigger={'onSubmit'}
        >
          <Input placeholder={t('EMAIL')} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('PASSWORD')}
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
          <Input.Password placeholder={t('PASSWORD')} />
        </Form.Item>
        <Form.Item
          name="remember"
          wrapperCol={{ span: 24 }}
          css={{ textAlign: 'center', marginBottom: 0 }}
          valuePropName={'checked'}
        >
          <Checkbox defaultChecked={false}>{t('REMEMBER_ME')}</Checkbox>
        </Form.Item>
      </Form>
      <Divider />
      <div>
        <Trans i18nKey="NO_ACCOUNT">
          Don't have an account? <a onClick={onSignUp}>Sign up here.</a>
        </Trans>
      </div>
    </Modal>
  );
};

export default LoginModal;
