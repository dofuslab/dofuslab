/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';
import { useTheme } from 'emotion-theming';

import { STAT_GROUPS, mq, SEARCH_BAR_ID } from 'common/constants';
import { ResponsiveGrid } from 'common/wrappers';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet, getErrors } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { topMarginStyle } from 'common/mixins';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { useTranslation } from 'i18n';
import { BuildError } from 'common/types';
import { TTheme } from 'common/themes';
import Selector from '../common/Selector';
import StatEditor from '../common/StatEditor';
import EquipmentSlots from '../common/EquipmentSlots';
import SetHeader from '../common/SetHeader';
import StatTable from '../common/StatTable';
import Layout from './Layout';

const { TabPane } = Tabs;

interface Props {
  customSet: customSet | null;
}

const SetBuilder: React.FC<Props> = ({ customSet }) => {
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
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  const { t } = useTranslation('common');

  const theme = useTheme<TTheme>();

  return (
    <Layout>
      <SetHeader customSet={customSet} errors={errors} />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
        errors={errors}
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
            </TabPane>
            <TabPane tab={t('WEAPON_AND_SPELLS')} key="weapon-and-spells">
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
        />
      </div>
    </Layout>
  );
};

export default React.memo(SetBuilder);
