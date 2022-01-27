/** @jsxImportSource @emotion/react */

import BuildPageComponent from 'components/common/BuildPage';
import { NextPage, GetStaticProps } from 'next';

import { createApolloClient } from 'common/apollo';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import CustomSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import ClassesQuery from 'graphql/queries/classes.graphql';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { ITEMS_PAGE_SIZE } from 'common/constants';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';

const Index: NextPage = () => {
  return <BuildPageComponent />;
};

export const getStaticProps: GetStaticProps = async ({
  locale,
  defaultLocale,
}) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { 'accept-language': selectedLocale },
    true,
  );

  // populate server-side apollo cache
  await Promise.all([
    ssrClient.query<itemSlots>({ query: ItemSlotsQuery }),
    ssrClient.query<customSetTags>({ query: CustomSetTagsQuery }),
    ssrClient.query<items, itemsVariables>({
      query: ItemsQuery,
      variables: {
        first: ITEMS_PAGE_SIZE,
        filters: { stats: [], maxLevel: 200, search: '', itemTypeIds: [] },
        equippedItemIds: [],
        level: 200,
      },
    }),
    ssrClient.query<classes>({ query: ClassesQuery }),
  ]);

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
      ])),
      // extracts data from the server-side apollo cache to hydrate frontend cache
      apolloState: ssrClient.cache.extract(),
    },
  };
};

export default Index;
