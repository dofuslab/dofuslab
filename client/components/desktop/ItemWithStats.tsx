/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { useDeleteItemMutation } from 'common/utils';
import { EquippedItem, CustomSet } from 'common/type-aliases';
import BasicItemWithStats from './BasicItemWithStats';

interface Props {
  equippedItem: EquippedItem;
  selected: boolean;
  deletable: boolean;
  customSet: CustomSet;
}

const ItemWithStats = ({
  equippedItem,
  selected,
  deletable,
  customSet,
}: Props) => {
  const deleteItem = useDeleteItemMutation(customSet);
  const onDelete = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (deleteItem) {
        deleteItem(equippedItem.slot.id);
      }
    },
    [deleteItem, equippedItem],
  );
  return (
    <BasicItemWithStats
      item={equippedItem.item}
      exos={equippedItem.exos}
      onDelete={onDelete}
      selected={selected}
      deletable={deletable}
    />
  );
};

export default ItemWithStats;
