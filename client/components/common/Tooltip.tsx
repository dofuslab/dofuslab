import React from 'react';
import { ClassNames } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Tooltip as AntdTooltip } from 'antd';
import { TooltipProps } from 'antd/lib/tooltip';

import { Theme } from 'common/types';

const Tooltip: React.FC<TooltipProps> = ({
  overlayClassName,
  ...restProps
}) => {
  const theme = useTheme<Theme>();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <AntdTooltip
          // eslint-disable-next-line react/jsx-props-no-spreading
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
