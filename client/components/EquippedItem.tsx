/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { EquipmentSlotName } from '../common/types';
import { EQUIPMENT_SLOTS } from '../common/constants';

interface IEquippedItem {
  type: EquipmentSlotName;
}

const EquippedItem: React.FC<IEquippedItem> = props => {
  return (
    <div
      css={{
        border: '1px solid #e8e8e8',
        width: 100,
        height: 100,
        margin: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      {...props}
    >
      {EQUIPMENT_SLOTS[props.type].name}
    </div>
  );
};

export default EquippedItem;
