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
      maxWidth: '100%',
      margin: 20,
      display: 'flex'
    }}
  >
    {props.children}
  </div>
);

export default Layout;
