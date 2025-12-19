/** @jsxImportSource @emotion/react */

import { GetServerSideProps, NextPage } from 'next';
import EquipPage from 'components/common/EquipPage';
import { useRouter } from 'next/router';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { createApolloClient } from 'common/apollo';
import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SetsQuery from 'graphql/queries/sets.graphql';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import { ITEMS_PAGE_SIZE } from 'common/constants';

const EquipSetWithCustomSetPage: NextPage = () => {
  const router = useRouter();
  const customSetId = Array.isArray(router.query.customSetId)
    ? router.query.customSetId[0]
    : router.query.customSetId || null;
  return <EquipPage customSetId={customSetId} />;
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & { apolloState: NormalizedCacheObject },
  {
    itemSlotName: string;
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

  // populate server-side apollo cache
  const results = await Promise.all([
    ssrClient.query<customSet, customSetVariables>({
      query: CustomSetQuery,
      variables: { id: params?.customSetId },
    }),
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

  await ssrClient.query<sets, setsVariables>({
    query: SetsQuery,
    variables: {
      first: ITEMS_PAGE_SIZE,
      filters: {
        stats: [],
        maxLevel: customSet.level,
        search: '',
        itemTypeIds: [],
      },
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(selectedLocale, [
        'auth',
        'common',
        'mage',
        'stat',
        'status',
        'weapon_spell_effect',
        'meta',
        'keyboard_shortcut',
      ])),
      // extracts data from the server-side apollo cache to hydrate frontend cache
      apolloState: ssrClient.cache.extract(),
    },
  };
};

export default EquipSetWithCustomSetPage;
