/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, ClassNames } from '@emotion/core';
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
import { useTheme } from 'emotion-theming';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import { logout as LogoutMutationType } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import NoSSR from 'react-no-ssr';
import Link from 'next/link';
import { TFunction } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faMugHot, faWrench } from '@fortawesome/free-solid-svg-icons';
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
import { LIGHT_THEME_NAME } from 'common/themes';
import Tooltip from 'components/common/Tooltip';
import { switchStyle } from 'common/mixins';
import { ClassicContext, getImageUrl } from 'common/utils';
import { Theme } from 'common/types';
import { DownOutlined } from '@ant-design/icons';
import { Media } from 'components/common/Media';
import DefaultBuildSettingsModal from 'components/common/DefaultBuildSettingsModal';
import BuildList from '../common/BuildList';
import SignUpModal from '../common/SignUpModal';
import LoginModal from '../common/LoginModal';

interface LayoutProps {
  children: React.ReactNode;
  showSwitch: boolean;
}

const { Option } = Select;

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

  const langSelect = (
    <Select<string>
      value={i18n.language}
      onSelect={changeLocaleHandler}
      css={{
        '&.ant-select': { marginLeft: 12 },
      }}
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

  const theme = useTheme<Theme>();

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
            checked={isClassic}
            onChange={setIsClassic}
          />
        );
        return (
          <div css={{ display: 'flex', marginRight: 12, alignItems: 'center' }}>
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
              DofusLab
            </a>
            <Media lessThan="sm">
              <Tooltip title={t('DOFUSLAB_CLASSIC', { ns: 'common' })}>
                {switchElement}
              </Tooltip>
            </Media>
            <Media greaterThanOrEqual="sm">{switchElement}</Media>
            <a
              css={{
                color: theme.text?.default,
                opacity: isClassic ? 1 : 0.3,
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
                setIsClassic(true);
              }}
            >
              DofusLab Classic
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
            <a>
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
            </a>
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
                    visible={drawerVisible}
                    closable
                    onClose={closeDrawer}
                    width="min(100%, 1000px)"
                  >
                    <BuildList
                      onClose={closeDrawer}
                      username={data.currentUser.username}
                    />
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
                        </Menu.ItemGroup>
                      </Menu>
                    }
                  >
                    <span>
                      <Button css={{ marginLeft: 12 }}>
                        {t('MY_ACCOUNT')}{' '}
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
      <DefaultBuildSettingsModal
        visible={showBuildSettings}
        onClose={closeBuildSettings}
      />
    </AntdLayout>
  );
};

export default Layout;
