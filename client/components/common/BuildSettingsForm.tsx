/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';

import { Form, Radio } from 'antd';
import { BuildGender } from '__generated__/globalTypes';
import { ClassSelect } from './ClassSelect';
import { useTranslation } from 'i18n';

export function BuildSettingsForm() {
  const { t } = useTranslation('common');
  return (
    <>
      <Form.Item
        label={
          <span css={{ fontSize: '0.75rem' }}>{t('DEFAULT_BUILD_GENDER')}</span>
        }
        name="gender"
        required
      >
        <Radio.Group>
          <Radio.Button value={BuildGender.FEMALE}>{t('FEMALE')}</Radio.Button>
          <Radio.Button value={BuildGender.MALE}>{t('MALE')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="buildDefaultClassId"
        label={
          <span css={{ fontSize: '0.75rem' }}>{t('DEFAULT_BUILD_CLASS')}</span>
        }
        validateTrigger="onSubmit"
        css={{ marginBottom: 0 }}
      >
        <ClassSelect size="middle" allowNoClass />
      </Form.Item>
    </>
  );
}
