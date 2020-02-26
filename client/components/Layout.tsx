/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import AntdLayout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';

import 'antd/dist/antd.css';
import LoginModal from './LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from '../graphql/queries/currentUser.graphql';
import logoutMutation from '../graphql/mutations/logout.graphql';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const client = useApolloClient();
  const { data } = useQuery<ICurrentUser>(currentUserQuery);
  const [logout] = useMutation<ILogout>(logoutMutation);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const openLoginModal = React.useCallback(() => {
    setShowLoginModal(true);
  }, []);
  const closeLoginModal = React.useCallback(() => {
    setShowLoginModal(false);
  }, []);
  const logoutHandler = React.useCallback(async () => {
    const { data } = await logout();
    if (data?.logoutUser?.ok) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: null },
      });
    }
  }, [logout]);

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

          <Menu.Item css={{ marginLeft: 'auto' }}>
            {data?.currentUser ? (
              <div>
                {data.currentUser.username} |{' '}
                <span key="logout" onClick={logoutHandler}>
                  Logout
                </span>
              </div>
            ) : (
              <span key="login" onClick={openLoginModal}>
                Login
              </span>
            )}
          </Menu.Item>
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
