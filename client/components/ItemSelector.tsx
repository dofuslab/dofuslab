/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import ItemCard from './ItemCard';
import { ResponsiveGrid } from 'common/wrappers';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items, itemsVariables } from 'graphql/queries/__generated__/items';
import CurrentlyEquippedItem from './CurrentlyEquippedItem';
import { customSet } from 'graphql/fragments/__generated__/customSet';

interface IProps {
  selectedItemSlotId: string | null;
  customSet?: customSet | null;
}

const ItemSelector: React.FC<IProps> = ({ selectedItemSlotId, customSet }) => {
  const { data } = useQuery<items, itemsVariables>(ItemsQuery, {
    variables: { first: 24 },
  });

  const responsiveGridRef = React.useRef<HTMLDivElement | null>(null);

  if (!data || !data.items) return null;

  const selectedEquippedItem =
    customSet && selectedItemSlotId
      ? customSet.equippedItems.find(
          item => item.slot.id === selectedItemSlotId,
        )?.item
      : null;

  return (
    <ResponsiveGrid
      numColumns={[1, 1, 2, 3, 4, 5]}
      css={{ marginBottom: 20, position: 'relative' }}
      ref={responsiveGridRef}
    >
      {selectedEquippedItem && (
        <CurrentlyEquippedItem
          item={selectedEquippedItem}
          selectedItemSlotId={selectedItemSlotId!}
          customSetId={customSet!.id}
        />
      )}
      {data.items.edges
        .map(edge => edge.node)
        .filter(
          item =>
            !selectedItemSlotId ||
            item.itemType.eligibleItemSlots.some(
              slot => slot.id === selectedItemSlotId,
            ),
        )
        .map(item => (
          <ItemCard
            key={item.id}
            item={item}
            selectedItemSlotId={selectedItemSlotId}
            selectedEquippedItem={selectedEquippedItem}
            customSet={customSet}
            responsiveGridRef={responsiveGridRef}
          />
        ))}
    </ResponsiveGrid>
  );
};

export default ItemSelector;
