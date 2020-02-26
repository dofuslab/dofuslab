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
        background: 'white',
        border: '1px solid #d9d9d9',
        width: 72,
        height: 72,
        margin: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem',
        borderRadius: 4,
      }}
      {...props}
    >
      {EQUIPMENT_SLOTS[props.type].name}
    </div>
  );
};

export default EquippedItem;
