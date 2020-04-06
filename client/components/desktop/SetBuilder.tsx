/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { STAT_GROUPS, mq, SEARCH_BAR_ID } from 'common/constants';
import Layout from './Layout';
import StatTable from '../common/StatTable';
import { ResponsiveGrid } from 'common/wrappers';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet } from 'common/utils';
import SetHeader from '../common/SetHeader';
import EquipmentSlots from '../common/EquipmentSlots';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import StatEditor from '../common/StatEditor';
import { topMarginStyle } from 'common/mixins';
import Selector from '../common/Selector';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';

interface IProps {
  customSet: customSet | null;
}

const SetBuilder: React.FC<IProps> = ({ customSet }) => {
  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 27) {
        // escape key
        selectItemSlot(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    const searchBar = document.getElementById(SEARCH_BAR_ID);
    if (searchBar) {
      searchBar.focus();
    }
  }, [selectedItemSlot]);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const weapon = customSet?.equippedItems.find(
    equippedItem => !!equippedItem.item.weaponStats,
  );

  return (
    <Layout>
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
                customSet={customSet}
              />
            ))}
            <StatEditor key={customSet?.id} customSet={customSet} />
            {weapon && customSet && weapon.item.weaponStats && (
              <>
                <BasicItemCard item={weapon.item} showOnlyWeaponStats />
                <WeaponDamage
                  weaponStats={weapon.item.weaponStats}
                  customSet={customSet}
                />
              </>
            )}
            <ClassSpells
              key={`${customSet?.id}-${customSet?.level}`}
              customSet={customSet}
            />
          </ResponsiveGrid>
        </div>
        <Selector
          key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSet?.level}`}
          customSet={customSet}
          selectItemSlot={selectItemSlot}
          selectedItemSlot={selectedItemSlot}
        />
      </div>
    </Layout>
  );
};

export default SetBuilder;
