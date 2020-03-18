/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { STAT_GROUPS, mq } from 'common/constants';
import ItemSelector from './ItemSelector';
import Layout from './Layout';
import StatTable from './StatTable';
import { ResponsiveGrid } from 'common/wrappers';

import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { getStatsFromCustomSet } from 'common/utils';
import SetHeader from './SetHeader';
import EquipmentSlots from './EquipmentSlots';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import StatEditor from './StatEditor';

const topMarginStyle = {
  marginTop: 8,
  [mq[4]]: {
    marginTop: 12,
  },
};

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { id: setId } = router.query;

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: setId }, skip: !setId },
  );

  const customSetItemIds = new Set<string>();
  (customSetData?.customSetById?.equippedItems ?? []).forEach(equippedItem =>
    customSetItemIds.add(equippedItem.item.id),
  );

  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 27) {
        selectItemSlot(null);
      }
    }
    if (document) {
      document.addEventListener('keydown', onKeyDown);
    }
    return () => document && document.removeEventListener('keydown', onKeyDown);
  }, []);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSetData?.customSetById),
    [customSetData],
  );

  return (
    <Layout>
      <SetHeader customSet={customSetData?.customSetById} />
      <EquipmentSlots
        customSet={customSetData?.customSetById}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
      />
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          paddingLeft: 14,
          display: 'flex',
          [mq[4]]: {
            paddingLeft: 20,
          },
        }}
      >
        <div
          css={{
            flex: '1 1 282px',
            [mq[0]]: { flex: '0 1 282px' },
            [mq[2]]: { flex: '0 1 576px' },
            overflow: 'auto',
            ...topMarginStyle,
          }}
        >
          <ResponsiveGrid
            numColumns={[1, 1, 2, 2, 2, 2, 2]}
            css={{ marginBottom: 20 }}
          >
            {STAT_GROUPS.map((group, i) => (
              <StatTable
                key={`stat-table-${i}`}
                group={group}
                statsFromCustomSet={statsFromCustomSet}
                customSet={customSetData?.customSetById}
              />
            ))}
            <StatEditor customSet={customSetData?.customSetById} />
          </ResponsiveGrid>
        </div>
        <div
          key={`div-${selectedItemSlot?.id}`} // re-render so div loses scroll position on selectedItemSlot change
          css={{
            display: 'none',
            padding: '0 14px',
            [mq[0]]: {
              display: 'block',
              flex: 1,
            },
            overflowY: 'scroll',
            ...topMarginStyle,
            [mq[4]]: {
              padding: '0 20px',
              ...(topMarginStyle[mq[4]] as {}),
            },
          }}
        >
          <ItemSelector
            key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSetData?.customSetById?.level}`}
            selectedItemSlot={selectedItemSlot}
            customSet={customSetData?.customSetById}
            selectItemSlot={selectItemSlot}
            customSetItemIds={customSetItemIds}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SetBuilder;
