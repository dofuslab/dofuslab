/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { mq } from '../common/constants';

const ResponsiveGrid = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => (
  <div
    css={{
      display: 'grid',
      width: '100%',
      gridTemplateColumns: '1fr',
      columnGap: 20,
      rowGap: 20,
      margin: '20px 0',
      [mq[0]]: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      [mq[1]]: {
        gridTemplateColumns: 'repeat(3, 1fr)'
      },
      [mq[2]]: {
        gridTemplateColumns: 'repeat(4, 1fr)'
      },
      [mq[3]]: {
        gridTemplateColumns: 'repeat(5, 1fr)'
      }
    }}
    {...props}
  />
);

export default ResponsiveGrid;
