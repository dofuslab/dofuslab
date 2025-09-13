/** @jsxImportSource @emotion/react */

import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticProps,
  NextPage,
} from 'next';
import EquipPage from 'components/common/EquipPage';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { createApolloClient } from 'common/apollo';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.query';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import ItemsQuery from 'graphql/queries/items.query';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import { ITEMS_PAGE_SIZE } from 'common/constants';
import { ItemSlot } from 'common/type-aliases';
import { formatNameForUrl, slotToUrlString } from 'common/utils';

type Props = {
  itemSlotId: string;
};

const EquipIndexPage: NextPage<Props> = ({ itemSlotId }) => (
  <EquipPage customSetId={null} itemSlotId={itemSlotId} />
);

type Params = { itemSlotName: string };

export const getStaticPaths: GetStaticPaths<Params> = async ({ locales }) => {
  const paths: GetStaticPathsResult<Params>['paths'] = [];

  locales?.forEach(async (locale) => {
    const serverClient = createApolloClient(
      {},
      { 'accept-language': locale },
      true,
    );
    const { data: itemSlotsData } = await serverClient.query<itemSlots>({
      query: ItemSlotsQuery,
    });
    itemSlotsData.itemSlots.forEach((slot) => {
      paths.push({ params: { itemSlotName: slotToUrlString(slot) }, locale });
    });
  });

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<
  SSRConfig &
    Props & {
      apolloState: NormalizedCacheObject;
    },
  Params
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

  if (!params?.itemSlotName) {
    return { notFound: true };
  }

  let itemSlot: ItemSlot | undefined;

  try {
    itemSlot = itemSlotsData.itemSlots.find((slot) => {
      const match = params.itemSlotName.match(
        /(?<slotName>[a-z]+)(-(?<slotOrder>\d+))?/,
      );

      if (!match?.groups) {
        throw new Error(`Invalid itemSlotName ${params.itemSlotName}`);
      }

      const urlSafeSlotName = formatNameForUrl(slot.name);

      if (urlSafeSlotName === match.groups.slotName) {
        return (
          match.groups.slotOrder === undefined ||
          match.groups.slotOrder === String(slot.order)
        );
      }

      return false;
    });
  } catch (e) {
    return { notFound: true };
  }

  if (!itemSlot) {
    // to support redirect URLs that used item slot ID as param
    const foundItemSlot = itemSlotsData.itemSlots.find(
      (slot) => slot.id === params.itemSlotName,
    );

    if (foundItemSlot) {
      return {
        redirect: {
          destination: `/${slotToUrlString(foundItemSlot)}/`,
          permanent: true,
        },
      };
    }

    return { notFound: true };
  }

  await ssrClient.query<items, itemsVariables>({
    query: ItemsQuery,
    variables: {
      first: ITEMS_PAGE_SIZE,
      filters: {
        stats: [],
        maxLevel: 200,
        search: '',
        itemTypeIds: itemSlot.itemTypes.map((type) => type.id),
      },
      eligibleItemTypeIds: itemSlot.itemTypes.map((type) => type.id),
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
        'meta',
        'keyboard_shortcut',
      ])),
      // extracts data from the server-side apollo cache to hydrate frontend cache
      apolloState: ssrClient.cache.extract(),
      itemSlotId: itemSlot.id,
    },
  };
};

export default EquipIndexPage;
