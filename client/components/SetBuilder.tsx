/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { STAT_GROUPS, mq } from 'common/constants';
import ItemSelector from './ItemSelector';
import EquippedItem from './EquippedItem';
import Layout from './Layout';
import StatTable from './StatTable';
import { ResponsiveGrid } from 'common/wrappers';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import {
  customSet,
  customSetVariables,
  customSet_customSetById_equippedItems_item,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';

const EquipmentSlots = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  margin: '0 12px',
});

const OptionalSecondPane = styled.div({
  display: 'none',
  marginTop: 12,
  marginLeft: 20,
  [mq[1]]: {
    display: 'block',
    flex: 1,
  },
  overflow: 'auto',
  paddingRight: 20,
});

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { setId } = router.query;
  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: setId }, skip: !setId },
  );
  const itemsBySlotId: {
    [key: string]: customSet_customSetById_equippedItems_item;
  } =
    customSetData?.customSetById?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr.item }),
      {},
    ) ?? {};

  return (
    <Layout>
      <EquipmentSlots>
        {data?.itemSlots.map(slot => (
          <EquippedItem
            slotName={slot.name}
            key={slot.id}
            item={itemsBySlotId[slot.id]}
          />
        ))}
      </EquipmentSlots>
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          paddingLeft: 20,
          display: 'flex',
        }}
      >
        <div css={{ flex: '0 1 600px', overflow: 'auto' }}>
          <ResponsiveGrid
            numColumns={[2, 2, 2, 2, 2, 2]}
            css={{ margin: '12px 0 20px' }}
          >
            {STAT_GROUPS.map(({ name, groups }) => (
              <StatTable key={name} name={name} groups={groups} />
            ))}
          </ResponsiveGrid>
        </div>
        <OptionalSecondPane>
          <ItemSelector />
        </OptionalSecondPane>
      </div>
    </Layout>
  );
};

export default SetBuilder;
