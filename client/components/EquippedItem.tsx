/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { EquipmentSlotName } from '../common/types';
import { EQUIPMENT_SLOTS } from '../common/constants';
import { BORDER_COLOR } from '../common/mixins';

interface IEquippedItem {
  type: EquipmentSlotName;
}

const EquippedItem: React.FC<IEquippedItem> = props => {
  return (
    <div
      css={{
        background: 'white',
        border: `1px solid ${BORDER_COLOR}`,
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
