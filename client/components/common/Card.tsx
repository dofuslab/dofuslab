/** @jsx jsx */

import React from 'react';
import { Card as AntdCard } from 'antd';
import { CardProps } from 'antd/lib/card';
import { ClassNames, jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Theme } from 'common/types';

const Card: React.FC<CardProps> = ({ className, ...restProps }) => {
  const theme = useTheme<Theme>();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <AntdCard
          className={cx(
            css({
              '&.ant-card': {
                backgroundColor: theme.card?.background,
              },
              '&.ant-card-bordered': {
                borderColor: theme.border?.default,
              },
            }),
            className,
          )}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...restProps}
        />
      )}
    </ClassNames>
  );
};

export default Card;
