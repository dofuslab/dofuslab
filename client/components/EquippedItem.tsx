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
        width: 72,
        height: 72,
        margin: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem'
      }}
      {...props}
    >
      {EQUIPMENT_SLOTS[props.type].name}
    </div>
  );
};

export default EquippedItem;
