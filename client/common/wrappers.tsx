import styled from '@emotion/styled';
import { mq } from './constants';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) => ({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr',
  columnGap: 20,
  rowGap: 20,
  [mq[0]]: {
    gridTemplateColumns: `repeat(${numColumns[0]}, 1fr)`
  },
  [mq[1]]: {
    gridTemplateColumns: `repeat(${numColumns[1]}, 1fr)`
  },
  [mq[2]]: {
    gridTemplateColumns: `repeat(${numColumns[2]}, 1fr)`
  },
  [mq[3]]: {
    gridTemplateColumns: `repeat(${numColumns[3]}, 1fr)`
  }
}));
