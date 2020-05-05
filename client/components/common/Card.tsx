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
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...restProps}
          className={cx(
            css({ backgroundColor: theme.card?.background }),
            className,
          )}
        />
      )}
    </ClassNames>
  );
};

export default Card;
