/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import Item from './Item';
import { ResponsiveGrid } from 'common/wrappers';
import ItemsQuery from 'graphql/queries/items.graphql';
import { items } from 'graphql/queries/__generated__/items';

interface IProps {
  selectedItemSlotId: string | null;
}

const ItemSelector: React.FC<IProps> = ({ selectedItemSlotId }) => {
  const { data } = useQuery<items>(ItemsQuery);

  if (!data || !data.items) return null;

  return (
    <ResponsiveGrid numColumns={[1, 1, 2, 3, 4, 5]} css={{ marginBottom: 20 }}>
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
          />
        ))}
    </ResponsiveGrid>
  );
};

export default ItemSelector;
