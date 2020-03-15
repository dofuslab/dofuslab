/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemWithStats from './ItemWithStats';
import { customSet } from 'graphql/fragments/__generated__/customSet';

interface IEquippedItem {
  slot: itemSlots_itemSlots;
  equippedItem?: customSet_customSetById_equippedItems;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  customSet?: customSet | null;
  selected: boolean;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slot,
  equippedItem,
  selectItemSlot,
  selected,
  customSet,
  ...restProps
}) => {
  const onClick = React.useCallback(() => {
    if (selected) {
      selectItemSlot(null);
    } else {
      selectItemSlot(slot);
    }
  }, [selectItemSlot, slot, selected]);

  return (
    <div css={itemBox} onClick={onClick} {...restProps}>
      {equippedItem ? (
        <ItemWithStats
          equippedItem={equippedItem}
          selected={selected}
          customSet={customSet!}
          deletable
        />
      ) : (
        <div css={{ ...itemImageBox, ...(selected ? selectedBox : {}) }}>
          {slot.name}
        </div>
      )}
    </div>
  );
};

export default EquippedItem;
