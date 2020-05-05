/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import {
  customSet_equippedItems,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { useDeleteItemMutation } from 'common/utils';
import BasicItemWithStats from './BasicItemWithStats';

interface Props {
  equippedItem: customSet_equippedItems;
  selected: boolean;
  deletable: boolean;
  customSet: customSet;
}

const ItemWithStats: React.FC<Props> = ({
  equippedItem,
  selected,
  deletable,
  customSet,
}) => {
  const deleteItem = useDeleteItemMutation(equippedItem.slot.id, customSet);
  const onDelete = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      deleteItem && deleteItem();
    },
    [deleteItem],
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
