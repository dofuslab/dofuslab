import React from 'react';
import { ClassNames, useTheme } from '@emotion/react';

import { Tooltip as AntdTooltip } from 'antd';
import { TooltipProps } from 'antd/lib/tooltip';

const Tooltip = ({ overlayClassName, ...restProps }: TooltipProps) => {
  const theme = useTheme();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <AntdTooltip
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...restProps}
          overlayClassName={cx(
            css({
              '.ant-tooltip-inner, .ant-tooltip-arrow-content': {
                backgroundColor: theme.layer?.backgroundLight,
              },
            }),
            overlayClassName,
          )}
        />
      )}
    </ClassNames>
  );
};

export default Tooltip;
