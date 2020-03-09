/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';

import { itemBox } from 'common/mixins';
import { customSet_customSetById_equippedItems_item } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemWithStats from './ItemWithStats';

interface IEquippedItem {
  slot: itemSlots_itemSlots;
  item?: customSet_customSetById_equippedItems_item;
  selectItemSlot: React.Dispatch<React.SetStateAction<string | null>>;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slot,
  item,
  selectItemSlot,
  ...restProps
}) => {
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.nativeEvent.stopPropagation();
      selectItemSlot(slot.id);
    },
    [selectItemSlot, slot],
  );

  return (
    <div css={css(itemBox)} onClick={onClick} {...restProps}>
      {item ? <ItemWithStats item={item} /> : slot.name}
    </div>
  );
};

export default EquippedItem;
