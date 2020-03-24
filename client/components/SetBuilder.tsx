/** @jsx jsx */

import * as React from 'react';
import { jsx, Global, css } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { STAT_GROUPS, mq } from 'common/constants';
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

  const [selectorVisible, setSelectorVisible] = React.useState(false);

  const openSelector = React.useCallback(() => {
    setSelectorVisible(true);
  }, [setSelectorVisible]);

  const closeSelector = React.useCallback(() => {
    setSelectorVisible(false);
  }, [setSelectorVisible]);

  return (
    <Layout>
      <Global
        styles={css`
          body {
            overflow: ${selectorVisible ? 'hidden' : 'auto'};
            ${mq[1]}: {
              overflow: hidden;
            };
          }
        `}
      />
      <SetHeader customSet={customSetData?.customSetById} />
      <EquipmentSlots
        customSet={customSetData?.customSetById}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
        openSelector={openSelector}
      />
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          display: 'flex',
          [mq[1]]: {
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

            overflow: 'auto',
            ...topMarginStyle,
            [mq[1]]: { flex: '0 1 282px', ...(topMarginStyle[mq[1]] as {}) },
            [mq[2]]: { flex: '0 1 576px' },
          }}
        >
          <ResponsiveGrid
            numColumns={[2, 1, 2, 2, 2, 2, 2]}
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
        <Selector
          key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSetData?.customSetById?.level}`}
          customSet={customSetData?.customSetById}
          selectItemSlot={selectItemSlot}
          selectedItemSlot={selectedItemSlot}
          selectorVisible={selectorVisible}
          closeSelector={closeSelector}
        />
      </div>
    </Layout>
  );
};

export default SetBuilder;
