/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, ClassNames } from '@emotion/core';
import { Layout as AntdLayout, Button, Menu, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';
import NoSSR from 'react-no-ssr';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';

import { useTranslation, LANGUAGES, langToFullName } from 'i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTshirt,
  faDoorOpen,
  faLanguage,
  faHome,
  faSignInAlt,
  faUserPlus,
  faKey,
  faMugHot,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import StatusChecker from 'components/common/StatusChecker';
import {
  changeLocale,
  changeLocaleVariables,
} from 'graphql/mutations/__generated__/changeLocale';
import changeLocaleMutation from 'graphql/mutations/changeLocale.graphql';
import ChangePasswordModal from 'components/common/ChangePasswordModal';
import { LIGHT_THEME_NAME } from 'common/themes';
import {
  DISCORD_SERVER_LINK,
  GITHUB_REPO_LINK,
  BUY_ME_COFFEE_LINK,
} from 'common/constants';
import { Theme } from 'common/types';
import SignUpModal from '../common/SignUpModal';
import LoginModal from '../common/LoginModal';

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

const random = Math.random();

const getDonateElement = (t: TFunction) =>
  random < 0.98 ? (
    <>
      <span css={iconWrapper}>
        <FontAwesomeIcon icon={faMugHot} />
      </span>
      {t('BUY_US_COFFEE', { ns: 'common' })}
    </>
  ) : (
    <ClassNames>
      {({ css, cx }) => (
        <>
          <span
            className={cx(
              'twicon-tapioca',
              css(iconWrapper),
              css({
                fontSize: '1.25rem',
                transform: 'translateY(2px)',
              }),
            )}
          />
          {t('BUY_US_BUBBLE_TEA', { ns: 'common' })}
        </>
      )}
    </ClassNames>
  );

const Layout = ({ children }: LayoutProps) => {
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
    const { data: logoutData } = await logout();
    if (logoutData?.logoutUser?.ok) {
      await client.resetStore();
      router.push('/');
    }
  }, [logout, router, client]);

  const changeLocaleHandler = React.useCallback(
    async (locale: string) => {
      i18n.changeLanguage(locale);
      await changeLocaleMutate({ variables: { locale } });
      await client.resetStore();
    },
    [changeLocaleMutate, i18n, client],
  );

  const theme = useTheme<Theme>();

  return (
    <AntdLayout css={{ height: '100%', minHeight: '100vh' }}>
      <Global
        styles={{
          html: {
            fontSize: 22,
          },
          body: {
            height: 'auto',
          },
          '.ant-input-affix-wrapper, .ant-input': {
            padding: '7px 15px',
          },
          '.ant-btn': {
            height: 42,
          }
        }}
      />
      <StatusChecker />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: theme.header?.background,
          borderBottom: `1px solid ${theme.border?.default}`,
          padding: '0 12px',
          fontSize: '0.8rem',
        }}
      >
        <Link href="/" as="/">
          <a>
            <div css={{ fontWeight: 500 }}>
              <img
                src={
                  theme.name === LIGHT_THEME_NAME
                    ? 'https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Light.svg'
                    : 'https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark.svg'
                }
                css={{ width: 120 }}
                alt="DofusLab"
              />
            </div>
          </a>
        </Link>
        <Button onClick={openDrawer} size="large" css={{ fontSize: '0.9rem', padding: '4px 15px' }}>
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
              '.ant-menu-item, .ant-menu-submenu-title, .ant-menu-item:not(:last-child)': {
                fontSize: '0.8rem',
                margin: 0,
              },
              '.ant-menu-item::after': {
                left: 0,
                right: 'auto',
              },
              '.ant-menu-item:nth-of-type(1)': {
                marginTop: '8px',
              },
              '.ant-menu-item:nth-last-of-type(1)': {
                marginBottom: '8px',
              },
            }}
          >
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

            {data?.currentUser && data.currentUser.verified && (
              <Menu.Item key="my-builds">
                <Link href="/my-builds" as="/my-builds">
                  <a>
                    <span css={iconWrapper}>
                      <FontAwesomeIcon icon={faTshirt} />
                    </span>
                    {t('MY_BUILDS', { ns: 'common' })}
                  </a>
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

            {!data?.currentUser && (
              <Menu.Item key="signup" onClick={openSignUpModal}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faUserPlus} />
                </span>
                {t('SIGN_UP')}
              </Menu.Item>
            )}

            {data?.currentUser && (
              <Menu.Item key="change-password" onClick={openPasswordModal}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faKey} />
                </span>
                {t('CHANGE_PASSWORD')}
              </Menu.Item>
            )}
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
              {LANGUAGES.map((lang) => (
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
            {data?.currentUser && (
              <Menu.Item key="logout" onClick={logoutHandler}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faDoorOpen} />
                </span>
                {t('LOGOUT')}
              </Menu.Item>
            )}
            <Menu.Divider
              css={{ '&.ant-menu-item-divider': { margin: '4px 0' } }}
            />
            <Menu.Item>
              <a
                href={DISCORD_SERVER_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faDiscord} />
                </span>
                {t('JOIN_US_DISCORD', { ns: 'common' })}
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                href={GITHUB_REPO_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faGithub} />
                </span>
                {t('CONTRIBUTE_GITHUB', { ns: 'common' })}
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                href={BUY_ME_COFFEE_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <NoSSR>{getDonateElement(t)}</NoSSR>
              </a>
            </Menu.Item>
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
        {children}
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
