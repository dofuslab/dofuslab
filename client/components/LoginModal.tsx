/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import {
  login as ILogin,
  loginVariables as ILoginVariables,
} from 'graphql/mutations/__generated__/login';
import loginMutation from 'graphql/mutations/login.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation } from 'i18n';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<IProps> = ({ visible, onClose }) => {
  // const [email, setEmail] = React.useState('');
  // const [password, setPassword] = React.useState('');
  const { t } = useTranslation('common');
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [login, { loading }] = useMutation<ILogin, ILoginVariables>(
    loginMutation,
    // {
    //   variables: { email, password },
    // },
  );
  // const onEmailChange = React.useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     setEmail(e.target.value);
  //   },
  //   [],
  // );
  // const onPasswordChange = React.useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     setPassword(e.target.value);
  //   },
  //   [],
  // );
  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await login({
      variables: { email: values.email, password: values.password },
    });
    form.resetFields();
    if (data?.loginUser?.user) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: { ...data.loginUser.user } },
      });
      onClose();
      // setEmail('');
      // setPassword('');
    }
  }, [login, onClose, client, form]);

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
          {t('CANCEL')}
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
        initialValues={{ modifier: 'public' }}
        onFinish={handleOk}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        css={{ width: '70%' }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: t('VALIDATION.EMAIL_REQUIRED') },
            {
              pattern: /[^@]+@[^@]+\.[^@]+/,
              message: t('VALIDATION.VALID_EMAIL'),
            },
          ]}
          validateTrigger={'onSubmit'}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          validateTrigger={'onSubmit'}
          rules={[
            { required: true, message: t('VALIDATION.PASSWORD_REQUIRED') },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
              message: t('VALIDATION.PASSWORD_RULES'),
            },
          ]}
          css={{ marginTop: 16 }}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;
