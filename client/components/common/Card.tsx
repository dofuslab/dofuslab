/** @jsxImportSource @emotion/react */

import { Card as AntdCard } from 'antd';
import { CardProps } from 'antd/lib/card';
import { ClassNames, useTheme } from '@emotion/react';

const Card = ({ className, ...restProps }: CardProps) => {
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
              '.ant-card-head': {
                padding: 8,
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
