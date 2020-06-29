/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, ClassNames } from '@emotion/core';
import {
  Layout as AntdLayout,
  Button,
  Drawer,
  Dropdown,
  Menu,
  Divider,
  Switch,
} from 'antd';
import { useRouter } from 'next/router';
import { useTheme } from 'emotion-theming';

import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import { logout as LogoutMutationType } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import NoSSR from 'react-no-ssr';
import Link from 'next/link';
import { TFunction } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faKey,
  faMugHot,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';

import { useTranslation, LANGUAGES, langToFullName } from 'i18n';
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
import changeLocaleMutation from 'graphql/mutations/changeLocale.graphql';
import ChangePasswordModal from 'components/common/ChangePasswordModal';
import {
  LIGHT_THEME_NAME,
  darkTheme,
  lightTheme,
  DARK_THEME_NAME,
} from 'common/themes';
import Tooltip from 'components/common/Tooltip';
import { switchStyle } from 'common/mixins';
import { ClassicContext, ThemeContext } from 'common/utils';
import { Theme } from 'common/types';
import { DownOutlined } from '@ant-design/icons';
import MyBuilds from '../common/MyBuilds';
import SignUpModal from '../common/SignUpModal';
import LoginModal from '../common/LoginModal';

interface LayoutProps {
  children: React.ReactNode;
  showSwitch: boolean;
}

const getDonateElement = (t: TFunction) => {
  return Math.random() < 0.98 ? (
    <Tooltip
      placement="bottomLeft"
      title={t('BUY_US_COFFEE', { ns: 'common' })}
    >
      <FontAwesomeIcon icon={faMugHot} />
    </Tooltip>
  ) : (
    <ClassNames>
      {({ css, cx }) => (
        <Tooltip
          placement="bottomLeft"
          align={{ offset: [0, -1] }}
          title={t('BUY_US_BUBBLE_TEA', { ns: 'common' })}
        >
          <div
            className={cx(
              'twicon-tapioca',
              css({
                fontSize: '1.75rem',
                transform: 'translate(-2px, 1px)',
              }),
            )}
          />
        </Tooltip>
      )}
    </ClassNames>
  );
};

const Layout = ({ children, showSwitch }: LayoutProps) => {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const client = useApolloClient();
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);
  const [logout] = useMutation<LogoutMutationType>(logoutMutation);
  const [changeLocaleMutate] = useMutation<changeLocale, changeLocaleVariables>(
    changeLocaleMutation,
  );
  const router = useRouter();

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
  }, [logout, router]);

  const changeLocaleHandler = React.useCallback(
    async (locale: string) => {
      i18n.changeLanguage(locale);
      await changeLocaleMutate({ variables: { locale } });
      await client.resetStore();
    },
    [changeLocaleMutate, i18n, client],
  );

  const [drawerVisible, setDrawerVisible] = React.useState(false);

  const openDrawer = React.useCallback(() => {
    setDrawerVisible(true);
  }, [setDrawerVisible]);
  const closeDrawer = React.useCallback(() => {
    setDrawerVisible(false);
  }, [setDrawerVisible]);

  const { setTheme } = React.useContext(ThemeContext);

  const theme = useTheme<Theme>();

  return (
    <AntdLayout
      css={{
        '&.ant-layout': {
          height: '100%',
          minHeight: '100vh',
          backgroundColor: theme.body?.background,
        },
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
          '&.ant-layout-header': {
            display: 'flex',
            justifyContent: 'space-between',
            background: theme.header?.background,
            borderBottom: `1px solid ${theme.border?.default}`,
            padding: '0 20px',
            fontSize: '0.8rem',
          },
        }}
      >
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" as="/">
            <div css={{ fontWeight: 500, cursor: 'pointer' }}>
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
          </Link>
        </div>
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <ClassicContext.Consumer>
            {([isClassic, setIsClassic]) => {
              return (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.SubMenu title={t('LANGUAGE', { ns: 'common' })}>
                        {LANGUAGES.map((lang) => (
                          <Menu.Item
                            key={lang}
                            onClick={() => changeLocaleHandler(lang)}
                          >
                            {langToFullName(lang)}
                          </Menu.Item>
                        ))}
                      </Menu.SubMenu>
                      <Menu.Divider />
                      <Menu.Item
                        onClick={() => {
                          setIsClassic(!isClassic);
                        }}
                      >
                        {showSwitch && (
                          <>
                            <Switch
                              css={{
                                ...switchStyle(theme, true),
                                marginRight: 8,
                              }}
                              checked={isClassic}
                              onClick={(checked, e) => {
                                setIsClassic(checked);
                                e.stopPropagation();
                              }}
                            />
                            DofusLab Classic
                          </>
                        )}
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => {
                          setTheme(
                            theme.name === LIGHT_THEME_NAME
                              ? darkTheme
                              : lightTheme,
                          );
                        }}
                      >
                        <Switch
                          checked={theme.name === DARK_THEME_NAME}
                          onClick={(checked, e) => {
                            setTheme(checked ? darkTheme : lightTheme);
                            e.stopPropagation();
                          }}
                          css={{ marginRight: 8 }}
                          checkedChildren={<FontAwesomeIcon icon={faMoon} />}
                          unCheckedChildren={<FontAwesomeIcon icon={faSun} />}
                        />
                        {t('DARK_MODE', { ns: 'common' })}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button>
                    {t('OPTIONS', { ns: 'common' })}{' '}
                    <DownOutlined css={{ fontSize: '12px' }} />
                  </Button>
                </Dropdown>
              );
            }}
          </ClassicContext.Consumer>
          {data?.currentUser ? (
            <div>
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
                    <MyBuilds onClose={closeDrawer} />
                  </Drawer>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.ItemGroup
                          title={`${t('WELCOME')} ${data.currentUser.username}`}
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
                        </Menu.ItemGroup>
                        <Menu.SubMenu title={t('LANGUAGE', { ns: 'common' })}>
                          {LANGUAGES.map((lang) => (
                            <Menu.Item key={lang}>
                              {langToFullName(lang)}
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      </Menu>
                    }
                  >
                    <Button css={{ marginLeft: 12 }}>
                      {t('MY_ACCOUNT')}{' '}
                      <DownOutlined css={{ fontSize: '12px' }} />
                    </Button>
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
            {/* disable SSR to render based on Math.random() */}
            <NoSSR>
              <a
                href={BUY_ME_COFFEE_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip
                  placement="bottomLeft"
                  title={t('BUY_US_COFFEE', { ns: 'common' })}
                >
                  {getDonateElement(t)}
                </Tooltip>
              </a>
            </NoSSR>
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
