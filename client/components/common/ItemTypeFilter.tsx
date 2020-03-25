/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
// import CheckboxGroup, { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { itemSlots_itemSlots_itemTypes } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IProps {
  itemTypes: Array<itemSlots_itemSlots_itemTypes>;
  itemTypeIds: Set<string>;
  setItemTypeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const ItemTypeFilter: React.FC<IProps> = ({
  itemTypes,
  itemTypeIds,
  setItemTypeIds,
}) => {
  if (itemTypes.length <= 1) {
    return null;
  }
  return (
    <div
      css={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }}
    >
      {[...itemTypes]
        .sort((t1, t2) => t1.name.localeCompare(t2.name))
        .map(type => (
          <Checkbox
            css={{
              flex: '0 1 144px',
              [mq[1]]: {
                flexBasis: '120px',
              },
              minWidth: 0,
              marginTop: 4,
              fontSize: '0.75rem',
              ['&:last-of-type']: {
                marginRight: 8,
              },
            }}
            key={type.id}
            checked={itemTypeIds.has(type.id)}
            data-type-id={type.id}
            onChange={(e: CheckboxChangeEvent) => {
              const copy = new Set(itemTypeIds);
              if (e.target.checked) {
                copy.add(type.id);
              } else {
                copy.delete(type.id);
              }
              setItemTypeIds(copy);
            }}
          >
            {type.name}
          </Checkbox>
        ))}
    </div>
  );
};

export default ItemTypeFilter;
