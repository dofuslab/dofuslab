/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import registerMutation from 'graphql/mutations/register.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation, Trans } from 'i18n';
import {
  register,
  registerVariables,
} from 'graphql/mutations/__generated__/register';
import Divider from 'antd/lib/divider';

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
      title="Sign up"
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
          form="sign-up-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
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
          name="username"
          label={t('USERNAME')}
          rules={[
            { required: true, message: t('VALIDATION.USERNAME_REQUIRED') },
            {
              pattern: /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
              message: t('VALIDATION.USERNAME_RULES'),
            },
          ]}
          validateTrigger={'onSubmit'}
        >
          <Input placeholder={t('USERNAME')} maxLength={20} />
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
      </Form>
      <Divider />
      <div>
        <Trans i18nKey="NO_ACCOUNT">
          Already have an account? <a onClick={onLogin}>Login here.</a>
        </Trans>
      </div>
    </Modal>
  );
};

export default SignUpModal;
