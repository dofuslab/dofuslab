import { mq, BREAKPOINTS } from './constants';
import { TTheme } from './themes';

export const shadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

export const gold5 = '#ffc53d';

export const blue1 = '#e6f7ff';
export const blue3 = '#91d5ff';
export const blue6 = '#1890ff';
export const blue8 = '#0050b3';

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

export const red5 = '#ff4d4f';
export const red6 = '#f5222d';
export const red8 = '#a8071a';

export const ITEM_BOX_WIDTH = 84;
export const ITEM_BOX_WIDTH_SMALL = 72;

export const ITEM_IMAGE_WIDTH = 72;
export const ITEM_IMAGE_WIDTH_SMALL = 60;

export const itemBoxDimensions = {
  width: '100%',
  height: 'auto',
  [mq[1]]: {
    width: ITEM_BOX_WIDTH_SMALL,
    height: ITEM_BOX_WIDTH_SMALL,
  },
  [mq[4]]: {
    width: ITEM_BOX_WIDTH,
    height: ITEM_BOX_WIDTH,
  },
};

export const itemImageDimensions = {
  width: '80%',
  height: 'auto',
  [mq[1]]: {
    width: ITEM_IMAGE_WIDTH_SMALL,
    height: ITEM_IMAGE_WIDTH_SMALL,
  },
  [mq[4]]: {
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_WIDTH,
  },
};

export const itemImageBox = (theme: TTheme) => ({
  position: 'absolute' as 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  [mq[1]]: {
    width: ITEM_BOX_WIDTH_SMALL,
    height: ITEM_BOX_WIDTH_SMALL,
    position: 'relative' as 'relative',
  },
  [mq[4]]: {
    width: ITEM_BOX_WIDTH,
    height: ITEM_BOX_WIDTH,
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  borderRadius: 4,
  cursor: 'pointer',
  border: `1px solid ${theme.border?.default}`,
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
});

export const ellipsis = {
  overflow: 'hidden' as 'hidden',
  textOverflow: 'ellipsis' as 'ellipsis',
  whiteSpace: 'nowrap' as 'nowrap',
};

export const itemBox = (theme: TTheme) => ({
  background: theme.layer?.background,
  paddingTop: '100%',
  position: 'relative' as 'relative',
  borderRadius: 4,

  ...itemBoxDimensions,
  [mq[1]]: {
    margin: 4,
    paddingTop: 0,
    position: 'static' as 'static',
    ...(itemBoxDimensions[mq[1]] as {}),
  },
  [mq[4]]: {
    margin: 8,
    ...(itemBoxDimensions[mq[4]] as {}),
  },
});

export const selected = (theme: TTheme) => ({
  border: '1px solid transparent' /* remove the border's colour */,
  boxShadow: `0 0 0 2px ${theme.border?.selected}` /* emulate the border */,
  background: theme.layer?.background,
});

export const primarySelected = (theme: TTheme) => ({
  boxShadow: `0 0 0 2px ${theme.border?.primarySelected}` /* emulate the border */,
  background: theme.layer?.background,
});

export const itemCardStyle = {
  fontSize: '0.75rem',
  borderRadius: 4,
  minWidth: 0,
  flex: 1,
};

export const popoverTitleStyle = {
  ['.ant-popover-title']: { padding: '8px 12px' },
};

export const getResponsiveGridStyle = (numColumns: ReadonlyArray<number>) => {
  const numColumnsCopy = [...numColumns];
  while (numColumnsCopy.length < BREAKPOINTS.length) {
    numColumnsCopy.push(numColumnsCopy[numColumnsCopy.length - 1]);
  }
  return {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '1fr',
    columnGap: 12,
    rowGap: 12,
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
      columnGap: 20,
      rowGap: 20,
    },
    [mq[5]]: {
      gridTemplateColumns: `repeat(${numColumns[5]}, 1fr)`,
    },
    [mq[6]]: {
      gridTemplateColumns: `repeat(${numColumns[6]}, 1fr)`,
    },
  };
};

export const topMarginStyle = {
  marginTop: 12,
  [mq[1]]: {
    marginTop: 8,
  },
  [mq[4]]: {
    marginTop: 12,
  },
};
