/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useEquipItemMutation } from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/react-hooks';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { ItemSlot, ItemSet, Item } from 'common/type-aliases';
import { notification } from 'antd';
import { useTranslation } from 'i18n';
import BasicItemCard from './BasicItemCard';

interface Props {
  item: Item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  equipped: boolean;
  openSetModal: (set: ItemSet) => void;
  shouldRedirect?: boolean;
  nextSlotId: string | null;
}

const ItemCard: React.FC<Props> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
  shouldRedirect,
  nextSlotId,
}) => {
  const mutate = useEquipItemMutation(item);
  const { t } = useTranslation('common');
  const client = useApolloClient();

  const router = useRouter();
  const { query } = router;

  const onClick = React.useCallback(() => {
    if (itemSlotId) {
      const slots = client.readQuery<itemSlots>({ query: ItemSlotsQuery });
      let nextSlot = null;
      if (nextSlotId && slots) {
        nextSlot =
          slots.itemSlots.find((slot) => slot.id === nextSlotId) || null;
      }
      if (selectItemSlot) {
        selectItemSlot(nextSlot);
      }
      if (shouldRedirect && customSetId) {
        if (nextSlot) {
          router.replace(
            {
              pathname: '/equip/[itemSlotId]',
              query: {
                ...query,
                itemSlotId: nextSlot.id,
                customSetId,
              },
            },
            `/equip/${nextSlot.id}/${customSetId}`,
          );
          notification.success({
            message: t('SUCCESS'),
            description: t('ITEM_EQUIPPED', { itemName: item.name }),
          });
        } else {
          router.push(
            { pathname: '/index', query: { customSetId, class: query.class } },
            customSetId ? `/build/${customSetId}` : '/',
          );
        }
      }
      mutate(itemSlotId);
    }
  }, [
    item,
    itemSlotId,
    customSetId,
    mutate,
    selectItemSlot,
    shouldRedirect,
    client,
    nextSlotId,
    router,
  ]);

  return (
    <BasicItemCard
      item={item}
      equipped={equipped}
      openSetModal={openSetModal}
      onClick={onClick}
    />
  );
};

export default React.memo(ItemCard);
