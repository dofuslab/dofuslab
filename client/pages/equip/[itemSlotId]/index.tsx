/** @jsxImportSource @emotion/react */

import { GetStaticProps, NextPage } from 'next';
import EquipPage from 'components/common/EquipPage';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { createApolloClient } from 'common/apollo';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { ITEMS_PAGE_SIZE } from 'common/constants';

const EquipIndexPage: NextPage = () => <EquipPage customSetId={null} />;

export const getStaticProps: GetStaticProps<
  SSRConfig & {
    apolloState: NormalizedCacheObject;
  },
  {
    itemSlotId: string;
  }
> = async ({ locale, defaultLocale, params }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { 'accept-language': selectedLocale },
    true,
  );

  // populate server-side apollo cache
  const { data: itemSlotsData } = await ssrClient.query<itemSlots>({
    query: ItemSlotsQuery,
  });

  if (!params?.itemSlotId) {
    throw new Error(
      `params?.itemSlotId resolved to ${params?.itemSlotId} when it is required`,
    );
  }

  const itemSlot = itemSlotsData.itemSlots.find(
    (slot) => slot.id === params?.itemSlotId,
  );

  if (!itemSlot) {
    throw new Error(`No item slot with id ${params.itemSlotId} found`);
  }

  await ssrClient.query<items, itemsVariables>({
    query: ItemsQuery,
    variables: {
      first: ITEMS_PAGE_SIZE,
      filters: {
        stats: [],
        maxLevel: 200,
        search: '',
        itemTypeIds: [itemSlot.itemTypes.map((type) => type.id)],
      },
      equippedItemIds: [],
      level: 200,
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
      ])),
      // extracts data from the server-side apollo cache to hydrate frontend cache
      apolloState: ssrClient.cache.extract(),
    },
  };
};

export default EquipIndexPage;
