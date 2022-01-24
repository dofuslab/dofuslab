/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTranslation } from 'i18n';

function SetHeaderMetadata({
  translationLabelId,
  value,
}: {
  translationLabelId: string;
  value: Date | React.ReactNode;
}) {
  let node: React.ReactNode = '';
  if (value instanceof Date) {
    node = `${value.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} 
      ${value.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
  } else {
    node = value;
  }
  const { t } = useTranslation('common');
  return (
    <div css={{ display: 'flex' }}>
      <div css={{ fontWeight: 500 }}>{t(translationLabelId)}</div>
      <div css={{ marginLeft: 8 }}>{node}</div>
    </div>
  );
}

export default SetHeaderMetadata;
