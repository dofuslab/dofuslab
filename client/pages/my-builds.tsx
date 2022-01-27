import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { NormalizedCacheObject, useQuery } from '@apollo/client';
import Router from 'next/router';

import { currentUser } from 'graphql/queries/__generated__/currentUser';
import Layout from 'components/mobile/Layout';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import CurrentUserQuery from 'graphql/queries/currentUser.graphql';
import BuildList from 'components/common/BuildList';
import { SSRConfig, useTranslation } from 'next-i18next';
import { getTitle } from 'common/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createApolloClient } from 'common/apollo';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import CustomSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import ClassesQuery from 'graphql/queries/classes.graphql';
import {
  buildList,
  buildListVariables,
} from 'graphql/queries/__generated__/buildList';
import BuildListQuery from 'graphql/queries/buildList.graphql';
import { BUILD_LIST_PAGE_SIZE } from 'common/constants';

const MyBuildsPage: NextPage = () => {
  const { data } = useQuery<currentUser>(CurrentUserQuery);
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
        <BuildList username={data.currentUser.username} isEditable isMobile />
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & { apolloState: NormalizedCacheObject }
> = async ({ locale, defaultLocale, req: { headers } }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { ...headers, 'accept-language': selectedLocale },
    true,
  );

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<currentUser>({ query: CurrentUserQuery }),
      ssrClient.query<customSetTags>({ query: CustomSetTagsQuery }),
      ssrClient.query<classes>({ query: ClassesQuery }),
    ]);

    const user = results[0].data.currentUser;

    if (!user || !user.verified) {
      return { notFound: true };
    }

    await ssrClient.query<buildList, buildListVariables>({
      query: BuildListQuery,
      variables: {
        username: user.username,
        first: BUILD_LIST_PAGE_SIZE,
        filters: { search: '', tagIds: [] },
      },
    });

    return {
      props: {
        ...(await serverSideTranslations(selectedLocale, [
          'common',
          'auth',
          'status',
        ])),
        // extracts data from the server-side apollo cache to hydrate frontend cache
        apolloState: ssrClient.cache.extract(),
      },
    };
  } catch (e) {
    // TODO: improve error handling
    return { notFound: true };
  }
};
export default MyBuildsPage;
