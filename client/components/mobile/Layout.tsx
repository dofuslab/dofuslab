/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import { Layout as AntdLayout, Button, Menu, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import LoginModal from '../common/LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import { BORDER_COLOR } from 'common/mixins';

import { useTranslation, LANGUAGES, langToFullName } from 'i18n';
import SignUpModal from '../common/SignUpModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTshirt,
  faDoorOpen,
  faLanguage,
  faHome,
  faSignInAlt,
  faUserPlus,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import StatusChecker from 'components/common/StatusChecker';
import {
  changeLocale,
  changeLocaleVariables,
} from 'graphql/mutations/__generated__/changeLocale';
import changeLocaleMutation from 'graphql/mutations/changeLocale.graphql';
import { useRouter } from 'next/router';
import ChangePasswordModal from 'components/common/ChangePasswordModal';

interface LayoutProps {
  children: React.ReactNode;
}

const { SubMenu } = Menu;

const iconWrapper = {
  marginRight: 12,
  width: 20,
  textAlign: 'center' as 'center',
  display: 'inline-block',
};

const Layout = (props: LayoutProps) => {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const client = useApolloClient();
  const { data } = useQuery<ICurrentUser>(currentUserQuery);
  const [logout] = useMutation<ILogout>(logoutMutation);
  const [changeLocaleMutate] = useMutation<changeLocale, changeLocaleVariables>(
    changeLocaleMutation,
  );
  const router = useRouter();

  const [showDrawer, setShowDrawer] = React.useState(false);
  const openDrawer = React.useCallback(() => {
    setShowDrawer(true);
  }, []);
  const closeDrawer = React.useCallback(() => {
    setShowDrawer(false);
  }, []);

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

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const openPasswordModal = React.useCallback(() => {
    setShowPasswordModal(true);
  }, []);
  const closePasswordModal = React.useCallback(() => {
    setShowPasswordModal(false);
  }, []);

  const logoutHandler = React.useCallback(async () => {
    const { data } = await logout();
    if (data?.logoutUser?.ok) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: null },
      });
      router.push('/');
    }
  }, [logout, router]);

  const changeLocaleHandler = React.useCallback(
    (locale: string) => {
      changeLocaleMutate({ variables: { locale } });
      i18n.changeLanguage(locale);
      client.resetStore();
    },
    [changeLocaleMutate, i18n, client],
  );

  return (
    <AntdLayout css={{ height: '100%', minHeight: '100vh' }}>
      <Global
        styles={css`
          body {
            height: auto;
          }
        `}
      />
      <StatusChecker />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: '0 12px',
          fontSize: '0.8rem',
        }}
      >
        <Link href="/" as="/">
          <div css={{ fontWeight: 500 }}>DofusLab</div>
        </Link>
        <Button onClick={openDrawer} size="large" css={{ fontSize: '0.9rem' }}>
          <MenuOutlined />
        </Button>
        <Drawer
          visible={showDrawer}
          closable
          onClose={closeDrawer}
          css={{
            '.ant-drawer-body': {
              padding: '44px 0 24px 0',
            },
          }}
        >
          {data?.currentUser && (
            <div
              css={{
                height: 40,
                lineHeight: '40px',
                paddingLeft: 24,
                fontWeight: 500,
              }}
            >
              {t('WELCOME')}
              {data.currentUser.username}
            </div>
          )}
          <Menu
            mode="inline"
            css={{
              border: 'none',
              '.ant-menu-item-divider': {
                margin: 0,
              },
              '.ant-menu-item, .ant-menu-submenu-title, .ant-menu-item:not(:last-child)': {
                fontSize: '0.8rem',
                margin: 0,
              },
              '.ant-menu-item::after': {
                left: 0,
                right: 'auto',
              },
            }}
          >
            {data?.currentUser && <Menu.Divider />}
            <Menu.Item key="home">
              <Link href="/" as="/">
                <div css={{ display: 'flex' }}>
                  <span css={iconWrapper}>
                    <FontAwesomeIcon icon={faHome} />
                  </span>
                  <div>Home</div>
                </div>
              </Link>
            </Menu.Item>

            <Menu.Divider />

            {data?.currentUser && data.currentUser.verified && (
              <Menu.Item key="my-builds">
                <Link href="/my-builds" as="/my-builds">
                  <div>
                    <span css={iconWrapper}>
                      <FontAwesomeIcon icon={faTshirt} />
                    </span>
                    {t('MY_BUILDS', { ns: 'common' })}
                  </div>
                </Link>
              </Menu.Item>
            )}

            {!data?.currentUser && (
              <Menu.Item key="login" onClick={openLoginModal}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faSignInAlt} />
                </span>
                {t('LOGIN')}
              </Menu.Item>
            )}

            {!data?.currentUser && <Menu.Divider />}
            {!data?.currentUser && (
              <Menu.Item key="signup" onClick={openSignUpModal}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faUserPlus} />
                </span>
                {t('SIGN_UP')}
              </Menu.Item>
            )}

            {data?.currentUser && <Menu.Divider />}
            {data?.currentUser && (
              <Menu.Item key="change-password" onClick={openPasswordModal}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faKey} />
                </span>
                {t('CHANGE_PASSWORD')}
              </Menu.Item>
            )}
            <Menu.Divider />
            <SubMenu
              key="language"
              title={
                <div>
                  <span css={iconWrapper}>
                    <FontAwesomeIcon icon={faLanguage} />
                  </span>
                  {t('LANGUAGE', { ns: 'common' })}
                </div>
              }
            >
              {LANGUAGES.map(lang => (
                <Menu.Item
                  key={lang}
                  onClick={() => {
                    changeLocaleHandler(lang);
                  }}
                >
                  {langToFullName(lang)}
                </Menu.Item>
              ))}
            </SubMenu>
            <Menu.Divider />
            {data?.currentUser && (
              <Menu.Item key="logout" onClick={logoutHandler}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faDoorOpen} />
                </span>
                {t('LOGOUT')}
              </Menu.Item>
            )}
          </Menu>
        </Drawer>
      </AntdLayout.Header>

      <AntdLayout.Content
        css={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 8,
          paddingRight: 8,
          overflowAnchor: 'none',
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
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={closePasswordModal}
      />
    </AntdLayout>
  );
};

export default Layout;
