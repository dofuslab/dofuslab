/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';

import { STAT_GROUPS, mq, BREAKPOINTS } from 'common/constants';
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
import { topMarginStyle } from 'common/mixins';
import Selector from './Selector';

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { id: setId } = router.query;

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: setId }, skip: !setId },
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

  const isNotMobile = useMediaQuery({
    query: `(min-device-width: ${BREAKPOINTS[0]}px)`,
  });

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
          display: 'flex',
          [mq[0]]: {
            paddingLeft: 14,
          },
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
        {isNotMobile && (
          <Selector
            key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSetData?.customSetById?.level}`}
            customSet={customSetData?.customSetById}
            selectItemSlot={selectItemSlot}
            selectedItemSlot={selectedItemSlot}
          />
        )}
      </div>
    </Layout>
  );
};

export default SetBuilder;
