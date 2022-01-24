/** @jsxImportSource @emotion/react */

import React from 'react';
import { Card as AntdCard } from 'antd';
import { CardProps } from 'antd/lib/card';
import { ClassNames, useTheme } from '@emotion/react';

const Card: React.FC<CardProps> = ({ className, ...restProps }) => {
  const theme = useTheme();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <AntdCard
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...restProps}
          className={cx(
            css({
              backgroundColor: theme.card?.background,
              '.ant-card-actions': {
                backgroundColor: theme.card?.background,
              },
            }),
            className,
          )}
        />
      )}
    </ClassNames>
  );
};

export default Card;
