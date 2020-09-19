import React from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import Router from 'next/router';

import { currentUser } from 'graphql/queries/__generated__/currentUser';
import Layout from 'components/mobile/Layout';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import MyBuilds from 'components/common/MyBuilds';
import { useTranslation } from 'i18n';
import { getTitle } from 'common/utils';

const MyBuildsPage: NextPage = () => {
  const { data } = useQuery<currentUser>(currentUserQuery);
  const { t } = useTranslation('common');

  React.useEffect(() => {
    if (!data?.currentUser) {
      Router.push('/');
    }
  }, [data]);

  return (
    <Layout>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>{getTitle(t('MY_BUILDS'))}</title>
      </Head>
      <MyBuilds isMobile />
    </Layout>
  );
};

MyBuildsPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'auth', 'status'],
  };
};

export default MyBuildsPage;
