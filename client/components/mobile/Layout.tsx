/** @jsxImportSource @emotion/react */

import * as React from 'react';
import { Global, ClassNames, useTheme } from '@emotion/react';
import { Layout as AntdLayout, Button, Menu, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import NoSSR from 'react-no-ssr';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
import { LANGUAGES, langToFullName } from 'common/i18n-utils';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';

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
  faWrench,
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
import { getImageUrl } from 'common/utils';
import DefaultBuildSettingsModal from 'components/common/DefaultBuildSettingsModal';
import SignUpModal from '../common/SignUpModal';
import LoginModal from '../common/LoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

const { SubMenu } = Menu;

const iconWrapper = {
  marginRight: 12,
  width: 20,
  textAlign: 'center' as const,
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

function Layout({ children }: LayoutProps) {
  const { t } = useTranslation(['auth', 'common']);
  const client = useApolloClient();
  const { data } = useQuery<ICurrentUser>(currentUserQuery);
  const [logout] = useMutation<ILogout>(logoutMutation);
  const [changeLocaleMutate] = useMutation<changeLocale, changeLocaleVariables>(
    changeLocaleMutation,
  );
  const router = useRouter();
  const { pathname, asPath, query } = router;

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

  const [showBuildSettings, setShowBuildSettings] = React.useState(false);
  const openBuildSettings = React.useCallback(() => {
    setShowBuildSettings(true);
  }, []);
  const closeBuildSettings = React.useCallback(() => {
    setShowBuildSettings(false);
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
      Cookies.set('NEXT_LOCALE', locale);
      await router.push({ pathname, query }, asPath, { locale });
      await changeLocaleMutate({ variables: { locale } });
      window.location.reload();
    },
    [changeLocaleMutate, router, client],
  );

  const theme = useTheme();

  return (
    <AntdLayout css={{ height: '100%', minHeight: '100vh' }}>
      <Global
        styles={{
          html: {
            fontSize: 18,
          },
          body: {
            height: 'auto',
          },
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
                src={getImageUrl(
                  theme.name === LIGHT_THEME_NAME
                    ? 'logo/DL-Full_Light.svg'
                    : 'logo/DL-Full_Dark.svg',
                )}
                css={{ width: 120 }}
                alt="DofusLab"
              />
            </div>
          </a>
        </Link>
        <Button onClick={openDrawer} size="large" css={{ fontSize: '0.9rem' }}>
          <MenuOutlined />
        </Button>
        <Drawer
          open={showDrawer}
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
              <Link href={`/user/${data.currentUser.username}`}>
                <a>{data.currentUser.username}</a>
              </Link>
            </div>
          )}
          <Menu
            mode="inline"
            css={{
              border: 'none',
              '.ant-menu-item, .ant-menu-submenu-title, .ant-menu-item:not(:last-child)':
                {
                  fontSize: '0.8rem',
                  margin: 0,
                },
              '.ant-menu-item::after': {
                left: 0,
                right: 'auto',
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

            {data?.currentUser && (
              <Menu.Item key="build-settings" onClick={openBuildSettings}>
                <span css={iconWrapper}>
                  <FontAwesomeIcon icon={faWrench} />
                </span>
                {t('DEFAULT_BUILD_SETTINGS', { ns: 'common' })}
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
          paddingTop: 12,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 8,
          paddingRight: 8,
          overflowAnchor: 'none',
          position: 'relative',
        }}
      >
        {children}
      </AntdLayout.Content>

      <LoginModal
        open={showLoginModal}
        onClose={closeLoginModal}
        openSignUpModal={openSignUpModal}
      />
      <SignUpModal
        open={showSignUpModal}
        onClose={closeSignUpModal}
        openLoginModal={openLoginModal}
      />
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={closePasswordModal}
      />

      <DefaultBuildSettingsModal
        open={showBuildSettings}
        onClose={closeBuildSettings}
      />
    </AntdLayout>
  );
}

export default Layout;
