/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import EquippedItemWithStats from './EquippedItemWithStats';
import MageModal from './MageModal';

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

  const [mageModalVisible, setMageModalVisible] = React.useState(false);
  const openMageModal = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setMageModalVisible(true);
    },
    [setMageModalVisible],
  );
  const closeMageModal = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setMageModalVisible(false);
    },
    [setMageModalVisible],
  );

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
          />
        ) : (
          <div css={{ ...itemImageBox, ...(selected ? selectedBox : {}) }}>
            {slot.name}
          </div>
        )}
      </div>
      {customSet && equippedItem && (
        <MageModal
          visible={mageModalVisible}
          equippedItem={equippedItem}
          closeMageModal={closeMageModal}
          key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
          customSet={customSet}
        />
      )}
    </>
  );
};

export default EquippedItem;
