/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Button from 'antd/lib/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'i18n';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { mq } from 'common/constants';

interface IProps {
  onReset: () => void;
  className?: string;
}

const ResetAllButton: React.FC<IProps> = ({ onReset, className }) => {
  const { t } = useTranslation('common');
  return (
    <Button
      css={{
        fontSize: '0.75rem',
        margin: '12px 0',
        height: 42,
        [mq[1]]: {
          height: 'auto',
        },
        [mq[4]]: { marginTop: '20px 0' },
      }}
      onClick={onReset}
      className={className}
    >
      <FontAwesomeIcon icon={faRedo} css={{ marginRight: 8 }} />
      {t('RESET_ALL_FILTERS')}
    </Button>
  );
};

export default ResetAllButton;
