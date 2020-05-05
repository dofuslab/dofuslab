/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { useEquipItemMutation } from 'common/utils';
import {
  itemSlots_itemSlots,
  itemSlots,
} from 'graphql/queries/__generated__/itemSlots';
import BasicItemCard from './BasicItemCard';
import Router from 'next/router';
import { useApolloClient } from '@apollo/react-hooks';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

interface IProps {
  item: item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  equipped: boolean;
  openSetModal: (set: item_set) => void;
  isMobile?: boolean;
  nextSlotId: string | null;
}

const ItemCard: React.FC<IProps> = ({
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
      selectItemSlot && selectItemSlot(nextSlot);
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
