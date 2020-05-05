/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useEquipItemMutation } from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import Router from 'next/router';
import { useApolloClient } from '@apollo/react-hooks';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { ItemSlot, ItemSet, Item } from 'common/type-aliases';
import BasicItemCard from './BasicItemCard';

interface Props {
  item: Item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  equipped: boolean;
  openSetModal: (set: ItemSet) => void;
  isMobile?: boolean;
  nextSlotId: string | null;
}

const ItemCard: React.FC<Props> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
  isMobile,
  nextSlotId,
}) => {
  const mutate = useEquipItemMutation(item);

  const client = useApolloClient();

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
      if (isMobile && customSetId) {
        Router.push(
          { pathname: '/index', query: { customSetId } },
          customSetId ? `/build/${customSetId}` : '/',
        );
      }
      mutate(itemSlotId);
    }
  }, [
    item,
    itemSlotId,
    customSetId,
    mutate,
    selectItemSlot,
    isMobile,
    client,
    nextSlotId,
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
