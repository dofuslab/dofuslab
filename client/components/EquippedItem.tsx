/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import {
  customSet,
  customSet_equippedItems,
} from 'graphql/fragments/__generated__/customSet';
import EquippedItemWithStats from './EquippedItemWithStats';
import { item_set } from 'graphql/fragments/__generated__/item';

interface IEquippedItem {
  slot: itemSlots_itemSlots;
  equippedItem?: customSet_customSetById_equippedItems;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  customSet?: customSet | null;
  selected: boolean;
  openMageModal: (equippedItem: customSet_equippedItems) => void;
  openSetModal: (set: item_set) => void;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slot,
  equippedItem,
  selectItemSlot,
  selected,
  customSet,
  openMageModal,
  openSetModal,
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
    <>
      <div css={itemBox} onClick={onClick} {...restProps}>
        {equippedItem ? (
          <EquippedItemWithStats
            equippedItem={equippedItem}
            selected={selected}
            customSet={customSet!}
            itemSlotId={slot.id}
            openMageModal={openMageModal}
            openSetModal={openSetModal}
          />
        ) : (
          <div css={{ ...itemImageBox, ...(selected ? selectedBox : {}) }}>
            {slot.name}
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(EquippedItem);
