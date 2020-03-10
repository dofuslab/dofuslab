/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { customSet_customSetById_equippedItems_item } from 'graphql/queries/__generated__/customSet';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import EquippedItem from './EquippedItem';
import { getBonusesFromCustomSet } from 'common/utils';
import BonusStats from './BonusStats';

interface IProps {
  customSet?: customSet | null;
  selectItemSlot: React.Dispatch<React.SetStateAction<string | null>>;
  selectedItemSlotId: string | null;
}

const EquipmentSlots: React.FC<IProps> = ({
  customSet,
  selectItemSlot,
  selectedItemSlotId,
}) => {
  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const itemsBySlotId: {
    [key: string]: customSet_customSetById_equippedItems_item;
  } =
    customSet?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr.item }),
      {},
    ) ?? {};

  const setBonuses = customSet ? getBonusesFromCustomSet(customSet) : {};

  return (
    <div
      css={{
        display: 'flex',
        flexWrap: 'wrap',
        margin: '0 12px',
      }}
    >
      {itemSlots?.map(slot => (
        <EquippedItem
          slot={slot}
          key={slot.id}
          item={itemsBySlotId[slot.id]}
          selected={selectedItemSlotId === slot.id}
          selectItemSlot={selectItemSlot}
        />
      ))}
      {!!Object.keys(setBonuses).length && (
        <BonusStats setBonuses={setBonuses} />
      )}
    </div>
  );
};

export default EquipmentSlots;
