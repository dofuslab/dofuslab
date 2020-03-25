/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { useEquipItemMutation, useCustomSet } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import BasicItemCard from './BasicItemCard';

interface IProps {
  item: item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  equipped: boolean;
  openSetModal: (set: item_set) => void;
}

const ItemCard: React.FC<IProps> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
}) => {
  const customSet = useCustomSet(customSetId);

  const mutate = useEquipItemMutation(item, customSet);

  const onClick = React.useCallback(async () => {
    if (itemSlotId) {
      selectItemSlot && selectItemSlot(null);
      await mutate(itemSlotId);
    }
  }, [item, itemSlotId, customSet, mutate, selectItemSlot]);

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
