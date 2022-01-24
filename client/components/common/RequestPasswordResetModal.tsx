/** @jsxImportSource @emotion/react */

import React from 'react';

import { Modal, Input, Form, Button, notification } from 'antd';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'i18n';
import { mq } from 'common/constants';
import {
  requestPasswordReset,
  requestPasswordResetVariables,
} from 'graphql/mutations/__generated__/requestPasswordReset';
import requestPasswordResetMutation from 'graphql/mutations/requestPasswordReset.graphql';
import { inputFontSize } from 'common/mixins';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const RequestPasswordResetModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [form] = Form.useForm();

  const [mutate, { loading }] = useMutation<
    requestPasswordReset,
    requestPasswordResetVariables
  >(requestPasswordResetMutation);
  const handleOk = React.useCallback(async () => {
    const values = await form.validateFields();

    const { data } = await mutate({
      variables: {
        email: values.email,
      },
    });
    if (data?.requestPasswordReset?.ok) {
      onClose();
      notification.success({
        message: t('REQUEST_PASSWORD_RESET_EMAIL_SENT.TITLE'),
        description: t('REQUEST_PASSWORD_RESET_EMAIL_SENT.DESCRIPTION'),
      });
    }

    form.resetFields();
  }, [mutate, onClose, form]);

  return (
    <Modal
      title={
        <div css={{ fontSize: '0.9rem' }}>{t('REQUEST_PASSWORD_RESET')}</div>
      }
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
          form="request-password-reset-form"
          key="submit"
          htmlType="submit"
          type="primary"
          loading={loading}
          css={{ fontSize: '0.75rem' }}
        >
          {t('OK', { ns: 'common' })}
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="request_password_reset"
        id="request-password-reset-form"
        initialValues={{ remember: true }}
        onFinish={handleOk}
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 12 }}
        css={{ [mq[1]]: { width: '70%' } }}
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
            placeholder={t('EMAIL')}
            css={inputFontSize}
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

export default RequestPasswordResetModal;
