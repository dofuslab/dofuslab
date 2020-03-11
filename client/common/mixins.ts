import { css } from '@emotion/core';
import { mq } from './constants';

export const shadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

export const gray1 = '#ffffff';
export const gray2 = '#fafafa';
export const gray3 = '#f5f5f5';
export const gray4 = '#f0f0f0';
export const gray5 = '#d9d9d9';
export const gray6 = '#bfbfbf';
export const gray7 = '#8c8c8c';
export const gray8 = '#595959';
export const gray9 = '#434343';
export const gray10 = '#262626';
export const gray11 = '#1f1f1f';
export const gray12 = '#141414';
export const gray13 = '#000000';

export const BORDER_COLOR = gray5;

export const ITEM_BOX_WIDTH = 84;

export const itemBoxDimensions = {
  width: ITEM_BOX_WIDTH,
  height: ITEM_BOX_WIDTH,
};

export const itemImageBox = {
  width: ITEM_BOX_WIDTH,
  height: ITEM_BOX_WIDTH,
  position: 'relative' as 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  borderRadius: 4,
  cursor: 'pointer',
  border: `1px solid ${BORDER_COLOR}`,
  ['&:hover::before']: {
    opacity: 1,
  },
  ['&::before']: {
    content: "''",
    boxShadow: shadow,
    opacity: 0,
    transition: 'opacity 0.3s',
    position: 'absolute' as 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

export const ellipsis = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemBox = {
  background: 'white',

  width: ITEM_BOX_WIDTH,
  height: ITEM_BOX_WIDTH,
  margin: 8,
};

export const selected = {
  border: `2px solid ${gray6}`,
  background: gray2,
};

export const itemCardStyle = {
  width: '100%',
  fontSize: '0.75rem',
  borderRadius: 4,
  minWidth: 0,
};

export const popoverTitleStyle = {
  ['.ant-popover-title']: { padding: '8px 16px' },
};

export const getResponsiveGridStyle = (numColumns: ReadonlyArray<number>) => ({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr',
  columnGap: 20,
  rowGap: 20,
  [mq[0]]: {
    gridTemplateColumns: `repeat(${numColumns[0]}, 1fr)`,
  },
  [mq[1]]: {
    gridTemplateColumns: `repeat(${numColumns[1]}, 1fr)`,
  },
  [mq[2]]: {
    gridTemplateColumns: `repeat(${numColumns[2]}, 1fr)`,
  },
  [mq[3]]: {
    gridTemplateColumns: `repeat(${numColumns[3]}, 1fr)`,
  },
  [mq[4]]: {
    gridTemplateColumns: `repeat(${numColumns[4]}, 1fr)`,
  },
  [mq[5]]: {
    gridTemplateColumns: `repeat(${numColumns[5]}, 1fr)`,
  },
});
