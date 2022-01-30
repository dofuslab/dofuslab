import React from 'react';
import { GetServerSideProps, NextPage } from 'next';

import { EditableContext } from 'common/utils';
import EquippedItemView from 'components/mobile/EquippedItemView';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { createApolloClient } from 'common/apollo';
import {
  customSet as customSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.graphql';

const EquippedItemPage: NextPage = () => {
  return (
    <EditableContext.Provider value>
      <EquippedItemView />
    </EditableContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & {
    apolloState: NormalizedCacheObject;
  },
  {
    customSetId: string;
    equippedItemId: string;
  }
> = async ({ locale, defaultLocale, req: { headers }, params }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { ...headers, 'accept-language': selectedLocale },
    true,
  );

  if (!params?.customSetId || !params.equippedItemId) {
    return { notFound: true };
  }

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<customSetQueryType, customSetVariables>({
        query: CustomSetQuery,
        variables: { id: params?.customSetId },
      }),
      ssrClient.query<currentUser>({ query: CurrentUserQuery }),
    ]);

    const customSet = results[0].data.customSetById;

    if (!customSet) {
      return { notFound: true };
    }

    const equippedItem = customSet.equippedItems.find(
      (ei) => ei.id === params.equippedItemId,
    );

    if (!equippedItem) {
      return { notFound: true };
    }

    if (!customSet.hasEditPermission) {
      return {
        redirect: {
          destination:
            locale === defaultLocale
              ? `/view/${params.customSetId}/${params.equippedItemId}/`
              : `/${locale}/view/${params.customSetId}/${params.equippedItemId}/`,
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
          'weapon_spell_effect',
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

export default EquippedItemPage;
