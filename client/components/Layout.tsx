/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import AntdLayout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';

import 'antd/dist/antd.css';
import LoginModal from './LoginModal';
import { useQuery } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from '../graphql/queries/currentUser.graphql';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { data } = useQuery<ICurrentUser>(currentUserQuery);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const openLoginModal = React.useCallback(() => {
    setShowLoginModal(true);
  }, []);
  const closeLoginModal = React.useCallback(() => {
    setShowLoginModal(false);
  }, []);

  return (
    <AntdLayout>
      <AntdLayout.Header>
        <Menu
          mode="horizontal"
          theme="dark"
          css={{
            lineHeight: '64px',
            display: 'flex',
          }}
        >
          <Menu.Item key="1">nav 1</Menu.Item>
          <Menu.Item key="2">nav 2</Menu.Item>
          <Menu.Item key="3">nav 3</Menu.Item>

          <div css={{ marginLeft: 'auto', paddingLeft: 20, paddingRight: 20 }}>
            {data?.currentUser ? (
              data.currentUser.username
            ) : (
              <a key="login" onClick={openLoginModal}>
                Login
              </a>
            )}
          </div>
        </Menu>
      </AntdLayout.Header>
      <AntdLayout.Content css={{ margin: 20, display: 'flex' }}>
        {props.children}
      </AntdLayout.Content>
      <LoginModal visible={showLoginModal} onClose={closeLoginModal} />
    </AntdLayout>
  );
};

export default Layout;
