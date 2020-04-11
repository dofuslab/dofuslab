/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import {
  Layout as AntdLayout,
  Button,
  Drawer,
  Select,
  Dropdown,
  Menu,
} from 'antd';
import { useRouter } from 'next/router';

import LoginModal from '../common/LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import { BORDER_COLOR, gray8 } from 'common/mixins';

import { useTranslation, LANGUAGES } from 'i18n';
import SignUpModal from '../common/SignUpModal';
import MyBuilds from '../common/MyBuilds';
import Link from 'next/link';
import { mq } from 'common/constants';
import StatusChecker from 'components/common/StatusChecker';
import {
  changeLocale,
  changeLocaleVariables,
} from 'graphql/mutations/__generated__/changeLocale';
import changeLocaleMutation from 'graphql/mutations/changeLocale.graphql';
import ChangePasswordModal from 'components/common/ChangePasswordModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: React.ReactNode;
}

const { Option } = Select;

const Layout = (props: LayoutProps) => {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const client = useApolloClient();
  const { data } = useQuery<ICurrentUser>(currentUserQuery);
  const [logout] = useMutation<ILogout>(logoutMutation);
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
      css={{ marginLeft: 12 }}
    >
      {LANGUAGES.map(lang => (
        <Option key={lang} value={lang}>
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <div
              css={{
                fontVariant: 'small-caps',
                fontSize: '0.8rem',
                fontWeight: 500,
                marginTop: -2,
              }}
            >
              {lang}
            </div>
          </div>
        </Option>
      ))}
    </Select>
  );

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
          {data?.currentUser ? (
            <div>
              {t('WELCOME')}
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="change-password"
                      onClick={openPasswordModal}
                    >
                      <FontAwesomeIcon icon={faKey} css={{ marginRight: 8 }} />
                      {t('CHANGE_PASSWORD')}
                    </Menu.Item>
                  </Menu>
                }
              >
                <a onClick={openPasswordModal}>{data.currentUser.username}</a>
              </Dropdown>
              {langSelect}
              {data.currentUser.verified && (
                <>
                  <Button onClick={openDrawer} css={{ marginLeft: 16 }}>
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
            <div css={{ display: 'flex', alignItems: 'center' }}>
              {langSelect}
              <Button
                onClick={openLoginModal}
                type="link"
                css={{
                  padding: 0,
                  color: gray8,
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
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={closePasswordModal}
      />
    </AntdLayout>
  );
};

export default Layout;
