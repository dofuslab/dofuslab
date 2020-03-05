/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Input from 'antd/lib/input';

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
  padding: '0 20px',
  [mq[1]]: {
    display: 'block',
    flex: 1,
  },
  overflow: 'auto',
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

  const [selectedItemSlotId, selectItemSlot] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const onClickBody = () => {
      selectItemSlot(null);
    };
    window.addEventListener('click', onClickBody);
    return () => {
      window.removeEventListener('click', onClickBody);
    };
  }, []);

  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <Layout>
      <div
        css={{
          margin: '8px 20px',
          display: 'flex',
          alignItems: 'baseline',
          flex: '0 0 40px',
        }}
      >
        {isEditing ? (
          <Input css={{ fontSize: '1.5rem', fontWeight: 500, width: 240 }} />
        ) : (
          <div
            css={{ fontSize: '1.5rem', fontWeight: 500, maxWidth: 400 }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            {customSetData?.customSetById?.name || 'Untitled'}
          </div>
        )}

        <div css={{ marginLeft: 20 }}>
          Level {customSetData?.customSetById?.level}
        </div>
      </div>
      <EquipmentSlots>
        {data?.itemSlots.map(slot => (
          <EquippedItem
            slot={slot}
            key={slot.id}
            item={itemsBySlotId[slot.id]}
            css={() =>
              selectedItemSlotId === slot.id
                ? { border: '2px solid #aaa', background: '#eee' }
                : {}
            }
            selectItemSlot={selectItemSlot}
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
          <ItemSelector selectedItemSlotId={selectedItemSlotId} />
        </OptionalSecondPane>
      </div>
    </Layout>
  );
};

export default SetBuilder;
