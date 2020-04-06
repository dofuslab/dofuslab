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
import BonusStats from 'components/desktop/BonusStats';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';

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

  const weapon = customSet?.equippedItems.find(
    equippedItem => !!equippedItem.item.weaponStats,
  );

  return (
    <>
      <SetHeader customSet={customSet} isMobile />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
      />
      {customSet && <BonusStats customSet={customSet} />}
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          display: 'flex',
        }}
      >
        <div
          css={{
            flex: '1 1 288px',
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
      </div>
    </>
  );
};

export default Home;
