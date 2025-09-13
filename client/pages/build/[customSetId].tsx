/** @jsxImportSource @emotion/react */

import BuildPageComponent from 'components/common/BuildPage';
import { GetServerSideProps, NextPage } from 'next';

import { createApolloClient } from 'common/apollo';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import SessionSettingsQuery from 'graphql/queries/sessionSettings.query';
import { sessionSettings } from 'graphql/queries/__generated__/sessionSettings';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.query';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.query';
import { EditableContext } from 'common/utils';

const BuildPage: NextPage = () => {
  return (
    <EditableContext.Provider value>
      <BuildPageComponent />
    </EditableContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & { apolloState: NormalizedCacheObject },
  {
    customSetId: string;
  }
> = async ({ locale, defaultLocale, req: { headers }, params }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { ...headers, 'accept-language': selectedLocale },
    true,
  );

  if (!params?.customSetId) {
    return { notFound: true };
  }

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<customSet, customSetVariables>({
        query: CustomSetQuery,
        variables: { id: params?.customSetId },
      }),
      ssrClient.query<sessionSettings>({ query: SessionSettingsQuery }),
      ssrClient.query<currentUser>({ query: CurrentUserQuery }),
    ]);

    const customSet = results[0].data.customSetById;

    if (!customSet) {
      return { notFound: true };
    }

    if (!customSet.hasEditPermission) {
      return {
        redirect: {
          destination:
            locale === defaultLocale
              ? `/view/${params.customSetId}`
              : `/${locale}/view/${params.customSetId}/`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(selectedLocale, [
          'auth',
          'common',
          'mage',
          'stat',
          'status',
          'weapon_spell_effect',
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

export default BuildPage;
