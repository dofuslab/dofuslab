/** @jsxImportSource @emotion/react */

import type { ReactNode } from 'react';

import { useState, useCallback, useMemo } from 'react';
import { Global, useTheme } from '@emotion/react';
import { Layout as AntdLayout, Button, Menu, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
import { LANGUAGES, langToFullName } from 'common/i18n-utils';
import { AntdRegistry } from '@ant-design/nextjs-registry';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTshirt,
  faDoorOpen,
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
  children: ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

const iconWrapper = {
  marginRight: 12,
  width: 20,
  textAlign: 'center' as const,
  display: 'inline-block',
};

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

  const [showDrawer, setShowDrawer] = useState(false);
  const openDrawer = useCallback(() => {
    setShowDrawer(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, []);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
  }, []);
  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const openSignUpModal = useCallback(() => {
    setShowSignUpModal(true);
  }, []);
  const closeSignUpModal = useCallback(() => {
    setShowSignUpModal(false);
  }, []);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const openPasswordModal = useCallback(() => {
    setShowPasswordModal(true);
  }, []);
  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
  }, []);

  const [showBuildSettings, setShowBuildSettings] = useState(false);
  const openBuildSettings = useCallback(() => {
    setShowBuildSettings(true);
  }, []);
  const closeBuildSettings = useCallback(() => {
    setShowBuildSettings(false);
  }, []);

  const logoutHandler = useCallback(async () => {
    const { data: logoutData } = await logout();
    if (logoutData?.logoutUser?.ok) {
      await client.resetStore();
      router.push('/');
    }
  }, [logout, router, client]);

  const changeLocaleHandler = useCallback(
    async (locale: string) => {
      Cookies.set('NEXT_LOCALE', locale);
      await router.push({ pathname, query }, asPath, { locale });
      await changeLocaleMutate({ variables: { locale } });
      window.location.reload();
    },
    [changeLocaleMutate, router, client],
  );

  const menuClickHandler = useCallback<NonNullable<MenuProps['onClick']>>(
    (e) => {
      const { key } = e;

      switch (key) {
        case 'login':
          openLoginModal();
          break;
        case 'signup':
          openSignUpModal();
          break;
        case 'change-password':
          openPasswordModal();
          break;
        case 'build-settings':
          openBuildSettings();
          break;
        case 'logout':
          logoutHandler();
          break;
        default:
          // Handle language selection
          if (LANGUAGES.includes(key)) {
            changeLocaleHandler(key);
          }
          break;
      }
    },
    [
      openLoginModal,
      openSignUpModal,
      openPasswordModal,
      openBuildSettings,
      logoutHandler,
      changeLocaleHandler,
    ],
  );

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        key: 'home',
        label: (
          <Link href="/" as="/" legacyBehavior>
            <div css={{ display: 'flex' }}>
              <span css={iconWrapper}>
                <FontAwesomeIcon icon={faHome} />
              </span>
              <div>Home</div>
            </div>
          </Link>
        ),
      },
    ];

    if (data?.currentUser && data.currentUser.verified) {
      items.push({
        key: 'my-builds',
        label: (
          <Link href="/my-builds" as="/my-builds">
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faTshirt} />
            </span>
            {t('MY_BUILDS', { ns: 'common' })}
          </Link>
        ),
      });
    }

    if (!data?.currentUser) {
      items.push(
        {
          key: 'login',
          label: (
            <div css={{ display: 'flex' }}>
              <span css={iconWrapper}>
                <FontAwesomeIcon icon={faSignInAlt} />
              </span>
              {t('LOGIN')}
            </div>
          ),
        },
        {
          key: 'signup',
          label: (
            <div css={{ display: 'flex' }}>
              <span css={iconWrapper}>
                <FontAwesomeIcon icon={faUserPlus} />
              </span>
              {t('SIGN_UP')}
            </div>
          ),
        },
      );
    }

    if (data?.currentUser) {
      items.push(
        {
          key: 'change-password',
          label: (
            <div css={{ display: 'flex' }}>
              <span css={iconWrapper}>
                <FontAwesomeIcon icon={faKey} />
              </span>
              {t('CHANGE_PASSWORD')}
            </div>
          ),
        },
        {
          key: 'build-settings',
          label: (
            <div css={{ display: 'flex' }}>
              <span css={iconWrapper}>
                <FontAwesomeIcon icon={faWrench} />
              </span>
              {t('DEFAULT_BUILD_SETTINGS', { ns: 'common' })}
            </div>
          ),
        },
      );
    }

    // Note: Removing while this causes issues with submenu:
    // TypeError: Cannot destructure property 'scrollHeight' of 'e' as it is null.
    // When trying to open submenu
    // // Language submenu
    // items.push({
    //   key: 'language',
    //   label: (
    //     <div css={{ display: 'flex' }}>
    //       <span css={iconWrapper}>
    //         <FontAwesomeIcon icon={faLanguage} />
    //       </span>
    //       {t('LANGUAGE', { ns: 'common' })}
    //     </div>
    //   ),
    //   children: LANGUAGES.map((lang) => ({
    //     key: lang,
    //     label: langToFullName(lang),
    //   })),
    // });

    items.push(
      ...LANGUAGES.map((lang) => ({
        key: lang,
        label: <div css={{ display: 'flex' }}>{langToFullName(lang)}</div>,
      })),
    );

    if (data?.currentUser) {
      items.push({
        key: 'logout',
        label: (
          <div css={{ display: 'flex' }}>
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faDoorOpen} />
            </span>
            {t('LOGOUT')}
          </div>
        ),
      });
    }

    // Divider
    items.push({
      type: 'divider',
    });

    // External links
    items.push(
      {
        key: 'discord',
        label: (
          <a
            href={DISCORD_SERVER_LINK}
            target="_blank"
            rel="noopener noreferrer"
            css={{ display: 'flex' }}
          >
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faDiscord} />
            </span>
            {t('JOIN_US_DISCORD', { ns: 'common' })}
          </a>
        ),
      },
      {
        key: 'github',
        label: (
          <a
            href={GITHUB_REPO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            css={{ display: 'flex' }}
          >
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faGithub} />
            </span>
            {t('CONTRIBUTE_GITHUB', { ns: 'common' })}
          </a>
        ),
      },
      {
        key: 'coffee',
        label: (
          <a
            href={BUY_ME_COFFEE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            css={{ display: 'flex' }}
          >
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faMugHot} />
            </span>
            {t('BUY_US_COFFEE', { ns: 'common' })}
          </a>
        ),
      },
    );

    return items;
  }, [data?.currentUser, t]);

  const theme = useTheme();

  return (
    <AntdRegistry>
      <AntdLayout
        css={{ height: '100%', minHeight: '100vh' }}
        suppressHydrationWarning
      >
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
            <div
              css={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}
            >
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
          </Link>
          <Button
            onClick={openDrawer}
            size="large"
            css={{ fontSize: '0.9rem' }}
          >
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
                  {data.currentUser.username}
                </Link>
              </div>
            )}
            <Menu
              mode="inline"
              onClick={menuClickHandler}
              items={menuItems}
              css={{
                border: 'none',
                '.ant-menu-item, .ant-menu-submenu-title, .ant-menu-item:not(:last-child)':
                  {
                    width: '100%',
                    fontSize: '0.8rem',
                    margin: 0,
                  },
                '.ant-menu-item::after': {
                  left: 0,
                  right: 'auto',
                },
                '.ant-menu-item-divider': {
                  margin: '4px 0',
                },
              }}
              triggerSubMenuAction="click"
            />
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
    </AntdRegistry>
  );
}

export default Layout;
