/** @jsxImportSource @emotion/react */

import { GetStaticProps, NextPage } from 'next';
import EquipPage from 'components/common/EquipPage';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { createApolloClient } from 'common/apollo';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import SetsQuery from 'graphql/queries/sets.graphql';
import { sets, setsVariables } from 'graphql/queries/__generated__/sets';
import { ITEMS_PAGE_SIZE } from 'common/constants';

const EquipSetPage: NextPage = () => <EquipPage customSetId={null} />;

export const getStaticProps: GetStaticProps<
  SSRConfig & {
    apolloState: NormalizedCacheObject;
  }
> = async ({ locale, defaultLocale }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { 'accept-language': selectedLocale },
    true,
  );

  await ssrClient.query<sets, setsVariables>({
    query: SetsQuery,
    variables: {
      first: ITEMS_PAGE_SIZE,
      filters: {
        stats: [],
        maxLevel: 200,
        search: '',
        itemTypeIds: [],
      },
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(selectedLocale, [
        'common',
        'stat',
        'auth',
        'weapon_spell_effect',
        'status',
        'mage',
        'meta',
        'keyboard_shortcut',
      ])),
      // extracts data from the server-side apollo cache to hydrate frontend cache
      apolloState: ssrClient.cache.extract(),
    },
  };
};

export default EquipSetPage;
