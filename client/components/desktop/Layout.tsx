/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import { Layout as AntdLayout, Button, Drawer, Select } from 'antd';
import { FlagIcon } from 'react-flag-kit';

import LoginModal from '../common/LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import { BORDER_COLOR, gray8 } from 'common/mixins';

import { useTranslation, LANGUAGES, langToFlagCode } from 'i18n';
import SignUpModal from '../common/SignUpModal';
import MyBuilds from '../common/MyBuilds';
import Link from 'next/link';
import { mq } from 'common/constants';
import StatusChecker from 'components/common/StatusChecker';

interface LayoutProps {
  children: React.ReactNode;
}

const { Option } = Select;

const Layout = (props: LayoutProps) => {
  const { t, i18n } = useTranslation(['auth', 'common']);
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

  const [drawerVisible, setDrawerVisible] = React.useState(false);

  const openDrawer = React.useCallback(() => {
    setDrawerVisible(true);
  }, [setDrawerVisible]);
  const closeDrawer = React.useCallback(() => {
    setDrawerVisible(false);
  }, [setDrawerVisible]);

  return (
    <AntdLayout css={{ height: '100%', minHeight: '100vh' }}>
      <Global
        styles={css`
          html {
            font-size: 18px;
          }
          body {
            ${mq[1]} {
              height: 100vh;
            }
            font-size: 0.8rem;
          }
          #__next {
            height: 100%;
          }
        `}
      />
      <StatusChecker />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'white',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: '0 20px',
          fontSize: '0.8rem',
        }}
      >
        <Link href="/" as="/">
          <div css={{ fontWeight: 500, cursor: 'pointer' }}>DofusLab</div>
        </Link>
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <Select
            value={i18n.language}
            onSelect={lang => i18n.changeLanguage(lang)}
            css={{ marginRight: 16 }}
          >
            {LANGUAGES.map(lang => (
              <Option key={lang} value={lang}>
                <div css={{ display: 'flex', alignItems: 'center' }}>
                  <FlagIcon code={langToFlagCode(lang)} size={20} />
                  <div css={{ marginLeft: 8 }}>{lang}</div>
                </div>
              </Option>
            ))}
          </Select>
          {data?.currentUser ? (
            <div>
              {t('WELCOME_MESSAGE', {
                displayName: data.currentUser.username,
              })}
              {data.currentUser.verified && (
                <>
                  <Button onClick={openDrawer} css={{ marginLeft: 12 }}>
                    {t('MY_BUILDS', { ns: 'common' })}
                  </Button>
                  <Drawer
                    visible={drawerVisible}
                    closable
                    onClose={closeDrawer}
                    width={480}
                  >
                    <MyBuilds />
                  </Drawer>
                </>
              )}
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
                }}
              >
                {t('LOGIN')}
              </Button>
              <span
                css={{
                  margin: '0 12px',
                }}
              >
                {t('OR', { ns: 'common' })}
              </span>
              <Button onClick={openSignUpModal} type="default">
                {t('SIGN_UP')}
              </Button>
            </div>
          )}
        </div>
      </AntdLayout.Header>

      <AntdLayout.Content
        css={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
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
