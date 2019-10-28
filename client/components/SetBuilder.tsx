/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { EQUIPMENT_SLOTS, STAT_GROUPS } from '../common/constants';
import EquipmentSelector from './EquipmentSelector';
import EquippedItem from './EquippedItem';
import Layout from './Layout';
import StatTable from './StatTable';
import ResponsiveGrid from './ResponsiveGrid';

import { EquipmentSlotId } from '../common/types';

interface IEquipmentSlots {
  children: React.ReactNode;
}

const EquipmentSlots: React.FC<IEquipmentSlots> = props => (
  <div css={{ display: 'flex', flexWrap: 'wrap', margin: -10 }} {...props} />
);

export default class SetBuilder extends React.PureComponent {
  render() {
    return (
      <Layout>
        <>
          <EquipmentSlots>
            {Object.values(EQUIPMENT_SLOTS).map(slot =>
              Array(slot.quantity)
                .fill(null)
                .map((_, idx) => (
                  <EquippedItem type={slot.name} key={`${slot.name}-${idx}`} />
                ))
            )}
          </EquipmentSlots>
          <EquipmentSelector slotId={EquipmentSlotId.Hat} />
          <ResponsiveGrid>
            {STAT_GROUPS.map(({ name, group }) => (
              <StatTable key={name} name={name} group={group} />
            ))}
          </ResponsiveGrid>
        </>
      </Layout>
    );
  }
}
