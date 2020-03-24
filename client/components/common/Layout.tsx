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
import { BORDER_COLOR, gray8 } from 'common/mixins';

import { useTranslation } from 'i18n';
import SignUpModal from './SignUpModal';
import { mq } from 'common/constants';
import { Media } from './Media';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { t } = useTranslation('auth');
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
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);
  const openSignUpModal = React.useCallback(() => {
    setShowSignUpModal(true);
  }, []);
  const closeSignUpModal = React.useCallback(() => {
    setShowSignUpModal(false);
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
    <AntdLayout css={{ height: '100%', minHeight: '100vh' }}>
      <Global
        styles={css`
          html {
            font-size: 21px;
          }
          body {
            height: auto;
          }
          ${mq[1]} {
            html {
              font-size: 18px;
            }
            body {
              height: 100vh;
              font-size: 0.8rem;
            }

            #__next {
              height: 100%;
            }
          }
        `}
      />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'white',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: '0 12px',
          fontSize: '0.8rem',
          [mq[1]]: {
            padding: '0 20px',
          },
        }}
      >
        <div css={{ fontWeight: 500 }}>DofusLab</div>
        <div>
          {data?.currentUser ? (
            <div>
              {t('WELCOME_MESSAGE', { username: data.currentUser.username })}
              <Button
                key="logout"
                onClick={logoutHandler}
                css={{ marginLeft: 12 }}
              >
                {t('LOGOUT')}
              </Button>
            </div>
          ) : (
            <div>
              <Button
                onClick={openLoginModal}
                type="link"
                css={{
                  padding: 0,
                  color: gray8,
                  fontSize: '0.75rem',
                  [mq[1]]: { fontSize: 'inherit' },
                }}
              >
                {t('LOGIN')}
              </Button>
              <span
                css={{
                  margin: '0 12px',
                  fontSize: '0.75rem',
                  [mq[1]]: { fontSize: 'inherit' },
                }}
              >
                or
              </span>
              <Media greaterThanOrEqual="xs" css={{ display: 'inline' }}>
                <Button onClick={openSignUpModal} type="default">
                  {t('SIGN_UP')}
                </Button>
              </Media>
              <Media lessThan="xs" css={{ display: 'inline' }}>
                <Button
                  onClick={openSignUpModal}
                  type="default"
                  css={{ fontSize: '0.75rem' }}
                  size="large"
                >
                  {t('SIGN_UP')}
                </Button>
              </Media>
            </div>
          )}
        </div>
      </AntdLayout.Header>

      <AntdLayout.Content
        css={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 8,
          paddingRight: 8,
          [mq[1]]: { padding: 0 },
        }}
      >
        {props.children}
      </AntdLayout.Content>
      <LoginModal
        visible={showLoginModal}
        onClose={closeLoginModal}
        openSignUpModal={openSignUpModal}
      />
      <SignUpModal
        visible={showSignUpModal}
        onClose={closeSignUpModal}
        openLoginModal={openLoginModal}
      />
    </AntdLayout>
  );
};

export default Layout;
