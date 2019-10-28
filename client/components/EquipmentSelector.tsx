/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import Equipment from './Equipment';
import ResponsiveGrid from './ResponsiveGrid';
import { mq, EQUIPMENT_SLOT_TO_TYPES } from '../common/constants';
import { EquipmentSlotId, Equipment as EquipmentType } from '../common/types';
import { EQUIPMENT_LISTS } from '../common/data';

interface IEquipmentSelector {
  slotId: EquipmentSlotId;
}

const EquipmentSelector: React.FC<IEquipmentSelector> = props => {
  const equipmentTypes = EQUIPMENT_SLOT_TO_TYPES[props.slotId];
  const equipmentList: EquipmentType[] = [];

  equipmentTypes
    .filter(equipmentType => !!EQUIPMENT_LISTS[equipmentType])
    .forEach(equipmentType => {
      EQUIPMENT_LISTS[equipmentType]!.forEach(equipment =>
        equipmentList.push(equipment)
      );
    });

  return (
    <ResponsiveGrid>
      {equipmentList.map(equipment => (
        <Equipment equipment={equipment} />
      ))}
    </ResponsiveGrid>
  );
};

export default EquipmentSelector;
