/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import {
  itemSlots,
  itemSlots_itemSlots,
} from 'graphql/queries/__generated__/itemSlots';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import EquippedItem from './EquippedItem';
import { mq } from 'common/constants';

interface IProps {
  customSet?: customSet | null;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  selectedItemSlotId: string | null;
}

const EquipmentSlots: React.FC<IProps> = ({
  customSet,
  selectItemSlot,
  selectedItemSlotId,
}) => {
  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const equippedItemsBySlotId: {
    [key: string]: customSet_customSetById_equippedItems;
  } =
    customSet?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr }),
      {},
    ) ?? {};

  return (
    <div
      css={{
        display: 'flex',
        flexWrap: 'wrap',
        margin: '0 8px',
        [mq[4]]: {
          margin: '0 12px',
        },
      }}
    >
      {itemSlots?.map(slot => (
        <EquippedItem
          slot={slot}
          key={slot.id}
          equippedItem={equippedItemsBySlotId[slot.id]}
          selected={selectedItemSlotId === slot.id}
          selectItemSlot={selectItemSlot}
          customSet={customSet}
        />
      ))}
    </div>
  );
};

export default EquipmentSlots;
