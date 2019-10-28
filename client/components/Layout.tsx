/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import 'antd/dist/antd.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => (
  <div
    css={{
      // [mq[0]]: { maxWidth: 560 },
      // [mq[1]]: { maxWidth: 720 },
      // [mq[2]]: { maxWidth: 1080 },
      // [mq[3]]: { maxWidth: 1200 },
      maxWidth: '100%',
      margin: 20
    }}
  >
    {props.children}
  </div>
);

export default Layout;
