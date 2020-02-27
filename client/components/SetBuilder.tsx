/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { EQUIPMENT_SLOTS, STAT_GROUPS, mq } from '../common/constants';
import ItemSelector from './ItemSelector';
import EquippedItem from './EquippedItem';
import Layout from './Layout';
import StatTable from './StatTable';
import { ResponsiveGrid } from '../common/wrappers';

const EquipmentSlots = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  margin: -8,
});

const OptionalSecondPane = styled.div({
  display: 'none',
  marginLeft: 40,
  [mq[2]]: {
    display: 'block',
    flex: 1,
  },
  overflow: 'auto',
  paddingRight: 20,
});

export default class SetBuilder extends React.PureComponent {
  render() {
    return (
      <Layout>
        <div css={{ flex: '0 1 auto', overflowX: 'hidden', paddingLeft: 20 }}>
          <EquipmentSlots>
            {Object.values(EQUIPMENT_SLOTS).map(slot =>
              Array(slot.quantity)
                .fill(null)
                .map((_, idx) => (
                  <EquippedItem type={slot.name} key={`${slot.name}-${idx}`} />
                )),
            )}
          </EquipmentSlots>
          <ResponsiveGrid numColumns={[2, 3, 4, 4]} css={{ margin: '20px 0' }}>
            {STAT_GROUPS.map(({ name, groups }) => (
              <StatTable key={name} name={name} groups={groups} />
            ))}
          </ResponsiveGrid>
        </div>
        <OptionalSecondPane>
          <ItemSelector />
        </OptionalSecondPane>
      </Layout>
    );
  }
}
