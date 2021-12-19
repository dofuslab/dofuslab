/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'i18n';
import { capitalize, getTitle } from 'common/utils';
import UserCustomSets from 'components/common/UserCustomSets';
import { useRouter } from 'next/router';
import { Media } from 'components/common/Media';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';

// import userProfileCustomSets from 'graphql/queries/userProfileSets.graphql';
// import { userProfileSets } from 'graphql/queries/__generated__/userProfileSets';
// import { useQuery } from '@apollo/client';

const UserProfilePage: NextPage = () => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const username = Array.isArray(router.query.username)
    ? router.query.username[0]
    : router.query.username || null;

  // const { data } = useQuery<userProfile>(userProfileSets);

  // React.useEffect(() => {
  //   if (!data?.userByName) {
  //     Router.push('/');
  //   }
  // }, [data]);

  return (
    <>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
        />
        <title>
          {getTitle(
            t('USER_SETS', { username: capitalize(username as string) }),
          )}
        </title>
      </Head>
      <Media lessThan="xs">
        <MobileLayout>
          <UserCustomSets username={username} />
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
        <DesktopLayout showSwitch={false}>
          <UserCustomSets username={username} />
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
