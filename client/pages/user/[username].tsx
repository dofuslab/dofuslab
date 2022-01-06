/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'i18n';
import { getTitle } from 'common/utils';
import UserCustomSets from 'components/common/UserCustomSets';
import { useRouter } from 'next/router';
import { Media } from 'components/common/Media';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';

const UserProfilePage: NextPage = () => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const username = Array.isArray(router.query.username)
    ? router.query.username[0]
    : router.query.username || null;

  return (
    <>
      <Head>
        <title>
          {getTitle(
            t('USER_PROFILE', { username: (username!) }),
          )}
        </title>
      </Head>
      <Media lessThan="xs">
        <MobileLayout>
          <UserCustomSets username={username!} />
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
        <DesktopLayout showSwitch={false}>
          <UserCustomSets username={username!} />
        </DesktopLayout>
      </Media>
    </>
  );
};

UserProfilePage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'auth', 'status'],
  };
};

export default UserProfilePage;
