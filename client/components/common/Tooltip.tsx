import React from 'react';
import { ClassNames } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Tooltip as AntdTooltip } from 'antd';
import { TooltipProps } from 'antd/lib/tooltip';

import { TTheme } from 'common/themes';

const Tooltip: React.FC<TooltipProps> = ({
  overlayClassName,
  ...restProps
}) => {
  const theme = useTheme<TTheme>();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <AntdTooltip
          {...restProps}
          overlayClassName={cx(
            css({
              '.ant-tooltip-inner, .ant-tooltip-arrow::before': {
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
