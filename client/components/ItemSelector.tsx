/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import Item from './Item';
import { ResponsiveGrid } from 'common/wrappers';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items } from 'graphql/queries/__generated__/items';
import CurrentlyEquippedItem from './CurrentlyEquippedItem';
import { customSet } from 'graphql/fragments/__generated__/customSet';

interface IProps {
  selectedItemSlotId: string | null;
  customSet?: customSet | null;
}

const ItemSelector: React.FC<IProps> = ({ selectedItemSlotId, customSet }) => {
  const { data } = useQuery<items>(ItemsQuery);

  if (!data || !data.items) return null;

  const selectedEquippedItem =
    customSet && selectedItemSlotId
      ? customSet.equippedItems.find(
          item => item.slot.id === selectedItemSlotId,
        )?.item
      : null;

  return (
    <ResponsiveGrid numColumns={[1, 1, 2, 3, 4, 5]} css={{ marginBottom: 20 }}>
      {selectedEquippedItem && (
        <CurrentlyEquippedItem
          item={selectedEquippedItem}
          selectedItemSlotId={selectedItemSlotId!}
          customSetId={customSet!.id}
        />
      )}
      {data.items
        .filter(
          item =>
            !selectedItemSlotId ||
            item.itemType.eligibleItemSlots.some(
              slot => slot.id === selectedItemSlotId,
            ),
        )
        .map(item => (
          <Item
            key={item.id}
            item={item}
            selectedItemSlotId={selectedItemSlotId}
            selectedEquippedItem={selectedEquippedItem}
            customSet={customSet}
          />
        ))}
    </ResponsiveGrid>
  );
};

export default ItemSelector;
