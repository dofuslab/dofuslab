/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';
import { useTheme } from 'emotion-theming';

import { mq, SEARCH_BAR_ID } from 'common/constants';
import { ResponsiveGrid } from 'common/wrappers';

import { getStatsFromCustomSet, getErrors } from 'common/utils';
import { topMarginStyle } from 'common/mixins';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { useTranslation } from 'i18n';
import { BuildError, Theme } from 'common/types';
import { Stat } from '__generated__/globalTypes';
import { CustomSet, ItemSlot } from 'common/type-aliases';
import Selector from '../common/Selector';
import StatEditor from '../common/StatEditor';
import EquipmentSlots from '../common/EquipmentSlots';
import SetHeader from '../common/SetHeader';
import StatTable from '../common/StatTable';
import Layout from './Layout';

const { TabPane } = Tabs;

const statGroups = [
  ['HP', Stat.AP, Stat.MP, Stat.RANGE],
  [Stat.INITIATIVE, Stat.CRITICAL, Stat.SUMMON, Stat.HEALS, Stat.PROSPECTING],
  [
    Stat.VITALITY,
    Stat.WISDOM,
    Stat.AGILITY,
    Stat.CHANCE,
    Stat.STRENGTH,
    Stat.INTELLIGENCE,
    Stat.POWER,
  ],
  [Stat.DODGE, Stat.LOCK],
  [Stat.AP_PARRY, Stat.AP_REDUCTION, Stat.MP_PARRY, Stat.MP_REDUCTION],
  [
    Stat.NEUTRAL_DAMAGE,
    Stat.EARTH_DAMAGE,
    Stat.FIRE_DAMAGE,
    Stat.WATER_DAMAGE,
    Stat.AIR_DAMAGE,
  ],
  [
    Stat.PCT_NEUTRAL_RES,
    Stat.PCT_EARTH_RES,
    Stat.PCT_FIRE_RES,
    Stat.PCT_WATER_RES,
    Stat.PCT_AIR_RES,
  ],
  [Stat.TRAP_DAMAGE, Stat.TRAP_POWER, Stat.REFLECT, Stat.PODS],
  [
    Stat.NEUTRAL_RES,
    Stat.EARTH_RES,
    Stat.FIRE_RES,
    Stat.WATER_RES,
    Stat.AIR_RES,
  ],

  [
    Stat.CRITICAL_DAMAGE,
    Stat.PUSHBACK_DAMAGE,
    Stat.PCT_MELEE_DAMAGE,
    Stat.PCT_RANGED_DAMAGE,
    Stat.PCT_WEAPON_DAMAGE,
    Stat.PCT_SPELL_DAMAGE,
  ],
  [
    Stat.CRITICAL_RES,
    Stat.PUSHBACK_RES,
    Stat.PCT_MELEE_RES,
    Stat.PCT_RANGED_RES,
  ],
];

interface Props {
  customSet: CustomSet | null;
}

const SetBuilder: React.FC<Props> = ({ customSet }) => {
  const [selectedItemSlot, selectItemSlot] = React.useState<ItemSlot | null>(
    null,
  );

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
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  const { t } = useTranslation('common');

  const theme = useTheme<Theme>();

  return (
    <Layout>
      <SetHeader
        customSet={customSet}
        errors={errors}
        css={{
          [mq[1]]: { padding: '0px 14px' },
          [mq[4]]: {
            padding: '0px 20px',
          },
        }}
        isMobile={false}
        isClassic={false}
      />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
        errors={errors}
        isMobile={false}
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
            overflow: 'auto',
            flex: '0 1 296px',
            paddingRight: 12,
            ...(topMarginStyle[mq[1]] as {}),
            [mq[2]]: { flex: '0 1 576px' },
          }}
        >
          <Tabs
            defaultActiveKey="characteristics"
            css={{
              '.ant-tabs-bar': {
                borderBottom: `1px solid ${theme.border?.default}`,
              },
            }}
          >
            <TabPane tab={t('CHARACTERISTICS')} key="characteristics">
              <ResponsiveGrid
                numColumns={[2, 1, 2, 2, 2, 2, 2]}
                css={{ marginBottom: 20 }}
              >
                {statGroups.map((group) => (
                  <StatTable
                    key={`stat-table-${group[0]}`}
                    group={group}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                ))}
                <StatEditor key={customSet?.stats.id} customSet={customSet} />
              </ResponsiveGrid>
            </TabPane>
            <TabPane
              tab={t('WEAPON_AND_SPELLS')}
              key="weapon-and-spells"
              forceRender
            >
              <ResponsiveGrid
                numColumns={[2, 1, 2, 2, 2, 2, 2]}
                css={{ marginBottom: 20 }}
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
            </TabPane>
          </Tabs>
        </div>
        <Selector
          key={`selected-item-slot-${selectedItemSlot?.name}-level-${customSet?.level}`}
          customSet={customSet}
          selectItemSlot={selectItemSlot}
          selectedItemSlot={selectedItemSlot}
          isMobile={false}
          isClassic={false}
        />
      </div>
    </Layout>
  );
};

export default React.memo(SetBuilder);
