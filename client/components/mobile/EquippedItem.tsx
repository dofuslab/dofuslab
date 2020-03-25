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
import EquippedItemWithStats from '../common/EquippedItemWithStats';
import { item_set } from 'graphql/fragments/__generated__/item';
import Link from 'next/link';

interface IProps {
  slot: itemSlots_itemSlots;
  equippedItem?: customSet_customSetById_equippedItems;
  customSet?: customSet | null;
  selected: boolean;
  openMageModal: (equippedItem: customSet_equippedItems) => void;
  openSetModal: (set: item_set) => void;
}

const EquippedItem: React.FC<IProps> = ({
  slot,
  equippedItem,
  selected,
  customSet,
  openMageModal,
  openSetModal,
  ...restProps
}) => {
  return (
    <>
      <div css={itemBox} {...restProps}>
        {equippedItem ? (
          <Link
            href="/set/[customSetId]/[equippedItemId]"
            as={`/set/${customSet!.id}/${equippedItem.id}`}
          >
            <div>
              <EquippedItemWithStats
                equippedItem={equippedItem}
                selected={selected}
                customSet={customSet!}
                itemSlotId={slot.id}
                openMageModal={openMageModal}
                openSetModal={openSetModal}
              />
            </div>
          </Link>
        ) : (
          <Link
            href={{
              pathname: '/equip/[itemSlotId]',
              query: { itemSlotId: slot.id, customSetId: customSet?.id },
            }}
            as={`/equip/${slot.id}/${customSet ? customSet.id : ''}`}
          >
            <div css={{ ...itemImageBox, ...(selected ? selectedBox : {}) }}>
              {slot.name}
            </div>
          </Link>
        )}
      </div>
    </>
  );
};

export default React.memo(EquippedItem);
