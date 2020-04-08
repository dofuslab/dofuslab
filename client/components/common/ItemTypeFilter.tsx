/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { itemSlots_itemSlots_itemTypes } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';
import { Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

const { Group: CheckboxGroup } = Checkbox;

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
  const onChangeItemTypeIds = React.useCallback(
    (newItemTypeIds: Array<CheckboxValueType>) =>
      setItemTypeIds(new Set(newItemTypeIds as Array<string>)),
    [setItemTypeIds],
  );
  if (itemTypes.length <= 1) {
    return null;
  }
  return (
    <CheckboxGroup
      value={Array.from(itemTypeIds)}
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
        marginTop: 8,
        lineHeight: '1.4rem',
        [mq[1]]: {
          lineHeight: 'normal',
        },
        ['.ant-checkbox-group-item']: {
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
        },
      }}
    />
  );
};

export default ItemTypeFilter;
