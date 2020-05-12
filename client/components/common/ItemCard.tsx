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
import { useTranslation, prependDe } from 'i18n';
import BasicItemCard from './BasicItemCard';

interface Props {
  item: Item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  equipped: boolean;
  openSetModal: (set: ItemSet) => void;
  shouldRedirect?: boolean;
  remainingSlotIds: Array<string>;
}

const ItemCard: React.FC<Props> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
  shouldRedirect,
  remainingSlotIds,
}) => {
  const mutate = useEquipItemMutation(item);
  const { t, i18n } = useTranslation('common');
  const client = useApolloClient();

  const router = useRouter();

  const onClick = React.useCallback(() => {
    const { query } = router;
    const nextSlotId = remainingSlotIds[0];
    const numRemainingSlots = remainingSlotIds.length;
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
              pathname: '/equip/[itemSlotId]/[customSetId]',
              query: {
                itemSlotId: nextSlot.id,
                customSetId,
              },
            },
            `/equip/${nextSlot.id}/${customSetId}`,
          );

          notification.success({
            message: t('SUCCESS'),
            description: t('ITEM_EQUIPPED', {
              itemName: item.name,
              count: numRemainingSlots,
              slotName: prependDe(i18n.language, nextSlot.name),
            }),
          });
        } else {
          router.push(
            {
              pathname: '/',
              query: { customSetId, class: query.class || undefined },
            },
            {
              pathname: customSetId ? `/build/${customSetId}` : '/',
              query: query.class ? { class: query.class } : undefined,
            },
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
    remainingSlotIds,
    router,
    i18n,
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
