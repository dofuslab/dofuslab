/** @jsxImportSource @emotion/react */

import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import {
  getTitle,
  getUserProfileMetaImage,
  getUserProfileMetaDescription,
} from 'common/utils';
import UserProfile from 'components/common/UserProfile';
import { useRouter } from 'next/router';
import { Media } from 'components/common/Media';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';
import { useQuery } from '@apollo/client';
import userProfileQuery from 'graphql/queries/userProfile.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import {
  userProfile,
  userProfileVariables,
} from 'graphql/queries/__generated__/userProfile';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import ErrorPage from 'pages/_error';

const UserProfilePage: NextPage = () => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const username = Array.isArray(router.query.username)
    ? router.query.username[0]
    : router.query.username;

  if (!username) {
    throw new Error('no username provided');
  }

  const { data: currentUser } = useQuery<currentUser>(currentUserQuery);

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
        <title>{getTitle(t('USER_PROFILE', { username }))}</title>
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
          content={getTitle(t('USER_PROFILE', { username }))}
        />
        {userProfileData && (
          <meta
            property="og:description"
            content={getUserProfileMetaDescription(
              username,
              userProfileData.userByName.customSets.totalCount,
            )}
          />
        )}
        <meta
          property="twitter:title"
          content={getTitle(t('USER_PROFILE', { username }))}
        />
        {userProfileData && (
          <meta
            property="twitter:description"
            content={getUserProfileMetaDescription(
              username,
              userProfileData.userByName.customSets.totalCount,
            )}
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

UserProfilePage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'auth', 'status'],
  };
};

export default UserProfilePage;
