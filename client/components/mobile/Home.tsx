/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { STAT_GROUPS } from 'common/constants';
import StatTable from '../common/StatTable';
import { ResponsiveGrid } from 'common/wrappers';
import SetHeader from '../common/SetHeader';
import EquipmentSlots from '../common/EquipmentSlots';
import StatEditor from '../common/StatEditor';
import { topMarginStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';

interface IProps {
  customSet?: customSet | null;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  selectedItemSlot: itemSlots_itemSlots | null;
}

const Home: React.FC<IProps> = ({
  customSet,
  selectItemSlot,
  selectedItemSlot,
}) => {
  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  return (
    <>
      <SetHeader customSet={customSet} />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
      />
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          display: 'flex',
        }}
      >
        <div
          css={{
            flex: '1 1 282px',
            overflow: 'auto',
            ...topMarginStyle,
          }}
        >
          <ResponsiveGrid numColumns={[2]} css={{ marginBottom: 20 }}>
            {STAT_GROUPS.map((group, i) => (
              <StatTable
                key={`stat-table-${i}`}
                group={group}
                statsFromCustomSet={statsFromCustomSet}
                customSet={customSet}
              />
            ))}
            <StatEditor customSet={customSet} />
          </ResponsiveGrid>
        </div>
      </div>
    </>
  );
};

export default Home;
