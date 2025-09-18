/** @jsxImportSource @emotion/react */

import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { SSRConfig, useTranslation } from 'next-i18next';
import { getTitle, getUserProfileMetaImage } from 'common/utils';
import UserProfile from 'components/common/UserProfile';
import { useRouter } from 'next/router';
import { Media } from 'components/common/Media';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';
import { NormalizedCacheObject, useQuery } from '@apollo/client';
import userProfileQuery from 'graphql/queries/userProfile.query';
import CurrentUserQuery from 'graphql/queries/currentUser.query';
import {
  userProfile,
  userProfileVariables,
} from 'graphql/queries/__generated__/userProfile';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import ErrorPage from 'pages/_error';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createApolloClient } from 'common/apollo';
import { DEFAULT_LANGUAGE, prependDe } from 'common/i18n-utils';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import CustomSetTagsQuery from 'graphql/queries/customSetTags.query';
import { classes } from 'graphql/queries/__generated__/classes';
import ClassesQuery from 'graphql/queries/classes.query';
import {
  buildList,
  buildListVariables,
} from 'graphql/queries/__generated__/buildList';
import BuildListQuery from 'graphql/queries/buildList.query';
import { BUILD_LIST_PAGE_SIZE } from 'common/constants';

const UserProfilePage: NextPage = () => {
  const { t } = useTranslation(['common', 'meta']);

  const router = useRouter();

  const locale = router.locale || router.defaultLocale || DEFAULT_LANGUAGE;

  const username = Array.isArray(router.query.username)
    ? router.query.username[0]
    : router.query.username;

  if (!username) {
    throw new Error('no username provided');
  }

  const { data: currentUser } = useQuery<currentUser>(CurrentUserQuery);

  const { data: userProfileData } = useQuery<userProfile, userProfileVariables>(
    userProfileQuery,
    { variables: { username } },
  );

  if (userProfileData?.userByName === null) {
    return <ErrorPage statusCode={404} />;
  }

  const isEditable =
    currentUser?.currentUser?.username.toLowerCase() === username.toLowerCase();

  return (
    <>
      <Head>
        <title>
          {getTitle(
            t('USER_PROFILE', { username: prependDe(locale, username) }),
          )}
        </title>
        <meta property="og:site_name" content="DofusLab" />
        <meta property="og:type" content="profile" />
        <meta
          property="og:image:url"
          content={getUserProfileMetaImage(
            userProfileData?.userByName.profilePicture,
          )}
        />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:title"
          content={getTitle(
            t('USER_PROFILE', { username: prependDe(locale, username) }),
          )}
        />
        {userProfileData && (
          <meta
            property="og:description"
            content={t('USER_PROFILE', {
              ns: 'meta',
              username: prependDe(locale, username),
              count: userProfileData.userByName.customSets.totalCount,
            })}
          />
        )}
        <meta
          property="twitter:title"
          content={getTitle(
            t('USER_PROFILE', { username: prependDe(locale, username) }),
          )}
        />
        {userProfileData && (
          <meta
            property="twitter:description"
            content={t('USER_PROFILE', {
              ns: 'meta',
              username: prependDe(locale, username),
              count: userProfileData.userByName.customSets.totalCount,
            })}
          />
        )}
        <meta
          property="twitter:image"
          content={getUserProfileMetaImage(
            userProfileData?.userByName.profilePicture,
          )}
        />
        <meta property="twitter:card" content="summary" />
      </Head>
      <Media lessThan="xs">
        <MobileLayout>
          {userProfileData?.userByName && (
            <UserProfile
              username={userProfileData.userByName.username}
              creationDate={userProfileData.userByName.creationDate}
              profilePicture={userProfileData.userByName.profilePicture}
              isEditable={isEditable}
              isMobile
            />
          )}
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
        <DesktopLayout showSwitch={false}>
          {userProfileData?.userByName && (
            <UserProfile
              username={userProfileData.userByName.username}
              creationDate={userProfileData.userByName.creationDate}
              profilePicture={userProfileData.userByName.profilePicture}
              isEditable={isEditable}
            />
          )}
        </DesktopLayout>
      </Media>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & { apolloState: NormalizedCacheObject },
  {
    username: string;
  }
> = async ({ locale, defaultLocale, req: { headers }, params }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { ...headers, 'accept-language': selectedLocale },
    true,
  );

  if (!params?.username) {
    return { notFound: true };
  }

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<userProfile, userProfileVariables>({
        query: userProfileQuery,
        variables: { username: params.username },
      }),
      ssrClient.query<buildList, buildListVariables>({
        query: BuildListQuery,
        variables: {
          username: params.username,
          first: BUILD_LIST_PAGE_SIZE,
          filters: { search: '', tagIds: [] },
        },
      }),
      ssrClient.query<customSetTags>({ query: CustomSetTagsQuery }),
      ssrClient.query<classes>({ query: ClassesQuery }),
      ssrClient.query<currentUser>({ query: CurrentUserQuery }),
    ]);

    const user = results[0].data.userByName;

    if (!user) {
      return { notFound: true };
    }

    return {
      props: {
        ...(await serverSideTranslations(selectedLocale, [
          'common',
          'auth',
          'status',
          'keyboard_shortcut',
          'meta',
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

export default UserProfilePage;
