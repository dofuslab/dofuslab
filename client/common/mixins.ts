import { css } from '@emotion/core';

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

export const ITEM_BOX_WIDTH = 72;

export const itemBoxDimensions = {
  width: ITEM_BOX_WIDTH,
  height: ITEM_BOX_WIDTH,
};

export const ellipsis = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemBox = {
  background: 'white',
  border: `1px solid ${BORDER_COLOR}`,
  width: ITEM_BOX_WIDTH,
  height: ITEM_BOX_WIDTH,
  margin: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  borderRadius: 4,
  cursor: 'pointer',
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
