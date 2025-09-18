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
import CustomSetQuery from 'graphql/queries/customSet.query';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.query';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ItemSlot } from 'common/type-aliases';
import { formatNameForUrl, slotToUrlString } from 'common/utils';

type Props = {
  itemSlotId: string;
};

const EquipWithCustomSetPage: NextPage<Props> = ({ itemSlotId }) => {
  const router = useRouter();
  const customSetId = Array.isArray(router.query.customSetId)
    ? router.query.customSetId[0]
    : router.query.customSetId || null;
  return <EquipPage customSetId={customSetId} itemSlotId={itemSlotId} />;
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & Props & { apolloState: NormalizedCacheObject },
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

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<customSet, customSetVariables>({
        query: CustomSetQuery,
        variables: { id: params?.customSetId },
      }),
      ssrClient.query<itemSlots>({ query: ItemSlotsQuery }),
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

    const itemSlotsData = results[1].data;
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
            destination:
              locale === defaultLocale
                ? `/${slotToUrlString(foundItemSlot)}/${customSet.id}/`
                : `/${locale}/${slotToUrlString(foundItemSlot)}/${
                    customSet.id
                  }/`,
            permanent: true,
          },
        };
      }

      return { notFound: true };
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
          'meta',
          'keyboard_shortcut',
        ])),
        // extracts data from the server-side apollo cache to hydrate frontend cache
        apolloState: ssrClient.cache.extract(),
        itemSlotId: itemSlot.id,
      },
    };
  } catch (e) {
    // TODO: improve error handling
    return { notFound: true };
  }
};

export default EquipWithCustomSetPage;
