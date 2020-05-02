/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { STAT_GROUPS, SEARCH_BAR_ID } from 'common/constants';
import Layout from './Layout';
import StatTable from '../common/StatTable';
import { ResponsiveGrid } from 'common/wrappers';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet, getErrors } from 'common/utils';
import SetHeader from '../common/SetHeader';
import ClassicEquipmentSlots from './ClassicEquipmentSlots';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import StatEditor from '../common/StatEditor';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { IError } from 'common/types';

interface IProps {
  customSet: customSet | null;
}

const ClassicSetBuilder: React.FC<IProps> = ({ customSet }) => {
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
    const searchBar = document.getElementById(
      SEARCH_BAR_ID,
    ) as HTMLInputElement;
    if (searchBar) {
      searchBar.focus();
      searchBar.setSelectionRange(0, searchBar.value.length);
    }
  }, [selectedItemSlot?.id]);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const weapon = customSet?.equippedItems.find(
    equippedItem => !!equippedItem.item.weaponStats,
  );

  let errors: Array<IError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  return (
    <Layout>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 1740,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <SetHeader customSet={customSet} errors={errors} />
        <div css={{ display: 'flex', alignItems: 'flex-start', marginTop: 8 }}>
          <ResponsiveGrid
            numColumns={[2, 1, 1, 2, 2, 2, 2]}
            css={{ margin: '0 36px 48px 12px', flex: '1 1 0' }}
          >
            {STAT_GROUPS.map((group, i) => (
              <StatTable
                key={`stat-table-${i}`}
                group={group}
                statsFromCustomSet={statsFromCustomSet}
                customSet={customSet}
              />
            ))}
            <StatEditor key={customSet?.stats.id} customSet={customSet} />
          </ResponsiveGrid>
          <ClassicEquipmentSlots
            customSet={customSet}
            selectItemSlot={selectItemSlot}
            selectedItemSlotId={selectedItemSlot?.id ?? null}
            errors={errors}
          />
          <ResponsiveGrid
            numColumns={[2, 1, 1, 2, 2, 2, 2]}
            css={{
              marginBottom: 20,
              margin: '0 12px 48px 36px',
              flex: '1 1 0',
            }}
          >
            {weapon && customSet && weapon.item.weaponStats && (
              <>
                <BasicItemCard
                  item={weapon.item}
                  showOnlyWeaponStats
                  weaponElementMage={weapon.weaponElementMage}
                />
                <WeaponDamage
                  weaponStats={weapon.item.weaponStats}
                  customSet={customSet}
                  weaponElementMage={weapon.weaponElementMage}
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
    </Layout>
  );
};

export default React.memo(ClassicSetBuilder);
