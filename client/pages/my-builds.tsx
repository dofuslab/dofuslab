import React from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import Router from 'next/router';

import { currentUser } from 'graphql/queries/__generated__/currentUser';
import Layout from 'components/mobile/Layout';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import BuildList from 'components/common/BuildList';
import { useTranslation } from 'next-i18next';
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
      {data?.currentUser && (
        <BuildList username={data.currentUser.username} isEditable />
      )}
    </Layout>
  );
};

MyBuildsPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'auth', 'status', 'keyboard_shortcut'],
  };
};

export default MyBuildsPage;
