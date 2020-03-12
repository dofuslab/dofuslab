/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import { customSet_customSetById_equippedItems_item } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemWithStats from './ItemWithStats';

interface IEquippedItem {
  slot: itemSlots_itemSlots;
  item?: customSet_customSetById_equippedItems_item;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  selected: boolean;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slot,
  item,
  selectItemSlot,
  selected,
  ...restProps
}) => {
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.nativeEvent.stopPropagation();
      console.log(slot);
      selectItemSlot(slot);
    },
    [selectItemSlot, slot],
  );

  return (
    <div css={itemBox} onClick={onClick} {...restProps}>
      {item ? (
        <ItemWithStats item={item} selected={selected} />
      ) : (
        <div css={{ ...itemImageBox, ...(selected ? selectedBox : {}) }}>
          {' '}
          {slot.name}
        </div>
      )}
    </div>
  );
};

export default EquippedItem;
