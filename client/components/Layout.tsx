/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import AntdLayout from 'antd/lib/layout';
import Button from 'antd/lib/button/button';

import LoginModal from './LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import { BORDER_COLOR } from 'common/mixins';

import 'antd/dist/antd.css';

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
    <AntdLayout css={{ height: '100%' }}>
      <Global
        styles={css`
          body {
            height: 100vh;
          }

          #__next {
            height: 100%;
          }
        `}
      />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'white',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: '0 20px',
        }}
      >
        <div>Dofus Sets</div>
        <div>
          {data?.currentUser ? (
            <div>
              Welcome, {data.currentUser.username}
              <Button
                key="logout"
                onClick={logoutHandler}
                css={{ marginLeft: 12 }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={openLoginModal}>Login</Button>
          )}
        </div>
      </AntdLayout.Header>

      <AntdLayout.Content
        css={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}
      >
        {props.children}
      </AntdLayout.Content>
      <LoginModal visible={showLoginModal} onClose={closeLoginModal} />
    </AntdLayout>
  );
};

export default Layout;
