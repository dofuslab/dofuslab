/** @jsxImportSource @emotion/react */

import type { ReactNode } from 'react';

import { useState, useCallback, useRef, useEffect } from 'react';

import { Global, useTheme } from '@emotion/react';
import {
  Layout as AntdLayout,
  Button,
  Drawer,
  Select,
  Dropdown,
  Menu,
  Divider,
  Switch,
} from 'antd';
import { useRouter } from 'next/router';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import { logout as LogoutMutationType } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.query';
import logoutMutation from 'graphql/mutations/logout.mutation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { LANGUAGES, langToFullName } from 'common/i18n-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faKey,
  faKeyboard,
  faMugHot,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import Cookies from 'js-cookie';
import {
  mq,
  DISCORD_SERVER_LINK,
  GITHUB_REPO_LINK,
  BUY_ME_COFFEE_LINK,
} from 'common/constants';
import StatusChecker from 'components/common/StatusChecker';
import {
  changeLocale,
  changeLocaleVariables,
} from 'graphql/mutations/__generated__/changeLocale';
import changeLocaleMutation from 'graphql/mutations/changeLocale.mutation';
import ChangePasswordModal from 'components/common/ChangePasswordModal';
import { LIGHT_THEME_NAME } from 'common/themes';
import Tooltip from 'components/common/Tooltip';
import { switchStyle } from 'common/mixins';
import { ClassicContext, getImageUrl } from 'common/utils';
import { DownOutlined } from '@ant-design/icons';
import { Media } from 'components/common/Media';
import DefaultBuildSettingsModal from 'components/common/DefaultBuildSettingsModal';
import BuildList from '../common/BuildList';
import SignUpModal from '../common/SignUpModal';
import LoginModal from '../common/LoginModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

interface LayoutProps {
  children: ReactNode;
  showSwitch: boolean;
}

const { Option } = Select;

function Layout({ children, showSwitch }: LayoutProps) {
  const { t, i18n } = useTranslation(['auth', 'common', 'keyboard_shortcut']);
  const client = useApolloClient();
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);
  const [logout] = useMutation<LogoutMutationType>(logoutMutation);
  const [changeLocaleMutate] = useMutation<changeLocale, changeLocaleVariables>(
    changeLocaleMutation,
  );
  const router = useRouter();
  const [isChangingLocale, setIsChangingLocale] = useState(false);
  const { pathname, asPath, query } = router;

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

  const [isReady, setIsReady] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const openKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(true);
  }, []);
  const closeKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(false);
  }, []);

  const logoutHandler = useCallback(async () => {
    const { data: logoutData } = await logout();
    if (logoutData?.logoutUser?.ok) {
      await client.resetStore();
      router.push('/');
    }
  }, [logout, router]);

  const changeLocaleHandler = useCallback(
    async (locale: string) => {
      setIsChangingLocale(true);
      Cookies.set('NEXT_LOCALE', locale);
      await changeLocaleMutate({ variables: { locale } });
      await router.push({ pathname, query }, asPath, { locale });
      window.location.reload();
    },
    [changeLocaleMutate, router, client],
  );

  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
  }, [setDrawerVisible]);
  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
  }, [setDrawerVisible]);

  const langSelect = (
    <Select<string>
      value={i18n.language}
      onSelect={changeLocaleHandler}
      css={{
        '&.ant-select': { marginLeft: 12 },
      }}
      onKeyDown={(e) => {
        // prevents triggering SetBuilderKeyboardShortcuts
        e.nativeEvent.stopPropagation();
      }}
      loading={isChangingLocale}
    >
      {LANGUAGES.map((lang) => (
        <Option key={lang} value={lang}>
          <div css={{ display: 'flex', alignItems: 'center' }}>
            {langToFullName(lang)}
          </div>
        </Option>
      ))}
    </Select>
  );

  const theme = useTheme();

  const drawerBody = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isReady) {
      drawerBody.current = document.getElementsByClassName(
        'ant-drawer-body',
      )[0] as HTMLDivElement;

      if (drawerBody.current) {
        setIsReady(true);
      }
    }
  });

  const classicSwitch = (
    <ClassicContext.Consumer>
      {([isClassic, setIsClassic]) => {
        const switchElement = (
          <Switch
            css={{
              ...switchStyle(theme, true),
              [mq[2]]: {
                marginLeft: 8,
                marginRight: 8,
              },
            }}
            checked={!isClassic}
            onChange={(v) => setIsClassic(!v)}
          />
        );
        return (
          <div
            css={{
              display: 'flex',
              marginRight: 12,
              alignItems: 'center',
              fontSize: '0.75rem',
            }}
          >
            <Media lessThan="sm">
              <Tooltip
                css={{ fontSize: '0.75rem' }}
                title={t('ADVANCED_MODE', { ns: 'common' })}
              >
                {switchElement}
              </Tooltip>
            </Media>
            <Media greaterThanOrEqual="sm">{switchElement}</Media>
            <a
              css={{
                color: theme.text?.default,
                opacity: isClassic ? 0.3 : 1,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  opacity: 1,
                },
                display: 'none',
                [mq[2]]: {
                  display: 'inline',
                },
              }}
              onClick={() => {
                setIsClassic(false);
              }}
            >
              {t('ADVANCED_MODE', { ns: 'common' })}
            </a>
          </div>
        );
      }}
    </ClassicContext.Consumer>
  );

  return (
    <AntdLayout
      css={{
        height: '100%',
        minHeight: '100vh',
        backgroundColor: theme.body?.background,
      }}
    >
      <Global
        styles={{
          html: {
            fontSize: 18,
          },
          body: {
            backgroundColor: theme.body?.background,
            [mq[1]]: {
              height: '100vh',
            },
            fontSize: '0.8rem',
            msScrollbarFaceColor: theme.scrollbar?.background,
            msScrollbarBaseColor: theme.scrollbar?.background,
            msScrollbar3dlightColor: theme.scrollbar?.background,
            msScrollbarHighlightColor: theme.scrollbar?.background,
            msScrollbarTrackColor: theme.scrollbar?.trackBackground,
            msScrollbarArrowColor: theme.scrollbar?.trackBackground,
            msScrollbarShadowColor: theme.scrollbar?.background,
            msScrollbarDarkshadowColor: theme.scrollbar?.background,
          },
          '#__next': {
            height: '100%',
          },
          '&::-webkit-scrollbar': {
            width: 12,
            height: 3,

            '&-button': {
              backgroundColor: theme.scrollbar?.background,
              '&:decrement': {
                borderBottom: `1px solid ${theme.scrollbar?.buttonBorder}`,
              },
              '&:increment': {
                borderTop: `1px solid ${theme.scrollbar?.buttonBorder}`,
              },
            },

            '&-track': {
              backgroundColor: theme.scrollbar?.background,
              '&-piece': {
                backgroundColor: theme.scrollbar?.trackBackground,
              },
            },

            '&-thumb': {
              height: 20,
              backgroundColor: theme.scrollbar?.background,
            },

            '&-corner': {
              backgroundColor: theme.scrollbar?.background,
            },
          },
        }}
      />
      <StatusChecker />
      <AntdLayout.Header
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          background: theme.header?.background,
          borderBottom: `1px solid ${theme.border?.default}`,
          padding: '0 20px',
          fontSize: '0.8rem',
        }}
      >
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" as="/">
            <div css={{ fontWeight: 500, cursor: 'pointer' }}>
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
        </div>
        <div css={{ display: 'flex', alignItems: 'center' }}>
          {showSwitch && classicSwitch}
          {data?.currentUser ? (
            <div>
              {langSelect}
              {data.currentUser.verified && (
                <>
                  <Button onClick={openDrawer} css={{ marginLeft: 12 }}>
                    {t('MY_BUILDS', { ns: 'common' })}
                  </Button>
                  <Drawer
                    open={drawerVisible}
                    closable
                    onClose={closeDrawer}
                    width="min(100%, 1000px)"
                    forceRender
                  >
                    {isReady && (
                      <BuildList
                        onClose={closeDrawer}
                        username={data.currentUser.username}
                        isEditable
                        getScrollParent={() => {
                          return drawerBody.current;
                        }}
                        isMobile={false}
                      />
                    )}
                  </Drawer>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.ItemGroup
                          title={
                            <span>
                              {t('WELCOME')}{' '}
                              <Link href={`/user/${data.currentUser.username}`}>
                                {data.currentUser.username}
                              </Link>
                            </span>
                          }
                        >
                          <Menu.Item
                            key="change-password"
                            onClick={openPasswordModal}
                          >
                            <FontAwesomeIcon
                              icon={faKey}
                              css={{ marginRight: 8 }}
                            />
                            {t('CHANGE_PASSWORD')}
                          </Menu.Item>
                          <Menu.Item
                            key="build-settings"
                            onClick={openBuildSettings}
                          >
                            <FontAwesomeIcon
                              icon={faWrench}
                              css={{ marginRight: 8 }}
                            />
                            {t('DEFAULT_BUILD_SETTINGS', { ns: 'common' })}
                          </Menu.Item>
                          <Menu.Item
                            key="keyboard-shortcuts"
                            onClick={openKeyboardShortcuts}
                          >
                            <FontAwesomeIcon
                              icon={faKeyboard}
                              css={{ marginRight: 8 }}
                            />
                            {t('KEYBOARD_SHORTCUTS', {
                              ns: 'keyboard_shortcut',
                            })}
                          </Menu.Item>
                        </Menu.ItemGroup>
                      </Menu>
                    }
                  >
                    <span>
                      <Button css={{ marginLeft: 12 }}>
                        {t('MENU', { ns: 'common' })}{' '}
                        <DownOutlined css={{ fontSize: '12px' }} />
                      </Button>
                    </span>
                  </Dropdown>
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
            <div css={{ display: 'flex', alignItems: 'center' }}>
              <Button onClick={openKeyboardShortcuts}>
                {t('SHORTCUTS', { ns: 'keyboard_shortcut' })}
              </Button>
              {langSelect}
              <Button
                onClick={openLoginModal}
                type="link"
                css={{
                  padding: 0,
                  color: theme.text?.link?.default,
                  marginLeft: 16,
                }}
              >
                {t('LOGIN')}
              </Button>
              <span
                css={{
                  margin: '-2px 12px 0',
                }}
              >
                {t('OR', { ns: 'common' })}
              </span>
              <Button onClick={openSignUpModal} type="default">
                {t('SIGN_UP')}
              </Button>
            </div>
          )}
          <Divider type="vertical" css={{ margin: '0 8px 0 12px' }} />
          <div
            css={{
              marginLeft: 4,
              display: 'flex',
              alignItems: 'center',
              '> *': {
                fontSize: '1.2rem',
                '&:not(:last-of-type)': {
                  marginRight: 12,
                },
              },
            }}
          >
            <a
              href={DISCORD_SERVER_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip
                placement="bottomLeft"
                title={t('JOIN_US_DISCORD', { ns: 'common' })}
              >
                <FontAwesomeIcon icon={faDiscord} />
              </Tooltip>
            </a>
            <a
              href={GITHUB_REPO_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip
                placement="bottomLeft"
                title={t('CONTRIBUTE_GITHUB', { ns: 'common' })}
              >
                <FontAwesomeIcon icon={faGithub} />
              </Tooltip>
            </a>
            <a
              href={BUY_ME_COFFEE_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip
                placement="bottomLeft"
                title={t('BUY_US_COFFEE', { ns: 'common' })}
              >
                <FontAwesomeIcon icon={faMugHot} />
              </Tooltip>
            </a>
          </div>
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
      <KeyboardShortcutsModal
        open={showKeyboardShortcuts}
        onClose={closeKeyboardShortcuts}
      />
    </AntdLayout>
  );
}

export default Layout;
