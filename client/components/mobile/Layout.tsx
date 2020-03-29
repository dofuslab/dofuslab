/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import AntdLayout from 'antd/lib/layout';
import Button from 'antd/lib/button/button';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import { DownOutlined } from '@ant-design/icons';

import LoginModal from '../common/LoginModal';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';
import { logout as ILogout } from 'graphql/mutations/__generated__/logout';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import logoutMutation from 'graphql/mutations/logout.graphql';
import { BORDER_COLOR, gray8 } from 'common/mixins';

import { useTranslation } from 'i18n';
import SignUpModal from '../common/SignUpModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTshirt,
  faDoorOpen,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const iconWrapper = {
  marginRight: 12,
  width: 20,
  textAlign: 'center' as 'center',
  display: 'inline-block',
};

const Layout = (props: LayoutProps) => {
  const { t } = useTranslation(['auth', 'common']);
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

  const menu = (
    <Menu>
      <Menu.Item key="CREATE_NEW_BUILD" css={{ padding: '8px 12px' }}>
        <a css={{ fontSize: '0.75rem' }}>
          <span css={iconWrapper}>
            <FontAwesomeIcon icon={faPlus} />
          </span>
          {t('CREATE_NEW_BUILD', { ns: 'common' })}
        </a>
      </Menu.Item>
      <Menu.Item key="MY_BUILDS" css={{ padding: '8px 12px' }}>
        <Link href="/my-builds" as="/my-builds">
          <a css={{ fontSize: '0.75rem' }}>
            <span css={iconWrapper}>
              <FontAwesomeIcon icon={faTshirt} />
            </span>
            {t('MY_BUILDS', { ns: 'common' })}
          </a>
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="LOGOUT" css={{ padding: '8px 12px' }}>
        <a css={{ fontSize: '0.75rem' }} onClick={logoutHandler}>
          <span css={iconWrapper}>
            <FontAwesomeIcon icon={faDoorOpen} />
          </span>
          {t('LOGOUT')}
        </a>
      </Menu.Item>
    </Menu>
  );

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
        }}
      >
        <div css={{ fontWeight: 500 }}>DofusLab</div>
        <div>
          {data?.currentUser ? (
            <div>
              <Dropdown
                overlay={menu}
                trigger={['click']}
                align={{ offset: [0, 16] }}
              >
                <a css={{ fontSize: '0.8rem' }}>
                  {t('WELCOME_MESSAGE', {
                    displayName: data.currentUser.username,
                  })}
                  <DownOutlined css={{ marginLeft: 8 }} />
                </a>
              </Dropdown>
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
                }}
              >
                {t('LOGIN')}
              </Button>
              <span
                css={{
                  margin: '0 12px',
                  fontSize: '0.75rem',
                }}
              >
                {t('OR', { ns: 'common' })}
              </span>
              <Button
                onClick={openSignUpModal}
                type="default"
                css={{ fontSize: '0.75rem' }}
                size="large"
              >
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
          paddingLeft: 8,
          paddingRight: 8,
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
