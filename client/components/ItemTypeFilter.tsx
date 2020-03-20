/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import CheckboxGroup, { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { itemSlots_itemSlots_itemTypes } from 'graphql/queries/__generated__/itemSlots';

interface IProps {
  itemTypes: Array<itemSlots_itemSlots_itemTypes>;
  itemTypeIds: Array<string>;
  setItemTypeIds: React.Dispatch<React.SetStateAction<Array<string>>>;
}

const ItemTypeFilter: React.FC<IProps> = ({
  itemTypes,
  itemTypeIds,
  setItemTypeIds,
}) => {
  const onChangeItemTypeIds = React.useCallback(
    (newItemTypeIds: Array<CheckboxValueType>) =>
      setItemTypeIds(newItemTypeIds as Array<string>),
    [setItemTypeIds],
  );
  if (itemTypes.length < 1) {
    return null;
  }
  return (
    <CheckboxGroup
      value={itemTypeIds}
      onChange={onChangeItemTypeIds}
      options={[...itemTypes]
        .sort((t1, t2) => t1.name.localeCompare(t2.name))
        .map(type => ({
          label: type.name,
          value: type.id,
        }))}
      css={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        ['.ant-checkbox-group-item']: {
          flex: '0 1 120px',
          minWidth: 0,
          marginTop: 4,
          fontSize: '0.75rem',
          ['&:last-of-type']: {
            marginRight: 8,
          },
        },
      }}
    />
  );
};

export default ItemTypeFilter;
