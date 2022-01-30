/** @jsxImportSource @emotion/react */

import React from 'react';

import { Button, Divider, Form, Input, Modal } from 'antd';

import { useMutation, useApolloClient } from '@apollo/client';
import registerMutation from 'graphql/mutations/register.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { useTranslation, Trans } from 'next-i18next';
import {
  register,
  registerVariables,
} from 'graphql/mutations/__generated__/register';
import {
  PASSWORD_REGEX,
  DISPLAY_NAME_REGEX,
  CONSECUTIVE_SEPARATOR_REGEX,
  VALID_START_END_REGEX,
} from 'common/constants';
import { inputFontSize } from 'common/mixins';
import { BuildGender } from '__generated__/globalTypes';
import BuildSettingsForm from './BuildSettingsForm';

interface Props {
  visible: boolean;
  onClose: () => void;
  openLoginModal: () => void;
}

const SignUpModal: React.FC<Props> = ({ visible, onClose, openLoginModal }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const client = useApolloClient();
  const [registerMutate, { loading }] = useMutation<
    register,
    registerVariables
  >(registerMutation);
  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await registerMutate({
      variables: {
        email: values.email,
        password: values.password,
        username: values.username,
        gender: values.gender,
        buildDefaultClassId: values.buildDefaultClassId || null,
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
  }, [registerMutate, onClose, client, form]);

  const onLogin = React.useCallback(() => {
    onClose();
    openLoginModal();
  }, [onClose, openLoginModal]);

  return (
    <Modal
      title={t('SIGN_UP')}
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
        initialValues={{
          remember: true,
          gender: BuildGender.FEMALE,
          buildDefaultClassId: '',
        }}
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
          name="email"
          label={<span css={{ fontSize: '0.75rem' }}>{t('EMAIL')}</span>}
          rules={[
            { required: true, message: t('VALIDATION.EMAIL_REQUIRED') },
            {
              pattern: /[^@]+@[^@]+\.[^@]+/,
              message: t('VALIDATION.VALID_EMAIL'),
            },
          ]}
          validateTrigger="onSubmit"
        >
          <Input
            css={inputFontSize}
            placeholder={t('EMAIL')}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
        <Form.Item
          name="username"
          label={<span css={{ fontSize: '0.75rem' }}>{t('DISPLAY_NAME')}</span>}
          rules={[
            { required: true, message: t('VALIDATION.DISPLAY_NAME_REQUIRED') },
            {
              pattern: DISPLAY_NAME_REGEX,
              message: t('VALIDATION.DISPLAY_NAME_RULES'),
            },
            {
              pattern: CONSECUTIVE_SEPARATOR_REGEX,
              message: t('VALIDATION.CONSECUTIVE_SEPARATOR_RULE'),
            },
            {
              pattern: VALID_START_END_REGEX,
              message: t('VALIDATION.START_END_RULE'),
            },
          ]}
          validateTrigger="onSubmit"
        >
          <Input
            css={inputFontSize}
            placeholder={t('DISPLAY_NAME')}
            maxLength={20}
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
          dependencies={['password']}
          validateTrigger="onSubmit"
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
            css={{ '.ant-input': inputFontSize }}
            placeholder={t('PASSWORD')}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </Form.Item>
        <Divider />
        <BuildSettingsForm />
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
