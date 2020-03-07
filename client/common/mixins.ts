import { css } from '@emotion/core';

export const BORDER_COLOR = '#d9d9d9';

export const ellipsis = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemBox = css({
  background: 'white',
  border: `1px solid ${BORDER_COLOR}`,
  width: 72,
  height: 72,
  margin: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  borderRadius: 4,
  cursor: 'pointer',
});
