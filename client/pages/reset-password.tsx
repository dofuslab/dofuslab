/** @jsx jsx */
import React from 'react';
import { NextPage } from 'next';
import { useQuery, useMutation } from '@apollo/client';
import { jsx } from '@emotion/core';

import { currentUser } from 'graphql/queries/__generated__/currentUser';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { useRouter } from 'next/router';
import { Button, Form, Input, notification } from 'antd';
import { useTranslation } from 'i18n';
import {
  resetPassword,
  resetPasswordVariables,
} from 'graphql/mutations/__generated__/resetPassword';
import resetPasswordMutation from 'graphql/mutations/resetPassword.graphql';
import CommonLayout from 'components/common/CommonLayout';
import ErrorPage from 'pages/_error';
import { mq, PASSWORD_REGEX } from 'common/constants';
import { getTitle } from 'common/utils';
import { inputFontSize } from 'common/mixins';

const RequestPasswordResetPage: NextPage = () => {
  const { data } = useQuery<currentUser>(currentUserQuery);
  const router = useRouter();

  const { token } = router.query;

  const { t } = useTranslation('auth');
  const [mutate, { loading }] = useMutation<
    resetPassword,
    resetPasswordVariables
  >(resetPasswordMutation);

  React.useEffect(() => {
    if (data?.currentUser?.verified) {
      router.replace('/', {
        pathname: '/',
        // eslint-disable-next-line @typescript-eslint/camelcase
        query: { reset_password: 'already_logged_in' },
      });
    } else if (data?.currentUser) {
      router.replace('/verify-email', '/verify-email');
    }
  }, [data, router]);

  const [form] = Form.useForm();

  const onClick = React.useCallback(async () => {
    if (typeof token !== 'string') {
      return;
    }
    const values = await form.validateFields();

    const { data: resetPasswordData } = await mutate({
      variables: {
        token,
        password: values.newPassword,
      },
    });
    if (resetPasswordData?.resetPassword?.ok) {
      form.resetFields();
      notification.success({
        message: t('RESET_PASSWORD_SUCCESS.TITLE'),
        description: t('RESET_PASSWORD_SUCCESS.DESCRIPTION'),
      });

      router.replace('/');
    }
  }, [mutate, t]);

  if (typeof token !== 'string') {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <CommonLayout showSwitch={false}>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>{getTitle(t('CHANGE_PASSWORD'))}</title>
      </Head>
      <div
        css={{
          margin: '100px auto 60px auto',
          maxWidth: 540,
          textAlign: 'center',
        }}
      >
        <h1 css={{ fontSize: '32px' }}>{t('RESET_PASSWORD')}</h1>
        <div css={{ marginBottom: 20 }}>
          <img
            src="https://dofus-lab.s3.us-east-2.amazonaws.com/item/18042.png"
            alt="Pandawa Cub"
          />
        </div>
        <Form
          form={form}
          name="reset-password"
          id="reset-password-form"
          initialValues={{ remember: true }}
          onFinish={onClick}
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          css={{
            [mq[0]]: {
              width: 480,
            },
            '.ant-form-item-explain, .ant-form-item-extra': {
              margin: '4px 0',
            },
          }}
        >
          <Form.Item
            name="newPassword"
            label={
              <span css={{ fontSize: '0.75rem' }}>{t('NEW_PASSWORD')}</span>
            }
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
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{ offset: 8, span: 16 }}
            css={{ textAlign: 'left' }}
          >
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('RESET_PASSWORD')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </CommonLayout>
  );
};

RequestPasswordResetPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['auth'],
  };
};

export default RequestPasswordResetPage;
